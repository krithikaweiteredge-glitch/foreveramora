'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MaskLines, FadeUp } from '@/components/ui/Reveal';
import { experience } from '@/lib/content';
import s from './sections.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Process() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // the rail fills as you move through the four steps
      gsap.fromTo(
        `.${s.proc__rail} i`,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: {
            trigger: `.${s.proc__list}`,
            start: 'top 70%',
            end: 'bottom 78%',
            scrub: 0.5,
          },
        }
      );

      gsap.utils.toArray(`.${s.proc__step}`).forEach((step) => {
        gsap.fromTo(
          step.querySelectorAll('[data-p]'),
          { y: 42, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'expo.out',
            stagger: 0.08,
            scrollTrigger: { trigger: step, start: 'top 82%' },
          }
        );
        gsap.fromTo(
          step.querySelector(`.${s.proc__dot}`),
          { scale: 0.2, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            ease: 'back.out(2)',
            scrollTrigger: { trigger: step, start: 'top 78%' },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={`section ${s.proc}`} ref={root} aria-labelledby="proc-h">
      <div className="wrap">
        <div className={s.head}>
          <div>
            <FadeUp as="p" className="eyebrow">
              The experience
            </FadeUp>
            <MaskLines
              id="proc-h"
              className="display display--sm"
              lines={['Four steps.', 'One long memory.']}
              style={{ marginTop: '1.2rem' }}
            />
          </div>
          <FadeUp className={`lede ${s.head__side}`} delay={0.1}>
            No packages to decode, no hard sell, no upselling on the day. Here is
            exactly how working with us goes.
          </FadeUp>
        </div>

        <ol className={s.proc__list}>
          <div className={s.proc__rail} aria-hidden>
            <i />
          </div>
          {experience.map((p) => (
            <li className={s.proc__step} key={p.n}>
              <span className={s.proc__dot} aria-hidden />
              <span className={`num ${s.proc__n}`} data-p>
                {p.n}
              </span>
              <div className={s.proc__body}>
                <h3 className={`display display--sm ${s.proc__title}`} data-p>
                  {p.title}
                </h3>
                <p className={`serif serif-it ${s.proc__line}`} data-p>
                  {p.line}
                </p>
                <p className="body-s" data-p style={{ maxWidth: '44ch' }}>
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
