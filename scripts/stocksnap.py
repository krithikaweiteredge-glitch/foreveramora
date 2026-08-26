"""
StockSnap — the primary placeholder pool.

Every photograph on StockSnap is released under CC0: public domain, free for
commercial use, no attribution required, modification allowed. That makes it
the only free pool that is genuinely safe on a commercial studio site, and the
work is contemporary and professionally shot.

Their site exposes a plain JSON search, which is what we use:

    https://stocksnap.io/api/search-photos/<query>/relevance/desc/<page>

Images come off the CDN at 960px wide, which is enough once cropped and graded.
"""
import json
import shutil
import ssl
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

try:
    import certifi

    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()

BASE = "https://stocksnap.io"
CDN = "https://cdn.stocksnap.io/img-thumbs/960w/%s.jpg"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
HEADERS = {"User-Agent": UA, "Referer": BASE + "/", "Accept": "*/*"}

_last = [0.0]
MIN_INTERVAL = 0.7


# Cloudflare fingerprints urllib and returns 403 where a normal client gets
# through, so prefer curl when it is on the machine and fall back to urllib.
CURL = shutil.which("curl")


def _raw(url, timeout=40):
    if CURL:
        proc = subprocess.run(
            [
                CURL, "-sS", "--fail", "--compressed",
                "--max-time", str(timeout),
                "-A", UA,
                "-e", BASE + "/",
                "-H", "Accept: */*",
                url,
            ],
            capture_output=True,
        )
        if proc.returncode != 0:
            raise RuntimeError(
                "curl %d: %s" % (proc.returncode, proc.stderr.decode()[:120])
            )
        return proc.stdout

    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def _get(url, timeout=40, attempts=4, as_json=True):
    delay = 3.0
    for attempt in range(attempts):
        wait = MIN_INTERVAL - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        try:
            raw = _raw(url, timeout)
            return json.loads(raw.decode("utf-8")) if as_json else raw
        except Exception:
            if attempt == attempts - 1:
                raise
            time.sleep(delay)
            delay = min(delay * 2, 20)
    return None


def search(term, pages=2):
    """Newest-and-best-liked first, deduplicated by image id."""
    out, seen = [], set()
    for page in range(1, pages + 1):
        url = "%s/api/search-photos/%s/relevance/desc/%d" % (
            BASE,
            urllib.parse.quote(term),
            page,
        )
        try:
            data = _get(url)
        except Exception as e:
            print("   ! stocksnap search failed:", term, e, flush=True)
            break
        results = (data or {}).get("results") or []
        if not results:
            break
        for r in results:
            iid = r.get("img_id")
            if not iid or iid in seen:
                continue
            seen.add(iid)
            out.append(
                {
                    "id": iid,
                    "title": (r.get("tags") or term).replace("  ", " ").strip()[:90],
                    "url": CDN % iid,
                    "page": "%s/photo/%s" % (BASE, iid),
                    "artist": r.get("author_name") or "StockSnap contributor",
                    "license": "CC0 1.0 (public domain)",
                    "source": "stocksnap",
                    # downloads are a decent prior for "is this frame any good"
                    "popularity": float(r.get("downloads_raw") or 0),
                    "width": int(r.get("img_width") or 0),
                    "height": int(r.get("img_height") or 0),
                }
            )
    return out


def fetch(url, timeout=60):
    return _get(url, timeout=timeout, as_json=False)


# (term, how many, bucket) — written for the pictures a studio would show
SEARCHES = [
    # weddings
    ("wedding", 40, "wedding"),
    ("wedding couple", 30, "wedding"),
    ("bride", 34, "wedding"),
    ("groom", 20, "wedding"),
    ("wedding ceremony", 26, "wedding"),
    ("wedding reception", 22, "wedding"),
    ("wedding dress", 20, "wedding"),
    ("bridesmaids", 16, "wedding"),
    ("wedding guests", 16, "wedding"),
    ("just married", 16, "wedding"),
    ("wedding veil", 14, "wedding"),
    ("marriage", 18, "wedding"),
    # couples
    ("couple", 34, "couple"),
    ("love couple", 26, "couple"),
    ("engagement", 20, "couple"),
    ("romantic", 22, "couple"),
    ("holding hands", 18, "couple"),
    ("couple sunset", 20, "couple"),
    ("kiss", 16, "couple"),
    # family
    ("family", 30, "family"),
    ("newborn", 22, "family"),
    ("baby", 26, "family"),
    ("children playing", 22, "family"),
    ("mother child", 20, "family"),
    ("grandmother", 16, "family"),
    # birthdays & celebration
    ("birthday", 22, "birthday"),
    ("celebration", 24, "birthday"),
    ("party", 22, "birthday"),
    ("confetti", 16, "birthday"),
    ("balloons", 14, "birthday"),
    # festivals / night
    ("festival", 22, "festival"),
    ("candles", 20, "festival"),
    ("fireworks", 18, "festival"),
    ("dancing", 22, "festival"),
    ("concert lights", 16, "festival"),
    ("lanterns", 16, "festival"),
    # detail
    ("wedding rings", 20, "detail"),
    ("bouquet", 20, "detail"),
    ("flowers", 24, "detail"),
    ("table setting", 18, "detail"),
    ("jewelry", 16, "detail"),
    ("champagne", 14, "detail"),
    # fashion / editorial
    ("fashion", 26, "fashion"),
    ("portrait", 30, "fashion"),
    ("model", 22, "fashion"),
    ("studio portrait", 18, "fashion"),
    ("woman portrait", 22, "fashion"),
    # corporate
    ("conference", 18, "corporate"),
    ("business meeting", 16, "corporate"),
    ("presentation stage", 14, "corporate"),
    ("office team", 14, "corporate"),
    # street / place
    ("street night", 20, "street"),
    ("city lights", 18, "street"),
    ("travel", 18, "place"),
    ("sunset landscape", 18, "place"),
    ("architecture", 16, "place"),
    ("venue interior", 14, "place"),
    # studio
    ("camera", 22, "studio"),
    ("photographer", 20, "studio"),
    ("film camera", 14, "studio"),
]
