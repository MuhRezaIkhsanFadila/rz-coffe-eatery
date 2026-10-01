import { Link } from 'react-router-dom'

export default function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="empty-state card">
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
