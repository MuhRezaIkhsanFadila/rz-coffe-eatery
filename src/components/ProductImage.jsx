import { useState } from 'react'

export default function ProductImage({ product, className = '', children }) {
  const [status, setStatus] = useState('loading')

  const stateClass =
    status === 'loading' ? 'skeleton' : status === 'error' ? 'thumb-fallback' : ''

  return (
    <div
      className={`${className} ${stateClass}`.trim()}
      data-emoji={product.emoji}
    >
      {status !== 'error' && (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={status === 'loaded' ? 'is-loaded' : ''}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
      {children}
    </div>
  )
}
