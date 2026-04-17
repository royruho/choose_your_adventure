const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL    = "gemini-2.5-flash";

function getKey() {
  return localStorage.getItem("gemini_api_key") || "";
}

function parseRetryAfter(body) {
  try {
    const msg = body?.error?.message || "";
    const m = msg.match(/try again in (\d+\.?\d*)s/i) || msg.match(/retry.*?(\d+\.?\d*)\s*s/i);
    return m ? parseFloat(m[1]) + 1.0 : 6.0;
  } catch {
    return 6.0;
  }
}

function extractJSON(raw) {
  if (!raw) return null;
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    const m = clean.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch { /* fall through */ }
    }
    return null;
  }
}

async function geminiCall(system, messages, opts = {}) {
  const key = getKey();
  if (!key) throw new Error("No Gemini API key configured");

  const { max_tokens_override } = opts;
  const maxTokens = max_tokens_override || 2000;

  const openaiMessages = [{ role: "system", content: system }, ...messages];
  const body = {
    model: GEMINI_MODEL,
    max_completion_tokens: maxTokens,
    messages: openaiMessages,
    response_format: { type: "json_object" },
    reasoning_effort: "none",
  };

  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const resp = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    if (resp.status === 429) {
      if (attempt < MAX_RETRIES) {
        let waitBody = null;
        try { waitBody = await resp.json(); } catch { /* ignore */ }
        const wait = parseRetryAfter(waitBody) * 1000;
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw new Error("Rate limit reached — please wait a moment and try again.");
    }

    if (resp.status === 503) {
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 4000 * (attempt + 1)));
        continue;
      }
      throw new Error("Gemini is temporarily overloaded — please try again in a few seconds.");
    }

    if (!resp.ok) {
      const errText = await resp.text().catch(() => resp.statusText);
      throw new Error(`Gemini error ${resp.status}: ${errText}`);
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content || "";
    const result = extractJSON(raw);
    if (result) return result;

    // Raw text returned but not valid JSON
    return {
      story: raw,
      choices: [],
      gameOver: false,
      gameOverReason: "",
    };
  }
}

export const api = {
  /**
   * Main game call — calls Gemini directly using key from localStorage.
   * opts: { max_tokens_override }
   */
  chat: (system, messages, opts = {}) => geminiCall(system, messages, opts),

  /**
   * Validate a Gemini API key by sending a minimal test call.
   * Resolves true on success, throws an Error with a human-readable message on failure.
   */
  validateKey: async (key) => {
    if (!key?.trim()) throw new Error("Please enter an API key.");
    const resp = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key.trim()}`,
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        max_completion_tokens: 5,
        messages: [
          { role: "system", content: "You are a test." },
          { role: "user",   content: "Say ok" },
        ],
      }),
    });
    if (resp.status === 401 || resp.status === 403) throw new Error("Invalid API key — check that you copied it correctly.");
    if (resp.status === 429) throw new Error("Key is valid but rate-limited right now — try again in a moment.");
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      if (txt.includes("API_KEY_INVALID") || txt.includes("PERMISSION_DENIED"))
        throw new Error("Invalid API key — check that you copied it correctly.");
      throw new Error(`Validation failed (${resp.status}) — check your key and try again.`);
    }
    return true;
  },
};
