/**
 * ─────────────────────────────────────────────────────────────
 *  COPY & CONTENT MODEL
 *  Realistic, structured placeholder content. Every field maps to
 *  something the studio will replace with its own words and work.
 * ─────────────────────────────────────────────────────────────
 */
import { media } from './media';

/* ── 6. TYPES OF EVENTS WE CAPTURE ─────────────────────────── */
export const categories = [
  {
    id: 'weddings',
    index: '01',
    title: 'Weddings',
    kicker: 'The whole arc of a day',
    line: 'From the first nervous breath to the last car leaving the gate.',
    image: `/media/categories/weddings.webp`,
    cta: 'Explore wedding stories',
    captures: [
      'Bride & groom portraits', 'Bridal entry', 'Groom entry', 'First look',
      'Wedding rituals', 'Garland exchange', 'Family emotions', 'Parents’ reactions',
      'Couple portraits', 'Candid moments', 'Dance performances', 'Reception',
      'Wedding details', 'Jewellery', 'Mehendi', 'Haldi', 'Sangeet', 'Decor',
      'Guests', 'Behind-the-scenes', 'The farewell',
    ],
  },
  {
    id: 'engagements',
    index: '02',
    title: 'Engagements',
    kicker: 'The yes, and everything after it',
    line: 'One ring, one room, and every face in it changing at once.',
    image: `/media/categories/engagements.webp`,
    cta: 'Explore engagement stories',
    captures: [
      'Ring exchange', 'Couple portraits', 'Family reactions', 'Candid laughter',
      'Decor', 'Celebration', 'Couple details', 'Friends and family',
    ],
  },
  {
    id: 'pre-wedding',
    index: '03',
    title: 'Pre-Wedding Stories',
    kicker: 'Before forever begins',
    line: 'A film about two people, shot before the world gets involved.',
    image: `/media/categories/pre-wedding.webp`,
    cta: 'Explore pre-wedding films',
    captures: [
      'Cinematic couple portraits', 'Romantic moments', 'Travel stories',
      'Location-based portraits', 'Fashion & editorial shots', 'Story-driven films',
      'Drone cinematography', 'Behind-the-scenes',
    ],
  },
  {
    id: 'birthdays',
    index: '04',
    title: 'Birthdays & Celebrations',
    kicker: 'The room right before the lights go out',
    line: 'Cake, chaos, and the face someone makes when they realise it’s for them.',
    image: `/media/categories/birthdays.webp`,
    cta: 'Explore celebrations',
    captures: [
      'Cake cutting', 'Family moments', 'Friends', 'Surprise reactions',
      'Decorations', 'Dancing', 'Candid laughter', 'Group portraits',
      'Emotional moments',
    ],
  },
  {
    id: 'baby-family',
    index: '05',
    title: 'Baby & Family',
    kicker: 'How small everyone used to be',
    line: 'The years you can’t feel passing until you look at the pictures.',
    image: `/media/categories/baby-family.webp`,
    cta: 'Explore family stories',
    captures: [
      'Newborn moments', 'Baby portraits', 'Parents with baby', 'Family portraits',
      'First birthdays', 'Kids playing', 'Natural family interactions',
    ],
  },
  {
    id: 'corporate',
    index: '06',
    title: 'Corporate & Brand',
    kicker: 'Work that deserves a better photograph',
    line: 'Launches, keynotes and teams, shot like they matter. Because they do.',
    image: `/media/categories/corporate.webp`,
    cta: 'Explore brand work',
    captures: [
      'Conferences', 'Product launches', 'Corporate events', 'Team photography',
      'Brand films', 'Promotional videos', 'Award ceremonies', 'Business portraits',
      'Behind-the-scenes content',
    ],
  },
  {
    id: 'festivals',
    index: '07',
    title: 'Festivals & Culture',
    kicker: 'Traditions, exactly as they are',
    line: 'The rituals your grandparents knew by heart, kept for the ones who won’t.',
    image: `/media/categories/festivals.webp`,
    cta: 'Explore cultural stories',
    captures: [
      'Traditional ceremonies', 'Cultural performances', 'Family celebrations',
      'Rituals', 'Decorations', 'Traditional clothing', 'Community moments',
      'Candid emotions',
    ],
  },
  {
    id: 'fashion',
    index: '08',
    title: 'Fashion & Editorial',
    kicker: 'Light, shaped on purpose',
    line: 'Campaigns and portfolios built frame by frame, not filter by filter.',
    image: `/media/categories/fashion.webp`,
    cta: 'Explore editorial work',
    captures: [
      'Fashion campaigns', 'Model portfolios', 'Editorial photography',
      'Product photography', 'Brand campaigns', 'Fashion films',
    ],
  },
];

