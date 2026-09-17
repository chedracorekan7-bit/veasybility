import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProjectCard from './ProjectCard';

/**
 * ProjectsGrid Component
 * Grille de 6 projets avec animation de scroll et bouton CTA
 * Section destinée à la page d'accueil
 */
export default function ProjectsGrid({ projects }) {
  // Limiter à 6 projets pour l'affichage home
  const displayProjects = projects?.slice(0, 6) || [];

  return (
    <section className="py-24 md:py-32 px-6 bg-bg relative transition-colors duration-300 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute -top-40 right-0 w-150 h-150 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center md:text-left"
        >
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-normal uppercase tracking-wide mb-4 text-foreground">
            Nos Projets.
          </h2>
          <p className="font-sans text-muted text-lg md:text-xl max-w-2xl font-normal leading-relaxed">
            Une sélection de nos réalisations les plus ambitieuses. Chaque projet reflète notre engagement envers l'excellence et l'innovation.
          </p>
        </motion.div>

        {/* Projects Grid - 3x2 layout */}
        {displayProjects.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16"
            >
              {displayProjects.map((project, index) => (
                <ProjectCard key={project.id || index} project={project} index={index} />
              ))}
            </motion.div>

            {/* CTA Button - View All Projects */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center"
            >
              <Link
                to="/projects"
                className="group relative inline-flex items-center gap-3 px-6 py-3.5 md:px-8 md:py-4 bg-transparent border border-primary text-primary font-sans font-semibold rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-500 overflow-hidden text-sm md:text-base"
              >
                {/* Suppression du fond brillant car on utilise le changement de couleur */}

                <span className="relative z-10">Voir tous les projets</span>
                <ChevronRight
                  size={20}
                  className="relative z-10 group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <p className="font-sans text-muted text-lg">
              Les projets seront bientôt disponibles.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
