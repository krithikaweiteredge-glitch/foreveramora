'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const LABELS = { drag: 'Drag', view: 'View', play: 'Play', link: '' };

/**
 * Custom cursor + the warm light that follows it.
 * Any element can change the cursor with  data-cursor="drag|view|play|link".
 */
export default function Cursor() {
  const ref = useRef(null);
  const lightRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const fine =
      window.matchMedia('(pointer: fine)').matches &&
      window.innerWidth >= 900 &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const light = lightRef.current;
    const lx = gsap.quickTo(light, 'x', { duration: 1.5, ease: 'power3.out' });
    const ly = gsap.quickTo(light, 'y', { duration: 1.5, ease: 'power3.out' });

    if (!fine) {
      // Touch: no cursor, no spotlight — just a still ambient glow.
      gsap.set(light, { x: window.innerWidth / 2, y: window.innerHeight * 0.35 });
      light.dataset.on = 'true';
      return;
    }

    document.body.dataset.cursor = 'custom';
    const el = ref.current;
    const cx = gsap.quickTo(el, 'x', { duration: 0.36, ease: 'power3.out' });
    const cy = gsap.quickTo(el, 'y', { duration: 0.36, ease: 'power3.out' });

    let raf = 0;
    const onMove = (e) => {
      cx(e.clientX);
      cy(e.clientY);
      lx(e.clientX);
      ly(e.clientY);
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          const t = e.target instanceof Element ? e.target : null;
          const hit = t?.closest('[data-cursor]');
          const mode = hit?.getAttribute('data-cursor') || '';
          const clickable = t?.closest('a, button, input, select, textarea, label');
          const next = mode || (clickable ? 'link' : '');
          if (el.dataset.mode !== next) {
            el.dataset.mode = next;
            labelRef.current.textContent = LABELS[next] ?? '';
          }
        });
      }
    };

    const show = () => {
      gsap.to(el, { opacity: 1, duration: 0.3 });
      light.dataset.on = 'true';
    };
    const hide = () => {
      gsap.to(el, { opacity: 0, duration: 0.3 });
      light.dataset.on = 'false';
    };
    const down = () => gsap.to(el, { scale: 0.82, duration: 0.25, ease: 'power3.out' });
    const up = () => gsap.to(el, { scale: 1, duration: 0.4, ease: 'power3.out' });

    gsap.set(el, { opacity: 0, xPercent: 0, yPercent: 0 });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerenter', show);
    document.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);

    return () => {
      delete document.body.dataset.cursor;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerenter', show);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={lightRef} className="spotlight" aria-hidden />
      <div ref={ref} className="cursor" data-mode="" aria-hidden>
        <div className="cursor__dot" />
        <div className="cursor__ring">
          <span ref={labelRef} className="cursor__label" />
        </div>
      </div>
    </>
  );
}
