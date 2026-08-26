'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Img from '@/components/ui/Img';
import { chapters } from '@/lib/content';
import s from './sections.module.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * The horizontal reel. Each chapter gets its own composition — never the
 * same card five times.
 */
export default function Chapters() {
  const root = useRef(null);
  const track = useRef(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || window.innerWidth < 760) return; // phones swipe instead

    const ctx = gsap.context(() => {
      const distance = () => tr.scrollWidth - window.innerWidth;

      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // photographs drift inside their frames as they cross the screen
      gsap.utils.toArray(`.${s.ch__media} img`).forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -8, scale: 1.14 },
          {
            xPercent: 8,
            scale: 1.02,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest(`.${s.ch__panel}`),
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          }
        );
      });

      gsap.utils.toArray(`.${s.ch__panel}`).forEach((panel) => {
        const copy = panel.querySelectorAll('[data-ch-copy] > *');
        if (!copy.length) return;
        gsap.fromTo(
          copy,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.07,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: 'left 78%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={s.ch} id="stories" ref={root} aria-label="Every story is different">
      <div className={s.ch__track} ref={track}>
        {chapters.map((c, i) => (
          <article
            className={`${s.ch__panel} ${c.scale === 'tall' ? s.ch__tall : s.ch__wide}`}
            key={c.n}
          >
            <figure className={s.ch__media}>
              <Img
                src={c.image}
                alt={`${c.title} — ${c.lines.join(' ')}`}
                sizes="(max-width: 760px) 88vw, 46vw"
              />
              <span className={s.ch__num}>{c.n}</span>
            </figure>

            <div className={s.ch__copy} data-ch-copy>
              <p className="eyebrow">
                {c.n} — {c.title}
              </p>
              <h3 className={`serif ${s.ch__h}`}>
                {c.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </h3>
              <p className="body-s" style={{ maxWidth: '34ch' }}>
                {c.body}
              </p>
            </div>
          </article>
        ))}

        <div className={`${s.ch__panel} ${s.ch__outro}`}>
          <div data-ch-copy>
            <h3 className="serif serif-it gold" style={{ fontSize: 'clamp(1.8rem,4vw,3.4rem)' }}>
              Yours won’t look
              <br />
              like any of these.
            </h3>
            <a className="btn" href="#book" style={{ marginTop: '2rem' }}>
              <span>
                Start yours
                <i className={s.arrow} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
