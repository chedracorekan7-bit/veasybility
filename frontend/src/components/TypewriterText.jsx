import { useEffect, useMemo, useState } from 'react';

/**
 * Effet machine à écrire premium — caractère par caractère, multi-lignes.
 * Respecte prefers-reduced-motion.
 */
export default function TypewriterText({
  lines = [],
  speed = 48,
  initialDelay = 700,
  linePause = 320,
  className = '',
  cursor = true,
  cursorClassName = '',
  as: Tag = 'span',
  onComplete,
}) {
  const fullLines = useMemo(
    () => lines.map((line) => (typeof line === 'string' ? { text: line } : line)),
    [lines],
  );

  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (reduceMotion || fullLines.length === 0) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    if (!hasStarted) {
      const startTimer = setTimeout(() => setHasStarted(true), initialDelay);
      return () => clearTimeout(startTimer);
    }

    const current = fullLines[lineIndex];
    if (!current) return;

    if (charIndex >= current.text.length) {
      if (lineIndex >= fullLines.length - 1) {
        setIsComplete(true);
        onComplete?.();
        return;
      }

      // Support per-line pause via pauseAfter, fallback to global linePause
      const delay = current.pauseAfter ?? linePause;
      const pauseTimer = setTimeout(() => {
        setLineIndex((i) => i + 1);
        setCharIndex(0);
      }, delay);

      return () => clearTimeout(pauseTimer);
    }

    const tickTimer = setTimeout(() => setCharIndex((c) => c + 1), speed);
    return () => clearTimeout(tickTimer);
  }, [
    reduceMotion,
    fullLines,
    hasStarted,
    lineIndex,
    charIndex,
    speed,
    initialDelay,
    linePause,
    onComplete,
  ]);

  const showCursor = cursor && hasStarted && !reduceMotion;
  const isLastLine = lineIndex >= fullLines.length - 1;
  const lineComplete = isLastLine && charIndex >= (fullLines[lineIndex]?.text.length ?? 0);
  const cursorVisible = showCursor && (!isComplete || lineComplete);

  const srText = fullLines.map((l) => l.text).join(' ');

  return (
    <Tag className={`${className} relative`} aria-label={srText}>
      <span className="sr-only">{srText}</span>

      {/* Invisible spacer — renders full text to reserve final layout height */}
      <span aria-hidden="true" className="invisible block">
        {fullLines.map((line, idx) => (
          <span
            key={`spacer-${idx}`}
            className={line.className ?? (idx > 0 ? 'block mt-2' : '')}
          >
            {line.text}
          </span>
        ))}
      </span>

      {/* Visible animated text — overlaid on top, never affects layout */}
      <span aria-hidden="true" className="absolute inset-0">
        {fullLines.map((line, idx) => {
          const isCurrent = !reduceMotion && !isComplete && idx === lineIndex;
          const isPast = reduceMotion || isComplete || idx < lineIndex;
          const isLast = idx === fullLines.length - 1;
          const visibleText = isPast
            ? line.text
            : isCurrent
              ? line.text.slice(0, charIndex)
              : '';

          if (!visibleText && !isCurrent && !isPast) return null;

          // Show cursor inline: while typing (isCurrent) or after completion on the last line
          const showInlineCursor =
            (isCurrent && cursorVisible) || (isComplete && isLast && cursorVisible);

          return (
            <span
              key={`${line.text}-${idx}`}
              className={line.className ?? (idx > 0 ? 'block mt-2' : '')}
            >
              {visibleText}
              {showInlineCursor && (
                <span
                  className={`inline-block w-[3px] md:w-1 h-[0.85em] md:h-[0.9em] bg-primary ml-0.5 md:ml-1 align-middle rounded-sm animate-typewriter-cursor ${cursorClassName}`}
                />
              )}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
