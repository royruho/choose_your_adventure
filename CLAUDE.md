# CLAUDE.md — Project Guide for Claude Code

This file tells Claude Code everything it needs to know to work effectively in this repository.

---

## What this project is

An AI-powered choose-your-own-adventure game.

- **Frontend**: React + Vite (`frontend/`) — all UI, no direct LLM access
- **Backend**: FastAPI (`app/`) — LLM proxy, JWT auth, story persistence
- **Database**: SQLite locally, PostgreSQL (Aiven) in the cloud
- **AI**: Any OpenAI-compatible LLM endpoint (currently Groq `llama-3.3-70b-versatile`)

---

## Repository layout

```
app/
  main.py         FastAPI app, CORS, lifespan LLM startup check
  db_api.py       All API routes: auth, LLM proxy, story CRUD, LLM config
  auth.py         JWT creation and verification, bcrypt password hashing
  models.py       SQLAlchemy models: User, Story, StoryPart
  crud.py         Database operations
  db.py           Engine setup — supports both SQLite and PostgreSQL

frontend/
  src/
    adventure.jsx  Entire game UI — setup wizard, gameplay, all state
    api.js         Typed API client (wraps fetch, reads VITE_API_URL)
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
# Copy and fill in the env file
cp .env.example .env

# Start everything
docker compose up --build

# First run only — create database tables
docker compose exec backend alembic upgrade head
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
| `LLM_API_KEY` | API key for the LLM | `gsk_...` |
| `LLM_MODEL` | Model name | `llama-3.3-70b-versatile` |
| `LLM_MAX_TOKENS` | Max tokens per response | `1000` |
| `SECRET_KEY` | JWT signing secret | any long random string |
| `DATABASE_URL` | DB connection string | `sqlite:///./data/stories.db` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |

**Frontend (`frontend/.env`)**

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend URL | `http://localhost:8000` |

---

## Supported LLM providers

The backend auto-detects the provider from the endpoint URL:

| Provider | Endpoint | Detection |
|---|---|---|
| Anthropic | `https://api.anthropic.com/v1/messages` | `"anthropic.com"` in URL |
| Groq | `https://api.groq.com/openai/v1/chat/completions` | OpenAI-compatible |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | OpenAI-compatible |

LLM config can be changed at runtime (no restart needed) via `POST /api/config/llm`.

---

## Key backend routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| GET | `/api/config/llm` | — | Current LLM config (key masked) |
| POST | `/api/config/llm` | — | Update LLM config at runtime |
| POST | `/api/llm/chat` | optional | LLM proxy — core game call |
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

Everything lives in `frontend/src/adventure.jsx` — a single React component with:

**Setup wizard** (9 steps): language → genre → age → pacing → duration → rules → perspective → story seed → character

**Game state**:
- `storyLog` — `Array<{role: "narrator"|"player", text: string}>`
- `config` — all setup choices
- `character` — name, gender, age, appearance, skills
- `stats` — health, inventory, relationships
- `choices` — current choice buttons
- `turnCount` — current turn number
- `storySummary` — rolling LLM-generated summary `{narrative, world}`
- `storyId` — DB story ID (null for guests)

**Key functions**:
- `buildSystemPrompt()` — assembles the full system prompt including story arc phase and summary context
- `startAdventure()` — sends rich opening prompt, creates DB story record for logged-in users
- `makeChoice(choiceText)` — uses sliding window history + triggers background summarization every 5 turns
- `triggerSummarize(fullLog, currentSummary)` — background call, updates `storySummary` silently
- `handleExport()` — downloads story as `.txt`
- `handleSaveGame()` — downloads full game state as `.json`
- `handleLoadGame()` / `handleFileChange()` — restores game state from `.json` file

---

## Long-context management (rolling summary)

As stories grow long, the full history would exceed context limits and cause the LLM to forget details. The app uses two mechanisms:

1. **Sliding window**: Only the last 12 `storyLog` entries (~6 turns) are sent as raw history when a summary exists.
2. **Rolling summary**: Every 5 turns, a background LLM call produces a structured summary:
   ```json
   {
     "narrative": "2-3 sentence summary of key events",
     "world": {
       "npcs": {"Name": "relationship/status"},
       "locations": ["place — notes"],
       "decisions": ["key decision made"],
       "threads": ["active plot thread"]
     }
   }
   ```
   This is injected into the system prompt as `STORY CONTEXT` on every subsequent turn.

Constants in `adventure.jsx`:
- `SUMMARY_EVERY = 5` — how often to summarize (turns)
- `WINDOW_SIZE = 12` — storyLog entries kept in raw history

---

## Story arc pacing

The system prompt includes the current turn number and total planned turns. The LLM receives a `PHASE` instruction that changes as the story progresses:

| Progress | Phase label | Instruction |
|---|---|---|
| Turn 0 | OPENING | Establish world, character, inciting situation |
| 0–35% | EARLY | Develop world, introduce complications |
| 35–65% | MIDDLE | Escalate tension, twist or reversal |
| 65–85% | LATE | Push to climax, consequences mounting |
| Last 2 turns | CLIMAX | Converge all threads, decisive choice |
| Final turn | FINALE | Satisfying conclusion, set `gameOver: true` |

Story lengths: Sprint (5), Short (10), Standard (20), Epic (40) turns.

---

## Adding a new setup step

1. Add translation keys to the `TR` object at the top of `adventure.jsx`
2. Add the step name to `SETUP_STEPS` array
3. Add the new field to the `config` state initializer
4. Add a `case "stepname":` in `renderSetupStep()` with `NavButtons` pointing to correct step indexes
5. Update all subsequent step `onBack`/`onNext` numbers (they shift by +1)
6. Use the new config field in `buildSystemPrompt()` if it affects the LLM

---

## Migrations

After changing `models.py`, create a new migration:

```bash
# Auto-generate
docker compose exec backend alembic revision --autogenerate -m "description"

# Apply
docker compose exec backend alembic upgrade head

# Against Aiven (cloud)
DATABASE_URL="postgres://..." alembic upgrade head
```

---

## What NOT to do

- Do not add LLM calls directly in the frontend — all AI calls go through `/api/llm/chat`
- Do not store API keys in the frontend — they live in `.env` on the backend
- Do not hardcode step numbers — always update all `setSetupStep()` calls when inserting a step
- The `storySummary` background call must not block gameplay — never `await triggerSummarize()`
