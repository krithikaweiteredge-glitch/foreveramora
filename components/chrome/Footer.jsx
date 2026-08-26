'use client';

import s from './chrome.module.css';
import { studio, nav } from '@/lib/studio';
import { services } from '@/lib/content';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={s.foot}>
      <div className="wrap">
        <div className={s.foot__grid}>
          <div className={s.foot__col}>
            <span className="eyebrow eyebrow--bare">The studio</span>
            <p className="body-s" style={{ marginTop: '1.1rem' }}>
              {studio.address.street}
              <br />
              {studio.address.locality} {studio.address.postalCode}
              <br />
              {studio.address.region}, {studio.address.countryName}
            </p>
            <p className="body-s" style={{ marginTop: '1.1rem' }}>
              Shooting across {studio.serviceAreas.slice(0, 5).join(', ')} and
              wherever the celebration is.
            </p>
          </div>

          <div className={s.foot__col}>
            <span className="eyebrow eyebrow--bare">Navigate</span>
            <ul className={s.foot__list}>
              {nav.map((n) => (
                <li key={n.href}>
                  <a className="link" href={n.href}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={s.foot__col}>
            <span className="eyebrow eyebrow--bare">Services</span>
            <ul className={s.foot__list}>
              {services.slice(0, 7).map((sv) => (
                <li key={sv.title}>
                  <a className="link" href="#services">
                    {sv.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={s.foot__col}>
            <span className="eyebrow eyebrow--bare">Say hello</span>
            <ul className={s.foot__list}>
              <li>
                <a className="link" href={`mailto:${studio.email}`}>
                  {studio.email}
                </a>
              </li>
              <li>
                <a className="link" href={studio.phoneHref}>
                  {studio.phone}
                </a>
              </li>
              <li>
                <a className="link" href={studio.whatsapp} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
            </ul>
            <ul className={s.foot__list} style={{ marginTop: '1.4rem' }}>
              {studio.social.map((so) => (
                <li key={so.label}>
                  <a className="link" href={so.href} target="_blank" rel="noreferrer">
                    {so.label} <span style={{ color: 'var(--bone-4)' }}>{so.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={s.foot__mark} aria-hidden>
          {studio.wordmark}
        </div>

        <div className={s.foot__legal}>
          <span>
            © {year} {studio.legalName}. All frames reserved.
          </span>
          <span className={s.foot__tag}>{studio.tagline}</span>
          <a className="link" href="#top">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
