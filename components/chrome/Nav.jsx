'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import s from './chrome.module.css';
import { nav, studio } from '@/lib/studio';
import Magnetic from '@/components/ui/Magnetic';

export default function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setStuck(y > window.innerHeight * 0.55);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const items = el.querySelectorAll(`.${s.menu__item} > *`);
    const meta = el.querySelectorAll(`.${s.menu__meta} > *`);

    if (open) {
      window.__lenis?.stop();
      gsap.set(el, { pointerEvents: 'auto' });
      gsap
        .timeline()
        .to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'expo.inOut' })
        .fromTo(
          items,
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.95, ease: 'expo.out', stagger: 0.06 },
          '-=0.55'
        )
        .fromTo(
          meta,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05 },
          '-=0.6'
        );
    } else {
      window.__lenis?.start();
      gsap.to(el, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.7,
        ease: 'expo.inOut',
        onComplete: () => gsap.set(el, { pointerEvents: 'none' }),
      });
    }
  }, [open]);

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  return (
    <>
      <header className={s.nav} data-stuck={stuck} data-open={open}>
        <div className={s.nav__inner}>
          <a href="#top" className={s.nav__logo} aria-label={`${studio.name} — home`}>
            <span className={s.nav__logoMark} />
            <span className={s.nav__logoText}>{studio.wordmark}</span>
          </a>

          <nav className={s.nav__links} aria-label="Primary">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className={s.nav__link}>
                <span data-t>{n.label}</span>
                <span data-t aria-hidden>
                  {n.label}
                </span>
              </a>
            ))}
          </nav>

          <div className={s.nav__right}>
            <Magnetic strength={0.22}>
              <a href="#book" className={`btn btn--sm ${s.nav__cta}`}>
                <span>Book now</span>
              </a>
            </Magnetic>
            <button
              className={s.burger}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      <div className={s.menu} ref={menuRef} style={{ clipPath: 'inset(0% 0% 100% 0%)' }}>
        <div className={s.menu__list}>
          {nav.map((n, i) => (
            <div className={s.menu__item} key={n.href}>
              <a href={n.href} onClick={() => setOpen(false)}>
                <em className="num">{String(i + 1).padStart(2, '0')}</em>
                {n.label}
              </a>
            </div>
          ))}
        </div>
        <div className={s.menu__meta}>
          <div>
            <span className="eyebrow eyebrow--bare">Studio</span>
            <p className="body-s">
              {studio.address.locality}, {studio.address.region}
              <br />
              {studio.address.countryName}
            </p>
          </div>
          <div>
            <span className="eyebrow eyebrow--bare">Enquiries</span>
            <p className="body-s">
              <a className="link" href={`mailto:${studio.email}`}>
                {studio.email}
              </a>
              <br />
              <a className="link" href={studio.phoneHref}>
                {studio.phone}
              </a>
            </p>
          </div>
          <div>
            <span className="eyebrow eyebrow--bare">Follow</span>
            <p className="body-s">
              {studio.social.map((so) => (
                <a
                  key={so.label}
                  className="link"
                  href={so.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginRight: '1.1rem' }}
                >
                  {so.label}
                </a>
              ))}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
