import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Utility function to interpolate between two colors in RGB
 */
function interpolateColor(color1, color2, progress) {
  // Extract RGB values: expects "rgb(r, g, b)"
  const match1 = color1.match(/\d+/g);
  const match2 = color2.match(/\d+/g);

  if (!match1 || !match2) return color1;

  const [r1, g1, b1] = match1.map(Number);
  const [r2, g2, b2] = match2.map(Number);

  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * TextReveal Component
 * Animates text color from muted (gray) to primary (green) as user scrolls
 * Creates a professional text reveal effect similar to Awwwards-style landing pages
 */
export default function TextReveal({ children, className = '' }) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Color values (matches CSS variables)
  const MUTED_COLOR = 'rgb(156, 163, 175)'; // --theme-muted in dark theme
  const PRIMARY_COLOR = 'rgb(17, 173, 50)';  // #11ad32

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const element = containerRef.current;
      const elementRect = element.getBoundingClientRect();
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll position relative to element
      const elementStart = elementRect.top;
      const elementEnd = elementRect.bottom;

      // Calculate progress: 0 when element enters, 1 when element leaves
      let progress = 0;

      if (elementStart < windowHeight && elementEnd > 0) {
        // Element is in viewport
        // Progress increases as element moves up
        progress = 1 - elementStart / (windowHeight + elementHeight);
        progress = Math.max(0, Math.min(1, progress));
      } else if (elementStart <= 0) {
        // Element has completely passed the top
        progress = 1;
      }

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Split text into words for individual animation
  const words = children.split(' ');
  const totalWords = words.length;

  return (
    <motion.div
      ref={containerRef}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {words.map((word, index) => {
        // Stagger the reveal: each word animates slightly after the previous one
        const wordProgress = Math.max(
          0,
          Math.min(1, scrollProgress * (totalWords + 2) - index)
        );

        // Interpolate opacity: from 0.5 (muted/faded) to 1.0 (vivid/full color)
        const opacity = 0.5 + wordProgress * 0.5;

        // Interpolate color from gray (muted) to green (primary)
        const color = interpolateColor(MUTED_COLOR, PRIMARY_COLOR, wordProgress);

        return (
          <motion.span
            key={index}
            className="inline-block mr-[0.25em]"
            style={{
              color: color,
              opacity: opacity,
            }}
            animate={{
              color: color,
              opacity: opacity,
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
