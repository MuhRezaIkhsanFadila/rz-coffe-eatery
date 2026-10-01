import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">Z</span>
          <span className="brand-text">Zaa Coffe &amp; eatery</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Menu
          </NavLink>
          <NavLink to="/keranjang">
            Keranjang
            {count > 0 && <span className="cart-badge">{count}</span>}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/akun">Akun</NavLink>
              <button type="button" className="link-btn" onClick={handleLogout}>
                Keluar
              </button>
            </>
          ) : (
            <NavLink to="/login">Masuk</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
