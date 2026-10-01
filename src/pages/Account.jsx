import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="container">
      <div className="section-head"><h2>Akun Saya</h2></div>
      <div className="card account-card">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="account-row">
          <span className="muted">Nama</span>
          <span>{user.name}</span>
        </div>
        <div className="account-row">
          <span className="muted">Email</span>
          <span>{user.email}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Link to="/" className="btn">Lihat Menu</Link>
          <button type="button" className="btn" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </div>
    </div>
  )
}