/* ── 7. EVERY STORY IS DIFFERENT ───────────────────────────── */
export const chapters = [
  {
    n: '01',
    title: 'The Wedding',
    lines: ['Two families.', 'One celebration.', 'A thousand moments.'],
    body: 'Nobody remembers the timeline. They remember her father turning away from the camera, and the four seconds before he turned back.',
    image: media.chapters[0],
    scale: 'wide',
  },
  {
    n: '02',
    title: 'The Pre-Wedding',
    lines: ['Before forever begins.'],
    body: 'Two people, one location, no guests. The last time it is only about them.',
    image: media.chapters[1],
    scale: 'tall',
  },
  {
    n: '03',
    title: 'The Celebration',
    lines: ['Where everyone you love', 'comes together.'],
    body: 'Cousins who only meet at weddings. Uncles who only dance at weddings. We shoot all of it.',
    image: media.chapters[2],
    scale: 'wide',
  },
  {
    n: '04',
    title: 'The Rituals',
    lines: ['Older than everyone', 'in the room.'],
    body: 'Hands, fire, thread, rice. The details that make the day yours and not a template.',
    image: media.chapters[3],
    scale: 'tall',
  },
  {
    n: '05',
    title: 'The Farewell',
    lines: ['The hardest frame', 'of the day.'],
    body: 'We stay for it. It is usually the photograph a family looks at longest.',
    image: media.chapters[4],
    scale: 'wide',
  },
];

/* ── 10. PORTFOLIO ─────────────────────────────────────────── */
const gal = (slug) => [1, 2, 3, 4].map((i) => `/media/portfolio/${slug}-${i}.webp`);

