import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedCounter Component
 * Anime les chiffres lorsqu'ils entrent dans le viewport
 * Déclenche uniquement lors de l'intersection avec le viewport
 */
export function AnimatedCounter({ value, duration = 2.5 }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Extrait le nombre du string (ex: "50", "98%", "6 ans" => 50, 98, 6)
    const numericValue = parseInt(value.replace(/\D/g, ''));
    
    if (isNaN(numericValue) || numericValue === 0) return;

    // Configuration du IntersectionObserver pour détecter l'entrée au viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Animation des compteurs
          let currentValue = 0;
          const increment = numericValue / (duration * 60); // 60 FPS
          
          const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
              setCount(numericValue);
              clearInterval(timer);
            } else {
              setCount(Math.floor(currentValue));
            }
          }, 1000 / 60);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3, rootMargin: '50px' }
    );

    const currentRef = ref.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{count}</span>;
}

// ValueCard et StatCard sont désormais gérés directement dans About.jsx via GSAP
