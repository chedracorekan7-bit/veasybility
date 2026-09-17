import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import MediaDisplay from './MediaDisplay';

/**
 * ProjectCard Component
 * Carte projet avec image, titre, description et hover effects professionnels
 */
export default function ProjectCard({ project, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8 }}
      className="group h-full"
    >
      <Link
        to={`/projects/${project.slug}`}
        className="relative block h-full overflow-hidden rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all duration-500"
      >
        {/* Image container with overlay */}
        <div className="relative w-full aspect-video overflow-hidden bg-surface-elevated group/media-container">
          <MediaDisplay
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/media-container:scale-105"
            autoPlay={false}
            muted={true}
            loop={true}
            mediaType={project.mediaType}
          />

          {/* Gradient overlay - moins opaque pour les vidéos */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover/media-container:opacity-100 transition-opacity duration-500" />

          {/* Hover indicator */}
          <motion.div
            initial={false}
            whileHover={{ scale: 1.1, rotate: 45 }}
            className="absolute top-4 right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground opacity-0 group-hover/media-container:opacity-100 transition-opacity duration-500"
          >
            <ArrowUpRight size={20} />
          </motion.div>
        </div>

        {/* Content container */}
        <div className="p-6 md:p-8 relative z-10">
          {/* Category badge */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              {project.category}
            </span>
            <span className="text-xs text-muted-strong font-medium">{project.year}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-xl md:text-2xl font-normal uppercase tracking-wide text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
            {project.title}
          </h3>

          {/* Description */}
          <p className="font-sans text-sm md:text-base text-muted leading-relaxed mb-6 line-clamp-2">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags?.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="text-xs text-muted-strong bg-foreground/5 px-2.5 py-1 rounded-md border border-border/50 hover:border-primary/30 transition-colors duration-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
