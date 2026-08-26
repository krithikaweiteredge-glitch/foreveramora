/**
 * ─────────────────────────────────────────────────────────────
 *  STUDIO PROFILE — the single place to put the real company data.
 *  Everything on the site (nav, footer, contact, SEO, schema.org)
 *  reads from here. Replace the values marked  ▸ REPLACE  and the
 *  whole site updates.
 * ─────────────────────────────────────────────────────────────
 */

export const studio = {
  name: 'foreveramora',
  legalName: 'Foreveramora Studios', //  ▸ REPLACE with registered name
  wordmark: 'foreveramora',
  tagline: 'We don’t just capture moments. We make them last.',
  founded: '2026', //  ▸ REPLACE

  // ── Contact ───────────────────────────────────────────────
  email: 'hello@foreveramora.com', //  ▸ REPLACE
  bookingEmail: 'book@foreveramora.com', //  ▸ REPLACE
  phone: '+91 98000 00000', //  ▸ REPLACE
  phoneHref: 'tel:+919800000000', //  ▸ REPLACE
  whatsapp: 'https://wa.me/919800000000', //  ▸ REPLACE

  // ── Location (drives Local SEO + LocalBusiness schema) ─────
  address: {
    street: '2nd Floor, Studio 14, Road No. 12, Banjara Hills', //  ▸ REPLACE
    locality: 'Hyderabad',
    region: 'Telangana',
    postalCode: '500034', //  ▸ REPLACE
    country: 'IN',
    countryName: 'India',
  },
  geo: { lat: 17.4126, lng: 78.4392 }, //  ▸ REPLACE with the real studio pin
  serviceAreas: [
    'Hyderabad',
    'Secunderabad',
    'Warangal',
    'Vijayawada',
    'Bengaluru',
    'Goa',
    'Udaipur',
  ],
  openingHours: 'Mo-Sa 10:00-19:00',

  // ── Social ────────────────────────────────────────────────
  social: [
    { label: 'Instagram', handle: '@foreveramora', href: 'https://instagram.com/' }, //  ▸ REPLACE
    { label: 'YouTube', handle: 'foreveramora films', href: 'https://youtube.com/' }, //  ▸ REPLACE
    { label: 'Vimeo', handle: 'foreveramora', href: 'https://vimeo.com/' }, //  ▸ REPLACE
    { label: 'Pinterest', handle: 'foreveramora', href: 'https://pinterest.com/' }, //  ▸ REPLACE
  ],

  // ── Site ──────────────────────────────────────────────────
  url: 'https://www.foreveramora.com', //  ▸ REPLACE with the live domain
  priceRange: '$$$',

  // Numbers shown in the About section  ▸ REPLACE with real figures
  figures: [
    { value: '60+', label: 'Celebrations documented' },
    { value: '9', label: 'Cities travelled to' },
    { value: '14', label: 'Years of combined experience' },
    { value: '400k+', label: 'Frames archived, nothing deleted' },
  ],
};

export const nav = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#book' },
];
