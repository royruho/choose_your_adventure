const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL    = "google/gemini-2.0-flash-exp:free";
const MAX_TOKENS_CAP      = 2000;
const MAX_TURNS_FREE      = 20;

const ALLOWED_ORIGINS = [
  "https://choose-your-adventure.vercel.app",
  "http://localhost:5173",
];

if (process.env.ALLOWED_ORIGIN) {
  ALLOWED_ORIGINS.push(process.env.ALLOWED_ORIGIN);
}

module.exports = async function handler(req, res) {
  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS — only our own domain
  const origin = req.headers.origin || "";
  const allowed = ALLOWED_ORIGINS.some(o => origin === o);
  if (!allowed) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const key = process.env.OPENROUTER_KEY;
  if (!key) {
    return res.status(503).json({ error: "Service not configured" });
  }

  const body = req.body;

  // Must have messages — basic shape check
  if (!body?.messages || !Array.isArray(body.messages)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  // Hard cap on tokens to prevent expensive calls
  body.max_completion_tokens = Math.min(
    body.max_completion_tokens || MAX_TOKENS_CAP,
    MAX_TOKENS_CAP
  );

  // Always use the designated free model — caller cannot override
  body.model = OPENROUTER_MODEL;

  try {
    const upstream = await fetch(OPENROUTER_ENDPOINT, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type":  "application/json",
        "HTTP-Referer":  "https://choose-your-adventure.vercel.app",
        "X-Title":       "Choose Your Adventure",
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Upstream error" });
  }
}
