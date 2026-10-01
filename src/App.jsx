import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produk/:id" element={<ProductDetail />} />
          <Route path="/keranjang" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<Register />} />
          <Route
            path="/akun"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
