import { motion } from 'framer-motion';
import QuoteIcon from './QuoteIcon';

/**
 * TestimonialCard Component
 * Affiche un témoignage avec citation, avatar, nom et rôle
 */
export default function TestimonialCard({ testimonial, isActive }) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0.3,
        scale: isActive ? 1 : 0.95,
        filter: isActive ? 'blur(0px)' : 'blur(2px)',
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`transition-all duration-500 ${
        isActive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="bg-surface border border-border rounded-2xl p-8 md:p-10 lg:p-12 h-full flex flex-col justify-between min-h-100 hover:border-primary/50 transition-colors duration-300">
        
        {/* Quote icon - Premium styled */}
        <QuoteIcon />

        {/* Testimonial text */}
        <p className="font-sans text-lg md:text-xl lg:text-2xl font-normal leading-relaxed text-foreground mb-8 grow">
          {testimonial.quote}
        </p>

        {/* Star rating */}
        <div className="flex gap-1.5 mb-8">
          {[...Array(testimonial.rating || 5)].map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.2 }}
              className="text-primary"
            >
            
            </motion.div>
          ))}
        </div>

        {/* Author info */}
        <div className="flex items-center gap-4 pt-6 border-t border-border">
          {/* Avatar with initials only */}
          <motion.div
            className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-primary/20 flex items-center justify-center border border-primary/30"
            whileHover={{ scale: 1.1, borderColor: 'var(--theme-primary)' }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-display text-base font-bold text-primary uppercase tracking-wider">
              {testimonial.name
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </span>
          </motion.div>

          {/* Name and role */}
          <div className="flex-1">
            <h4 className="font-display text-base md:text-lg font-normal uppercase tracking-wide text-foreground mb-1">
              {testimonial.name}
            </h4>
            <p className="font-sans text-sm text-muted">{testimonial.role}</p>
          </div>

          {/* Verification check */}
          {testimonial.verified && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0"
            >
              <svg
                className="w-4 h-4 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
