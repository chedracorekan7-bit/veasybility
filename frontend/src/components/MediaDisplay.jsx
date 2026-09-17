import { useEffect, useMemo, useState, useRef } from 'react';

const FALLBACK_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect fill="#121212" width="800" height="450"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="18">Media indisponible</text></svg>'
  );

export default function MediaDisplay({ src, alt = '', className = '', loading = 'lazy', autoPlay = false, muted = true, loop = true, mediaType, ...props }) {
  const videoRef = useRef(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Déterminer si c'est une vidéo et obtenir l'URL correcte
  useEffect(() => {
    if (!src) {
      setIsVideo(false);
      return;
    }
    
    // Utiliser le mediaType si fourni (méthode la plus fiable)
    if (mediaType === 'video') {
      setIsVideo(true);
      return;
    }
    
    if (mediaType === 'image') {
      setIsVideo(false);
      return;
    }
    
    // Sinon, détecter automatiquement
    // Obtenir l'URL sous forme de string
    const srcStr = String(src);
    
    // Vérifier les extensions vidéo dans l'URL
    const videoExtensions = ['.webm', '.mp4', '.mov', '.avi', '.mkv'];
    const hasVideoExtension = videoExtensions.some(ext => srcStr.toLowerCase().includes(ext));
    
    setIsVideo(hasVideoExtension);
    
    // DEBUG: Pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log('MediaDisplay - src:', srcStr, 'mediaType:', mediaType, 'hasVideoExtension:', hasVideoExtension, 'isVideo:', hasVideoExtension);
    }
  }, [src, mediaType]);
  
  // Gérer la lecture automatique pour les vidéos
  useEffect(() => {
    if (isVideo && videoRef.current) {
      // Forcer la lecture silencieuse
      videoRef.current.play().catch(error => {
        console.log('Auto-play prevented:', error);
      });
    }
  }, [isVideo, src]);
  
  // Gérer les erreurs de chargement pour les images
  const imageCandidates = useMemo(() => {
    if (!src) return [FALLBACK_IMAGE];
    
    // Si c'est une vidéo, ne pas créer de liste d'images
    if (isVideo) {
      // Pour les vidéos, on retourne le src directement (géré dans la section vidéo)
      // Mais on garde le fallback au cas où
      return [src, FALLBACK_IMAGE];
    }
    
    // Pour les images, créer la liste des candidats
    const list = [src];
    if (typeof src === 'string' && src.endsWith('.avif')) {
      list.push(src.replace(/\.avif$/, '.webp'), src.replace(/\.avif$/, '.jpg'));
    }
    list.push(FALLBACK_IMAGE);
    return list;
  }, [src, isVideo]);

  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => setImageIndex(0), [src]);
  
  if (isVideo) {
    // S'assurer que src est une string valide
    const videoSrc = typeof src === 'string' ? src : String(src);
    
    return (
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          src={videoSrc}
          className={`${className} w-full h-full object-cover`}
          muted={true}
          loop={true}
          autoPlay={true}
          playsInline
          preload="auto"
          {...props}
        >
          <source src={videoSrc} type="video/webm" />
          Votre navigateur ne supporte pas la vidéo.
        </video>
      </div>
    );
  }
  
  // Pour les images
  // S'assurer que la source est une string valide
  const imgSrc = imageCandidates[imageIndex];
  const finalSrc = typeof imgSrc === 'string' ? imgSrc : String(imgSrc);
  
  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setImageIndex((i) => (i < imageCandidates.length - 1 ? i + 1 : i))}
      {...props}
    />
  );
}