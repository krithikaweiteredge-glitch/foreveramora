'use client';

import { useRef, useState } from 'react';
import Img from '@/components/ui/Img';
import Magnetic from '@/components/ui/Magnetic';
import { MaskLines, FadeUp } from '@/components/ui/Reveal';
import { services } from '@/lib/content';
import { media } from '@/lib/media';
import s from './sections.module.css';

export default function Services() {
  const [hover, setHover] = useState(null);
  const root = useRef(null);

  return (
    <section className={`section ${s.svc}`} ref={root} aria-labelledby="svc-h">
      <div className="wrap">
        <div className={s.head}>
          <div>
            <FadeUp as="p" className="eyebrow">
              What we do
            </FadeUp>
            <MaskLines
              id="svc-h"
              className="display display--sm"
              lines={['Built around', 'your day.']}
              style={{ marginTop: '1.2rem' }}
            />
          </div>
          <FadeUp className={`lede ${s.head__side}`} delay={0.1}>
            We don’t sell tiers. We look at your dates, your venues and how much
            of it you want kept — then quote exactly that.
          </FadeUp>
        </div>

        <div className={s.svc__body}>
          <ul className={s.svc__list} onMouseLeave={() => setHover(null)}>
            {services.map((sv, i) => (
              <li
                key={sv.title}
                className={s.svc__item}
                data-dim={hover !== null && hover !== i}
                onMouseEnter={() => setHover(i)}
              >
                <a href="#book">
                  <span className={`num ${s.svc__n}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.svc__title}>{sv.title}</span>
                  <span className={s.svc__note}>{sv.note}</span>
                  <i className={s.arrow} aria-hidden />
                </a>
              </li>
            ))}
          </ul>

          <aside className={s.svc__side}>
            <div className={s.svc__stills} aria-hidden>
              {services.map((sv, i) => (
                <Img
                  key={sv.title}
                  src={media.emotion[i % media.emotion.length]}
                  alt=""
                  sizes="30vw"
                  data-on={hover === i}
                />
              ))}
              <Img
                src={media.emotion[0]}
                alt=""
                sizes="30vw"
                data-on={hover === null}
              />
            </div>

            <div className={s.svc__quote}>
              <p className="serif serif-it">No price list. Ever.</p>
              <p className="body-s" style={{ marginTop: '0.9rem' }}>
                A December wedding in Udaipur and a Sunday newborn session in Pune
                are not the same job. Tell us what yours looks like and we’ll send
                a number for that, not for a bracket.
              </p>
              <Magnetic strength={0.26}>
                <a className="btn btn--solid" href="#book" style={{ marginTop: '1.6rem' }}>
                  <span>Get a custom quote</span>
                </a>
              </Magnetic>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
