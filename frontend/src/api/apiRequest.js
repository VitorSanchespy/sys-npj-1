export async function apiRequest(url, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let options = { method, headers };
  if (body instanceof FormData) {
    delete headers["Content-Type"];
    options.body = body;
  } else if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    let message = "Erro desconhecido";
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return await response.json();
}