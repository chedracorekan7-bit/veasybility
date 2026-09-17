import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MediaDisplay from '../components/MediaDisplay';
import { getProjectsWithImages } from '../data/projects';

const projects = getProjectsWithImages();

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.25 } },
};

export default function Projects() {
  const { t } = useTranslation();

  const categories = [
    { key: 'all',       label: t('projects.cat_all') },
    { key: 'dev',       label: t('projects.cat_dev') },
    { key: 'design',    label: t('projects.cat_design') },
    { key: 'branding',  label: t('projects.cat_branding') },
    { key: 'video',     label: t('projects.cat_video') },
    { key: 'motion',    label: t('projects.cat_motion') },
    { key: 'marketing', label: t('projects.cat_marketing') },
  ];

  const [searchParams] = useSearchParams();

  // Lire le filtre depuis l'URL (?category=dev) — synchronisé à chaque navigation
  const VALID_CATEGORIES = ['all', 'dev', 'design', 'branding', 'video', 'motion', 'marketing'];
  const urlCategory = searchParams.get('category');
  const initialCategory = VALID_CATEGORIES.includes(urlCategory) ? urlCategory : 'all';

  const [activeKey, setActiveKey] = useState(initialCategory);

  // Mettre à jour le filtre si l'URL change (ex : bouton retour)
  useEffect(() => {
    const cat = searchParams.get('category');
    setActiveKey(VALID_CATEGORIES.includes(cat) ? cat : 'all');
  }, [searchParams]);

  const filteredProjects = activeKey === 'all'
    ? projects
    : projects.filter(p => p.categoryValue === activeKey);

  return (
    <div className="min-h-screen bg-bg pt-32 pb-24 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tighter leading-none">
            {t('projects.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#7fff00]">
              {t('projects.title_accent')}
            </span>
          </h1>
          <p className="text-muted text-xl max-w-2xl mx-auto leading-relaxed">
            {t('projects.subtitle')}
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.key}
              onClick={() => setActiveKey(cat.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeKey === cat.key
                  ? 'text-primary-foreground'
                  : 'text-muted bg-foreground/5 border border-border-strong hover:border-primary/40 hover:text-primary'
              }`}
            >
              {activeKey === cat.key && (
                <motion.span
                  layoutId="activePill"
                  className="absolute inset-0 rounded-full bg-primary"
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Count */}
        <motion.p
          key={activeKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-strong text-sm mb-10"
        >
          {t(`projects.count_${filteredProjects.length > 1 ? 'other' : 'one'}`, { count: filteredProjects.length })}
        </motion.p>

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeKey}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={cardVariants}
                layout
                className="group relative overflow-hidden rounded-2xl bg-surface border border-border hover:border-primary/30 transition-colors duration-500 cursor-pointer"
              >
                <Link to={`/projects/${project.slug}`} className="block">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <MediaDisplay
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      mediaType={project.mediaType}
                      autoPlay={false}
                      muted={true}
                      loop={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-70" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-xs text-muted px-3 py-1 rounded-full border border-border-strong">
                      {project.year}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_15px_var(--theme-shadow-primary)]"
                    >
                      <ArrowUpRight size={18} className="text-primary-foreground" />
                    </motion.div>
                  </div>
                  <div className="p-6">
                    <span className="text-primary text-xs font-bold tracking-widest uppercase mb-2 block">
                      {t(project.categoryKey)}
                    </span>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {t(project.titleKey)}
                    </h3>
                    <p className="text-muted-strong text-sm leading-relaxed mb-4 line-clamp-2">
                      {t(project.descKey)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1 rounded-full bg-foreground/5 text-muted border border-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="text-muted-strong text-lg">{t('projects.empty')}</p>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-24"
        >
          <p className="text-muted mb-6 text-lg">{t('projects.cta_question')}</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-transparent text-white border  font-bold hover:bg-white hover:text-black transition-all duration-300 group hover:-translate-y-1 hover:-translate-x-1"
          >
            {t('projects.cta_btn')}
            <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
