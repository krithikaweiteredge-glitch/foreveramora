'use client';

import { useRef, useState } from 'react';
import Magnetic from '@/components/ui/Magnetic';
import { MaskLines, FadeUp } from '@/components/ui/Reveal';
import { eventTypes, serviceOptions } from '@/lib/content';
import { studio } from '@/lib/studio';
import s from './sections.module.css';

const INTENTS = [
  { id: 'availability', label: 'Check availability' },
  { id: 'consultation', label: 'Book a consultation' },
  { id: 'quote', label: 'Get a quote' },
];

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  eventType: '',
  eventDate: '',
  location: '',
  guests: '',
  message: '',
  company: '', // honeypot
};

export default function Booking() {
  const [intent, setIntent] = useState('availability');
  const [form, setForm] = useState(EMPTY);
  const [picked, setPicked] = useState([]);
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');
  const [bad, setBad] = useState([]);
  const formRef = useRef(null);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setBad((b) => b.filter((x) => x !== k));
  };

  const toggle = (svc) =>
    setPicked((p) => (p.includes(svc) ? p.filter((x) => x !== svc) : [...p, svc]));

  const submit = async (e) => {
    e.preventDefault();
    if (state === 'sending') return;

    // Validate client-side
    const missing = [];
    if (!form.name.trim()) missing.push('name');
    if (!form.phone.trim()) missing.push('phone');
    if (!form.email.trim()) missing.push('email');
    if (!form.eventType.trim()) missing.push('eventType');

    if (missing.length > 0) {
      setBad(missing);
      setError('Please fill in all required fields marked with *');
      setState('error');
      return;
    }

    setState('sending');
    setError('');

    // Format WhatsApp message
    const intentLabel = INTENTS.find((i) => i.id === intent)?.label ?? 'Booking Enquiry';
    const lines = [
      `*New ${intentLabel} — Foreveramora*`,
      '',
      `*Name:* ${form.name.trim()}`,
      `*Phone:* ${form.phone.trim()}`,
      `*Email:* ${form.email.trim()}`,
      `*Event Type:* ${form.eventType.trim()}`,
    ];
    if (form.eventDate.trim()) lines.push(`*Event Date:* ${form.eventDate.trim()}`);
    if (form.location.trim()) lines.push(`*Location:* ${form.location.trim()}`);
    if (form.guests.trim()) lines.push(`*Guests:* ${form.guests.trim()}`);
    if (picked.length > 0) lines.push(`*Services:* ${picked.join(', ')}`);
    if (form.message.trim()) lines.push(`*Notes:* ${form.message.trim()}`);

    const whatsappUrl = `https://wa.me/918008873388?text=${encodeURIComponent(lines.join('\n'))}`;

    try {
      // Record enquiry via API
      fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, services: picked, intent }),
      }).catch(() => {});

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      setState('done');
      setForm(EMPTY);
      setPicked([]);
    } catch {
      window.open(whatsappUrl, '_blank');
      setState('done');
    }
  };

  return (
    <section className={s.book} id="book" aria-labelledby="book-h">
      <div className={s.book__glow} aria-hidden />

      <div className="wrap">
        <div className={s.book__top}>
          <FadeUp as="p" className="eyebrow">
            Let’s begin
          </FadeUp>
          <MaskLines
            id="book-h"
            className={`display ${s.book__h}`}
            lines={['Ready to turn', 'your moments', 'into memories?']}
          />
          <FadeUp className="lede" delay={0.1} style={{ marginTop: '1.8rem' }}>
            Tell us the date and the place. We’ll come back within 24 hours with
            availability and a quote built around your day — no templates, no
            packages you have to squeeze into.
          </FadeUp>

          <FadeUp className={s.book__intents} delay={0.16}>
            {INTENTS.map((it) => (
              <button
                key={it.id}
                type="button"
                className={`btn btn--sm ${s.book__intent}`}
                data-on={intent === it.id}
                onClick={() => {
                  setIntent(it.id);
                  formRef.current?.querySelector('input')?.focus();
                }}
              >
                <span>{it.label}</span>
              </button>
            ))}
          </FadeUp>
        </div>

        <div className={s.book__grid}>
          <form className={s.book__form} onSubmit={submit} ref={formRef} noValidate>
            <div className={s.book__row}>
              <Field
                label="Your name"
                name="name"
                value={form.name}
                onChange={set('name')}
                bad={bad.includes('name')}
                autoComplete="name"
                required
              />
              <Field
                label="Phone / WhatsApp"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                bad={bad.includes('phone')}
                autoComplete="tel"
                required
              />
            </div>

            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              bad={bad.includes('email')}
              autoComplete="email"
              required
            />

            <div className={s.book__row}>
              <Field
                label="Event type"
                name="eventType"
                as="select"
                value={form.eventType}
                onChange={set('eventType')}
                bad={bad.includes('eventType')}
                required
              >
                <option value="">Choose one</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Field>
              <Field
                label="Event date"
                name="eventDate"
                type="date"
                value={form.eventDate}
                onChange={set('eventDate')}
                hint="Approximate is fine"
              />
            </div>

            <div className={s.book__row}>
              <Field
                label="Location / venue"
                name="location"
                value={form.location}
                onChange={set('location')}
                placeholder="City, or the venue if you have it"
              />
              <Field
                label="Guests (approx.)"
                name="guests"
                type="number"
                inputMode="numeric"
                min="0"
                value={form.guests}
                onChange={set('guests')}
              />
            </div>

            <fieldset className={s.book__chips}>
              <legend>Services you’re after</legend>
              <div>
                {serviceOptions.map((svc) => (
                  <button
                    type="button"
                    key={svc}
                    className={s.book__chip}
                    data-on={picked.includes(svc)}
                    onClick={() => toggle(svc)}
                    aria-pressed={picked.includes(svc)}
                  >
                    {svc}
                  </button>
                ))}
              </div>
            </fieldset>

            <Field
              label="Anything else"
              name="message"
              as="textarea"
              rows={4}
              value={form.message}
              onChange={set('message')}
              placeholder="The story so far, the vibe, the one photograph you must have…"
            />

            {/* honeypot */}
            <input
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
              name="company"
              value={form.company}
              onChange={set('company')}
              aria-hidden
            />

            <div className={s.book__submit}>
              <Magnetic strength={0.24}>
                <button className="btn btn--solid" type="submit" disabled={state === 'sending'}>
                  <span>
                    {state === 'sending'
                      ? 'Sending…'
                      : state === 'done'
                        ? 'Enquiry sent'
                        : INTENTS.find((i) => i.id === intent)?.label ?? 'Get a quote'}
                  </span>
                </button>
              </Magnetic>
              <p className="body-s" role="status" aria-live="polite">
                {state === 'done'
                  ? 'Opening WhatsApp with your enquiry details… If it didn’t open automatically, click Message on WhatsApp on the right.'
                  : state === 'error'
                    ? error
                    : 'We reply to every enquiry personally, usually the same day.'}
              </p>
            </div>
          </form>

          <aside className={s.book__aside}>
            <div>
              <span className="eyebrow eyebrow--bare">Prefer to talk</span>
              <p className={s.book__big}>
                <a className="link" href={studio.phoneHref}>
                  {studio.phone}
                </a>
              </p>
              <p className={s.book__big}>
                <a className="link" href={`mailto:${studio.bookingEmail}`}>
                  {studio.bookingEmail}
                </a>
              </p>
              <a className="btn btn--sm btn--gold" href={studio.whatsapp} target="_blank" rel="noreferrer">
                <span>Message on WhatsApp</span>
              </a>
            </div>

            <div>
              <span className="eyebrow eyebrow--bare">The studio</span>
              <p className="body-s" style={{ marginTop: '0.9rem' }}>
                {studio.address.street}
                <br />
                {studio.address.locality} {studio.address.postalCode}
                <br />
                {studio.address.region}, {studio.address.countryName}
              </p>
              <p className="body-s" style={{ marginTop: '0.9rem' }}>
                Visits by appointment · {studio.openingHours.replace('Mo-Sa', 'Mon–Sat')}
              </p>
            </div>

            <div>
              <span className="eyebrow eyebrow--bare">We travel</span>
              <p className="body-s" style={{ marginTop: '0.9rem' }}>
                {studio.serviceAreas.join(' · ')}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ── one field, three shapes ───────────────────────────────── */
function Field({
  label,
  name,
  as = 'input',
  hint,
  bad,
  children,
  required,
  ...rest
}) {
  const Tag = as;
  return (
    <label className={s.field} data-bad={bad || undefined}>
      <span className={s.field__label}>
        {label}
        {required && <i aria-hidden> *</i>}
      </span>
      <Tag id={name} name={name} required={required} {...rest}>
        {children}
      </Tag>
      {hint && <span className={s.field__hint}>{hint}</span>}
      <i className={s.field__rule} aria-hidden />
    </label>
  );
}
