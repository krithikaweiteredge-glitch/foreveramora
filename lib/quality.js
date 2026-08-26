'use client';

import { useEffect, useState } from 'react';

/**
 * Device tiering. Everything 3D reads from this so a cheap phone gets a
 * lighter scene instead of a slideshow, and `prefers-reduced-motion`
 * gets no WebGL at all.
 *
 *   tier: 'high' | 'medium' | 'low' | 'off'
 */

let cached = null;

export function detectQuality() {
  if (cached) return cached;
  if (typeof window === 'undefined') {
    return { tier: 'medium', dpr: [1, 1.5], webgl: true, reduced: false, touch: false };
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none)').matches;
  const w = window.innerWidth;

  // WebGL support probe — one throwaway context, released immediately.
  let webgl = false;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    webgl = !!gl;
    const lose = gl && gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  } catch {
    webgl = false;
  }

  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;

  let tier = 'medium';
  if (!webgl || reduced) tier = 'off';
  else if (w < 720 || cores <= 4 || mem <= 3) tier = 'low';
  else if (w >= 1280 && cores >= 8 && mem >= 8) tier = 'high';

  const dpr =
    tier === 'high' ? [1, 1.5] : tier === 'medium' ? [1, 1.25] : [1, 1];

  cached = { tier, dpr, webgl, reduced, touch, cores, mem };
  return cached;
}

/** Per-scene budgets, so no component invents its own numbers. */
export const budget = {
  high: { particles: 700, heroPhotos: 7, wall: 24, apertureBlades: 8, glass: true, aa: true },
  medium: { particles: 400, heroPhotos: 6, wall: 18, apertureBlades: 8, glass: true, aa: true },
  low: { particles: 200, heroPhotos: 4, wall: 12, apertureBlades: 7, glass: false, aa: false },
  off: { particles: 0, heroPhotos: 0, wall: 0, apertureBlades: 0, glass: false, aa: false },
};

export function useQuality() {
  const [q, setQ] = useState({
    tier: 'medium',
    dpr: [1, 1.5],
    webgl: true,
    reduced: false,
    touch: false,
    ready: false,
  });

  useEffect(() => {
    setQ({ ...detectQuality(), ready: true });
  }, []);

  return { ...q, budget: budget[q.tier] };
}

/** True once the element has been within `margin` of the viewport. */
export function useInView(ref, { margin = '25%', once = false } = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin: `${margin} 0px ${margin} 0px`, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, once]);

  return inView;
}
