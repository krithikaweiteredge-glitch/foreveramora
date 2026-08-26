'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import s from './chrome.module.css';
import Img from '@/components/ui/Img';

/**
 * Fullscreen cinematic player.
 *
 * If `film.src` is empty the modal still opens and holds the frame — the
 * studio drops an .mp4 into /public/media/video/ and fills in
 * `films.reel.src` in lib/media.js to make it play.
 */
export default function FilmPlayer({ film, open, onClose }) {
  const root = useRef(null);
  const video = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (open) {
      window.__lenis?.stop();
      document.body.dataset.lock = 'true';
      gsap.set(el, { display: 'grid' });
      gsap
        .timeline()
        .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' })
        .fromTo(
          `.${s.player__inner}`,
          { scale: 1.08, opacity: 0, filter: 'blur(14px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.05, ease: 'expo.out' },
          '-=0.25'
        );
      video.current?.play?.().catch(() => {});
    } else {
      video.current?.pause?.();
      gsap.to(el, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(el, { display: 'none' });
          window.__lenis?.start();
          document.body.dataset.lock = 'false';
        },
      });
    }
  }, [open]);

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div
      className={s.player}
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={film.label}
      style={{ display: 'none' }}
    >
      <button className={s.player__scrim} onClick={onClose} aria-label="Close film" />

      <div className={s.player__inner}>
        {film.src ? (
          <video
            ref={video}
            className={s.player__video}
            src={film.src}
            poster={film.poster.replace(/\.webp$/, '.jpg')}
            controls
            playsInline
            preload="none"
          />
        ) : (
          <div className={s.player__holder}>
            <Img src={film.poster} alt={film.label} sizes="92vw" priority />
            <span className={s.player__slot}>
              Film slot — add the reel at <code>lib/media.js → films.reel.src</code>
            </span>
          </div>
        )}

        <div className={s.player__bar}>
          <span className="eyebrow eyebrow--bare">{film.label}</span>
          <span className="num">{film.duration}</span>
        </div>
      </div>

      <button className={s.player__close} onClick={onClose} aria-label="Close film">
        <i />
        <i />
      </button>
    </div>
  );
}
