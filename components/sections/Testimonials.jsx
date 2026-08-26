'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Img from '@/components/ui/Img';
import { testimonials } from '@/lib/content';
import s from './sections.module.css';

/** Scenes in a film, not cards in a row. */
export default function Testimonials() {
  const [i, setI] = useState(0);
  const root = useRef(null);
  const timer = useRef(null);

  const go = (n) => setI(((n % testimonials.length) + testimonials.length) % testimonials.length);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(i + 1), 7600);
    return () => clearTimeout(timer.current);
  }, [i]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const lines = el.querySelectorAll(`.${s.tm__quote} .mask-line > span`);
    const meta = el.querySelectorAll(`.${s.tm__meta} > *`);
    const tl = gsap
      .timeline()
      .fromTo(
        lines,
        { yPercent: 112, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.15, ease: 'expo.out', stagger: 0.08 }
      )
      .fromTo(
        meta,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06 },
        '-=0.75'
      );
    return () => tl.kill();
  }, [i]);

  const t = testimonials[i];
  const lines = t.quote.split('. ').map((s, idx, arr) => (idx < arr.length - 1 ? s + '.' : s));

  return (
    <section className={s.tm} ref={root} aria-label="What clients say">
      <div className={s.tm__plates} aria-hidden>
        {testimonials.map((x, n) => (
          <Img
            key={x.plate}
            src={x.plate}
            alt=""
            sizes="100vw"
            data-on={n === i}
          />
        ))}
      </div>

      <div className={`wrap ${s.tm__inner}`}>
        <p className="eyebrow">In their words</p>

        <blockquote className={`serif ${s.tm__quote}`} key={i}>
          {lines.map((l, n) => (
            <span className="mask-line" key={n}>
              <span>{l}</span>
            </span>
          ))}
        </blockquote>

        <div className={s.tm__meta} key={`m${i}`}>
          <span className={s.tm__name}>{t.name}</span>
          <span className={s.tm__ev}>
            {t.event} · {t.location}
          </span>
        </div>

        <div className={s.tm__nav}>
          <button onClick={() => go(i - 1)} aria-label="Previous testimonial">
            <i className={s.tm__prev} />
          </button>
          <ol className={s.tm__dots}>
            {testimonials.map((x, n) => (
              <li key={x.name} data-on={n === i}>
                <button onClick={() => go(n)} aria-label={`Testimonial ${n + 1}`}>
                  <i />
                </button>
              </li>
            ))}
          </ol>
          <button onClick={() => go(i + 1)} aria-label="Next testimonial">
            <i className={s.tm__next} />
          </button>
        </div>
      </div>
    </section>
  );
}
