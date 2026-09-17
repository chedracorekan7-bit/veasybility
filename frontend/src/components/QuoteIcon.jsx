import { motion } from 'framer-motion';

/**
 * QuoteIcon Component
 * Guillemets stylisés premium avec design minimaliste
 * Inspiré des landing pages haut de gamme (Awwwards)
 */
export default function QuoteIcon() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-16 h-16 mb-8"
    >
      {/* Background circle */}
      <div className="absolute inset-0 bg-primary/10 rounded-full" />
      
      {/* Quote text with premium styling */}
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8 text-primary"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Custom quote mark design */}
          <path d="M3 21c3 -1 7 -1 11 0 M3 21c -3 -3.5 -3 -9 -1 -12 c2 -3 6 -2 8 0 c1 1 2 3 2 5 a5 5 0 0 1 -5 5 a3 3 0 0 1 -3 -3" />
          <path d="M15 21c3 -1 7 -1 11 0 M15 21c -3 -3.5 -3 -9 -1 -12 c2 -3 6 -2 8 0 c1 1 2 3 2 5 a5 5 0 0 1 -5 5 a3 3 0 0 1 -3 -3" />
        </svg>
      </div>

      {/* Animated border on hover */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary opacity-0 group-hover:opacity-100"
        whileHover={{ opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
