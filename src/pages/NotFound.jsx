import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container">
      <div className="notfound">
        <p className="code">404</p>
        <h2>Halaman tidak ditemukan</h2>
        <p className="muted">Sepertinya kamu tersesat. Yuk kembali ke menu.</p>
        <Link to="/" className="btn btn-primary">Kembali ke menu</Link>
      </div>
    </div>
  )
}