export const stories = [
  {
    slug: 'ananya-arjun',
    title: 'Ananya × Arjun',
    type: 'Wedding',
    location: 'Udaipur, Rajasthan',
    date: 'November 2025',
    logline: 'Two families. One unforgettable beginning.',
    story:
      'Three days on the water in Udaipur. A baraat that arrived by boat, a grandmother who danced longer than anyone under forty, and a bride who cried exactly once — at the wrong moment, which turned out to be the right one.',
    services: ['Wedding Photography', 'Cinematic Film', 'Drone', 'Same-Day Edit'],
    cover: '/media/portfolio/ananya-arjun.webp',
    gallery: gal('ananya-arjun'),
  },
  {
    slug: 'meera-kabir',
    title: 'Meera × Kabir',
    type: 'Wedding',
    location: 'Hyderabad, Telangana',
    date: 'February 2026',
    logline: 'A hundred guests, one farmhouse, two power cuts.',
    story:
      'A December wedding at a farmhouse outside the city. The power went twice. Both times somebody started singing, and both times we kept rolling.',
    services: ['Wedding Photography', 'Wedding Film', 'Candid'],
    cover: '/media/portfolio/meera-kabir.webp',
    gallery: gal('meera-kabir'),
  },
  {
    slug: 'saanvi-dev',
    title: 'Saanvi × Dev',
    type: 'Pre-Wedding Film',
    location: 'Gokarna, Karnataka',
    date: 'August 2025',
    logline: 'Before forever begins.',
    story:
      'Shot over one long day between two tides. No poses, one conversation, and a drone that stayed high enough to keep out of it.',
    services: ['Pre-Wedding Film', 'Portraits', 'Drone Cinematography'],
    cover: '/media/portfolio/saanvi-dev.webp',
    gallery: gal('saanvi-dev'),
  },
  {
    slug: 'riya-aarav',
    title: 'Riya × Aarav',
    type: 'Engagement',
    location: 'Secunderabad, Telangana',
    date: 'January 2026',
    logline: 'The yes, and every face that heard it.',
    story:
      'A terrace, forty people, and a proposal nobody but us knew was coming. We shot the room, not the ring.',
    services: ['Event Photography', 'Highlight Film'],
    cover: '/media/portfolio/riya-aarav.webp',
    gallery: gal('riya-aarav'),
  },
  {
    slug: 'the-kapoors',
    title: 'The Kapoors',
    type: 'Family & Newborn',
    location: 'Hyderabad, Telangana',
    date: 'March 2026',
    logline: 'Eleven days old, and already the centre of everything.',
    story:
      'Morning light, one room, no props. The kind of session you understand properly about fifteen years later.',
    services: ['Newborn Session', 'Family Portraits'],
    cover: '/media/portfolio/the-kapoors.webp',
    gallery: gal('the-kapoors'),
  },
  {
    slug: 'nova-launch',
    title: 'Nova — Series A Launch',
    type: 'Corporate & Brand',
    location: 'Bengaluru, Karnataka',
    date: 'April 2026',
    logline: 'A product launch that didn’t look like one.',
    story:
      'Two cameras on stage, one roaming the floor. Delivered a 90-second brand film and 300 edited stills within 48 hours.',
    services: ['Event Coverage', 'Brand Film', 'Business Portraits'],
    cover: '/media/portfolio/nova-launch.webp',
    gallery: gal('nova-launch'),
  },
  {
    slug: 'navratri-nights',
    title: 'Navratri Nights',
    type: 'Festival & Culture',
    location: 'Ahmedabad, Gujarat',
    date: 'October 2025',
    logline: 'Nine nights. One continuous frame.',
    story:
      'Documentary coverage of a community garba — shot mostly at 1/40th, because stillness would have been a lie.',
    services: ['Documentary Photography', 'Event Film'],
    cover: '/media/portfolio/navratri-nights.webp',
    gallery: gal('navratri-nights'),
  },
  {
    slug: 'aurum-campaign',
    title: 'Aurum — SS26',
    type: 'Fashion & Editorial',
    location: 'Studio, Hyderabad',
    date: 'June 2026',
    logline: 'Gold, on skin, in one light.',
    story:
      'A jewellery campaign built around a single hard source and a lot of patience. Sixteen finals from a nine-hour day.',
    services: ['Campaign Photography', 'Fashion Film', 'Product'],
    cover: '/media/portfolio/aurum-campaign.webp',
    gallery: gal('aurum-campaign'),
  },
  {
    slug: 'zara-turns-one',
    title: 'Zara Turns One',
    type: 'Birthday',
    location: 'Goa',
    date: 'December 2025',
    logline: 'She slept through most of it. We didn’t.',
    story:
      'A first birthday on a beach at golden hour, with sixty people and one very unimpressed guest of honour.',
    services: ['Event Photography', 'Highlight Reel'],
    cover: '/media/portfolio/zara-turns-one.webp',
    gallery: gal('zara-turns-one'),
  },
];

/* ── 12. TESTIMONIALS ──────────────────────────────────────── */
export const testimonials = [
  {
    quote: 'They didn’t just capture our wedding. They captured how it felt.',
    name: 'Ananya Sethi', //  ▸ REPLACE
    event: 'Wedding',
    location: 'Udaipur',
    plate: media.ambient[0],
  },
  {
    quote:
      'My father doesn’t cry. There is a photograph of my father crying. I have never been more grateful for anything.',
    name: 'Kabir Rao',
    event: 'Wedding',
    location: 'Hyderabad',
    plate: media.ambient[1],
  },
  {
    quote:
      'We forgot they were there. That is the entire review. Then the film arrived and we watched it four times.',
    name: 'Saanvi & Dev',
    event: 'Pre-Wedding Film',
    location: 'Gokarna',
    plate: media.ambient[2],
  },
  {
    quote:
      'My grandmother passed eight months later. Those frames are the last ones of her laughing. There is no price on that.',
    name: 'Riya Malhotra',
    event: 'Engagement',
    location: 'Secunderabad',
    plate: media.ambient[3],
  },
];

