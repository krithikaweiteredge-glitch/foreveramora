'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * MaskLines — the house headline reveal.
 * Lines are authored (not measured) so the animation is deterministic
 * and never fights a font swap.
 */
export function MaskLines({
  lines,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  stagger = 0.085,
  start = 'top 82%',
  ...rest
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll('.mask-line > span');
    if (reduced()) {
      gsap.set(spans, { y: 0, opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        spans,
        { yPercent: 108, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.15,
          ease: 'expo.out',
          stagger,
          delay,
          scrollTrigger: { trigger: el, start },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay, stagger, start]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {lines.map((line, i) => (
        <span className="mask-line" key={i}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

/** FadeUp — for everything that isn't a headline. */
export function FadeUp({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  y = 26,
  start = 'top 88%',
  ...rest
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.05,
          ease: 'expo.out',
          delay,
          scrollTrigger: { trigger: el, start },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay, y, start]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Frame — an image that uncovers itself behind a wipe and settles
 * out of a slow scale. Used for every large still on the site.
 */
export function Frame({ children, className = '', style, ratio, parallax = 0 }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const img = el.querySelector('img');
    const cover = el.querySelector('[data-cover]');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 86%' },
      });
      tl.fromTo(
        cover,
        { yPercent: 0 },
        { yPercent: -101, duration: 1.35, ease: 'expo.inOut' }
      ).fromTo(
        img,
        { scale: 1.28 },
        { scale: 1, duration: 1.9, ease: 'expo.out' },
        0.05
      );

      if (parallax) {
        gsap.fromTo(
          img,
          { yPercent: -parallax },
          {
            yPercent: parallax,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    }, el);
    return () => ctx.revert();
  }, [parallax]);

  return (
    <div
      ref={ref}
      className={`reveal-img ${className}`}
      style={{ aspectRatio: ratio, ...style }}
    >
      {children}
      <div
        data-cover
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--void)',
          zIndex: 3,
        }}
      />
    </div>
  );
}

export { gsap, ScrollTrigger };
