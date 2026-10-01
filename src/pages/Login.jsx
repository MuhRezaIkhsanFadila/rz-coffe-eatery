import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const res = login(email, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate(location.state?.from || '/akun', { replace: true })
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <form className="card auth-card" onSubmit={handleSubmit}>
          <h1>Masuk</h1>
          <p className="muted">Masuk untuk melihat akunmu.</p>

          {error && <p className="error-text">{error}</p>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Masuk
          </button>

          <p className="auth-alt">
            Belum punya akun? <Link to="/daftar">Daftar di sini</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
