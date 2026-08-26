'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Img from '@/components/ui/Img';
import Magnetic from '@/components/ui/Magnetic';
import { media } from '@/lib/media';
import { studio } from '@/lib/studio';
import s from './sections.module.css';

gsap.registerPlugin(ScrollTrigger);

/** The last thing anyone reads before they decide. */
export default function Final() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      });

      // one photograph surfaces out of the black
      tl.fromTo(
        `.${s.final__plate}`,
        { opacity: 0, scale: 1.22, filter: 'blur(22px)' },
        { opacity: 0.34, scale: 1.04, filter: 'blur(0px)', duration: 1.4, ease: 'power2.out' },
        0
      )
        .fromTo(
          `.${s.final__a} .mask-line > span`,
          { yPercent: 112, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1, stagger: 0.14, ease: 'expo.out' },
          0.6
        )
        .to(`.${s.final__a}`, { opacity: 0, y: -50, duration: 0.7, ease: 'power2.in' }, 2.5)
        .fromTo(
          `.${s.final__b} .mask-line > span`,
          { yPercent: 112, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'expo.out' },
          2.85
        )
        .fromTo(
          `.${s.final__cta}`,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' },
          3.4
        )
        .fromTo(
          `.${s.final__mark}`,
          { opacity: 0, letterSpacing: '0.5em' },
          { opacity: 1, letterSpacing: '0.02em', duration: 1.2, ease: 'expo.out' },
          3.7
        );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={s.final} ref={root} aria-label="One last thing">
      <div className={s.final__sticky}>
        <div className={s.final__plate} aria-hidden>
          <Img src={media.final} alt="" sizes="100vw" />
        </div>

        <div className={`wrap ${s.final__words}`}>
          <p className={`display display--sm ${s.final__a}`}>
            <span className="mask-line">
              <span>One day,</span>
            </span>
            <span className="mask-line">
              <span>the day will be over.</span>
            </span>
            <span className="mask-line">
              <span>The photographs</span>
            </span>
            <span className="mask-line">
              <span>will remain.</span>
            </span>
          </p>

          <p className={`serif serif-it ${s.final__b}`}>
            <span className="mask-line">
              <span>Let’s make them</span>
            </span>
            <span className="mask-line">
              <span>worth remembering.</span>
            </span>
          </p>

          <div className={s.final__cta}>
            <Magnetic strength={0.3}>
              <a className="btn btn--solid" href="#book">
                <span>
                  Book your date
                  <i className={s.arrow} />
                </span>
              </a>
            </Magnetic>
          </div>

          <div className={s.final__mark} aria-hidden>
            {studio.wordmark}
          </div>
        </div>
      </div>
    </section>
  );
}
