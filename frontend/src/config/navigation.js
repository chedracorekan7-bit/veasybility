import { Home, User, FolderOpen, Mail } from 'lucide-react';

export const navItems = [
  { name: 'Accueil', shortName: 'Accueil', nameKey: 'nav.home', path: '/', icon: Home },
  { name: 'À propos', shortName: 'À propos', nameKey: 'nav.about', path: '/about', icon: User },
  { name: 'Projets', shortName: 'Projets', nameKey: 'nav.projects', path: '/projects', icon: FolderOpen },
  { name: 'Contact', shortName: 'Contact', nameKey: 'nav.contact', path: '/contact', icon: Mail },
];

export function isNavActive(pathname, path) {
  if (path === '/') return pathname === '/';
  return pathname.startsWith(path);
}
