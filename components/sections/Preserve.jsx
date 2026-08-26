'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Img from '@/components/ui/Img';
import { media } from '@/lib/media';
import s from './sections.module.css';

gsap.registerPlugin(ScrollTrigger);

/** Positions are hand-composed, not random — the frames orbit the words. */
const PLATES = [
  { caption: 'A bride laughing', x: -38, y: -26, w: 15, depth: 0.9, r: -4 },
  { caption: 'Parents getting emotional', x: 34, y: -30, w: 13, depth: 1.35, r: 3 },
  { caption: 'A groom seeing her for the first time', x: -30, y: 22, w: 12.5, depth: 1.1, r: 5 },
  { caption: 'Friends dancing', x: 40, y: 18, w: 14, depth: 0.75, r: -3 },
  { caption: 'Grandparents smiling', x: -46, y: -2, w: 10, depth: 1.6, r: 2 },
  { caption: 'Children running through it all', x: 47, y: -4, w: 10.5, depth: 1.5, r: -5 },
  { caption: 'Hands, held', x: -14, y: 34, w: 9.5, depth: 1.25, r: 4 },
  { caption: 'The hug nobody let go of', x: 16, y: -38, w: 9, depth: 1.45, r: -2 },
];

export default function Preserve() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.7 },
      });

      // line one holds, then gives way
      tl.to(`.${s.preserve__a}`, { yPercent: -14, opacity: 0, filter: 'blur(12px)', duration: 1 }, 0.28)
        .fromTo(
          `.${s.preserve__b} .mask-line > span`,
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'expo.out' },
          0.42
        );

      // the frames drift in from their own depths
      gsap.utils.toArray(`.${s.preserve__plate}`).forEach((p) => {
        const depth = parseFloat(p.dataset.depth);
        gsap.fromTo(
          p.firstElementChild,
          { yPercent: 25 * depth, opacity: 0.7, scale: 0.92 },
          {
            yPercent: -34 * depth,
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={s.preserve} ref={root} aria-labelledby="preserve-h">
      <div className={s.preserve__sticky}>
        <div className={s.preserve__plates} aria-hidden>
          {PLATES.map((p, i) => (
            <figure
              className={s.preserve__plate}
              key={p.caption}
              data-depth={p.depth}
              style={{
                '--x': `${p.x}vw`,
                '--y': `${p.y}vh`,
                '--w': `${p.w}vw`,
                '--r': `${p.r}deg`,
              }}
            >
              <div className={s.preserve__plateInner}>
                <Img
                  src={media.emotion[i % media.emotion.length]}
                  alt=""
                  sizes="18vw"
                />
                <figcaption>{p.caption}</figcaption>
              </div>
            </figure>
          ))}
        </div>

        <div className={s.preserve__words}>
          <h2 className={`display ${s.preserve__a}`} id="preserve-h">
            We don’t just
            <br />
            take photos.
          </h2>

          <div className={`${s.preserve__b}`} aria-hidden={false}>
            <span className="mask-line">
              <span className="serif serif-it gold">We preserve</span>
            </span>
            <span className="mask-line">
              <span className="serif serif-it gold">feelings.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
