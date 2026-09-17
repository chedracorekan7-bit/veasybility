import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * AuroraHero Component
 * Hero section premium avec effet aurore boréale verte (Northern Lights)
 * Utilise des blur effects animés pour créer une ambiance luxe
 */
export default function AuroraHero({ title, description, ctaText, ctaLink, ctaAction }) {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden bg-bg">
      {/* Northern Lights Effect - Multiple animated blur layers */}
      
      {/* Aurora 1 - Main green light with vertical flow */}
      <motion.div
        animate={{
          y: [0, 40, -20, 0],
          opacity: [0.4, 0.8, 0.6, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -right-40 w-150 h-150 bg-primary/40 rounded-full blur-3xl pointer-events-none"
      />

      {/* Aurora 2 - Secondary light from left */}
      <motion.div
        animate={{
          y: [-30, 30, -10, -30],
          opacity: [0.3, 0.7, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-1/3 -left-60 w-175 h-175 bg-primary/25 rounded-full blur-3xl pointer-events-none"
      />

      {/* Aurora 3 - Accent light for depth */}
      <motion.div
        animate={{
          y: [20, -20, 10, 20],
          opacity: [0.25, 0.6, 0.4, 0.25],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 right-1/3 w-120 h-120 bg-primary/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-bg/30 to-bg pointer-events-none" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto relative z-10 text-center"
      >
        {/* Subtitle badge */}
       

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-normal uppercase tracking-wider text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-8 text-foreground leading-[1.1]"
        >
          {title.split(' ').map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4 + i * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`inline-block mr-3 ${i === 1 ? 'text-primary' : ''}`}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-lg md:text-xl lg:text-2xl font-normal text-muted leading-relaxed max-w-2xl mx-auto mb-12"
        >
          {description}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {ctaAction ? (
            <button
              onClick={ctaAction}
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-white text-primary font-sans font-semibold rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-500 overflow-hidden "
            >

              <span className="relative z-10">{ctaText}</span>
              <motion.div
                className="relative z-10"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.3 }}
              >
                →
              </motion.div>
            </button>
          ) : (
            <a
              href={ctaLink}
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-white text-white font-sans font-semibold hover:bg-white hover:text-primary-foreground transition-all duration-500 overflow-hidden hover:-translate-y-1 hover:-translate-x-1"
            >
              <span className="relative z-10">{ctaText}</span>
              <motion.div
                className="relative z-10"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.3 }}
              >
              <ChevronRight size={18} className="group-hover:translate-x-0.5  transition-transform" />

                
              </motion.div>
            </a>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        
        
      </motion.div>
    </section>
  );
}
