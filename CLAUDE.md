# CLAUDE.md — Project Guide for Claude Code

This file tells Claude Code everything it needs to know to work effectively in this repository.

---

## What this project is

An AI-powered choose-your-own-adventure game with a chapter-based structure and dice-roll fate checks.

- **Frontend**: React + Vite (`frontend/`) — all UI, no direct LLM access
- **Backend**: FastAPI (`app/`) — LLM proxy, JWT auth, story persistence, rate-limit retry
- **Database**: SQLite locally, PostgreSQL (Aiven) in the cloud
- **AI**: Any OpenAI-compatible LLM endpoint (currently Groq `llama-3.3-70b-versatile`)

---

## Repository layout

```
app/
  main.py         FastAPI app, CORS, lifespan LLM startup check
  db_api.py       All API routes: auth, LLM proxy, story CRUD, LLM config + retry logic
  auth.py         JWT creation and verification, bcrypt password hashing
  models.py       SQLAlchemy models: User, Story, StoryPart
  crud.py         Database operations
  db.py           Engine setup — supports both SQLite and PostgreSQL

frontend/
  src/
    adventure.jsx  Entire game UI — setup wizard, gameplay, all state
    api.js         API client (wraps fetch, reads VITE_API_URL)
  Dockerfile       Node 20 Alpine, Vite dev server on port 5173

alembic/          Database migrations
Dockerfile        Python 3.11 slim, Uvicorn on port 8000
docker-compose.yml  Orchestrates backend + frontend locally
.env.example      Template for required environment variables
deployment.md     Step-by-step local Docker + cloud deployment guide
```

---

## Running locally

```bash
cp .env.example .env        # fill in LLM_API_KEY at minimum
docker compose up --build
docker compose exec backend alembic upgrade head   # first run only
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- Backend health: http://localhost:8000/api/health

---

## Environment variables

**Backend (`.env`)**

| Variable | Description | Example |
|---|---|---|
| `LLM_ENDPOINT` | LLM API URL | `https://api.groq.com/openai/v1/chat/completions` |
| `LLM_API_KEY` | API key | `gsk_...` |
| `LLM_MODEL` | Model name | `llama-3.3-70b-versatile` |
| `LLM_MAX_TOKENS` | Max output tokens per call | `800` |
| `SECRET_KEY` | JWT signing secret | any long random string |
| `DATABASE_URL` | DB connection string | `sqlite:///./stories.db` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |

**Frontend (`frontend/.env`)**

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend URL | `http://localhost:8000` |

---

## Supported LLM providers

The backend auto-detects the provider from the endpoint URL:

| Provider | Endpoint | Notes |
|---|---|---|
| Groq | `https://api.groq.com/openai/v1/chat/completions` | Recommended — free, fast |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | Free tier, regional limits |
| Anthropic | `https://api.anthropic.com/v1/messages` | Paid |

LLM config can be changed at runtime via `POST /api/config/llm`.

**Rate limit handling** (`app/db_api.py`): on HTTP 429, the backend parses the `"try again in Xs"` message from the error body, sleeps that duration + 1 s, and retries up to 2 times transparently. After 3 failures it returns a clean 429 to the client.

---

## Key backend routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| GET | `/api/config/llm` | — | Current LLM config (key masked) |
| POST | `/api/config/llm` | — | Update LLM config at runtime |
| POST | `/api/llm/chat` | optional | LLM proxy — all game calls go here |
| POST | `/api/auth/register` | — | Register user, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | required | Current user info |
| POST | `/api/stories` | required | Create a story record |
| GET | `/api/stories` | required | List user's stories |
| GET | `/api/stories/{id}` | required | Story + all parts |
| DELETE | `/api/stories/{id}` | required | Delete story |

---

## Database models

```
User          id, username, hashed_password
Story         id, title, owner_id, created_at, config (JSON), character (JSON)
StoryPart     id, story_id, turn_number, sender, content, stats (JSON), created_at
```

`config` stores: genre, language, ageTier, responseLength, storyLength, deathPossible, trackStats, perspective, storyPrompt  
`character` stores: name, gender, age, appearance, skills  
`stats` stores: health (0–100), inventory (array), relationships (object)

---

## Frontend architecture

Everything lives in `frontend/src/adventure.jsx` — a single React component.

### Setup wizard (9 steps)

language → genre → age tier → story pacing → adventure length → game rules → narrative perspective → story seed → character

Supported languages: **English, Hebrew, Arabic** (RTL handled automatically for Hebrew and Arabic).

### Game state

