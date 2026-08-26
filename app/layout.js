import { Inter, Instrument_Serif } from 'next/font/google';
import { studio } from '@/lib/studio';
import { media } from '@/lib/media';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
});

const display = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: '400',
  style: ['normal', 'italic'],
});

const description =
  'foreveramora is a cinematic photography and videography studio. Wedding photography, wedding films, pre-wedding stories, event and brand cinematography — crafted to turn once-in-a-lifetime moments into memories you relive forever.';

export const metadata = {
  metadataBase: new URL(studio.url),
  title: {
    default: `${studio.name} — Cinematic Wedding Photography & Films`,
    template: `%s · ${studio.name}`,
  },
  description,
  keywords: [
    'wedding photography',
    'wedding videography',
    'cinematic wedding films',
    'pre-wedding photography',
    'pre-wedding film',
    'candid wedding photographer',
    'event photography',
    'event videography',
    'engagement photography',
    'drone cinematography',
    'fashion and editorial photography',
    'corporate event photographer',
    `wedding photographer ${studio.address.locality}`,
    `photography studio ${studio.address.locality}`,
    studio.name,
  ],
  authors: [{ name: studio.legalName, url: studio.url }],
  creator: studio.legalName,
  publisher: studio.legalName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: studio.url,
    siteName: studio.name,
    title: `${studio.name} — We don’t just capture moments. We make them last.`,
    description,
    images: [
      {
        url: media.og,
        width: 1200,
        height: 630,
        alt: `${studio.name} — cinematic photography and films`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${studio.name} — Cinematic Photography & Films`,
    description,
    images: [media.og],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  category: 'Photography',
};

export const viewport = {
  themeColor: '#050506',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/* ── schema.org: LocalBusiness + the service catalogue ──────── */
function schema() {
  const a = studio.address;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': `${studio.url}#studio`,
        name: studio.legalName,
        alternateName: studio.name,
        description,
        url: studio.url,
        image: `${studio.url}${media.og}`,
        logo: `${studio.url}/brand/logo.svg`,
        telephone: studio.phone,
        email: studio.email,
        priceRange: studio.priceRange,
        foundingDate: studio.founded,
        openingHours: studio.openingHours,
        address: {
          '@type': 'PostalAddress',
          streetAddress: a.street,
          addressLocality: a.locality,
          addressRegion: a.region,
          postalCode: a.postalCode,
          addressCountry: a.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: studio.geo.lat,
          longitude: studio.geo.lng,
        },
        areaServed: studio.serviceAreas.map((name) => ({ '@type': 'Place', name })),
        sameAs: studio.social.map((s) => s.href),
        knowsAbout: [
          'Wedding photography',
          'Wedding videography',
          'Cinematic wedding films',
          'Pre-wedding photography',
          'Event photography',
          'Drone cinematography',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Photography & Videography Services',
          itemListElement: [
            'Wedding Photography',
            'Wedding Films',
            'Pre-Wedding Stories',
            'Event Photography',
            'Event Videography',
            'Drone Cinematography',
            'Candid Photography',
            'Traditional Photography',
            'Fashion & Editorial',
            'Corporate & Brand Events',
            'Social Media Content',
          ].map((name) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name, provider: { '@id': `${studio.url}#studio` } },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${studio.url}#website`,
        url: studio.url,
        name: studio.name,
        publisher: { '@id': `${studio.url}#studio` },
        inLanguage: 'en',
      },
    ],
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" href="/brand/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema()) }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
