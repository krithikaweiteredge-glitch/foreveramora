'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import s from './chrome.module.css';
import { studio } from '@/lib/studio';

const FRAMES = [
  'Loading the archive',
  'Warming the lights',
  'Threading the film',
  'Opening the aperture',
];

/**
 * The first four seconds set the tone for everything after them.
 * A counter, a wordmark, and then the room opens.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null);
  const numRef = useRef(null);
  const barRef = useRef(null);
  const [frame, setFrame] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.dataset.lock = 'true';

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(failsafe);
      document.removeEventListener('visibilitychange', onHidden);
      document.body.dataset.lock = 'false';
      document.dispatchEvent(new Event('fa:ready'));
      onDone?.();
      setGone(true);
    };

    // rAF is throttled in a background tab, which would strand the timeline
    // and leave a visitor staring at black. Two escape hatches:
    const failsafe = setTimeout(finish, 6000);
    const onHidden = () => {
      if (document.hidden) finish();
    };
    document.addEventListener('visibilitychange', onHidden);
    if (document.hidden) {
      finish();
      return () => clearTimeout(failsafe);
    }

    if (reduced) {
      finish();
      return;
    }

    const counter = { v: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        `.${s.pre__markInner}`,
        { yPercent: 118, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.15, ease: 'expo.out' }
      )
        .to(
          counter,
          {
            v: 100,
            duration: 2.1,
            ease: 'power2.inOut',
            onUpdate() {
              const v = Math.round(counter.v);
              if (numRef.current) {
                numRef.current.textContent = String(v).padStart(3, '0');
              }
              if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
              setFrame(Math.min(FRAMES.length - 1, Math.floor(v / 26)));
            },
          },
          0.15
        )
        // the room opens
        .to(`.${s.pre__line}`, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
        })
        .to(
          `.${s.pre__markInner}`,
          { yPercent: -118, opacity: 0, duration: 0.95, ease: 'expo.inOut' },
          '<'
        )
        .to(
          `.${s.pre__panel}`,
          {
            scaleY: 0,
            duration: 1.15,
            ease: 'expo.inOut',
            stagger: { each: 0.055, from: 'start' },
            transformOrigin: 'top center',
          },
          '-=0.45'
        )
        .add(finish, '-=0.85');
    }, root);

    return () => {
      clearTimeout(failsafe);
      document.removeEventListener('visibilitychange', onHidden);
      ctx.revert();
      document.body.dataset.lock = 'false';
    };
  }, [onDone]);

  if (gone) return null;

  return (
    <div className={s.pre} ref={root} aria-hidden>
      <div className={s.pre__panels}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div className={s.pre__panel} key={i} />
        ))}
      </div>

      <div className={s.pre__center}>
        <div className={s.pre__mark}>
          <span className={s.pre__markInner}>{studio.wordmark}</span>
        </div>
      </div>

      <div className={`${s.pre__foot} ${s.pre__line}`}>
        <span className={s.pre__status}>{FRAMES[frame]}</span>
        <span className={`${s.pre__num} num`} ref={numRef}>
          000
        </span>
      </div>

      <div className={`${s.pre__bar} ${s.pre__line}`}>
        <i ref={barRef} />
      </div>
    </div>
  );
}
