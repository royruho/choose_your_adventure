# Choose Your Adventure

An AI-powered choose-your-own-adventure game with a FastAPI backend and React/Vite frontend.

![Adventure Image](./static/pixiquest_small1.png "Choose Your Adventure")

---

## Architecture

```
Browser
  │
  └─► React/Vite frontend (port 5173)
        │
        └─► FastAPI backend (port 8000)
              │
              ├─► LLM API (Groq / Gemini / Anthropic)
              │
              └─► SQLite (local) or PostgreSQL (cloud)
```

The frontend never calls the LLM directly. All AI requests go through the backend, which holds the API key and handles provider differences.

---

## Features

### Setup wizard (9 steps)
1. **Language** — 17 languages with full RTL support for Hebrew and Arabic
2. **Genre** — Fantasy, Sci-Fi, Reality, Mystery — each with its own theme, fonts, and icon set
3. **Content rating** — Kids (8+), Teen (13+), Adult (18+)
4. **Story pacing** — Quick & Punchy (1–2 sentences), Balanced (paragraph), Rich & Immersive (2–3 paragraphs)
5. **Adventure length** — Sprint (5 turns), Short (10), Standard (20), Epic (40)
6. **Game rules** — death possible / not; stat tracking on / off
7. **Narrative perspective** — First person ("I drew my sword") or Second person ("You draw your sword")
8. **Story seed** — optional premise text to steer the opening
9. **Character** — name, gender, age, appearance, and up to 3 skills (genre-specific list)

### Gameplay
- AI narrates the story in the chosen language and perspective
- 2–5 meaningful choices per turn, plus a free-text action input
- Optional stat tracking: health bar, inventory, relationships
- Story arc pacing — the LLM receives its current phase (Opening / Early / Middle / Late / Climax / Finale) so the story develops and concludes naturally at the right turn

### Long-story context management
For long adventures the app uses a **rolling summary** so the LLM never loses track of early details:
- Every 5 turns a background call summarises key events, NPC relationships, locations, decisions, and active plot threads
- Only the last ~6 turns of raw dialogue are sent to the LLM; earlier history is covered by the summary
- The LLM is explicitly told not to contradict any established facts

### Save / Export
- **Save Game** — downloads a `.json` snapshot of the full game state (including summary) — can be resumed later
- **Load Game** — file picker on the setup screen restores any saved `.json`
- **Export Story** — downloads a human-readable `.txt` transcript with character info, the full story log, and final stats

### User accounts and persistence
- Play as a guest (no account required) — stories are not saved server-side
- Register / log in — each adventure is saved to the database as a `Story` with ordered `StoryPart` rows (player actions + narrator replies + stats snapshot per turn)
- Auth uses JWT stored in `localStorage`

### Theming
Each genre has its own colour palette, fonts, background, and persistent icon strip that appears throughout the entire setup and game:
- Fantasy: gold, Cinzel serif, ⚔️ 🧙 🐉 🏰 🌿
- Sci-Fi: cyan, Orbitron, 🚀 🤖 👾 🛸 ⚡
- Reality: blue-grey, DM Sans, 🌍 🏙️ 🚗 💼 🗺️
- Mystery: amber, Playfair Display, 🔍 🕯️ 🗝️ 💀 🌫️

---

## Supported LLM providers

| Provider | Free tier | Endpoint |
|---|---|---|
| **Groq** | 14,400 req/day | `https://api.groq.com/openai/v1/chat/completions` |
| **Gemini** | 1,500 req/day (AI Studio key) | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` |
| **Anthropic** | Paid | `https://api.anthropic.com/v1/messages` |

Groq is recommended for free use — fast, reliable, no quota issues.

LLM configuration can be changed at runtime without restarting the server via `POST /api/config/llm`.

---

## Quick start (Docker)

```bash
git clone <repo-url>
cd choose_your_adventure_claude

cp .env.example .env
# Edit .env — set LLM_API_KEY and LLM_ENDPOINT at minimum

docker compose up --build

# First run only:
docker compose exec backend alembic upgrade head
```

Open **http://localhost:5173**

See [deployment.md](./deployment.md) for detailed instructions including cloud deployment.

---

## Manual setup (without Docker)

### Backend

```bash
pip install -r requirements.txt
cp .env.example .env        # fill in your values
alembic upgrade head
uvicorn app.main:app --reload
```

Backend: http://localhost:8000  
API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL=http://localhost:8000 if needed
npm run dev
```

Frontend: http://localhost:5173

---

## Environment variables

**Backend (`.env`)**

| Variable | Description | Example |
|---|---|---|
| `LLM_ENDPOINT` | LLM API URL | `https://api.groq.com/openai/v1/chat/completions` |
| `LLM_API_KEY` | API key | `gsk_...` |
| `LLM_MODEL` | Model name | `llama-3.3-70b-versatile` |
| `LLM_MAX_TOKENS` | Max tokens per response | `1000` |
| `SECRET_KEY` | JWT signing secret | any long random string |
| `DATABASE_URL` | DB connection | `sqlite:///./data/stories.db` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:5173` |

**Frontend (`frontend/.env`)**

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:8000` |

---

## Project structure

```
app/
  main.py         FastAPI app entry point, CORS, startup LLM check
  db_api.py       All API routes (auth, LLM proxy, stories, config)
  auth.py         JWT + bcrypt
  models.py       SQLAlchemy models (User, Story, StoryPart)
  crud.py         Database operations
  db.py           Engine — SQLite locally, PostgreSQL in cloud

frontend/
  src/
    adventure.jsx  Entire game UI (setup wizard + gameplay)
    api.js         API client (all backend calls)
  Dockerfile

alembic/           Database migrations
Dockerfile         Backend container
docker-compose.yml Local dev orchestration
.env.example
deployment.md      Detailed deployment guide (local + cloud)
CLAUDE.md          Guide for Claude Code (AI assistant context)
```
