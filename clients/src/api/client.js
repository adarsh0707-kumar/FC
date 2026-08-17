const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(
  path,
  { method = "GET", body, token, isForm = false } = {},
) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.status = res.status;
    err.field = data.field;
    throw err;
  }

  return data;
}

export default request;
