/**
 * ─────────────────────────────────────────────────────────────
 *  MEDIA MANIFEST — every image and video path on the site.
 *
 *  HOW TO DROP IN THE REAL PHOTOGRAPHY
 *  1. Export the studio's photos as .webp (and a .jpg fallback).
 *  2. Drop them into /public/media/<folder>/ using the same file
 *     names, or just change the strings below. Nothing else moves.
 *  3. Small variants are named  name@450.webp / name@800.webp …
 *     and are used automatically for srcset. If you don't ship a
 *     small variant, delete the `srcset` by passing `sizes={null}`.
 *
 *  VIDEO: put real files in /public/media/video/ and fill in the
 *  `src` fields below. While `src` is empty the player falls back
 *  to a cinematic still with a slow push-in — nothing breaks.
 * ─────────────────────────────────────────────────────────────
 */

const M = '/media';

const pad = (n) => String(n).padStart(2, '0');
const seq = (dir, name, count, ext = 'webp') =>
  Array.from({ length: count }, (_, i) => `${M}/${dir}/${name}-${pad(i + 1)}.${ext}`);

export const media = {
  /** Photographs suspended around the hero frame */
  hero: seq('hero', 'hero', 8),

  /** Wide frames the camera travels through on the cinematic scroll */
  film: seq('film', 'frame', 4),

  /** "We preserve feelings" — the emotion strip */
  emotion: seq('emotion', 'emotion', 12),

  /** Memory wall */
  wall: seq('wall', 'w', 48),

  /** Horizontal story chapters */
  chapters: seq('chapters', 'chapter', 6),

  /** Ambient plates behind testimonials */
  ambient: seq('ambient', 'ambient', 4),

  /** Team portraits */
  team: seq('team', 'member', 6),

  lens: `${M}/lens/lens-01.webp`,
  final: `${M}/final/final-01.webp`,
  og: `${M}/og.jpg`,
};

/**
 * VIDEO SLOTS.  Leave `src` as '' until the real films are encoded —
 * the UI degrades to the poster with a slow cinematic push-in.
 * Recommended: 1080p H.264 .mp4 + .webm, ≤ 8 MB, muted, 12–25 s loop.
 */
export const films = {
  reel: {
    label: 'Studio Reel 2026',
    src: '', //  ▸ REPLACE  e.g. `${M}/video/reel-2026.mp4`
    poster: `${M}/film/frame-01.webp`,
    duration: '2:14',
  },
  photoFilmSplit: {
    photo: `${M}/emotion/emotion-01.webp`,
    filmPoster: `${M}/film/frame-02.webp`,
    filmSrc: '', //  ▸ REPLACE — the hover-preview loop
  },
  chapters: [
    { src: '', poster: `${M}/chapters/chapter-01.webp` }, //  ▸ REPLACE
    { src: '', poster: `${M}/chapters/chapter-03.webp` },
  ],
};

/**
 * The one small width every slot ships. scripts/fetch_photos.py writes
 * `name@480.webp` for every image, so this number lives in both places and
 * nowhere else.
 */
export const SMALL = 480;

/** srcset helper: `/media/hero/hero-01.webp` → adds the @480 variant */
export function srcSet(src, widths = []) {
  if (!widths.length) return undefined;
  const dot = src.lastIndexOf('.');
  const base = src.slice(0, dot);
  const ext = src.slice(dot);
  return [...widths.map((w) => `${base}@${w}${ext} ${w}w`), `${src} 1600w`].join(', ');
}
