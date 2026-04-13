import os
import re
import json
import asyncio
import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.db import get_db
from app import crud
from app.auth import (
    verify_password,
    create_access_token,
    get_current_user,
    require_current_user,
)

router = APIRouter(prefix="/api", tags=["Adventure API"])


# ─── Static / health ──────────────────────────────────────────────

@router.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.ico")


@router.get("/health")
def health():
    return {"status": "ok"}


# ─── Auth ─────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, req.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    user = crud.create_user(db, req.username, req.password)
    token = create_access_token(user.username)
    return {"token": token, "user": {"id": user.id, "username": user.username}}

@router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, req.username)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.username)
    return {"token": token, "user": {"id": user.id, "username": user.username}}

@router.get("/auth/me")
def me(current_user=Depends(require_current_user)):
    return {"id": current_user.id, "username": current_user.username}


# ─── LLM Config (mutable at runtime) ─────────────────────────────

_llm_config: dict = {
    "endpoint":   os.getenv("LLM_ENDPOINT", "https://api.anthropic.com/v1/messages"),
    "api_key":    os.getenv("LLM_API_KEY", ""),
    "model":      os.getenv("LLM_MODEL", "claude-sonnet-4-20250514"),
    "max_tokens": int(os.getenv("LLM_MAX_TOKENS", "800")),
}


class LLMConfigUpdate(BaseModel):
    endpoint:   Optional[str] = None
    api_key:    Optional[str] = None
    model:      Optional[str] = None
    max_tokens: Optional[int] = None


@router.get("/config/llm")
def get_llm_config():
    """Return current LLM config. API key is masked."""
    key = _llm_config["api_key"]
    masked = f"...{key[-4:]}" if len(key) >= 4 else ("set" if key else "not set")
    return {
        "endpoint":   _llm_config["endpoint"],
        "api_key":    masked,
        "model":      _llm_config["model"],
        "max_tokens": _llm_config["max_tokens"],
    }


@router.post("/config/llm")
def update_llm_config(req: LLMConfigUpdate):
    """Update LLM config at runtime (takes effect immediately, resets on server restart)."""
    if req.endpoint   is not None: _llm_config["endpoint"]   = req.endpoint
    if req.api_key    is not None: _llm_config["api_key"]    = req.api_key
    if req.model      is not None: _llm_config["model"]      = req.model
    if req.max_tokens is not None: _llm_config["max_tokens"] = req.max_tokens
    return {"ok": True, "model": _llm_config["model"], "endpoint": _llm_config["endpoint"]}


def _is_anthropic(endpoint: str) -> bool:
    return "anthropic.com" in endpoint

def _is_gemini(endpoint: str) -> bool:
    return "generativelanguage.googleapis.com" in endpoint


def _parse_retry_after(response: httpx.Response) -> float:
    """Extract wait-seconds from a 429 response body. Falls back to 6s."""
    try:
        msg = response.json().get("error", {}).get("message", "")
        m = re.search(r"try again in (\d+\.?\d*)s", msg)
        return float(m.group(1)) + 1.0 if m else 6.0
    except Exception:
        return 6.0


class ChatRequest(BaseModel):
    system: str
    messages: list
    # optional persistence
    story_id: Optional[int] = None
    turn_number: Optional[int] = None
    user_content: Optional[str] = None  # player's action text (for saving)
    # allow background/utility calls to use a smaller token budget
    max_tokens_override: Optional[int] = None


