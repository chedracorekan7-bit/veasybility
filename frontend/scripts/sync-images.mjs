/**
 * Synchronise src/assets/images/ → public/images/
 * Accepte : slug direct, noms Unsplash (photo-xxx), ou photo1/photo2/...
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SOURCE = path.join(root, 'src', 'assets', 'images');
const SOURCE_PROJECTS = path.join(SOURCE, 'projects');
const OUT = path.join(root, 'public', 'images');
const OUT_PROJECTS = path.join(OUT, 'projects');

const EXT = new Set(['.avif', '.webp', '.jpg', '.jpeg', '.jfif', '.png']);
const EXT_PRIORITY = { '.avif': 0, '.jfif': 1, '.webp': 2, '.jpg': 3, '.jpeg': 3, '.png': 4 };

const PROJECT_SLUGS = [
  'e-commerce-premium',
  'refonte-identite',
  'app-mobile-fintech',
  'clip-promo',
  'dashboard-analytics',
  'site-vitrine-luxe',
  'campagne-motion',
  'identite-startup',
  'showreel-motion-design',
  'campagne-digitale',
];

const PHOTO_TO_SLUG = {
  'photo-1661956602116-aa6865609028': 'e-commerce-premium',
  'photo-1600880292203-757bb62b4baf': 'refonte-identite',
  'photo-1512941937669-90a1b58e7e9c': 'app-mobile-fintech',
  'photo-1574717024653-61fd2cf4d44d': 'clip-promo',
  'photo-1551288049-bebda4e38f71': 'dashboard-analytics',
  'photo-1460925895917-afdab827c52f': 'campagne-digitale',
  'photo-1550745165-9bc0b252726f': 'showreel-motion-design',
  'photo-1558655146-d09347e92766': 'campagne-motion',
  'photo-1559136555-9303baea8ebd': 'identite-startup',
  // Fichiers génériques (photo1.avif, photo2.avif, etc.)
  'photo1': 'dashboard-analytics',
  'photo1 (1)': 'dashboard-analytics',
  'photo2': 'site-vitrine-luxe',
  'photo3': 'campagne-motion',
  'photo3 (1)': 'campagne-motion',
  'photo4': 'identite-startup',
};

function resolveSlug(basename) {
  if (PROJECT_SLUGS.includes(basename)) return basename;
  if (PHOTO_TO_SLUG[basename]) return PHOTO_TO_SLUG[basename];
  return null;
}

function sourcePriority(basename, ext) {
  const format = EXT_PRIORITY[ext] ?? 99;
  // Les fichiers photo-xxx / photo1… sont prioritaires sur les copies slug.png
  if (PHOTO_TO_SLUG[basename]) return format;
  if (PROJECT_SLUGS.includes(basename)) return 100 + format;
  return 200 + format;
}

async function exportFormats(input, basePath, width = 1200) {
  const ext = path.extname(input).toLowerCase();

  if (ext === '.avif') {
    // Copie directe — évite la recompression et préserve la qualité
    await fs.copyFile(input, `${basePath}.avif`);
  }

  const pipeline = sharp(input).rotate().resize({ width, withoutEnlargement: true });

  if (ext !== '.avif') {
    await pipeline.clone().avif({ quality: 62, effort: 4 }).toFile(`${basePath}.avif`);
  }

  await pipeline.clone().webp({ quality: 78 }).toFile(`${basePath}.webp`);
  await pipeline.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`${basePath}.jpg`);
}

async function syncProjects() {
  const entries = await fs.readdir(SOURCE_PROJECTS);
  const bySlug = new Map();
  const unmapped = [];

  for (const file of entries) {
    const ext = path.extname(file).toLowerCase();
    if (!EXT.has(ext)) continue;

    const basename = path.basename(file, ext);
    const slug = resolveSlug(basename);

    if (!slug) {
      unmapped.push({ file, ext, input: path.join(SOURCE_PROJECTS, file) });
      continue;
    }

    const priority = sourcePriority(basename, ext);
    const existing = bySlug.get(slug);
    if (!existing || priority < existing.priority) {
      bySlug.set(slug, { file, priority, input: path.join(SOURCE_PROJECTS, file) });
    }
  }

  // Assigner automatiquement les fichiers non reconnus aux projets sans image
  const missingSlugs = PROJECT_SLUGS.filter((s) => !bySlug.has(s));
  for (let i = 0; i < unmapped.length && i < missingSlugs.length; i++) {
    const slug = missingSlugs[i];
    bySlug.set(slug, unmapped[i]);
    console.log(`ℹ ${slug} ← ${unmapped[i].file} (assignation auto)`);
  }

  if (unmapped.length > missingSlugs.length) {
    for (let i = missingSlugs.length; i < unmapped.length; i++) {
      console.warn(`⚠ Ignoré : ${unmapped[i].file}`);
    }
  }

  for (const [slug, { file, input }] of bySlug) {
    await exportFormats(input, path.join(OUT_PROJECTS, slug));
    console.log(`✓ ${slug} ← ${file}`);
  }

  return bySlug.size;
}

async function syncAbout() {
  for (const name of ['about-team']) {
    for (const ext of ['.avif', '.jfif', '.webp', '.jpg', '.jpeg', '.png']) {
      const input = path.join(SOURCE, `${name}${ext}`);
      try {
        await fs.access(input);
        await exportFormats(input, path.join(OUT, name));
        console.log(`✓ ${name} ← ${name}${ext}`);
        return;
      } catch {
        /* next */
      }
    }
  }
}

async function main() {
  await fs.mkdir(OUT_PROJECTS, { recursive: true });
  console.log('Synchronisation des images...\n');
  await syncAbout();
  const count = await syncProjects();
  console.log(`\n${count} projet(s) synchronisé(s). Rechargez http://localhost:5173/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
