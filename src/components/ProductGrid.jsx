import { motion } from 'framer-motion'
import ProductCard from './ProductCard.jsx'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

export default function ProductGrid({ products }) {
  return (
    <motion.div
      className="grid"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {products.map((p) => (
        <motion.div
          key={p.id}
          className="product-item"
          variants={item}
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.div>
  )
}
