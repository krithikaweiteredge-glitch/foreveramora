'use client';

import { useRef, useState } from 'react';
import Img from '@/components/ui/Img';
import Magnetic from '@/components/ui/Magnetic';
import FilmPlayer from '@/components/chrome/FilmPlayer';
import { MaskLines, FadeUp } from '@/components/ui/Reveal';
import { films, media } from '@/lib/media';
import { filmFormats } from '@/lib/content';
import s from './sections.module.css';

export default function PhotoFilm() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState(null);
  const videoRef = useRef(null);

  const enterFilm = () => {
    setSide('film');
    const v = videoRef.current;
    if (v) v.play?.().catch(() => {});
  };
  const leave = () => {
    setSide(null);
    videoRef.current?.pause?.();
  };

  return (
    <section className={`section ${s.pf}`} aria-labelledby="pf-h">
      <div className="wrap">
        <MaskLines
          id="pf-h"
          className={`display display--sm ${s.pf__h}`}
          lines={['Photographs freeze time.', 'Films bring it back.']}
        />
      </div>

      <div className={s.pf__split} data-side={side}>
        {/* ── PHOTO ── */}
        <div
          className={`${s.pf__half} ${s.pf__photo}`}
          onMouseEnter={() => setSide('photo')}
          onMouseLeave={leave}
        >
          <Img
            src={films.photoFilmSplit.photo}
            alt="A still frame from a wedding day"
            sizes="50vw"
          />
          <div className={s.pf__label}>
            <span className="display display--sm">Photo</span>
            <p className="body-s">
              One frame, chosen out of thousands. Printed, framed, and still on a
              wall in forty years.
            </p>
          </div>
        </div>

        {/* ── FILM ── */}
        <div
          className={`${s.pf__half} ${s.pf__film}`}
          onMouseEnter={enterFilm}
          onMouseLeave={leave}
          data-cursor="play"
        >
          <Img
            src={films.photoFilmSplit.filmPoster}
            alt="A frame from a cinematic wedding film"
            sizes="50vw"
          />
          {films.photoFilmSplit.filmSrc && (
            <video
              ref={videoRef}
              className={s.pf__video}
              src={films.photoFilmSplit.filmSrc}
              poster={films.photoFilmSplit.filmPoster.replace(/\.webp$/, '.jpg')}
              muted
              loop
              playsInline
              preload="none"
            />
          )}
          <div className={s.pf__scan} aria-hidden />
          <div className={s.pf__label}>
            <span className="display display--sm">Film</span>
            <p className="body-s">
              Her voice. The music. The exact way the room sounded. Everything a
              photograph has to leave out.
            </p>
          </div>

          <Magnetic strength={0.3}>
            <button className={s.pf__play} onClick={() => setOpen(true)}>
              <span className={s.pf__playRing} aria-hidden />
              <span className={s.pf__playText}>Play film</span>
            </button>
          </Magnetic>
        </div>
      </div>

      <div className="wrap">
        <FadeUp className={s.pf__formats}>
          <span className="eyebrow">What we deliver</span>
          <ul>
            {filmFormats.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </FadeUp>
      </div>

      <FilmPlayer film={films.reel} open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
