'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Stage from '@/components/three/Stage';
import { media } from '@/lib/media';
import s from './sections.module.css';
import JourneyScene from '@/components/three/JourneyScene';

gsap.registerPlugin(ScrollTrigger);

const BEATS = [
  { k: 'One', t: 'A photograph is a room', e: 'you can walk back into.' },
  { k: 'Two', t: 'Ten years from now,', e: 'this is what today looks like.' },
  { k: 'Three', t: 'The light. The noise.', e: 'The people who were still here.' },
  { k: 'Four', t: 'We build them', e: 'to outlast all of us.' },
];

export default function Journey() {
  const root = useRef(null);
  const progress = useRef(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });

      if (reduced) {
        gsap.set(`.${s.journey__cap}`, { opacity: 1, y: 0 });
        return;
      }

      // each caption owns a slice of the corridor
      const caps = gsap.utils.toArray(`.${s.journey__cap}`);
      caps.forEach((cap, i) => {
        const span = 1 / caps.length;
        const start = i * span;
        gsap.fromTo(
          cap.querySelectorAll('span > span'),
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            ease: 'expo.out',
            duration: 0.5,
            stagger: 0.06,
            scrollTrigger: {
              trigger: el,
              start: () => `top+=${(start + 0.06) * el.offsetHeight - window.innerHeight} top`,
              toggleActions: 'play none none reverse',
            },
          }
        );
        gsap.to(cap, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: () => `top+=${(start + span * 0.72) * el.offsetHeight - window.innerHeight} top`,
            end: () => `top+=${(start + span) * el.offsetHeight - window.innerHeight} top`,
            scrub: true,
          },
        });
      });

      gsap.to(`.${s.journey__rail} i`, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={s.journey} ref={root} aria-label="Travelling through memories">
      <div className={s.journey__sticky}>
        <Stage
          camera={{ position: [0, 0, 0], fov: 52, near: 0.1, far: 90 }}
          fallbackSrc={media.film[0]}
          fallbackAlt="A wide cinematic frame from an event"
        >
          {(q) => <JourneyScene quality={q} progress={progress} />}
        </Stage>

        <div className={s.journey__caps}>
          {BEATS.map((b, i) => (
            <p className={s.journey__cap} key={b.k} data-i={i}>
              <span className="mask-line">
                <span>{b.t}</span>
              </span>
              <span className="mask-line">
                <span className="serif serif-it">{b.e}</span>
              </span>
            </p>
          ))}
        </div>

        <div className={s.journey__rail} aria-hidden>
          <i />
        </div>
      </div>
    </section>
  );
}