| State | Type | Description |
|---|---|---|
| `storyLog` | `Array<LogEntry>` | Full story log (see entry types below) |
| `config` | object | All setup choices |
| `character` | object | name, gender, age, appearance, skills |
| `stats` | object | health, inventory, relationships |
| `choices` | string[] | Current choice buttons |
| `turnCount` | number | Current turn number |
| `storySummary` | object | Rolling LLM summary `{narrative, world}` |
| `storyId` | number\|null | DB story ID (null for guests) |
| `chapterNumber` | number | Current chapter (1-based) |
| `chapterBrief` | object\|null | `{title, goal, obstacle}` — generated once, immutable for the chapter |
| `chapterBanner` | string\|null | Title shown in overlay when chapter starts |
| `chapterProgress` | object | `{achieved: string[], clues: string[]}` |
| `pendingRoll` | object\|null | `{context, choiceText}` — dice waiting to be rolled |
| `nextRollRequired` | object | `{required: bool, context: string}` from last LLM response |

### storyLog entry types

```js
{ role: "narrator",  text: string }
{ role: "player",    text: string }
{ role: "roll",      value: 1-6, outcome: string, context: string, skillBonus: bool }
{ role: "chapter",   text: string, num: number }
```

Only `narrator` and `player` entries are sent to the LLM as history. `roll` and `chapter` entries are display-only.

Error/retry entries (`"Something went wrong"` narrator + `"Try again"` player) are filtered out before building LLM history so failed calls never contaminate subsequent turns.

### Key functions

| Function | Description |
|---|---|
| `buildSystemPrompt()` | Assembles full system prompt: perspective, character, stats (current values), compact chapter brief, story arc phase, rolling summary context |
| `generateChapterBrief(chNum, total, summaryCtx)` | Background call — generates `{title, goal, obstacle}`. Delayed 5 s on start, 10 s on chapter transition. No await. |
| `startAdventure()` | Sends opening prompt, fires chapter 1 brief generation (delayed 5 s), creates DB record for logged-in users |
| `handleChoiceClick(choiceText)` | Checks `nextRollRequired` — if true, opens dice overlay; otherwise calls `makeChoice` directly |
| `handleRollResult(rollInfo)` | Receives dice result, dismisses overlay, calls `makeChoice(choiceText, rollInfo)` |
| `makeChoice(choiceText, rollInfo?)` | Filters error/retry history, builds sliding-window history, injects `[CURRENT STATE]` block, appends roll outcome, calls LLM, updates all state |
| `triggerSummarize(fullLog, currentSummary)` | Background call every 5 turns (skipped for adventures ≤ 10 turns). Delayed 20 s. No await. |
| `handleExport()` | Downloads `.txt` transcript |
| `handleSaveGame()` | Downloads full game state as `.json` (version 2) |
| `handleLoadGame()` / `handleFileChange()` | Restores game state from `.json` |
| `resetGame()` | Resets all state, returns to setup |

---

## Chapter system

Adventure length maps to chapter count:

| Length | Turns | Chapters |
|---|---|---|
| Sprint | 5 | 1 |
| Short | 10 | 2 |
| Standard | 20 | 4 |
| Epic | 40 | 8 |

Each chapter has **one single overarching goal** (not a list of steps or items). The chapter brief is generated once by a background LLM call and never changes mid-chapter:
- Adventure start → chapter 1 brief (fired 5 s after opening call)
- When LLM returns `chapterComplete: true` → next chapter brief (fired 10 s after the completing turn)

Chapter ends when the LLM signals `chapterComplete: true`, not by turn count. The player can explore freely, hit dead ends, and try multiple approaches before achieving the goal.

**Chapter brief format** (`chapterBrief`): `{title, goal, obstacle}` — three fields only.
- `goal`: one overarching objective — what to achieve, NOT specific items or steps
- `obstacle`: the main force or challenge blocking the goal
- `setting` and `resolutionCondition` are intentionally omitted — the premise sets the world; the goal IS the resolution condition

**Chapter section in system prompt** (compact, 2 lines):
```
CHAPTER 1 of 2: "Title" — Goal: X | Obstacle: Y
→ Set chapterComplete:true only when this goal is conclusively achieved.
```

**Chapter progress** (`chapterProgress`) is tracked cumulatively in the `[CURRENT STATE]` user message block — NOT in the system prompt:
- `achieved`: specific milestones completed toward the single chapter goal
- `clues`: hints and information discovered useful for reaching the goal

Progress is merged: achieved items accumulate (deduped), clues accumulate (deduped). Both are reset when a chapter transitions.

Progress is shown in the game UI:
- Header: achieved milestones as small tags
- Sidebar: full progress + clues list (in stats panel or standalone panel when stats are off)

---

## Dice rolling (fate checks)

When the LLM returns `rollRequired: true`, clicking any choice triggers the `DiceRoller` overlay before the LLM call.

| Roll | Outcome | LLM instruction |
|---|---|---|
| 1 | Critical Failure | "something goes badly wrong — a real setback with consequences" |
| 2–3 | Setback | "the attempt fails with a complication" |
| 4–5 | Partial Success | "partial success — it works but with a cost or catch" |
| 6 | Critical Success | "exceptional success, better than expected" |

**Skill bonus**: if `rollContext` fuzzy-matches a character skill, the die is rolled twice and the higher value is kept. The "Skill Bonus Applied" badge is shown in the dice UI.

