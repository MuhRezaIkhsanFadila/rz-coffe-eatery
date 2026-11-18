import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function boot() {
      if (!api.getToken()) {
        setLoading(false)
        return
      }
      try {
        const res = await api.get('/auth/me')
        if (active) setUser(res.user)
      } catch {
        api.clearToken()
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    boot()
    return () => {
      active = false
    }
  }, [])

  async function register(name, email, password) {
    try {
      const res = await api.post(
        '/auth/register',
        { name, email, password },
        false
      )
      api.setToken(res.token)
      setUser(res.user)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  async function login(email, password) {
    try {
      const res = await api.post('/auth/login', { email, password }, false)
      api.setToken(res.token)
      setUser(res.user)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  async function adminLogin(email, password) {
    try {
      const res = await api.post('/auth/admin/login', { email, password }, false)
      api.setToken(res.token)
      setUser(res.user)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  function logout() {
    api.clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, adminLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
