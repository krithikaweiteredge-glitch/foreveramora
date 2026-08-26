import { NextResponse } from 'next/server';
import { studio } from '@/lib/studio';

/**
 * Booking enquiries land here.
 *
 * ▸ REPLACE the `deliver()` body with whatever the studio actually uses:
 *   Resend / SendGrid / Nodemailer, a Google Sheet, HubSpot, Airtable,
 *   or a webhook into their CRM. Everything above it — validation,
 *   normalising, the honeypot — stays the same.
 */

const REQUIRED = ['name', 'email', 'phone', 'eventType'];

async function deliver(enquiry) {
  // ── ▸ REPLACE: wire the studio's real destination here ──────────
  //
  //   await resend.emails.send({
  //     from: 'site@foreveramora.com',
  //     to: studio.bookingEmail,
  //     subject: `New enquiry — ${enquiry.eventType} — ${enquiry.name}`,
  //     text: JSON.stringify(enquiry, null, 2),
  //   });
  //
  // Until then the enquiry is logged so nothing is silently lost.
  console.log(`[booking] new enquiry for ${studio.bookingEmail}`, enquiry);
}

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  // bots fill hidden fields; people don't
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  const missing = REQUIRED.filter((k) => !String(data[k] ?? '').trim());
  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: `Missing: ${missing.join(', ')}`, fields: missing },
      { status: 422 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email))) {
    return NextResponse.json(
      { ok: false, error: 'That email address looks incomplete.', fields: ['email'] },
      { status: 422 }
    );
  }

  const enquiry = {
    name: String(data.name).trim().slice(0, 120),
    email: String(data.email).trim().slice(0, 160),
    phone: String(data.phone).trim().slice(0, 40),
    eventType: String(data.eventType).slice(0, 60),
    eventDate: String(data.eventDate ?? '').slice(0, 40),
    location: String(data.location ?? '').trim().slice(0, 160),
    guests: String(data.guests ?? '').slice(0, 20),
    services: Array.isArray(data.services) ? data.services.slice(0, 12) : [],
    message: String(data.message ?? '').trim().slice(0, 2000),
    intent: String(data.intent ?? 'quote').slice(0, 40),
    receivedAt: new Date().toISOString(),
  };

  try {
    await deliver(enquiry);
  } catch (err) {
    console.error('[booking] delivery failed', err);
    return NextResponse.json(
      { ok: false, error: 'We could not send that. Please email or call us directly.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