@router.post("/llm/chat")
async def llm_chat(req: ChatRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    endpoint   = _llm_config["endpoint"]
    api_key    = _llm_config["api_key"]
    model      = _llm_config["model"]
    max_tokens = req.max_tokens_override or _llm_config["max_tokens"]

    if not api_key:
        raise HTTPException(status_code=503, detail="LLM API key not configured on server")

    raw_text = None
    MAX_RETRIES = 2
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            for attempt in range(MAX_RETRIES + 1):
                if _is_anthropic(endpoint):
                    response = await client.post(
                        endpoint,
                        headers={
                            "Content-Type": "application/json",
                            "x-api-key": api_key,
                            "anthropic-version": "2023-06-01",
                        },
                        json={
                            "model": model,
                            "max_tokens": max_tokens,
                            "system": req.system,
                            "messages": req.messages,
                        },
                    )
                else:
                    # OpenAI-compatible (Groq, Gemini, etc.)
                    openai_messages = [{"role": "system", "content": req.system}] + req.messages
                    body = {
                        "model": model,
                        "max_completion_tokens": max_tokens,
                        "messages": openai_messages,
                        "response_format": {"type": "json_object"},
                    }
                    if _is_gemini(endpoint):
                        # Disable thinking — for structured JSON tasks thinking wastes
                        # the token budget and can truncate the response.
                        # The OpenAI-compat endpoint uses reasoning_effort, not thinking_config.
                        body["reasoning_effort"] = "none"
                    response = await client.post(
                        endpoint,
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {api_key}",
                        },
                        json=body,
                    )

                # Retry on rate limit
                if response.status_code == 429:
                    if attempt < MAX_RETRIES:
                        wait = _parse_retry_after(response)
                        await asyncio.sleep(wait)
                        continue
                    raise HTTPException(
                        status_code=429,
                        detail=f"LLM rate limit reached — please wait a moment and try again.",
                    )

                response.raise_for_status()

                if _is_anthropic(endpoint):
                    data = response.json()
                    raw_text = "".join(b.get("text", "") for b in data.get("content", []))
                else:
                    data = response.json()
                    raw_text = data["choices"][0]["message"]["content"]
                break  # success

    except HTTPException:
        raise
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"LLM connection error: {str(e)}")

    # Parse the JSON the LLM returns.
    # Strategy: strip fences, then try direct parse, then try extracting the
    # outermost {...} block (handles preamble/postamble text from thinking models).
    clean = raw_text.replace("```json", "").replace("```", "").strip()
    result = None
    try:
        result = json.loads(clean)
    except json.JSONDecodeError:
        # Try to find the first complete JSON object in the text
        m = re.search(r'\{[\s\S]*\}', clean)
        if m:
            try:
                result = json.loads(m.group(0))
            except json.JSONDecodeError:
                pass
    if result is None:
        result = {
            "story": clean,
            "choices": [],
            "gameOver": False,
            "gameOverReason": "",
        }

    # Persist if story_id + user is provided
    if req.story_id and req.turn_number is not None and req.user_content is not None:
        story = crud.get_story_by_id(db, req.story_id)
        # Only save if story belongs to current user (or story has no owner — guest)
        if story and (story.owner_id is None or (current_user and story.owner_id == current_user.id)):
            crud.add_story_turn(
                db,
                story_id=req.story_id,
                turn_number=req.turn_number,
                user_content=req.user_content,
                narrator_content=result.get("story", ""),
                stats=result.get("stats"),
            )

    return result


# ─── Stories ──────────────────────────────────────────────────────

class CreateStoryRequest(BaseModel):
    title: str
    config: Optional[dict] = None
    character: Optional[dict] = None

@router.post("/stories")
def create_story(req: CreateStoryRequest, db: Session = Depends(get_db), current_user=Depends(require_current_user)):
    story = crud.create_story(db, owner_id=current_user.id, title=req.title, config=req.config, character=req.character)
    return _story_summary(story)

@router.get("/stories")
def list_stories(db: Session = Depends(get_db), current_user=Depends(require_current_user)):
    stories = crud.get_user_stories(db, current_user.id)
    return [_story_summary(s) for s in stories]

@router.get("/stories/{story_id}")
def get_story(story_id: int, db: Session = Depends(get_db), current_user=Depends(require_current_user)):
    story = _get_owned_story(db, story_id, current_user)
    parts = crud.get_story_parts(db, story_id)
    return {
        **_story_summary(story),
        "parts": [_part_dict(p) for p in parts],
    }

@router.delete("/stories/{story_id}")
def delete_story(story_id: int, db: Session = Depends(get_db), current_user=Depends(require_current_user)):
    _get_owned_story(db, story_id, current_user)
    crud.delete_story(db, story_id)
    return {"ok": True}


# ─── Helpers ──────────────────────────────────────────────────────

def _get_owned_story(db, story_id, current_user):
    story = crud.get_story_by_id(db, story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    if story.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your story")
    return story

def _story_summary(story):
    return {
        "id": story.id,
        "title": story.title,
        "created_at": story.created_at.isoformat() if story.created_at else None,
        "config": story.config,
        "character": story.character,
    }

def _part_dict(part):
    return {
        "id": part.id,
        "turn_number": part.turn_number,
        "sender": part.sender,
        "content": part.content,
        "stats": part.stats,
        "created_at": part.created_at.isoformat() if part.created_at else None,
    }
