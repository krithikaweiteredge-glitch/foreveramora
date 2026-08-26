'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Img from '@/components/ui/Img';
import { MaskLines, FadeUp } from '@/components/ui/Reveal';
import { categories } from '@/lib/content';
import s from './sections.module.css';

/**
 * An index, not a card grid. The list stays editorial; the photograph
 * floats in 3D beside the cursor and only exists while you are reading a line.
 */
export default function Categories() {
  const root = useRef(null);
  const previewRef = useRef(null);
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    if (
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const xTo = gsap.quickTo(el, 'x', { duration: 0.85, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.85, ease: 'power3.out' });
    const rTo = gsap.quickTo(el, 'rotateY', { duration: 1.1, ease: 'power3.out' });
    const tTo = gsap.quickTo(el, 'rotateX', { duration: 1.1, ease: 'power3.out' });

    let prev = 0;
    const onMove = (e) => {
      const r = root.current.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      xTo(x);
      yTo(y);
      // lean into the direction of travel
      const v = gsap.utils.clamp(-18, 18, (e.clientX - prev) * 0.9);
      prev = e.clientX;
      rTo(v);
      tTo(gsap.utils.clamp(-10, 10, -(y / r.height - 0.5) * 16));
    };

    const rootEl = root.current;
    if (!rootEl) return;
    rootEl.addEventListener('pointermove', onMove);
    return () => rootEl.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <section className={`section ${s.cats}`} id="services" ref={root}>
      <div className="wrap">
        <div className={s.head}>
          <div>
            <FadeUp as="p" className="eyebrow">
              What we capture
            </FadeUp>
            <MaskLines
              className="display display--sm"
              lines={['Every kind of day', 'worth keeping.']}
              style={{ marginTop: '1.2rem' }}
            />
          </div>
          <FadeUp className={`lede ${s.head__side}`} delay={0.1}>
            Eight kinds of event, one approach: find the real moment, light it
            properly, and stay out of the way until it happens.
          </FadeUp>
        </div>

        <ul className={s.cats__list}>
          {categories.map((c, i) => (
            <li
              key={c.id}
              className={s.cats__row}
              data-active={active === i}
              data-open={open === i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <button
                className={s.cats__head}
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <em className={`num ${s.cats__n}`}>{c.index}</em>
                <span className={s.cats__title}>{c.title}</span>
                <span className={s.cats__kicker}>{c.kicker}</span>
                <span className={s.cats__toggle} aria-hidden>
                  <i />
                  <i />
                </span>
              </button>

              <div className={s.cats__panel}>
                <div className={s.cats__panelInner}>
                  <p className={`serif ${s.cats__line}`}>{c.line}</p>
                  <div className={s.cats__capsWrap}>
                    <span className="eyebrow eyebrow--bare">We capture</span>
                    <ul className={s.cats__caps}>
                      {c.captures.map((cap) => (
                        <li key={cap}>{cap}</li>
                      ))}
                    </ul>
                    <a className={`btn btn--sm btn--gold ${s.cats__cta}`} href="#book">
                      <span>
                        {c.cta}
                        <i className={s.arrow} />
                      </span>
                    </a>
                  </div>
                  <div className={s.cats__still}>
                    <Img src={c.image} alt={`${c.title} photography by the studio`} sizes="34vw" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* the floating preview */}
      <div className={s.cats__preview} ref={previewRef} aria-hidden>
        {categories.map((c, i) => (
          <figure key={c.id} data-on={active === i}>
            <Img src={c.image} alt="" sizes="26vw" />
          </figure>
        ))}
      </div>
    </section>
  );
}