The roll result, outcome label, and narrative direction are appended to the outgoing LLM message.

---

## State consistency (LLM sync)

Every outgoing `makeChoice` message includes a `[CURRENT STATE]` block:

```
[CURRENT STATE — carry these values forward and return updated versions]
Health: 72/100 | Inventory: [Rusty Key, Torch] | Relationships: {Guard: suspicious} | Chapter achieved so far: Found the map room | Clues found: The seal breaks at midnight
```

The system prompt also shows the authoritative current stats values. This ensures the LLM never has to infer state from trimmed conversation history, which would cause drift on long adventures.

---

## Long-context management (rolling summary)

| Mechanism | Detail |
|---|---|
| Sliding window | Only the last 12 `storyLog` entries (~6 turns) are sent as raw history when a summary exists |
| Rolling summary | Every 5 turns a background call (delayed 20 s, `max_tokens_override: 350`) produces `{narrative, world: {npcs, locations, decisions, threads}}` — injected into system prompt as `STORY CONTEXT` |
| Short adventure skip | Summarization is skipped entirely for adventures of 10 turns or fewer (Sprint/Short) |

Constants: `SUMMARY_EVERY = 5`, `WINDOW_SIZE = 12`

**Windowed history message structure**: when the window is active, the message array starts directly from the earliest windowed player entry (no "Continue the adventure" anchor). A `[story continues]` guard is prepended only if the first windowed entry happens to be a narrator turn (keeps API message-role ordering valid).

---

## LLM JSON response contract

Every game turn the LLM must return:

```json
{
  "story": "narrative text",
  "choices": ["choice 1", "choice 2", "choice 3"],
  "stats": { "health": 85, "inventory": ["Torch"], "relationships": { "Elena": "ally" } },
  "gameOver": false,
  "gameOverReason": "",
  "rollRequired": false,
  "rollContext": "",
  "chapterComplete": false,
  "chapterProgress": { "achieved": ["milestone"], "clues": ["hint"] }
}
```

- `stats` only required when `config.trackStats` is true
- `rollRequired` / `rollContext`: signal to show dice before the next action
- `chapterComplete`: signal to generate next chapter brief and reset progress
- `chapterProgress`: cumulative — the LLM should carry forward existing entries and add new ones

---

## Story arc pacing

Phase is calculated from `Math.min(turnCount, storyLength)` so it never overflows beyond the intended range. FINALE and CLIMAX are additionally gated by `isLastChapter` — the LLM is never told "last turn, set gameOver" while the player is still on an earlier chapter.

| Progress | Phase | Instruction |
|---|---|---|
| Turn 0 | OPENING | Establish world, character, inciting situation |
| 0–35% | EARLY | Develop world, introduce complications |
| 35–65% | MIDDLE | Escalate tension, introduce twist |
| 65–100% | LATE | Push toward climax, N turns remaining |
| Last 2 turns + last chapter | CLIMAX | Bring all threads to a head |
| At/past turn limit + last chapter | FINALE | Satisfying conclusion, `gameOver: true` |

---

## Adding a new setup step

1. Add translation keys to the `TR` object (English + Hebrew + Arabic)
2. Add the step name to `SETUP_STEPS` array
3. Add the new field to the `config` state initializer
4. Add a `case "stepname":` in `renderSetupStep()` with `NavButtons` pointing to correct step indexes
5. Update all subsequent step `onBack`/`onNext` numbers (+1 each)
6. Use the new config field in `buildSystemPrompt()` and add it to the `useCallback` deps

---

## Adding a new language

1. Add `{ code: "LangName", label: "Native Label" }` to the `LANGUAGES` array
2. Add translation keys to `TR` for all existing keys in the new language
3. If RTL, add the language code to `RTL_LANGS`

---

## Migrations

```bash
# After changing models.py:
docker compose exec backend alembic revision --autogenerate -m "description"
docker compose exec backend alembic upgrade head

# Against Aiven (cloud):
DATABASE_URL="postgres://..." alembic upgrade head
```

---

## What NOT to do

- Do not add LLM calls in the frontend — all AI calls go through `/api/llm/chat`
- Do not store API keys in the frontend — they live in `.env` on the backend
- Do not hardcode step numbers — always update all `setSetupStep()` calls when inserting a step
- Background calls (`triggerSummarize`, `generateChapterBrief`) must not block gameplay — never `await` them
- Do not set `chapterComplete: true` based on turn count — it must be triggered only when the single chapter goal is achieved
- Chapter goals must be a single overarching objective — never a list of specific items or steps
- Do not add `setting` or `resolutionCondition` back to the chapter brief — both were intentionally removed
- Do not put `chapterProgress` in the system prompt — it belongs only in the `[CURRENT STATE]` user message block
- Do not trigger FINALE/CLIMAX phases when the player is not on the last chapter — the phase calculation uses `isLastChapter` guard for exactly this reason
