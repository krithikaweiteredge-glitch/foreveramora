"""
Build the site's placeholder photography.

  python scripts/fetch_photos.py            # fetch anything new, then grade
  python scripts/fetch_photos.py --grade    # re-grade what is already cached
  python scripts/fetch_photos.py --sheet    # write a contact sheet to review

Photographs come from StockSnap (see scripts/stocksnap.py), which releases
everything under CC0 - public domain, free for commercial use, modification
allowed, no attribution required. Every frame is scored, the best are assigned
to the most visible slots, and all of them are graded into one cinematic look
so the site reads as a single body of work.

Raw downloads are cached in  .media-cache/  (outside public/, never shipped).
Credits are written to  public/media/CREDITS.md.

These are PLACEHOLDERS. Replace them with the studio's own photography by
dropping files into public/media/** using the same names (see lib/media.js).
"""
import glob
import io
import json
import os
import random
import sys

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageStat

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import stocksnap  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", "public", "media"))
SRC = os.path.normpath(os.path.join(HERE, "..", ".media-cache"))
INDEX = os.path.join(SRC, "index.json")

MIN_PIXELS = 640 * 640  # anything smaller cannot carry a full-bleed slot


# ────────────────────── picking the good ones ──────────────────────

def quality(path):
    """A rough proxy for 'did someone who knew what they were doing shoot this'.

    Rewards a sharp subject sitting in a soft surround (shallow depth of
    field), real tonal range, and sane exposure. Punishes flat, evenly-busy
    frames - which is what a phone snapshot of a crowded room looks like.
    """
    try:
        img = Image.open(path).convert("L").resize((256, 256), Image.LANCZOS)
    except Exception:
        return -1.0

    edges = img.filter(ImageFilter.FIND_EDGES)
    centre = ImageStat.Stat(edges.crop((72, 72, 184, 184))).stddev[0]
    whole = ImageStat.Stat(edges).stddev[0] + 1e-3
    bokeh = centre / whole                       # subject sharper than surround
    contrast = ImageStat.Stat(img).stddev[0]
    mean = ImageStat.Stat(img).mean[0]
    exposure = max(0.0, 1.0 - abs(mean - 96.0) / 128.0)
    # this site is very dark; low-key frames sit in it far better than high-key
    low_key = max(0.0, 1.0 - abs(mean - 88.0) / 110.0)

    return centre * 0.05 + bokeh * 1.6 + contrast * 0.04 + exposure * 1.0 + low_key * 0.8


# ─────────────────────────── fetching ───────────────────────────

def load_index():
    """Prefer the manifest, but never depend on it.

    A fetch can be interrupted (StockSnap rate-limits after a few hundred
    downloads), so if the manifest is missing or behind, rebuild what we can
    straight from the files on disk. The bucket is the filename prefix.
    """
    records, known = [], set()
    if os.path.exists(INDEX):
        with io.open(INDEX, encoding="utf-8") as f:
            for r in json.load(f):
                if os.path.exists(os.path.join(SRC, r["file"])):
                    records.append(r)
                    known.add(r["file"])

    for path in sorted(glob.glob(os.path.join(SRC, "*.jpg"))):
        name = os.path.basename(path)
        if name in known:
            continue
        records.append(
            {
                "file": name,
                "bucket": name.rsplit("_", 1)[0],
                "score": round(quality(path), 3),
                "source": "stocksnap",
                "license": "CC0 1.0 (public domain)",
                "title": name.rsplit("_", 1)[0],
                "artist": "StockSnap contributor",
                "page": "https://stocksnap.io/",
            }
        )
    return records


