'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Stage from '@/components/three/Stage';
import Img from '@/components/ui/Img';
import { MaskLines, FadeUp } from '@/components/ui/Reveal';
import { stories } from '@/lib/content';
import s from './sections.module.css';
import PortfolioScene from '@/components/three/PortfolioScene';

export default function Portfolio() {
  const hostRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [openStory, setOpenStory] = useState(null);

  // shared, mutable, never re-renders React
  const drive = useRef({
    scroll: 0,
    vel: 0,
    dragging: false,
    index: 0,
    onIndex: null,
  }).current;

  const setIdx = useCallback(
    (i) => setIndex((prev) => (prev === i ? prev : i)),
    []
  );
  drive.onIndex = setIdx;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    let last = 0;
    let id = null;

    const down = (e) => {
      drive.dragging = true;
      last = e.clientX;
      id = e.pointerId;
      el.setPointerCapture?.(e.pointerId);
      el.dataset.dragging = 'true';
    };
    const move = (e) => {
      if (!drive.dragging || e.pointerId !== id) return;
      const dx = e.clientX - last;
      last = e.clientX;
      drive.vel = -dx / (el.clientWidth * 0.42);
      drive.scroll += drive.vel * 0.6;
    };
    const up = (e) => {
      if (!drive.dragging) return;
      drive.dragging = false;
      el.releasePointerCapture?.(e.pointerId ?? id);
      el.dataset.dragging = 'false';
    };

    // horizontal wheel / trackpad flicks steer it too
    const wheel = (e) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (!d) return;
      e.preventDefault();
      drive.vel += d / 900;
    };

    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });

    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [drive]);

  const go = useCallback(
    (dir) => {
      drive.vel += dir * 0.09;
    },
    [drive]
  );

  useEffect(() => {
    const key = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [go]);

  const story = stories[index] ?? stories[0];

  return (
    <section className={s.pf3} id="work" aria-labelledby="work-h">
      <div className="wrap">
        <div className={s.head}>
          <div>
            <FadeUp as="p" className="eyebrow">
              Selected work
            </FadeUp>
            <MaskLines
              id="work-h"
              className="display display--sm"
              lines={['The archive.']}
              style={{ marginTop: '1.2rem' }}
            />
          </div>
          <FadeUp className={`lede ${s.head__side}`} delay={0.1}>
            Drag through it. Every entry is a real day, in a real place, for real
            people who are still sending us photographs of their walls.
          </FadeUp>
        </div>
      </div>

      <div className={s.pf3__stage} ref={hostRef} data-cursor="drag">
        <Stage
          camera={{ position: [0, 0, 5.2], fov: 42, near: 0.1, far: 40 }}
          fallbackSrc={stories[0].cover}
          fallbackAlt={stories[0].title}
          drag
        >
          {(q) => <PortfolioScene quality={q} drive={drive} />}
        </Stage>

        <button
          className={`${s.pf3__arrow} ${s.pf3__prev}`}
          onClick={() => go(-1)}
          aria-label="Previous story"
        >
          <i />
        </button>
        <button
          className={`${s.pf3__arrow} ${s.pf3__next}`}
          onClick={() => go(1)}
          aria-label="Next story"
        >
          <i />
        </button>
      </div>

      <div className="wrap">
        <div className={s.pf3__meta}>
          <div className={s.pf3__metaMain} key={story.slug}>
            <h3 className={`display display--sm ${s.pf3__title}`}>{story.title}</h3>
            <p className={`serif serif-it ${s.pf3__log}`}>{story.logline}</p>
          </div>

          <dl className={s.pf3__facts} key={`${story.slug}-f`}>
            <div>
              <dt>Event</dt>
              <dd>{story.type}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{story.location}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{story.date}</dd>
            </div>
          </dl>

          <div className={s.pf3__actions}>
            <button className="btn btn--sm" onClick={() => setOpenStory(story)}>
              <span>
                Open the story
                <i className={s.arrow} />
              </span>
            </button>
            <span className={`num ${s.pf3__count}`}>
              {String(index + 1).padStart(2, '0')} / {String(stories.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <ol className={s.pf3__dots} aria-hidden>
          {stories.map((st, i) => (
            <li key={st.slug} data-on={i === index}>
              <button
                onClick={() => {
                  drive.scroll = i;
                  drive.vel = 0;
                }}
                tabIndex={-1}
              />
            </li>
          ))}
        </ol>
      </div>

      <StoryPanel story={openStory} onClose={() => setOpenStory(null)} />
    </section>
  );
}

/* ── the full case study ───────────────────────────────────── */
function StoryPanel({ story, onClose }) {
  const root = useRef(null);
  const shown = useRef(null);
  if (story) shown.current = story;
  const st = shown.current;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (story) {
      window.__lenis?.stop();
      document.body.dataset.lock = 'true';
      gsap.set(el, { display: 'block' });
      gsap
        .timeline()
        .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo(
          el.querySelector(`.${s.story__sheet}`),
          { yPercent: 8, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out' },
          '-=0.15'
        );
    } else {
      gsap.to(el, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          gsap.set(el, { display: 'none' });
          window.__lenis?.start();
          document.body.dataset.lock = 'false';
        },
      });
    }
  }, [story]);

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  if (!st) return null;

  return (
    <div
      className={s.story}
      ref={root}
      style={{ display: 'none' }}
      role="dialog"
      aria-modal="true"
      aria-label={st.title}
    >
      <button className={s.story__scrim} onClick={onClose} aria-label="Close story" />
      <div className={s.story__sheet}>
        <header className={s.story__head}>
          <div>
            <p className="eyebrow">
              {st.type} · {st.location}
            </p>
            <h3 className="display display--sm" style={{ marginTop: '0.9rem' }}>
              {st.title}
            </h3>
          </div>
          <button className={s.story__close} onClick={onClose} aria-label="Close story">
            <i />
            <i />
          </button>
        </header>

        <div className={s.story__body}>
          <p className={`serif serif-it ${s.story__log}`}>{st.logline}</p>
          <p className="lede">{st.story}</p>
          <dl className={s.story__facts}>
            <div>
              <dt>Date</dt>
              <dd>{st.date}</dd>
            </div>
            <div>
              <dt>Services</dt>
              <dd>{st.services.join(' · ')}</dd>
            </div>
          </dl>
        </div>

        <div className={s.story__grid}>
          {st.gallery.map((g, i) => (
            <figure key={g} data-i={i}>
              <Img src={g} alt={`${st.title} — frame ${i + 1}`} sizes="46vw" />
            </figure>
          ))}
          <figure className={s.story__filmSlot}>
            <Img src={st.cover} alt="" sizes="92vw" />
            <figcaption>
              Film slot — add this story’s film to <code>lib/media.js</code>
            </figcaption>
          </figure>
        </div>

        <footer className={s.story__foot}>
          <a className="btn btn--solid" href="#book" onClick={onClose}>
            <span>Plan something like this</span>
          </a>
        </footer>
      </div>
    </div>
  );
}
