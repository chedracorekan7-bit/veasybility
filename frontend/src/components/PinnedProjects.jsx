import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OptimizedImage from './OptimizedImage';

gsap.registerPlugin(ScrollTrigger);

export default function PinnedProjects({ projects }) {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const imageRefs = useRef([]);
  const textRefs = useRef([]);
  const bgTextRef = useRef(null);

  // Limiter à 6 projets
  const displayProjects = projects?.slice(0, 6) || [];

  useEffect(() => {
    // Utilisation de gsap.context pour un nettoyage facile lors du démontage (React 18+)
    const ctx = gsap.context(() => {
      
      // 1. Animation secondaire : Parallaxe sur le grand texte d'arrière-plan
      gsap.to(bgTextRef.current, {
        y: '20vh', // Déplace le texte vers le bas pendant le scroll
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      // 2. Comportement de scroll principal (ScrollTrigger pin)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80px", // Décalage = hauteur navbar (~80px) pour que le titre reste visible
          end: "+=800%",
          pin: true,
          scrub: 1,
        }
      });

      // 3. Configuration initiale des éléments
      // Inverser l'ordre des z-index pour que l'image suivante soit au-dessus de l'actuelle (surplanter)
      gsap.set(imageRefs.current, { zIndex: (i) => i });
      
      displayProjects.forEach((_, i) => {
        if (i === 0) {
          // Slide 1 visible par défaut
          gsap.set(textRefs.current[0], { autoAlpha: 1, x: 0 });
          gsap.set(imageRefs.current[0], { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' });
        } else {
          // Déterminer la direction d'arrivée en fonction de l'index (pair/impair)
          const isFromRight = i % 2 !== 0;
          
          // Autres slides cachées initialement
          gsap.set(textRefs.current[i], { autoAlpha: 0, x: isFromRight ? 150 : -150 }); 
          gsap.set(imageRefs.current[i], { 
            clipPath: isFromRight 
              ? 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)' // Depuis la droite
              : 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' // Depuis la gauche
          });
        }
      });

      // 4. Création des transitions avec direction alternée
      for (let i = 1; i < displayProjects.length; i++) {
        const label = `slide${i}`;
        const isFromRight = i % 2 !== 0;
        
        tl.addLabel(`${label}_start`, "+=0.5");

        // --- Images ---
        // Image entrante (vers la pleine vue)
        tl.to(imageRefs.current[i], {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          ease: "power2.inOut",
          duration: 1
        }, `${label}_start`);

        // Image sortante (translation opposée en arrière-plan, sans couper le clipPath pour éviter tout vide)
        tl.to(imageRefs.current[i - 1], {
          xPercent: isFromRight ? -20 : 20, 
          ease: "power2.inOut",
          duration: 1
        }, `${label}_start`);

        // --- Textes ---
        // Texte sortant
        tl.to(textRefs.current[i - 1], {
          autoAlpha: 0,
          x: isFromRight ? -150 : 150,
          ease: "power2.inOut",
          duration: 1
        }, `${label}_start`);

        // Texte entrant
        tl.to(textRefs.current[i], {
          autoAlpha: 1,
          x: 0,
          ease: "power2.inOut",
          duration: 1
        }, `${label}_start`);

        tl.addLabel(`${label}_end`, "+=0.5");
      }

    }, sectionRef);

    // Nettoyage complet des ScrollTriggers créés lors du démontage
    return () => ctx.revert();
  }, [displayProjects]);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-screen overflow-hidden bg-bg text-foreground"
      style={{ scrollMarginTop: '80px' }}
    >
      {/* Background Text Parallax (Effet de profondeur) */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <span 
          ref={bgTextRef}
          className="font-display mb-50 text-[12vw] font-bold uppercase tracking-widest opacity-5 text-foreground whitespace-nowrap"
        >
         
        </span>
      </div>

      {/* Titre de la Section */}
      <div className="absolute top-10 left-6 md:left-12 z-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wider text-foreground">
          {t('home.projects_title')}
        </h2>
      </div>

      {/* Conteneur Principal : 2 colonnes */}
      <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col md:flex-row items-center z-10 px-6 pt-16 pb-24">
        
        {/* Colonne 1 : Textes */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative flex items-center order-2 md:order-1">
          {displayProjects.map((project, index) => (
            <div 
              key={`text-${project.id}`} 
              ref={el => textRefs.current[index] = el}
              className="absolute inset-0 flex flex-col justify-center px-4 md:pr-12"
            >
              <span className="text-primary font-sans text-sm md:text-base font-semibold mb-4 tracking-wider uppercase">
                {t(project.categoryKey)}
              </span>
              <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal uppercase mb-6 leading-tight">
                {t(project.titleKey)}
              </h3>
              <p className="font-sans text-muted text-base md:text-lg leading-relaxed mb-8 max-w-md">
                {t(project.descKey)}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                {project.tags?.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-4 py-2 bg-foreground/5 border border-border/50 rounded-full text-xs font-sans text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Colonne 2 : Images (Masques de découpe) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative flex items-center justify-center order-1 md:order-2 py-12 md:py-24">
          {/* Conteneur des images */}
          <div className="relative w-full h-full max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
            {displayProjects.map((project, index) => (
              <div 
                key={`img-${project.id}`} 
                ref={el => imageRefs.current[index] = el}
                className="absolute inset-0 w-full h-full"
                // Optimisation des performances pour les animations
                style={{ willChange: 'clip-path, transform' }}
              >
                <Link to={`/projects/${project.slug}`} className="block w-full h-full group">
                  {/* Overlay subtil pour le contraste */}
                  <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none group-hover:bg-black/0 transition-colors duration-300"></div>
                  <OptimizedImage
                    src={project.image}
                    alt={project.title}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bouton Voir tous les projets */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-auto">
        <Link 
          to="/projects" 
          className="group relative flex md:inline-flex items-center justify-center gap-3 w-full md:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-transparent border border-foreground text-foreground font-sans font-semibold hover:bg-foreground hover:text-bg transition-all duration-500 overflow-hidden shadow-lg  hover:-translate-y-1 hover:translate-x-1 text-sm md:text-base hover:shadow-[0_0_30px_var(--theme-shadow-primary)]"
        >
          <span className="relative z-10">{t('home.projects_see_all')}</span>
          <svg className="w-4 h-4 md:w-5 md:h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
    </section>
  );
}
