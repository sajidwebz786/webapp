export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const tokenStore = {
  get: () => localStorage.getItem("traveltimes_token"),
  set: (token) => localStorage.setItem("traveltimes_token", token),
  clear: () => localStorage.removeItem("traveltimes_token")
};

export async function api(path, options = {}) {
  const token = tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
