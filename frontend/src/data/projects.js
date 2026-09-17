/** Données centralisées des projets */
// titleKey / descKey / categoryKey → clés i18n dans projects.items.*
// categoryValue → valeur interne stable pour le filtrage (indépendant de la langue)
// project_url → destination unique du livrable (site, démo, etc.)

// Import des images locales
import visuelImage from '../assets/images/projects/visuel.avif';
import social from '../assets/images/projects/social.avif';
import motionVideo from '../assets/images/projects/motion.webm';

export function resolveProjectUrl(project) {
  const raw = project?.project_url || project?.url || '';
  if (typeof raw !== 'string') return null;
  const url = raw.trim();
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export const projects = [
  {
    id: 1,
    titleKey: 'projects.items.ecommerce.title',
    descKey: 'projects.items.ecommerce.desc',
    categoryKey: 'projects.cat_dev',
    categoryValue: 'dev',
    slug: 'e-commerce-premium',
    tags: ['React', 'Laravel', 'Stripe'],
    year: '2025',
    project_date: '2025',
    client: 'Yubuy',
    project_url: 'https://yubuy.vercel.app',
  },
  {
    id: 2,
    titleKey: 'projects.items.refonte.title',
    descKey: 'projects.items.refonte.desc',
    categoryKey: 'projects.cat_branding',
    categoryValue: 'branding',
    slug: 'refonte-identite',
    tags: ['Branding', 'Figma', 'Illustrator'],
    year: '2025',
    project_date: '2025',
    client: 'Mr Trends',
    project_url: '',
  },
  {
    id: 3,
    titleKey: 'projects.items.fintech.title',
    descKey: 'projects.items.fintech.desc',
    categoryKey: 'projects.cat_dev',
    categoryValue: 'dev',
    slug: 'app-mobile-fintech',
    tags: ['React Native', 'Node.js', 'AWS'],
    year: '2025',
    project_date: '2025',
    client: 'Flooz',
    project_url: '',
  },
  {
    id: 4,
    titleKey: 'projects.items.clip.title',
    descKey: 'projects.items.clip.desc',
    categoryKey: 'projects.cat_video',
    categoryValue: 'video',
    slug: 'clip-promo',
    tags: ['Premiere Pro', 'After Effects', '4K'],
    year: '2025',
    project_date: '2025',
    client: 'Green Spot',
    project_url: '',
  },
  {
    id: 5,
    titleKey: 'projects.items.dashboard.title',
    descKey: 'projects.items.dashboard.desc',
    categoryKey: 'projects.cat_dev',
    categoryValue: 'dev',
    slug: 'dashboard-analytics',
    tags: ['Figma', 'D3.js', 'UX Research'],
    year: '2025',
    project_date: '2025',
    client: 'Yubuy',
    project_url: '',
  },
  {
    id: 6,
    titleKey: 'projects.items.vitrine.title',
    descKey: 'projects.items.vitrine.desc',
    categoryKey: 'projects.cat_dev',
    categoryValue: 'dev',
    slug: 'site-vitrine-luxe',
    tags: ['Next.js', 'GSAP', 'Three.js'],
    year: '2025',
    project_date: '2025',
    client: 'Karz',
    project_url: 'https://cinematic-landpage.vercel.app',
  },
  {
    id: 7,
    titleKey: 'projects.items.motion_camp.title',
    descKey: 'projects.items.motion_camp.desc',
    categoryKey: 'projects.cat_design',
    categoryValue: 'design',
    slug: 'campagne-motion',
    tags: ['Motion Design', 'After Effects'],
    year: '2025',
    project_date: '2025',
    client: 'Umedia',
    project_url: '',
  },
 
  {
    id: 9,
    titleKey: 'projects.items.showreel.title',
    descKey: 'projects.items.showreel.desc',
    categoryKey: 'projects.cat_motion',
    categoryValue: 'motion',
    slug: 'showreel-motion-design',
    tags: ['Cinema 4D', 'After Effects', 'Animation'],
    year: '2025',
    project_date: '2025',
    client: 'Creative Studio',
    project_url: '',
  },
  {
    id: 10,
    titleKey: 'projects.items.campagne.title',
    descKey: 'projects.items.campagne.desc',
    categoryKey: 'projects.cat_marketing',
    categoryValue: 'marketing',
    slug: 'campagne-digitale',
    tags: ['SEO', 'Google Ads', 'Analytics'],
    year: '2025',
    project_date: '2025',
    client: 'Bovispace',
    project_url: '',
  },
];

/** Correspondance noms de fichiers Unsplash → slug projet */
export const imageFileToSlug = {
  'photo-1661956602116-aa6865609028': 'e-commerce-premiu',
  'photo-1600880292203-757bb62b4baf': 'refonte-identite',
  'photo-1512941937669-90a1b58e7e9c': 'app-mobile-fintech',
  'photo-1574717024653-61fd2cf4d44d': 'clip-promo',
  'photo-1551288049-bebda4e38f71': 'dashboard-analytics',
  'photo-1460925895917-afdab827c52f': 'campagne-digitale',
  'photo-1550745165-9bc0b252726f': 'showreel-motion-design',
  'photo-1558655146-d09347e92766': 'campagne-motion',
  'photo-1559136555-9303baea8ebd': 'identite-startup',
  photo1: 'dashboard-analytics',
  'photo1 (1)': 'dashboard-analytics',
  photo2: 'site-vitrine-luxe',
  social: 'campagne-motion',
  'photo3 (1)': 'campagne-motion',
  photo4: 'identite-startup',
};

export const projectSlugs = new Set(projects.map((p) => p.slug));

export function projectImageUrl(slug) {
  // Mapping direct des slugs vers les médias avec type
  const mediaMap = {
    // Imports Vite (assets)
    'refonte-identite': { url: visuelImage, type: 'image' },
    'campagne-motion': { url: social, type: 'image' },
    'showreel-motion-design': { url: motionVideo, type: 'video' },
    
    // Fichiers dans public/images/projects/
    'e-commerce-premium': { url: '/images/projects/product.avif', type: 'image' },
    'app-mobile-fintech': { url: '/images/projects/app.avif', type: 'image' },
    'dashboard-analytics': { url: '/images/projects/dashboard.avif', type: 'image' },
    'site-vitrine-luxe': { url: '/images/projects/karz.avif', type: 'image' },
  };
  
  // Retourner le média s'il existe dans le mapping
  if (mediaMap[slug]) {
    return mediaMap[slug];
  }
  
  // Par défaut, utiliser le slug comme nom de fichier
  return { url: `/images/projects/${slug}.avif`, type: 'image' };
}

export function getProjectsWithImages() {
  return projects.map((p) => { 
    const media = projectImageUrl(p.slug);
    return { 
      ...p, 
      image: media.url,
      mediaType: media.type
    }; 
  });
}

export function getProjectBySlug(slug) {
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return { project: null, previous: null, next: null };
  const project = projects[idx];
  const media = projectImageUrl(project.slug);
  return {
    project: { 
      ...project, 
      image: media.url,
      mediaType: media.type,
      category: { name: project.categoryKey } 
    },
    previous: idx > 0 ? { 
      ...projects[idx - 1], 
      mediaType: projectImageUrl(projects[idx - 1].slug).type,
      category: { name: projects[idx - 1].categoryKey } 
    } : null,
    next: idx < projects.length - 1 ? { 
      ...projects[idx + 1], 
      mediaType: projectImageUrl(projects[idx + 1].slug).type,
      category: { name: projects[idx + 1].categoryKey } 
    } : null,
  };
}
