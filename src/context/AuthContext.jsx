import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const USERS_KEY = 'zaa_users'
const SESSION_KEY = 'zaa_user'

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function loadUsers() {
  const users = safeParse(USERS_KEY, [])
  return Array.isArray(users) ? users : []
}

function loadSession() {
  const u = safeParse(SESSION_KEY, null)
  return u && typeof u.email === 'string' ? u : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession)

  useEffect(() => {
    try {
      if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore storage errors */
    }
  }, [user])

  function register(name, email, password) {
    const cleanName = (name || '').trim()
    const cleanEmail = (email || '').trim().toLowerCase()
    if (!cleanName) return { ok: false, error: 'Nama wajib diisi.' }
    if (!cleanEmail) return { ok: false, error: 'Email wajib diisi.' }
    if (!password || password.length < 6)
      return { ok: false, error: 'Password minimal 6 karakter.' }

    const users = loadUsers()
    if (users.some((u) => u.email === cleanEmail))
      return { ok: false, error: 'Email sudah terdaftar.' }

    const newUser = { name: cleanName, email: cleanEmail, password }
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    } catch {
      return { ok: false, error: 'Gagal menyimpan data.' }
    }
    setUser({ name: cleanName, email: cleanEmail })
    return { ok: true }
  }

  function login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase()
    if (!cleanEmail) return { ok: false, error: 'Email wajib diisi.' }
    if (!password) return { ok: false, error: 'Password wajib diisi.' }

    const users = loadUsers()
    const found = users.find(
      (u) => u.email === cleanEmail && u.password === password
    )
    if (!found) return { ok: false, error: 'Email atau password salah.' }

    setUser({ name: found.name, email: found.email })
    return { ok: true }
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
