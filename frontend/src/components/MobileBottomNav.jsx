import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { navItems, isNavActive } from '../config/navigation';

export default function MobileBottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-bg/90 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)] transition-colors duration-300"
    >
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto px-1">
        {navItems.map(({ name, nameKey, path, icon: Icon }) => {
          const active = isNavActive(location.pathname, path);

          return (
            <Link
              key={path}
              to={path}
              aria-label={name}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1.5"
            >
              <motion.span
                whileTap={{ scale: 0.88 }}
                className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-colors duration-200 ${
                  active ? 'text-primary' : 'text-muted-strong'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-7 rounded-xl transition-colors duration-200 ${
                    active ? 'bg-primary/15' : ''
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span
                  className={`text-[10px] font-medium tracking-wide truncate max-w-full ${
                    active ? 'text-primary' : 'text-muted-strong'
                  }`}
                >
                  {t(nameKey)}
                </span>
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
