import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
  { to: '/admin/produk', label: 'Menu', icon: '☕', end: false },
  { to: '/admin/voucher', label: 'Voucher', icon: '🎟', end: false },
  { to: '/admin/pesanan', label: 'Pesanan', icon: '🧾', end: false },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">RZ</span>
          <div>
            <strong>Admin</strong>
            <p className="muted small">RZ COFFE</p>
          </div>
        </div>
        <nav className="admin-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <span className="admin-nav-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="admin-store-link">↗ Lihat Toko</Link>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <span className="muted">Halo, {user?.name || 'Admin'}</span>
          <div className="admin-topbar-actions">
            <Link to="/" className="btn admin-btn-sm">Lihat Toko</Link>
            <button type="button" className="btn admin-btn-sm" onClick={handleLogout}>
              Keluar
            </button>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
