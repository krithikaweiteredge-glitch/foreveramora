'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * One scroll authority for the whole page: Lenis drives, GSAP's ticker
 * pumps it, and ScrollTrigger reads from it. Anchor links are routed
 * through Lenis so they inherit the same easing.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // The experience is authored from the top down — never restore a
    // mid-scroll position behind the preloader.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    // some browsers restore the offset after the effect has already run
    const reset = () => window.scrollTo(0, 0);
    window.addEventListener('load', reset, { once: true });
    const t0 = setTimeout(reset, 120);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Native scroll, but ScrollTrigger still needs to be live.
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // native momentum on touch feels better than emulated
      touchMultiplier: 1.6,
      wheelMultiplier: 0.9,
    });

    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onAnchor = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -10, duration: 1.5 });
    };
    document.addEventListener('click', onAnchor);

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(document.body);

    return () => {
      clearTimeout(t0);
      window.removeEventListener('load', reset);
      document.removeEventListener('click', onAnchor);
      ro.disconnect();
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
