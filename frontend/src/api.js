const API_BASE = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "simple-feed-token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    let message = "Something went wrong";
    try {
      const payload = await response.json();
      message = payload.detail || message;
    } catch {
      // Keep the generic message for non-JSON API errors.
    }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

export const login = (email, password) => {
  const body = new URLSearchParams({ username: email, password });
  return request("/auth/jwt/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
};

export const register = (email, password) => request("/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

export const getFeed = () => request("/feed");

export const uploadPost = (file, caption) => {
  const body = new FormData();
  body.append("file", file);
  body.append("caption", caption);
  return request("/upload", { method: "POST", body });
};

export const deletePost = (id) => request(`/delete/${id}`, { method: "DELETE" });
