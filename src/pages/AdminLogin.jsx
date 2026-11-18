import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await adminLogin(email, password)
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-brand">
          <span className="brand-mark">RZ</span>
          <div>
            <strong>Admin Panel</strong>
            <p className="muted small">RZ COFFE &amp; EATERY</p>
          </div>
        </div>
        <h1>Masuk Admin</h1>
        <p className="muted">Khusus pengelola toko.</p>

        {error && <p className="error-text">{error}</p>}

        <div className="field">
          <label htmlFor="aemail">Email</label>
          <input
            id="aemail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@rz.coffe"
          />
        </div>
        <div className="field">
          <label htmlFor="apassword">Password</label>
          <input
            id="apassword"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Memproses…' : 'Masuk sebagai Admin'}
        </button>

        <p className="auth-alt">
          <Link to="/login" className="muted">← Kembali ke login pengguna</Link>
        </p>
      </form>
    </div>
  )
}
