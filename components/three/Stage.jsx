'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuality, useInView } from '@/lib/quality';
import Img from '@/components/ui/Img';
import CanvasHost from './CanvasHost';

/**
 * Stage — every WebGL scene on the site is mounted through here.
 *
 *  · No WebGL, or prefers-reduced-motion  → a still frame instead.
 *  · Off screen                           → the render loop is paused.
 *  · Far off screen                       → optionally unmounted.
 *  · Context lost                         → falls back instead of a black hole.
 */
export default function Stage({
  children,
  fallbackSrc,
  fallbackAlt = '',
  camera = { position: [0, 0, 6], fov: 42, near: 0.1, far: 100 },
  className = '',
  drag = false,
  unmountWhenAway = false,
  onQuality,
}) {
  const hostRef = useRef(null);
  const q = useQuality();
  const near = useInView(hostRef, { margin: '120%' });
  const [dead, setDead] = useState(false);
  const [mounted, setMounted] = useState(false);
  const retries = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (q.ready) onQuality?.(q);
  }, [q, onQuality]);

  // A lost context is usually the browser reclaiming one, not a broken GPU.
  // Remount a couple of times before giving up and showing the still.
  useEffect(() => {
    if (!dead || retries.current >= 2) return;
    retries.current += 1;
    const t = setTimeout(() => setDead(false), 900);
    return () => clearTimeout(t);
  }, [dead]);

  const usable = mounted && q.ready && q.tier !== 'off' && !(dead && retries.current >= 2);
  const shouldMount = usable && !dead;

  return (
    <div ref={hostRef} className={`stage ${drag ? 'stage--drag' : ''} ${className}`}>
      {shouldMount && (
        <CanvasHost
          camera={camera}
          dpr={q.dpr}
          frameloop={near ? 'always' : 'never'}
          antialias={q.budget.aa}
          onLost={() => setDead(true)}
        >
          {children(q)}
        </CanvasHost>
      )}

      {!usable && fallbackSrc && (
        <div className="stage__fallback">
          <Img src={fallbackSrc} alt={fallbackAlt} sizes="100vw" priority />
        </div>
      )}
    </div>
  );
}