def download():
    os.makedirs(SRC, exist_ok=True)
    records = load_index()
    seen = set()
    for r in records:
        seen.add(r.get("page") or r["file"])
    n = len(records)

    # StockSnap first (modern CC0 stock), then Flickr for the ceremonies
    # stock libraries never cover, then Commons as a last top-up.
    for term, want, bucket in stocksnap.SEARCHES:
        print("-> %s (%s)" % (term, bucket), flush=True)
        pages = max(1, min(4, (want + 39) // 40))
        try:
            hits = stocksnap.search(term, pages=pages)
        except Exception as e:
            print("   ! search failed:", e, flush=True)
            continue

        # popular frames first — downloads track composition more than luck
        hits.sort(key=lambda h: -h["popularity"])
        taken = 0
        for m in hits:
            if taken >= want:
                break
            if m["page"] in seen:
                continue
            seen.add(m["page"])

            name = "%s_%05d.jpg" % (bucket, n)
            path = os.path.join(SRC, name)
            try:
                blob = stocksnap.fetch(m["url"])
                img = Image.open(io.BytesIO(blob)).convert("RGB")
                if img.width * img.height < MIN_PIXELS:
                    continue
                img.save(path, "JPEG", quality=92)
            except Exception as e:
                print("   ! skip", m["id"], e, flush=True)
                continue

            m["file"] = name
            m["bucket"] = bucket
            m["score"] = round(quality(path), 3)
            records.append(m)
            n += 1
            taken += 1
        print("   +%d  (%d total)" % (taken, len(records)), flush=True)

        # checkpoint after every term
        with io.open(INDEX, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=1, ensure_ascii=False)

    with io.open(INDEX, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=1, ensure_ascii=False)

    write_credits(records)
    print("")
    print("cache holds %d photographs" % len(records))
    return records


def write_credits(records):
    used = sorted(records, key=lambda r: -r.get("score", 0))
    lines = [
        "# Placeholder photography credits",
        "",
        "The photographs on this site are **placeholders** from",
        "[StockSnap](https://stocksnap.io), released under **CC0 1.0** - public",
        "domain, free for commercial use, modification allowed, and no",
        "attribution legally required. The contributors are credited below",
        "anyway, because they earned it.",
        "",
        "Replace them with the studio's own photography - drop files into",
        "`public/media/**` using the same names (see `lib/media.js`) - and this",
        "file can be deleted.",
        "",
        "| File | Title | Author | Licence | Source |",
        "| --- | --- | --- | --- | --- |",
    ]
    for r in used:
        lines.append(
            "| `%s` | [%s](%s) | %s | %s | %s |"
            % (
                r["file"],
                str(r.get("title", ""))[:60].replace("|", "/"),
                r.get("page", ""),
                str(r.get("artist", ""))[:50].replace("|", "/"),
                r.get("license", ""),
                r.get("source", ""),
            )
        )
    with io.open(os.path.join(ROOT, "CREDITS.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


# ─────────────────────────── the grade ───────────────────────────

def cover(img, w, h, zoom=1.12):
    """Crop to fill, biased above centre where faces sit, then punch in a
    little further so cluttered edges fall away."""
    if zoom > 1.0:
        cw, ch = int(img.width / zoom), int(img.height / zoom)
        x = (img.width - cw) // 2
        y = int((img.height - ch) * 0.34)
        img = img.crop((x, y, x + cw, y + ch))
    src_r = img.width / img.height
    dst_r = w / h
    if src_r > dst_r:
        nw = int(img.height * dst_r)
        x = (img.width - nw) // 2
        img = img.crop((x, 0, x + nw, img.height))
    else:
        nh = int(img.width / dst_r)
        y = int((img.height - nh) * 0.34)
        img = img.crop((0, y, img.width, y + nh))
    return img.resize((w, h), Image.LANCZOS)


def split_tone(img, shadow=(44, 38, 58), highlight=(255, 226, 180), amount=0.2):
    """Cool shadows, warm highlights - the whole point of a film look."""
    lum = img.convert("L")
    sh = Image.new("RGB", img.size, shadow)
    hi = Image.new("RGB", img.size, highlight)
    inv = ImageChops.invert(lum)
    out = Image.composite(hi, img, lum.point(lambda v: int(v * amount)))
    return Image.composite(sh, out, inv.point(lambda v: int(v * amount * 0.85)))


def vignette(img, strength=0.55):
    w, h = img.size
    m = Image.new("L", (72, 72), 0)
    ImageDraw.Draw(m).ellipse([-16, -16, 88, 88], fill=255)
    m = m.resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(w * 0.05))
    m = m.point(lambda v: int(255 - (255 - v) * strength))
    return ImageChops.multiply(img, Image.merge("RGB", (m, m, m)))


def lift_blacks(img, lift=9):
    return img.point(lambda v: int(lift + v * (255 - lift) / 255))


def curve(img, shadows=1.06, highs=0.92):
    """A gentle S: hold the blacks, roll off the highlights."""
    lut = []
    for i in range(256):
        v = i / 255.0
        v = v * v * (3 - 2 * v) * 0.55 + v * 0.45   # smoothstep blended with linear
        v = v ** shadows
        v = 1.0 - (1.0 - v) ** highs
        lut.append(int(max(0, min(255, v * 255))))
    return img.point(lut * 3)


def grade(img, seed=0):
    """The house look: desaturated, warm, deep, quiet.

    Strong on purpose. It has to unify photographs from many different
    cameras and many different days into one body of work — and it is what
    turns an ordinary frame into something that belongs on a dark page.
    """
    rng = random.Random(seed)
    img = img.convert("RGB")

    # 1. pull most of the colour out, then put warmth back deliberately
    img = ImageEnhance.Color(img).enhance(0.62)
    img = curve(img)
    img = split_tone(img, shadow=(26, 30, 46), highlight=(255, 220, 172), amount=0.24)

    # 2. halation — film blooms around anything bright
    lum = img.convert("L").point(lambda v: 0 if v < 178 else (v - 178) * 3)
    glow = Image.merge(
        "RGB",
        (lum, lum.point(lambda v: int(v * 0.7)), lum.point(lambda v: int(v * 0.42))),
    ).filter(ImageFilter.GaussianBlur(max(2, img.width * 0.018)))
    img = ImageChops.add(img, glow.point(lambda v: int(v * 0.34)))

    # 3. sit it in the dark
    img = ImageEnhance.Contrast(img).enhance(1.3)
    img = lift_blacks(img, 4)
    img = vignette(img, 0.7)
    img = ImageEnhance.Brightness(img).enhance(0.8)

    # 4. grain, and a touch of diffusion on some frames
    n = Image.effect_noise(img.size, 10).convert("L")
    img = ImageChops.overlay(img, Image.merge("RGB", (n, n, n)))
    if rng.random() < 0.55:
        img = img.filter(ImageFilter.GaussianBlur(0.4))
    return img


# Every slot ships exactly two WebP files - the full size and one small
# variant at SMALL px - plus a JPG fallback. lib/media.js builds srcset from
# the same number, so the two can never drift apart.
SMALL = 480


def save(img, relpath, widths):
    out = os.path.join(ROOT, relpath)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    w0, h0 = img.size

    full = widths[0]
    if full != w0:
        img = img.resize((full, max(1, round(h0 * full / w0))), Image.LANCZOS)
    img.save(out + ".webp", "WEBP", quality=82, method=5)

    fw, fh = img.size
    small = img.resize((SMALL, max(1, round(fh * SMALL / fw))), Image.LANCZOS)
    small.save(out + "@%d.webp" % SMALL, "WEBP", quality=80, method=5)
    small.save(out + ".jpg", "JPEG", quality=78, optimize=True)


# ───────────── slot assignment: which photo goes where ─────────────

STORY_SLUGS = [
    ("ananya-arjun", ["wedding"]),
    ("meera-kabir", ["wedding"]),
    ("saanvi-dev", ["couple", "place"]),
    ("riya-aarav", ["couple", "wedding"]),
    ("the-kapoors", ["family"]),
    ("nova-launch", ["corporate"]),
    ("navratri-nights", ["festival"]),
    ("aurum-campaign", ["fashion", "detail"]),
    ("zara-turns-one", ["birthday", "family"]),
]


# StockSnap's "festival" and "concert" tags mean funfairs and stadiums, which
# have nothing to do with a wedding studio. Filter on the tag text.
OFF_BRIEF = (
    "circus", "carnival", "fairground", "funfair", "ferris", "rollercoaster",
    "stadium", "concert", "crowd", "rally", "protest", "football", "soccer",
    "basketball", "graffiti", "skateboard", "gaming", "computer", "laptop",
    "keyboard", "car ", "traffic", "burger", "pizza", "cocktail bar",
)


class Pool:
    """Hands out photographs best-first, so the hero and the covers get the
    strongest frames and the memory wall gets the rest."""

    SOURCE_BONUS = {"stocksnap": 3.2, "flickr": 1.2, "wikimedia": 0.0}

    @staticmethod
    def rank(r):
        # StockSnap is contemporary CC0 stock, shot commercially; Flickr is
        # where working photographers publish; Commons is documentation.
        # Weight the source first, then the measured quality of the frame.
        return r.get("score", 0) + Pool.SOURCE_BONUS.get(r.get("source"), 0.0)

    def __init__(self, records):
        records = [
            r
            for r in records
            if not any(w in str(r.get("title", "")).lower() for w in OFF_BRIEF)
        ]
        ranked = sorted(records, key=lambda r: -Pool.rank(r))
        # discard the bottom third outright rather than let it fill the wall
        keep = max(60, int(len(ranked) * 0.72))
        records = ranked[:keep]
        self.by = {}
        for r in records:
            self.by.setdefault(r["bucket"], []).append((self.rank(r), r["file"]))
        for k in self.by:
            self.by[k] = [f for _, f in sorted(self.by[k], key=lambda x: -x[0])]
        self.i = {k: 0 for k in self.by}
        self.all = [r["file"] for r in sorted(records, key=lambda r: -self.rank(r))]

    def take(self, buckets):
        if isinstance(buckets, str):
            buckets = [buckets]
        for b in buckets:
            lst = self.by.get(b)
            if lst:
                f = lst[self.i[b] % len(lst)]
                self.i[b] += 1
                return f
        return self.all[0]

    def open(self, buckets):
        return Image.open(os.path.join(SRC, self.take(buckets)))


def build():
    records = load_index()
    if not records:
        print("no cached photographs - run without --grade first")
        return
    pool = Pool(records)
    n = [0]

    def put(buckets, rel, w, h, widths, seed, zoom=1.12):
        img = grade(cover(pool.open(buckets), w, h, zoom), seed)
        save(img, rel, widths)
        n[0] += 1

    hero_b = ["wedding", "couple", "wedding", "family", "wedding", "detail",
              "fashion", "couple"]
    for i, b in enumerate(hero_b, 1):
        put([b, "wedding"], "hero/hero-%02d" % i, 900, 1200, [900, 450], i)

    for i, b in enumerate(["wedding", "couple", "festival", "family"], 1):
        put([b], "film/frame-%02d" % i, 1600, 900, [1280, 640], 100 + i, 1.05)

    emo = ["wedding", "family", "couple", "family", "festival", "birthday",
           "wedding", "couple", "family", "wedding", "festival", "detail"]
    for i, b in enumerate(emo, 1):
        put([b], "emotion/emotion-%02d" % i, 1000, 1250, [800, 400], 200 + i)

    cats = [
        ("weddings", ["wedding"]),
        ("engagements", ["couple"]),
        ("pre-wedding", ["couple", "place"]),
        ("birthdays", ["birthday", "family"]),
        ("baby-family", ["family"]),
        ("corporate", ["corporate"]),
        ("festivals", ["festival"]),
        ("fashion", ["fashion", "detail"]),
    ]
    for i, (c, b) in enumerate(cats, 1):
        put(b, "categories/" + c, 1200, 1500, [1000, 500], 300 + i)

    chb = [["wedding"], ["couple", "place"], ["festival"], ["wedding", "detail"],
           ["family"], ["birthday"]]
    for i, b in enumerate(chb, 1):
        put(b, "chapters/chapter-%02d" % i, 1500, 960, [1280, 640], 400 + i, 1.05)

    for i, (slug, b) in enumerate(STORY_SLUGS, 1):
        put(b, "portfolio/" + slug, 1440, 990, [1280, 640], 500 + i, 1.05)
        for j in range(1, 5):
            put(b, "portfolio/%s-%d" % (slug, j), 1200, 1500, [900, 450],
                5000 + i * 10 + j)

    # the wall is the studio's own archive — it stays on subject
    wall_b = ["wedding", "couple", "family", "detail", "wedding", "festival",
              "couple", "birthday", "wedding", "family"]
    for i in range(1, 49):
        put([wall_b[i % len(wall_b)]], "wall/w-%02d" % i, 512, 640, [400], 700 + i)

    for i in range(1, 7):
        put(["studio", "fashion"], "team/member-%02d" % i, 900, 1200, [700, 350],
            800 + i)

    for i, b in enumerate(["wedding", "couple", "festival", "place"], 1):
        put([b], "ambient/ambient-%02d" % i, 1600, 900, [1280, 640], 900 + i, 1.05)

    put(["wedding"], "lens/lens-01", 960, 960, [960, 480], 991)
    put(["wedding", "family"], "final/final-01", 1500, 1000, [1280, 640], 992, 1.05)

    grade(cover(pool.open(["wedding"]), 1200, 630, 1.05), 993).save(
        os.path.join(ROOT, "og.jpg"), "JPEG", quality=86, optimize=True
    )

    print("graded %d images into %s" % (n[0], ROOT))


def sheet(path="contact-sheet.jpg", bucket=None, count=40):
    """A quick look at what the top-scoring frames actually are."""
    records = [r for r in load_index() if bucket is None or r["bucket"] == bucket]
    records = sorted(records, key=lambda r: -r.get("score", 0))[:count]
    cols, cell = 8, 200
    rows = max(1, (len(records) + cols - 1) // cols)
    out = Image.new("RGB", (cols * cell, rows * cell), (8, 8, 10))
    for i, r in enumerate(records):
        try:
            im = grade(cover(Image.open(os.path.join(SRC, r["file"])), cell, cell), i)
        except Exception:
            continue
        out.paste(im, ((i % cols) * cell, (i // cols) * cell))
    out.save(path, "JPEG", quality=88)
    print("contact sheet ->", path)


if __name__ == "__main__":
    if "--sheet" in sys.argv:
        arg = [a for a in sys.argv[1:] if not a.startswith("--")]
        sheet(bucket=arg[0] if arg else None)
    else:
        if "--grade" not in sys.argv:
            download()
        build()
