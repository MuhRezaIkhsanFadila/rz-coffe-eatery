const BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'rz_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
export function setToken(t) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}
export function clearToken() {
  setToken(null)
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Tidak bisa terhubung ke server.')
  }
  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }
  if (!res.ok) {
    throw new Error((data && data.error) || `Terjadi kesalahan (${res.status})`)
  }
  return data
}

export const api = {
  get: (path, auth = true) => request(path, { method: 'GET', auth }),
  post: (path, body, auth = true) => request(path, { method: 'POST', body, auth }),
  patch: (path, body, auth = true) => request(path, { method: 'PATCH', body, auth }),
  del: (path, auth = true) => request(path, { method: 'DELETE', auth }),
  raw: request,
  getToken,
  setToken,
  clearToken,
}
