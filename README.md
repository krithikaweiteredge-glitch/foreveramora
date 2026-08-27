# foreveramora

An immersive, cinematic site for a photography & videography studio.
Next.js 15 · React Three Fiber · GSAP ScrollTrigger · Lenis.

> **We don't just capture moments. We make them last.**

---

## Run it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

```bash
npm run build && npm start   # production
```

---

## Making it the studio's

Everything a real studio needs to change lives in three files and one folder.

### 1. `lib/studio.js` — who you are

Name, phone, email, WhatsApp, street address, map pin, service areas, social
links, founding year, headline figures. Every line marked `▸ REPLACE`.

This file also drives the SEO: page metadata, Open Graph, and the
`LocalBusiness` + `OfferCatalog` schema in `app/layout.js`. Change the address
here and local SEO follows.

### 2. `lib/content.js` — what you say

Event categories and what you capture in each, testimonials, the team, the
four-step experience, and the service list. All written as realistic copy, not
lorem ipsum — edit it in place.

One rule: the four-step export is called `experience`, **never `process`**. An
import named `process` shadows Node's global inside the module and breaks the
production build's env macro.

### 3. `lib/media.js` — what you show

Every image path on the site, in one manifest.

**To drop in real photography**, either:

- keep the file names and overwrite the files in `public/media/**`, or
- point the strings in `lib/media.js` at whatever you name them.

Every slot ships **three files**: `name.webp` (full size), `name@480.webp`
(the srcset variant) and `name.jpg` (the fallback). That `480` is the value of
`SMALL` in `lib/media.js` and of `SMALL` in `scripts/fetch_photos.py` — it
lives in exactly those two places, and they must agree or the `srcset` points
at files that do not exist.

| Folder | What it is | Full size |
| --- | --- | --- |
| `hero/` | portraits suspended around the camera | 900 × 1200 |
| `film/` | the wide frames the camera flies through | 1600 × 900 |
| `emotion/` | the "we preserve feelings" strip | 1000 × 1250 |
| `categories/` | one cover per event type | 1200 × 1500 |
| `wall/` | the memory wall (48 frames) | 512 × 640 |
| `team/` | studio portraits | 900 × 1200 |
| `ambient/` | blurred plates behind testimonials | 1600 × 900 |
| `lens/`, `final/` | the lens interior and the closing frame | — |
| `og.jpg` | social share card | 1200 × 630 |
| `chapters/`, `portfolio/` | for the parked sections (see below) | — |

### 4. Films

`lib/media.js → films`. Every video slot has an empty `src`. Put real files in
`public/media/video/` and fill the strings in — until then the UI degrades to a
poster with a slow push-in, and the fullscreen player shows a clearly-labelled
placeholder. Recommended: 1080p H.264 `.mp4`, ≤ 8 MB, 12–25 s loops for the
hover previews.

### 5. Where enquiries go

`app/api/booking/route.js`. Validation, the honeypot and normalising are done;
the `deliver()` function currently logs. Replace its body with Resend /
SendGrid / Nodemailer / a CRM webhook — the commented example shows the shape.

---

## The placeholder photography

The images that ship with this repo are **placeholders** from
[StockSnap](https://stocksnap.io), every one released under **CC0 1.0** —
public domain, free for commercial use, modification allowed, no attribution
legally required. They are then colour-graded into one look so the site reads
as a single body of work.

Contributors are credited in
[`public/media/CREDITS.md`](public/media/CREDITS.md) anyway. Once the studio's
own work is in, delete that file.

```bash
npm run media          # fetch anything new, then grade
npm run media:grade    # re-grade the cache only — for tuning the look
npm run media:sheet    # contact sheet, to review what got picked
```

StockSnap rate-limits after a few hundred downloads. The fetch checkpoints
after every search term and `--grade` can rebuild its manifest straight from
`.media-cache/`, so an interrupted run is never wasted — just run it again
later to top up.

Raw downloads are cached in `.media-cache/` (git-ignored, never shipped).
`scripts/stocksnap.py` holds the search terms; the grade itself is `grade()`
in `scripts/fetch_photos.py` — one function, worth tuning.

---

## How it is built

```
app/                 layout (metadata + schema), page, globals.css, api/booking
components/
  Experience.jsx     the running order of the whole page
  chrome/            preloader, nav, cursor, film player, sticky CTA, footer
  sections/          one file per section, one shared CSS module
  three/             the WebGL scenes
    Stage.jsx        mounts every canvas: tiering, in-view gating, fallbacks
    CanvasHost.jsx   the only module importing R3F — loaded ssr:false
    CameraModel.jsx  the DSLR, built from geometry — no model download
    materials.js     the photo shader, dust, glass
  ui/                Img, mask reveals, magnetic buttons
lib/                 studio.js · content.js · media.js · quality.js
scripts/             the media pipeline
```

The page runs in this order:

hero → the memory corridor → *we preserve feelings* → what we capture →
through the lens → the memory wall → testimonials → behind the lens → the
experience → services → booking → the closing frame

### Parked sections

Three sections are built, styled and working but **not currently in the running
order** — they were taken out of the page on request. To bring one back, import
it in `components/Experience.jsx` and drop it where you want it:

| File | What it is | Also needs |
| --- | --- | --- |
| `sections/Chapters.jsx` | the pinned horizontal story reel | a `#stories` nav entry in `lib/studio.js` |
| `sections/Portfolio.jsx` | the draggable WebGL archive carousel + case-study panel | a `#work` nav entry |
| `sections/PhotoFilm.jsx` | the PHOTO / FILM split with the fullscreen player | uses `chrome/FilmPlayer.jsx` |

They are not imported anywhere, so they add nothing to the bundle.

### Performance

`lib/quality.js` tiers every device (`high` / `medium` / `low` / `off`) from
WebGL support, viewport, cores, memory and `prefers-reduced-motion`, and hands
each scene a budget: particle counts, wall size, aperture blades, glass
transmission, DPR cap, antialiasing.

`components/three/Stage.jsx` then:

- mounts a canvas only when the section approaches the viewport,
- pauses its render loop (`frameloop="never"`) when it leaves,
- releases the WebGL context entirely for the heavy scenes (browsers cap live
  contexts, and the site has several),
- remounts twice after a lost context before falling back,
- shows a graded still if WebGL is unavailable or motion is reduced.

three.js and R3F never enter the server bundle — `CanvasHost.jsx` is the only
module that imports them and `Stage` loads it with `ssr: false`. The homepage
ships **173 kB** of first-load JS; the WebGL arrives only when a scene does.

Images are pre-optimised WebP with a JPG fallback and a srcset variant, lazy by
default, with only the hero eager.

### Accessibility

Skip link, real landmarks and headings, focus-visible rings, `aria-*` on the
menu / dialogs / carousel controls, live region on the booking form, and a full
`prefers-reduced-motion` path that turns off the smooth scroll, the cursor, the
grain and every canvas.

---

## Still to add before launch

- Real photography and films (see above)
- Real contact details in `lib/studio.js`, and the live domain in `studio.url`
- A booking destination in `app/api/booking/route.js`
- `public/brand/` — the studio's real logo and favicon
