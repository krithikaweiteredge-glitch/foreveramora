'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Img from '@/components/ui/Img';
import { MaskLines, FadeUp, Frame } from '@/components/ui/Reveal';
import { team } from '@/lib/content';
import { studio } from '@/lib/studio';
import s from './sections.module.css';

export default function About() {
  const grid = useRef(null);

  // portraits tilt toward the cursor — subtle, and only where there is one
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    if (
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const cards = gsap.utils.toArray(`.${s.about__member}`);
    const cleanups = cards.map((card) => {
      const inner = card.querySelector(`.${s.about__card}`);
      const rx = gsap.quickTo(inner, 'rotateX', { duration: 0.7, ease: 'power3.out' });
      const ry = gsap.quickTo(inner, 'rotateY', { duration: 0.7, ease: 'power3.out' });
      const sc = gsap.quickTo(inner, 'scale', { duration: 0.7, ease: 'power3.out' });

      const move = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 16);
        rx(-py * 16);
        sc(1.04);
      };
      const out = () => {
        rx(0);
        ry(0);
        sc(1);
      };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', out);
      return () => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', out);
      };
    });

    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <section className={`section ${s.about}`} id="about" aria-labelledby="about-h">
      <div className="wrap">
        <div className={s.about__top}>
          <div>
            <FadeUp as="p" className="eyebrow">
              The studio
            </FadeUp>
            <MaskLines
              id="about-h"
              className="display display--sm"
              lines={['Behind', 'the lens.']}
              style={{ marginTop: '1.2rem' }}
            />
          </div>

          <div className={s.about__text}>
            <FadeUp as="p" className="lede">
              We started {studio.name} because we kept seeing the same wedding
              photographs — beautiful, competent, and completely interchangeable.
              Nobody in them looked like they were having a day they’d remember.
            </FadeUp>
            <FadeUp as="p" className="lede" delay={0.08} style={{ marginTop: '1.4rem' }}>
              So we shoot the other thing: the glance across the room, the aunt
              who can’t stop crying, the twenty seconds before anyone is ready.
              We light it properly, we grade it like film, and we hand you back
              a day you can walk into again.
            </FadeUp>
            <FadeUp as="p" className="body-s" delay={0.14} style={{ marginTop: '1.6rem' }}>
              Small crews. Quiet cameras. No shot list built from someone else’s
              wedding. And an experience calm enough that you forget there is a
              photographer in the room — which is the only way this works.
            </FadeUp>
          </div>
        </div>

        <ul className={s.about__figures}>
          {studio.figures.map((f, i) => (
            <FadeUp as="li" key={f.label} delay={i * 0.05}>
              <span className={`num ${s.about__fig}`}>{f.value}</span>
              <em>{f.label}</em>
            </FadeUp>
          ))}
        </ul>

        <div className={s.about__teamHead}>
          <span className="eyebrow">The people who show up</span>
          <p className="body-s">
            Photographers · Cinematographers · Editors · Colourists · Producers
          </p>
        </div>

        <div className={s.about__grid} ref={grid}>
          {team.map((m, i) => (
            <figure className={s.about__member} key={m.name}>
              <div className={s.about__card}>
                <Frame ratio="3 / 4" parallax={i % 2 ? 3 : 0}>
                  <Img
                    src={m.image}
                    alt={`${m.name}, ${m.role}`}
                    sizes="(max-width: 700px) 45vw, 22vw"
                  />
                </Frame>
              </div>
              <figcaption>
                <span className={s.about__name}>{m.name}</span>
                <span className={s.about__role}>{m.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
