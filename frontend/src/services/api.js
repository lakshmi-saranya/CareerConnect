// Centralised API helper — automatically attaches JWT to every request

const BASE = "http://localhost:8000";

function getToken() {
  const stored = localStorage.getItem("cc_user");
  if (!stored) return null;
  try { return JSON.parse(stored).access_token; }
  catch { return null; }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expired — force logout
    localStorage.removeItem("cc_user");
    window.location.href = "/login";
    return;
  }

  return res;
}
