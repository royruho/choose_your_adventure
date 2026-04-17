const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL    = "openai/gpt-oss-20b:free";
const MAX_TOKENS_CAP      = 2000;
const MAX_TURNS_FREE      = 20;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === "http://localhost:5173") return true;
  if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) return true;
  // Allow any Vercel preview/production deployment for this project
  return /^https:\/\/choose-your-adventure[a-z0-9-]*\.vercel\.app$/.test(origin);
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";

  // CORS preflight
  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) return res.status(403).end();
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }

  // Temporary debug — remove after confirming key is set
  if (req.method === "GET") {
    const k = process.env.OPENROUTER_KEY || "";
    return res.status(200).json({
      keySet: k.length > 0,
      keyLength: k.length,
      keyPrefix: k.length > 6 ? k.slice(0, 6) + "..." : "(empty)",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS — only our own domain
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
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
