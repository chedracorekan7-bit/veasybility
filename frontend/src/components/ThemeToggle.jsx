import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className={`group relative flex h-10 w-[76px] shrink-0 items-center rounded-full 
        border border-border bg-[var(--theme-toggle-track)] p-1 backdrop-blur-md transition-all duration-500
        hover:border-primary/50 hover:shadow-sm ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Background Icons */}
      <span className="flex w-full items-center justify-between px-[13px] pointer-events-none">
        <Sun
          size={14}
          strokeWidth={2.5}
          className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDark ? 'text-muted-strong scale-100 opacity-80 rotate-0' : 'text-transparent scale-50 opacity-0 -rotate-90'
          }`}
        />
        <Moon
          size={14}
          strokeWidth={2.5}
          className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            !isDark ? 'text-muted-strong scale-100 opacity-80 rotate-0' : 'text-transparent scale-50 opacity-0 rotate-90'
          }`}
        />
      </span>

      {/* Thumb */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_2px_12px_var(--theme-shadow-primary)] overflow-hidden"
        animate={{ x: isDark ? 36 : 0 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? -180 : 0, scale: isDark ? 0 : 1, opacity: isDark ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun size={16} strokeWidth={2.5} />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 0 : 180, scale: isDark ? 1 : 0, opacity: isDark ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon size={16} strokeWidth={2.5} />
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
