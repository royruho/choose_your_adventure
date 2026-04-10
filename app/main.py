from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging
import os
import httpx

load_dotenv()

from app.db_api import router as db_api_router, _llm_config, _is_anthropic

logger = logging.getLogger("uvicorn.error")


async def _check_llm():
    endpoint = _llm_config["endpoint"]
    api_key  = _llm_config["api_key"]
    model    = _llm_config["model"]

    if not api_key:
        logger.warning("⚠  LLM startup check SKIPPED — LLM_API_KEY is not set")
        return

    logger.info(f"🔍 LLM startup check — model={model} endpoint={endpoint}")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            if _is_anthropic(endpoint):
                resp = await client.post(
                    endpoint,
                    headers={"Content-Type": "application/json", "x-api-key": api_key, "anthropic-version": "2023-06-01"},
                    json={"model": model, "max_tokens": 16, "messages": [{"role": "user", "content": "ping"}]},
                )
            else:
                resp = await client.post(
                    endpoint,
                    headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
                    json={"model": model, "max_completion_tokens": 16, "messages": [{"role": "user", "content": "ping"}]},
                )
        if resp.status_code < 300:
            logger.info("✅ LLM startup check PASSED — API is reachable and key is valid")
        else:
            logger.error(f"❌ LLM startup check FAILED — HTTP {resp.status_code}: {resp.text[:300]}")
    except Exception as e:
        logger.error(f"❌ LLM startup check FAILED — {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _check_llm()
    yield


app = FastAPI(title="Choose Your Adventure API", lifespan=lifespan)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(db_api_router)
