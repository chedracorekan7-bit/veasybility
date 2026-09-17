import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Tag, User, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import MediaDisplay from '../components/MediaDisplay';
import { getProjectBySlug, projectImageUrl, resolveProjectUrl } from '../data/projects';

const API_URL = import.meta.env.VITE_API_URL || 'http://veasybility.test/api';
const STORAGE_URL = API_URL.replace(/\/api\/?$/, '/storage');

export default function ProjectDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState({ project: null, previous: null, next: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    
    // D'abord vérifier si le projet existe dans les données frontend
    const frontendProject = getProjectBySlug(slug);
    
    if (frontendProject.project) {
      // Le projet existe dans le frontend, utiliser ces données
      setData(frontendProject);
      setLoading(false);
    } else {
      // Le projet n'existe pas dans le frontend, essayer l'API
      axios
        .get(`${API_URL}/projects/${slug}`)
        .then((res) => { 
          setData(res.data); 
          setLoading(false); 
        })
        .catch(() => {
          // L'API a échoué aussi, rediriger vers la liste des projets
          navigate('/projects');
        });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-muted-strong text-sm">{t('project_details.loading')}</p>
        </div>
      </div>
    );
  }

  const { project, previous, next } = data;
  if (!project) return null;

  const coverImage =
    project.images?.[0]?.path || project.images?.[0]?.image_path
      ? `${STORAGE_URL}/${(project.images[0].path || project.images[0].image_path).replace(/^\//, '')}`
      : project.image || projectImageUrl(project.slug);

  const tags = project.tags || (project.category?.name ? [project.category.name] : []);
  const liveUrl = resolveProjectUrl(project);
  const liveHostname = (() => {
    if (!liveUrl) return '';
    try {
      return new URL(liveUrl).hostname.replace(/^www\./, '');
    } catch {
      return liveUrl;
    }
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slug}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-bg pt-28 pb-24 transition-colors duration-300"
      >
        {/* Back link */}
        <div className="max-w-5xl mx-auto px-6 mb-10">
          <Link to="/projects" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t('project_details.back')}
          </Link>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-6 mb-16"
        >
          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-foreground/5 border border-border-strong shadow-2xl">
            <MediaDisplay src={coverImage} alt={project.title} className="w-full h-full object-cover" autoPlay={true} muted={true} loop={true} mediaType={project.mediaType} />
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            <span className="inline-block text-primary font-bold uppercase tracking-widest text-xs mb-4 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              {project.category?.name ? t(project.category.name) : t('project_details.project_label')}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-foreground leading-tight">
              {project.titleKey ? t(project.titleKey) : project.title}
            </h1>
            
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="md:col-span-2"
            >
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t('project_details.overview')}</h2>
              <p className="text-muted leading-relaxed mb-6 text-lg">
                {project.descKey ? t(project.descKey) : project.description}
              </p>
              
              {/* Contenu spécifique du projet */}
              {project.titleKey && (
                <p className="text-muted leading-relaxed">
                  {(() => {
                    // Extraire la clé du projet (ex: 'ecommerce' depuis 'projects.items.ecommerce.title')
                    const keyMatch = project.titleKey.match(/projects\.items\.([a-z_]+)\.title/);
                    if (keyMatch && keyMatch[1]) {
                      const projectKey = keyMatch[1];
                      // Utiliser le contenu spécifique du projet s'il existe
                      const specificContent = t(`project_details.project_content.${projectKey}`, { defaultValue: '' });
                      if (specificContent && specificContent !== `project_details.project_content.${projectKey}`) {
                        return specificContent;
                      }
                    }
                    
                    // Fallback au contenu par défaut
                    return t('project_details.default_content');
                  })()}
                </p>
              )}
              
              {/* Fallback pour les projets sans titleKey */}
              {!project.titleKey && project.content && (
                <p className="text-muted leading-relaxed">{project.content}</p>
              )}
              {!project.titleKey && !project.content && (
                <p className="text-muted-strong leading-relaxed">{t('project_details.default_content')}</p>
              )}
              {tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-foreground/5 text-muted border border-border-strong">
                      <Tag size={12} className="text-primary" />{tag}
                    </span>
                  ))}
                </div>
              )}
              
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-surface p-8 rounded-3xl border border-border h-fit"
            >
              <h3 className="font-bold text-lg mb-6 text-foreground">{t('project_details.details')}</h3>
              <ul className="space-y-5">
                {project.client && (
                  <li className="flex items-start gap-3">
                    <User size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-muted-strong text-xs uppercase tracking-wider mb-0.5">{t('project_details.client')}</span>
                      <span className="text-foreground/90 font-medium">{project.client}</span>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <Tag size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-muted-strong text-xs uppercase tracking-wider mb-0.5">{t('project_details.category')}</span>
                    <span className="text-foreground/90 font-medium">
                      {project.category?.name ? t(project.category.name) : '—'}
                    </span>
                  </div>
                </li>
                {project.project_date && (
                  <li className="flex items-start gap-3">
                    <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-muted-strong text-xs uppercase tracking-wider mb-0.5">{t('project_details.year')}</span>
                      <span className="text-foreground/90 font-medium">
                        {new Date(project.project_date).getFullYear?.() || project.project_date}
                      </span>
                    </div>
                  </li>
                )}
                {liveUrl && (
                  <li className="pt-4 border-t border-border">
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 px-4 py-3  hover:text-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      {t('project_details.access_project')}
                      <ExternalLink size={14} />
                    </a>
                    {liveHostname && (
                      <span className="block mt-2 text-xs text-muted-strong truncate text-center"></span>
                    )}
                  </li>
                )}
              </ul>
            </motion.div>
          </div>

          {/* Gallery */}
          {project.images && project.images.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4 mb-20"
            >
              {project.images.slice(1).map((img, i) => (
                <div key={i} className="aspect-video rounded-2xl overflow-hidden bg-foreground/5">
                  <MediaDisplay
                    src={`${STORAGE_URL}/${(img.path || img.image_path).replace(/^\//, '')}`}
                    alt={`Visuel ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    autoPlay={false}
                    muted={true}
                    loop={true}
                    mediaType="image"
                  />
                </div>
              ))}
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{t('project_details.cta_title')}</h3>
              <p className="text-muted">{t('project_details.cta_desc')}</p>
            </div>
            <Link to="/contact" className="shrink-0 px-8 py-4 bg-transparent border border-white text-white font-bold  hover:bg-white hover:text-primary-foreground transition-all hover:-translate-y-1 hover:-translate-x-1  duration-500 hover:shadow-[0_0_30px_var(--theme-shadow-primary)]">
              {t('project_details.cta_btn')}
            </Link>
          </motion.div>

          {/* Pagination */}
          <div className="flex justify-between items-center py-10 border-t border-border-strong">
            {previous ? (
              <Link to={`/projects/${previous.slug}`} className="group flex flex-col items-start gap-1 max-w-[45%]">
                <span className="text-muted-strong text-sm flex items-center gap-2 group-hover:text-primary transition-colors">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('project_details.previous')}
                </span>
                <span className="font-bold text-xs text-muted group-hover:text-foreground transition-colors truncate">
                  {previous.titleKey ? t(previous.titleKey) : previous.title}
                </span>
              </Link>
            ) : <div />}
            {next ? (
              <Link to={`/projects/${next.slug}`} className="group flex flex-col items-end gap-1 max-w-[45%]">
                <span className="text-muted-strong text-sm flex items-center gap-2 group-hover:text-primary transition-colors">
                  {t('project_details.next')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="font-bold text-xs text-muted group-hover:text-foreground transition-colors truncate">
                  {next.titleKey ? t(next.titleKey) : next.title}
                </span>
              </Link>
            ) : <div />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
