import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AuroraHero from '../components/AuroraHero';
import { CheckCircle2, Zap, Handshake, ChevronRight } from 'lucide-react';
import { AnimatedCounter } from '../components/AboutComponents';
import TeamSlider from '../components/TeamSlider';

gsap.registerPlugin(ScrollTrigger);

const VALUES_ICONS = [CheckCircle2, Zap, Handshake];
const VALUES_KEYS = [
  { titleKey: 'about.value1_title', descKey: 'about.value1_desc' },
  { titleKey: 'about.value2_title', descKey: 'about.value2_desc' },
  { titleKey: 'about.value3_title', descKey: 'about.value3_desc' },
];

const STATS = [
  { value: '20', labelKey: 'about.stat1_label', suffix: '+' },
  { value: '15', labelKey: 'about.stat2_label', suffix: '+' },
  { value: '98', labelKey: 'about.stat3_label', suffix: '%' },
  { value: '2',  labelKey: 'about.stat4_label', suffix: '+' },
];

export default function About() {
  const { t } = useTranslation();

  const sectionRef = useRef(null);

  // Refs — Histoire
  const historyTitleRef = useRef(null);
  const wordsRef = useRef([]);

  // Refs — Valeurs
  const valuesTitleDesktopRef = useRef(null);
  const valuesTitleMobileRef  = useRef(null);
  const valuesTitleCharsRef   = useRef([]);
  const valuesCardsRef        = useRef([]);
  const valuesSectionRef      = useRef(null);
  const valuesMobileWrapRef   = useRef(null);
  const valuesMobileSectionRef = useRef(null);

  // Refs — Stats
  const statsSectionRef = useRef(null);
  const statsItemsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── 1. TITRE "Notre Histoire" ────────────────────────────────────────
      gsap.from(historyTitleRef.current, {
        opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: historyTitleRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // ─── 2. TEXT REVEAL ───────────────────────────────────────────────────
      if (wordsRef.current.length > 0) {
        gsap.set(wordsRef.current, { color: 'rgb(107, 114, 128)', opacity: 0.4 });
        gsap.to(wordsRef.current, {
          color: 'rgb(245, 245, 245)', opacity: 1, stagger: 0.06, ease: 'none',
          scrollTrigger: {
            trigger: wordsRef.current[0]?.parentElement,
            start: 'top 75%', end: 'bottom 30%', scrub: 1,
          },
        });
      }

      // ─── 3. TITRE "Nos Valeurs" lettres (desktop) ─────────────────────────
      if (valuesTitleCharsRef.current.length > 0 && valuesTitleDesktopRef.current) {
        gsap.from(valuesTitleCharsRef.current, {
          opacity: 0, y: 50, stagger: 0.04, duration: 0.6, ease: 'power3.out',
          scrollTrigger: {
            trigger: valuesTitleDesktopRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // ─── 4. BOÎTES VALEURS ────────────────────────────────────────────────
      const isMobile = window.innerWidth < 768;

      if (!isMobile && valuesSectionRef.current) {
        const cards = valuesCardsRef.current.filter(Boolean);
        gsap.set(cards, { opacity: 0, y: 70, scale: 0.96 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: valuesSectionRef.current,
            start: 'top 80px', end: '+=1200',
            pin: true, scrub: 1, anticipatePin: 1,
          },
        });

        cards.forEach((card, i) => {
          tl.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }, i * 0.6);
        });
        tl.to({}, { duration: 0.4 });
        tl.to(cards, { opacity: 0, y: -50, scale: 0.95, duration: 0.5, ease: 'power2.in', stagger: 0 });

      } else if (isMobile && valuesMobileWrapRef.current) {
        const mobileCards = Array.from(
          valuesMobileWrapRef.current.querySelectorAll('[data-mobile-card]')
        );

        gsap.set(mobileCards, { position: 'absolute', top: 0, left: 0, width: '100%' });
        gsap.set(mobileCards[0], { opacity: 0, y: 80, x: 0 });
        gsap.set(mobileCards[1], { opacity: 0, y: 0, x: -window.innerWidth });
        gsap.set(mobileCards[2], { opacity: 0, y: 0, x: window.innerWidth });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: valuesMobileSectionRef.current,
            start: 'top 80px', end: '+=1800',
            pin: true, scrub: 1, anticipatePin: 1,
          },
        });

        tl.to(mobileCards[0], { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0);
        tl.to(mobileCards[0], { opacity: 0, y: -80, duration: 0.4, ease: 'power2.in' }, 0.6);
        tl.to(mobileCards[1], { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0.6);
        tl.to(mobileCards[1], { opacity: 0, x: window.innerWidth, duration: 0.4, ease: 'power2.in' }, 1.2);
        tl.to(mobileCards[2], { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 1.2);
        tl.to(mobileCards[2], { opacity: 0, x: -window.innerWidth, duration: 0.4, ease: 'power2.in' }, 1.8);
      }

      // ─── 5. STATS ─────────────────────────────────────────────────────────
      const statsItems = statsItemsRef.current.filter(Boolean);
      if (statsItems.length > 0) {
        gsap.from(statsItems, {
          opacity: 0, y: 50, stagger: 0.12, duration: 0.7, ease: 'power3.out',
          scrollTrigger: {
            trigger: statsSectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = t('about.history_text').split(' ');
  const valuesTitle = t('about.values_title');

  return (
    <div className="w-full" ref={sectionRef}>

      <AuroraHero
        title={t('about.hero_title')}
        description={t('about.hero_desc')}
        ctaText={t('about.hero_cta')}
        ctaLink="/projects"
      />

      <section className="py-24 md:py-32 px-6 bg-surface relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto">

          {/* ── Notre Histoire ── */}
          <div className="mb-28">
            <h2
              ref={historyTitleRef}
              className="font-display text-3xl md:text-4xl font-normal uppercase tracking-wide mb-10 text-foreground"
            >
              {t('about.history_title')}
            </h2>
            <p className="font-sans text-lg md:text-2xl leading-relaxed max-w-3xl">
              {words.map((word, i) => (
                <span
                  key={i}
                  ref={el => { wordsRef.current[i] = el; }}
                  className="inline-block mr-[0.3em]"
                  style={{ color: 'rgb(107, 114, 128)', opacity: 0.4 }}
                >
                  {word}
                </span>
              ))}
            </p>
          </div>

          {/* ── Nos Valeurs ── */}
          <div className="mb-0">

            {/* DESKTOP */}
            <div ref={valuesSectionRef} className="hidden md:block">
              <h2
                ref={valuesTitleDesktopRef}
                className="font-display text-3xl md:text-4xl font-normal uppercase tracking-wide mb-16 text-foreground text-center overflow-hidden"
              >
                {valuesTitle.split('').map((char, i) => (
                  <span
                    key={i}
                    ref={el => { valuesTitleCharsRef.current[i] = el; }}
                    className="inline-block"
                    style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </h2>
              <div className="grid grid-cols-3 gap-8">
                {VALUES_KEYS.map(({ titleKey, descKey }, i) => {
                  const Icon = VALUES_ICONS[i];
                  return (
                    <div
                      key={i}
                      ref={el => { valuesCardsRef.current[i] = el; }}
                      className="bg-bg border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors duration-300 group"
                    >
                      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon size={32} strokeWidth={1.5} />
                      </div>
                      <h3 className="font-display text-2xl font-normal uppercase tracking-wide mb-4 text-foreground">
                        {t(titleKey)}
                      </h3>
                      <p className="font-sans text-muted leading-relaxed">{t(descKey)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MOBILE */}
            <div ref={valuesMobileSectionRef} className="md:hidden">
              <h2
                ref={valuesTitleMobileRef}
                className="font-display text-3xl font-normal uppercase tracking-wide mb-10 text-foreground text-center"
              >
                {t('about.values_title')}
              </h2>
              <div className="flex justify-center">
                <div
                  ref={valuesMobileWrapRef}
                  className="relative overflow-hidden rounded-2xl w-full max-w-sm"
                  style={{ height: '340px' }}
                >
                  {VALUES_KEYS.map(({ titleKey, descKey }, i) => {
                    const Icon = VALUES_ICONS[i];
                    return (
                      <div
                        key={i}
                        data-mobile-card
                        className="bg-bg border border-border rounded-2xl p-8"
                      >
                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                          <Icon size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="font-display text-2xl font-normal uppercase tracking-wide mb-4 text-foreground">
                          {t(titleKey)}
                        </h3>
                        <p className="font-sans text-muted leading-relaxed">{t(descKey)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* ── Stats ── */}
          <div
            ref={statsSectionRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 mt-24 "
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                ref={el => { statsItemsRef.current[i] = el; }}
                className="text-center"
              >
                <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                  <AnimatedCounter value={stat.value} duration={2.5} />
                  <span className="ml-1">{stat.suffix}</span>
                </div>
                <p className="font-sans text-muted text-lg">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <TeamSlider/>

      {/* ── CTA ── */}
      <section className="py-24 md:py-32 px-6 bg-bg relative transition-colors duration-300 overflow-hidden">
        <div className="absolute -top-40 right-0 w-150 h-150 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-100 h-100 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto relative z-10 text-center"
        >
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-normal uppercase tracking-wide mb-6 text-foreground">
            {t('about.cta_title')}
          </h2>
          <p className="font-sans text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto mb-12">
            {t('about.cta_desc')}
          </p>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-white text-white font-sans font-semibold  hover:bg-white hover:text-primary-foreground transition-all duration-500 hover:-translate-y-1 hover:-translate-x-1"
          >
            {t('about.cta_btn')}
            <ChevronRight size={18} className="group-hover:translate-x-0.5  transition-transform" />
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
