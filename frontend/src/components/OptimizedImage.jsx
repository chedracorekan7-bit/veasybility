import { useEffect, useMemo, useState } from 'react';

const FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect fill="#121212" width="800" height="450"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="18">Image indisponible</text></svg>'
  );

export default function OptimizedImage({ src, alt = '', className = '', loading = 'lazy', ...props }) {
  const candidates = useMemo(() => {
    if (!src) return [FALLBACK];
    const list = [src];
    if (src.endsWith('.avif')) {
      list.push(src.replace(/\.avif$/, '.webp'), src.replace(/\.avif$/, '.jpg'));
    }
    list.push(FALLBACK);
    return list;
  }, [src]);

  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [src]);

  return (
    <img
      src={candidates[index]}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setIndex((i) => (i < candidates.length - 1 ? i + 1 : i))}
      {...props}
    />
  );
}
