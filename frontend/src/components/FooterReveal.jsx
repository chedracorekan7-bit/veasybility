import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function FooterReveal() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const getBottomNavHeight = useCallback(() =>
    window.innerWidth < 768 ? 64 + (window.screen?.height - window.innerHeight > 100 ? 34 : 0) : 0
  , []);

  const updateProgress = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const bottomNavHeight = getBottomNavHeight();
    const effectiveViewportHeight = window.innerHeight - bottomNavHeight;
    const totalDistance = rect.height;
    const distanceScrolled = effectiveViewportHeight - rect.top;
    const progress = Math.max(0, Math.min(1, distanceScrolled / totalDistance));
    setScrollProgress(progress);
  }, [getBottomNavHeight]);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateProgress]);

  const mappedProgress = Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.75));
  const clipPercentage = 100 - mappedProgress * 100;
  const clipPath = `inset(0% ${clipPercentage}% 0% 0%)`;

  const y = 25 - scrollProgress * 25;

  // Option 3 : letter-spacing négatif sur mobile uniquement
  // Part de -0.08em (serré) vers -0.02em (normal) au fil du scroll
  const letterSpacing = isMobile
    ? `${-0.08 + mappedProgress * 0.06}em`
    : 'normal';

  const textStyle = {
    letterSpacing,
    fontSize: isMobile ? '8vw' : '9vw',
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#050505] py-1 md:py-4 pb-[calc(4rem+env(safe-area-inset-bottom)+8rem)] md:pb-10 overflow-hidden border-t border-white/5 flex items-center justify-center"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw]  bg-[#11ad32]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full px-4 flex items-center justify-center">
        <div
          style={{ transform: `translateY(${y}px)` }}
          className="relative w-full flex items-center justify-center"
        >
          {/* Couche de base — réserve la hauteur */}
          <div
            style={textStyle}
            className="font-michroma font-bold text-center tracking-tight leading-none text-transparent uppercase select-none whitespace-nowrap"
          >
            VEASYBILITY
          </div>

          {/* Couche animée — révélée de gauche à droite */}
          <div
            style={{ clipPath, WebkitClipPath: clipPath }}
            className="absolute inset-0 flex items-center justify-center select-none"
          >
            <div
              style={textStyle}
              className="font-michroma font-bold text-center leading-none uppercase whitespace-nowrap"
            >
              <span className="text-white">V</span>
              <span className="text-[#11ad32]">EASY</span>
              <span className="text-white">BILITY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
