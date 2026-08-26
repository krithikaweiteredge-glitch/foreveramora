'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Magnetic — the element leans toward the pointer and springs back.
 * Disabled on touch and for reduced motion; the child is untouched
 * so it stays a real <a>/<button>.
 */
export default function Magnetic({ children, strength = 0.34, radius = 90 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.42)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.42)' });

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };

    // Listen on a padded hit area so the pull starts before the cursor lands.
    const area = () => {
      const r = el.getBoundingClientRect();
      return {
        l: r.left - radius,
        t: r.top - radius,
        rr: r.right + radius,
        b: r.bottom + radius,
      };
    };

    let inside = false;
    const onWindowMove = (e) => {
      const a = area();
      const within =
        e.clientX > a.l && e.clientX < a.rr && e.clientY > a.t && e.clientY < a.b;
      if (within) {
        inside = true;
        move(e);
      } else if (inside) {
        inside = false;
        leave();
      }
    };

    window.addEventListener('pointermove', onWindowMove, { passive: true });
    return () => window.removeEventListener('pointermove', onWindowMove);
  }, [strength, radius]);

  return (
    <span ref={ref} style={{ display: 'inline-block', willChange: 'transform' }}>
      {children}
    </span>
  );
}
