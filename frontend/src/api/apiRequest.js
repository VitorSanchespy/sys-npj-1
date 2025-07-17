const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export async function apiRequest(endpoint, { method = "GET", token, body } = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = {};
  if (!(body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body instanceof FormData) {
    options.body = body;
  } else if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    let message = `Erro ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch (err) {
      console.error('Erro ao interpretar resposta:', err);
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return await response.json();
}