export async function apiRequest(endpoint, { method = 'GET', body, token, ...options } = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api/'}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const config = {
    method,
    headers,
    ...options,
  };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { status: response.status, ...error };
  }
  return response.json();
}