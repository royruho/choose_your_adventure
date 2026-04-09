const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function getToken() {
  return localStorage.getItem('adventure_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body) {
  const resp = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || `Request failed: ${resp.status}`);
  }
  return resp.json();
}

export const api = {
  // Auth
  register: (username, password) => request('POST', '/api/auth/register', { username, password }),
  login: (username, password) => request('POST', '/api/auth/login', { username, password }),
  me: () => request('GET', '/api/auth/me'),

  // LLM proxy — core game call
  chat: (system, messages, opts = {}) =>
    request('POST', '/api/llm/chat', { system, messages, ...opts }),

  // LLM config
  getLLMConfig: () => request('GET', '/api/config/llm'),
  setLLMConfig: (cfg) => request('POST', '/api/config/llm', cfg),

  // Stories
  createStory: (title, config, character) => request('POST', '/api/stories', { title, config, character }),
  listStories: () => request('GET', '/api/stories'),
  getStory: (id) => request('GET', `/api/stories/${id}`),
  deleteStory: (id) => request('DELETE', `/api/stories/${id}`),
};

export { API_URL };
