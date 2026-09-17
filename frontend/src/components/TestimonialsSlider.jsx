import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TestimonialCard from './TestimonialCard';

/**
 * TestimonialsSlider Component
 * Carrousel de témoignages avec navigation par flèches et indicateurs
 * Défilement automatique avec auto-play et transitions fluides
 */
export default function TestimonialsSlider({ testimonials = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [direction, setDirection] = useState(1);
  const { t } = useTranslation();

  const totalTestimonials = testimonials.length || 0;

  // Auto-play interval
  useEffect(() => {
    if (!autoplay || totalTestimonials === 0) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % totalTestimonials);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(timer);
  }, [autoplay, totalTestimonials]);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setAutoplay(false);
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setAutoplay(true), 10000);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalTestimonials - 1 : prevIndex - 1
    );
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalTestimonials);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  if (totalTestimonials === 0) {
    return (
      <section className="py-24 md:py-32 px-6 bg-bg relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted text-lg">{t('home.no_testimonials')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 px-6 bg-bg relative transition-colors duration-300 overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute -bottom-40 -left-40 w-150 h-150 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 right-0 w-100 h-100 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-primary rounded-full" />
          <span className="font-sans text-sm uppercase tracking-widest text-primary font-semibold">
            {t('home.testimonials_label')}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl md:text-5xl lg:text-6xl font-normal uppercase tracking-wide mb-6 text-foreground"
        >
          {t('home.testimonials_title')} <span className="text-primary">{t('home.testimonials_title_accent')}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-muted text-lg mb-12 max-w-2xl"
        >
          {t('home.testimonials_desc')}
        </motion.p>

        {/* Testimonials Carousel Container */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-1 gap-6 md:gap-8"
          >
            {/* Main testimonial with fade in/fade out transition */}
            <div className="relative">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <TestimonialCard
                  testimonial={testimonials[currentIndex]}
                  isActive={true}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation and indicators - Centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-8"
          >
            {/* Navigation buttons - Centered */}
            <div className="flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevious}
                className="w-12 h-12 rounded-full border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center text-foreground hover:text-primary transition-all duration-300 group"
              >
                <ChevronLeft
                  size={20}
                  className="group-hover:scale-125 transition-transform"
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNext}
                className="w-12 h-12 rounded-full border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center text-foreground hover:text-primary transition-all duration-300 group"
              >
                <ChevronRight
                  size={20}
                  className="group-hover:scale-125 transition-transform"
                />
              </motion.button>
            </div>

            {/* Slide indicators - Centered */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-sans text-muted">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <div className="flex gap-1.5">
                {[...Array(totalTestimonials)].map((_, i) => {
                  const isActive = i === currentIndex;
                  return (
                    <motion.button
                      key={i}
                      layout
                      onClick={() => goToSlide(i)}
                      className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive ? 'bg-primary w-6' : 'bg-border w-2 hover:bg-muted'
                      }`}
                      whileHover={{ scaleY: 1.5 }}
                    />
                  );
                })}
              </div>
              <span className="text-sm font-sans text-muted">
                {String(totalTestimonials).padStart(2, '0')}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
