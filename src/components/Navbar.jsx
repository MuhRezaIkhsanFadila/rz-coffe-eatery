import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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
          <span className="brand-mark">RZ</span>
          <span className="brand-text">RZ COFFE &amp; EATERY</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Menu
          </NavLink>
          <NavLink to="/keranjang">
            Keranjang
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  className="cart-badge"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
          {user?.role === 'admin' && (
            <Link to="/admin" className="admin-pill">
              Admin
            </Link>
          )}
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
