import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { navItems, isNavActive } from '../config/navigation';
import { useNavbarScroll } from '../hooks/useNavbarScroll';



function NavBrand() {
  return (
    <Link to="/" className="font-display text-xl md:text-2xl font-normal uppercase tracking-wider text-foreground shrink-0">
      V<span className="text-primary">easy</span>bility
    </Link>
  );
}

function NavLink({ link, isActive }) {
  return (
    <Link
      to={link.path}
      className="relative overflow-hidden group h-6 block"
    >
      <span
        className={`block text-sm font-medium whitespace-nowrap transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full ${
          isActive ? 'text-primary' : 'text-muted'
        }`}
      >
        {link.name}
      </span>
      <span
        className={`absolute inset-0 block text-sm font-medium whitespace-nowrap transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] translate-y-full group-hover:translate-y-0 text-primary`}
      >
        {link.name}
      </span>
    </Link>
  );
}

function NavActions() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="flex items-center">
      <div className="hidden md:flex gap-8 items-center">
        {navItems.map((link) => (
          <NavLink
            key={link.path}
            link={{ ...link, name: t(link.nameKey) }}
            isActive={isNavActive(location.pathname, link.path)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { isVisible, isAtTop } = useNavbarScroll();
  const showGlass = !isAtTop;

  return (
    <>
      {/* Mobile — always visible */}
      <nav
        className={`md:hidden fixed top-0 w-full z-40 transition-all duration-300 bg-bg/85 backdrop-blur-md border-b border-border ${!isAtTop ? 'py-4 shadow-lg' : 'py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <NavBrand />
          <NavActions />
        </div>
      </nav>

      {/* Desktop — fade up on scroll down, fade down on scroll up */}
      <motion.header
        className="hidden md:block fixed top-0 inset-x-0 z-40 pointer-events-none"
        initial={false}
        animate={{
          y: isVisible ? 0 : '-100%',
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <div className="pointer-events-auto px-4 pt-4">
          <div className="mx-auto max-w-7xl">
            <motion.div
              className={`flex items-center justify-between gap-8 transition-all duration-500 ${showGlass ? 'backdrop-blur-xl border border-border shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]' : ''
                } ${showGlass ? 'bg-bg/88' : 'bg-transparent border-transparent'}`}
              initial={false}
              animate={{
                borderRadius: isAtTop ? 0 : 20,
                paddingTop: isAtTop ? 24 : 16,
                paddingBottom: isAtTop ? 24 : 16,
                paddingLeft: isAtTop ? 24 : 32,
                paddingRight: isAtTop ? 24 : 32,
              }}
              transition={{
                duration: 0.4,
                ease: [0.20, 0.1, 0.25, 1],
              }}
            >
              <NavBrand />
              <NavActions />
            </motion.div>
          </div>
        </div>
      </motion.header>
    </>
  );
}
