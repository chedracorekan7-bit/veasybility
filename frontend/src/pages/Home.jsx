import { motion } from 'framer-motion';
import { ChevronRight, Code, PenTool, LayoutTemplate, Video, TrendingUp, MegaphoneIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TypewriterText from '../components/TypewriterText';
import SkillsMarquee from '../components/SkillsMarquee';
import TextReveal from '../components/TextReveal';
import PinnedProjects from '../components/PinnedProjects';
import TestimonialsSlider from '../components/TestimonialsSlider';
import { getProjectsWithImages } from '../data/projects';

export default function Home() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const specialties = [
    { icon: <Code size={32} />, titleKey: 'home.spec_dev', descKey: 'home.spec_dev_desc' },
    { icon: <PenTool size={32} />, titleKey: 'home.spec_design', descKey: 'home.spec_design_desc' },
    { icon: <LayoutTemplate size={32} />, titleKey: 'home.spec_branding', descKey: 'home.spec_branding_desc' },
    { icon: <Video size={32} />, titleKey: 'home.spec_video', descKey: 'home.spec_video_desc' },
    { icon: <TrendingUp size={32} />, titleKey: 'home.spec_marketing', descKey: 'home.spec_marketing_desc' },
    { icon: <MegaphoneIcon size={32} />, titleKey: 'home.spec_motion', descKey: 'home.spec_motion_desc' },
  ];

  const projects = getProjectsWithImages().slice(0, 6);

  const testimonials = [
    {
      id: 1,
      quote: t('home.testimonial1_quote'),
      name: 'Rose DAKO',
      role: t('home.testimonial1_role'),
      rating: 5,
      verified: true,
    },
    {
      id: 2,
      quote: t('home.testimonial2_quote'),
      name: 'Vital Akpomali',
      role: t('home.testimonial2_role'),
      rating: 5,
      verified: true,
    },
    {
      id: 3,
      quote: t('home.testimonial3_quote'),
      name: 'Moussa justin',
      role: t('home.testimonial3_role'),
      rating: 5,
      verified: true,
    },
    {
      id: 4,
      quote: t('home.testimonial4_quote'),
      name: 'Bovis Constant',
      role: t('home.testimonial4_role'),
      rating: 5,
      verified: true,
    },
    {
      id: 5,
      quote: t('home.testimonial5_quote'),
      name: 'Judicael Kossi',
      role: t('home.testimonial5_role'),
      rating: 5,
      verified: true,
    },
    {
      id: 6,
      quote: t('home.testimonial6_quote'),
      name: 'Prince Bongo',
      role: t('home.testimonial6_role'),
      rating: 5,
      verified: true,
    },
    {
      id: 7,
      quote: t('home.testimonial7_quote'),
      name: 'No Risky Art',
      role: t('home.testimonial7_role'),
      rating: 5,
      verified: true,
    },
  ];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col pt-32 md:pt-40 pb-12 md:pb-16 px-6 overflow-hidden bg-bg">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(17,173,50,0.06),transparent_55%)] pointer-events-none" />

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto relative z-10 px-6 w-full flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start flex-1">
            <div className="text-left flex flex-col self-stretch min-h-[calc(100svh-12rem)] lg:min-h-0">
              <motion.h1
                variants={itemVariants}
                className="font-display font-normal uppercase tracking-wider text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.2]"
              >
                <TypewriterText
                  as="span"
                  className="block"
                  speed={42}
                  initialDelay={900}
                  linePause={360}
                  lines={[
                    { text: t('home.hero_line1'), pauseAfter: 2000 },
                    { text: t('home.hero_line2'), className: 'text-primary block mt-2 md:mt-3' },
                  ]}
                />
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="lg:hidden font-sans text-sm md:text-base font-normal text-muted leading-relaxed mt-8 text-justify"
              >
                {t('home.hero_desc')}
              </motion.p>

              <motion.div variants={itemVariants} className="mt-auto flex flex-col sm:flex-row gap-4 justify-start items-center">
                <Link
                  to="/contact"
                  className="font-sans px-7 py-3.5 bg-transparent border border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-500 flex items-center gap-1 group w-full sm:w-auto justify-center text-sm hover:-translate-y-1 hover:translate-x-1"
                >
                  {t('home.cta_start')} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/projects"
                  className="font-sans px-7 py-3.5 my-2 bg-transparent border border-foreground text-foreground font-medium hover:bg-foreground hover:text-bg transition-all duration-500 w-full sm:w-auto justify-center text-center text-sm hover:-translate-y-1 hover:translate-x-1 hover:shadow-[0_0_30px_var(--theme-shadow-primary)]"
                >
                  {t('home.cta_projects')}
                </Link>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="hidden lg:flex flex-col self-stretch">
              <motion.p
                variants={itemVariants}
                className="mt-auto font-sans text-sm md:text-base lg:text-lg font-normal text-muted leading-relaxed max-w-lg lg:ml-auto text-justify"
              >
                {t('home.hero_desc')}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <SkillsMarquee />

      {/* À propos */}
      <section className="py-24 md:py-32 px-6 bg-bg relative transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-3xl md:text-4xl lg:text-5xl font-normal uppercase tracking-wide mb-12 text-foreground text-center"
            >
              {t('home.about_title')}
            </motion.h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans text-lg md:text-xl lg:text-2xl font-normal leading-relaxed text-center max-w-3xl mx-auto"
          >
            <TextReveal
              className="font-sans text-lg md:text-xl lg:text-2xl font-normal leading-relaxed text-center block"
              children={t('home.about_text')}
            />
          </motion.p>
        </div>
      </section>

      {/* Spécialités */}
      <section className="py-32 px-6 bg-surface relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }} className="mb-20 text-center md:text-left">
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-normal uppercase tracking-wide mb-6 text-foreground">
              {t('home.specialties_title')}
            </h2>
            <p className="font-sans text-muted text-lg md:text-xl max-w-2xl font-normal leading-relaxed">
              {t('home.specialties_desc')}
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {specialties.map((spec, idx) => (
              <motion.div
                key={idx}
                variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
                className="bg-foreground/5 border border-border hover:border-primary/30 p-8 rounded-3xl transition-colors group cursor-pointer"
              >
                <div className="w-16 h-16 bg-bg rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  {spec.icon}
                </div>
                <h3 className="font-display text-xl md:text-2xl font-normal uppercase tracking-wide mb-4 text-foreground">
                  {t(spec.titleKey)}
                </h3>
                <p className="font-sans text-muted font-normal leading-relaxed">{t(spec.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <PinnedProjects className="scroll-mt-30" projects={projects} />
      <TestimonialsSlider testimonials={testimonials} />
    </div>
  );
}
