'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Stage from '@/components/three/Stage';
import Magnetic from '@/components/ui/Magnetic';
import { media } from '@/lib/media';
import { studio } from '@/lib/studio';
import s from './sections.module.css';
import HeroScene from '@/components/three/HeroScene';

gsap.registerPlugin(ScrollTrigger);

const HEADLINE = ['We capture', 'the moments', 'you’ll never', 'get back.'];

export default function Hero({ ready = false }) {
  const root = useRef(null);

  // The headline waits for the preloader, then lifts into place.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lines = el.querySelectorAll(`.${s.hero__h1} .mask-line > span`);
    const rest = el.querySelectorAll('[data-hero-in]');

    if (reduced) {
      gsap.set([lines, rest], { yPercent: 0, y: 0, opacity: 1 });
      return;
    }
    if (!ready) {
      gsap.set(lines, { yPercent: 116, opacity: 0 });
      gsap.set(rest, { y: 24, opacity: 0 });
      return;
    }

    const tl = gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .to(lines, { yPercent: 0, opacity: 1, duration: 1.45, stagger: 0.1 })
      .to(rest, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09 }, '-=0.95');

    return () => tl.kill();
  }, [ready]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // the copy clears out as the camera starts moving through the frame
      if (!reduced) {
        gsap.to(`.${s.hero__copy}`, {
          y: -90,
          opacity: 0,
          filter: 'blur(9px)',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: '46% top',
            scrub: 0.6,
          },
        });

        // and the whole scene dips to black just before the next one begins
        gsap.to(`.${s.hero__dip}`, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: '62% top',
            end: 'bottom bottom',
            scrub: 0.4,
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={s.hero} id="top" ref={root}>
      <div className={s.hero__sticky}>
        <Stage
          camera={{ position: [0, 0, 6.4], fov: 44, near: 0.1, far: 60 }}
          fallbackSrc={media.hero[0]}
          fallbackAlt="A photograph suspended in a dark studio"
        >
          {(q) => <HeroScene quality={q} />}
        </Stage>

        <div className={s.hero__grade} aria-hidden />

        <div className={`wrap ${s.hero__copy}`}>
          <h1 className={`display display--xl ${s.hero__h1}`}>
            {HEADLINE.map((l) => (
              <span className="mask-line" key={l}>
                <span>{l}</span>
              </span>
            ))}
          </h1>

          <p className={`eyebrow ${s.hero__tag}`} data-hero-in>
            {studio.address.locality} · Since {studio.founded}
          </p>

          <p className={`lede ${s.hero__sub}`} data-hero-in>
            Photography &amp; films crafted to turn once-in-a-lifetime moments into
            memories you’ll relive forever.
          </p>

          <div className={s.hero__actions} data-hero-in>
            <Magnetic strength={0.28}>
              <a href="#services" className="btn">
                <span>
                  See what we capture
                  <i className={s.arrow} aria-hidden />
                </span>
              </a>
            </Magnetic>
            <Magnetic strength={0.28}>
              <a href="#book" className="btn btn--solid">
                <span>Book your date</span>
              </a>
            </Magnetic>
          </div>
        </div>

        <div className={s.hero__foot} data-hero-in>
          <span className={s.hero__scroll}>
            <i />
            Scroll to enter
          </span>
          <span className={s.hero__note}>
            Weddings · Films · Pre-wedding · Events · Editorial
          </span>
        </div>

        <div className={s.hero__dip} aria-hidden />
      </div>
    </section>
  );
}