/* ── 13. BEHIND THE LENS ───────────────────────────────────── */
export const team = [
  { name: 'Aarav Mehta', role: 'Founder & Lead Photographer', image: media.team[0] }, //  ▸ REPLACE
  { name: 'Ishita Nair', role: 'Director of Photography', image: media.team[1] },
  { name: 'Rohan D’Souza', role: 'Cinematographer', image: media.team[2] },
  { name: 'Tara Kulkarni', role: 'Candid & Documentary', image: media.team[3] },
  { name: 'Vikram Shah', role: 'Lead Editor & Colourist', image: media.team[4] },
  { name: 'Nidhi Bansal', role: 'Producer & Client Experience', image: media.team[5] },
];

/* ── 14. THE EXPERIENCE ─────────────────────────────────────
   Named `experience`, never `process`: an import called `process`
   shadows Node's global inside the module, and Next's build-time
   env macro then reads it and blows up the prerender. */
export const experience = [
  {
    n: '01',
    title: 'Meet',
    line: 'Tell us your story.',
    body: 'A call or a coffee. No pitch deck. We want the names, the family politics, the song that has to be playing when she walks in.',
  },
  {
    n: '02',
    title: 'Plan',
    line: 'We understand your vision.',
    body: 'A shot approach built around your day — light, locations, timings, the three people who must be in the frame together.',
  },
  {
    n: '03',
    title: 'Capture',
    line: 'We disappear into the moment.',
    body: 'Small crew. Quiet cameras. No staging your happiness. You will forget we are working, which is exactly the point.',
  },
  {
    n: '04',
    title: 'Relive',
    line: 'You get to experience it again.',
    body: 'A colour-graded film, a hand-sequenced gallery, and an archive we keep backed up in three places for ten years.',
  },
];

/* ── 15. SERVICES ──────────────────────────────────────────── */
export const services = [
  { title: 'Wedding Photography', note: 'Candid + traditional, two to six shooters, full-day coverage.' },
  { title: 'Wedding Films', note: 'Cinematic feature, highlight film, teaser and same-day edit.' },
  { title: 'Pre-Wedding Stories', note: 'A directed short film and portrait set, on location or travelling.' },
  { title: 'Event Photography', note: 'Engagements, sangeet, receptions, birthdays, anniversaries.' },
  { title: 'Event Videography', note: 'Multi-camera coverage, live-cut reels, full ceremony archives.' },
  { title: 'Drone Cinematography', note: 'Licensed pilots, permissions handled, 5.4K aerial coverage.' },
  { title: 'Candid Photography', note: 'Documentary shooters who stay out of the way and miss nothing.' },
  { title: 'Traditional Photography', note: 'The formals, the families, the frames your parents will ask for.' },
  { title: 'Fashion & Editorial', note: 'Campaigns, lookbooks, portfolios and product photography.' },
  { title: 'Corporate & Brand Events', note: 'Conferences, launches, keynotes, team and executive portraits.' },
  { title: 'Social Media Content', note: 'Vertical reels, teasers and stills cut for the way people watch.' },
];

/* ── 9. PHOTO / FILM ───────────────────────────────────────── */
export const filmFormats = [
  'Cinematic wedding films',
  'Highlight films',
  'Event films',
  'Reels & vertical cuts',
  'Social media content',
  'Drone footage',
  'Teasers',
  'Same-day edits',
];

/* ── Event types for the booking form ──────────────────────── */
export const eventTypes = [
  'Wedding', 'Engagement', 'Pre-Wedding Film', 'Birthday / Celebration',
  'Baby & Family', 'Corporate / Brand', 'Festival / Cultural',
  'Fashion / Editorial', 'Something else',
];

export const serviceOptions = [
  'Photography', 'Cinematic Film', 'Candid Coverage', 'Traditional Coverage',
  'Drone', 'Same-Day Edit', 'Album Design', 'Social Media Reels',
];
