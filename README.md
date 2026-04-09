# Choose Your Adventure

An AI-powered choose-your-own-adventure game with a FastAPI backend and React/Vite frontend.

![Adventure Image](./static/pixiquest_small1.png "Choose Your Adventure")

---

## Architecture

```
frontend/   Vite + React — all UI, calls backend only (no direct LLM access)
app/        FastAPI backend — LLM proxy, auth, story persistence (SQLite)
```

---

## Backend Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set LLM_ENDPOINT, LLM_API_KEY, LLM_MODEL, SECRET_KEY
```

`.env` LLM options:

| Provider | LLM_ENDPOINT | LLM_MODEL |
|---|---|---|
| Anthropic | `https://api.anthropic.com/v1/messages` | `claude-sonnet-4-20250514` |
| Groq | `https://api.groq.com/openai/v1/chat/completions` | `llama-3.3-70b-versatile` |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | `gemini-2.0-flash` |

### 3. Initialize / migrate database
```bash
alembic upgrade head
```

### 4. Run
```bash
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.  
API docs: `http://localhost:8000/docs`

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL if backend isn't on :8000
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## How persistence works

- **Guest users** — can play without logging in; stories are not saved.
- **Logged-in users** — each adventure is saved to the DB as a `Story` with ordered `StoryPart` rows (user prompts + narrator replies) and a stats snapshot at each turn.
- Auth: `POST /api/auth/register` and `POST /api/auth/login` return a JWT stored in `localStorage`.
