#!/usr/bin/env python3
"""AML publishing guard. Standard library only; run from repository root."""
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/articles-manifest.json"
REQUIRED = ("aml-global-nav", 'class="hero"', "hero-image", "aml-article-footer-nav", "aml-global-footer", "aml-share")
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
ARTICLE_LINK = re.compile(r'href=["\']([^"\']+)["\']')
IMAGE_REF = re.compile(r'(?:src|srcset)=["\']([^"\']+)["\']')
BAD_NEXT = re.compile(r"敬請期待|尚未發布")
errors, warnings = [], []

def err(msg): errors.append(msg)
def warn(msg): warnings.append(msg)

def local_path(url):
    parsed = urlparse(url)
    if parsed.scheme or parsed.netloc:
        return None
    path = parsed.path.lstrip("/")
    if not path or ".." in Path(path).parts:
        return None
    return ROOT / path

def check_visible_article_counts(total, category_counts):
    """Verify initial HTML count fallbacks against the published manifest."""
    home = (ROOT / "index.html").read_text(encoding="utf-8")
    library = (ROOT / "library.html").read_text(encoding="utf-8")
    expected = {
        "homepage total": (home, r"全站收錄\s*(\d+)\s*篇文章", total),
        "library feedback total": (library, r"目前共有\s*<strong>(\d+)</strong>\s*篇文章", total),
        "library toolbar total": (library, r"全部文章\s*·\s*(\d+)\s*篇", total),
    }
    for name, (html, pattern, count) in expected.items():
        found = re.findall(pattern, html)
        if len(found) != 1:
            err(f"{name}: expected exactly one static count; found {len(found)}")
        elif int(found[0]) != count:
            err(f"{name}: displayed {found[0]}, manifest says {count}")
    for domain, count in {"all": total, **category_counts}.items():
        pattern = (r'<button\b[^>]*\bdata-filter="' + re.escape(domain)
                   + r'"[^>]*>[\s\S]*?<span class="filter-count">\((\d+)\)</span></button>')
        found = re.findall(pattern, library)
        if len(found) != 1:
            err(f"library filter {domain}: expected one static count; found {len(found)}")
        elif int(found[0]) != count:
            err(f"library filter {domain}: displayed {found[0]}, manifest says {count}")

def validate_scripted_practice_bridges(articles):
    """Check article→tool destinations maintained in the shared site script."""
    script_path = ROOT / "aml-site.js"
    source = script_path.read_text(encoding="utf-8")
    start = source.find("const amlPracticeToolBridge = {")
    end = source.find("const renderPracticeBridge", start)
    if start < 0 or end < 0:
        err("aml-site.js: practice bridge configuration not found")
        return
    config = source[start:end]
    pairs = re.findall(
        r'"(/articles/[a-z0-9-]+)"\s*:\s*\{[^{}]*?\bhref:\s*"([^"]+)"',
        config, flags=re.S
    )
    if not pairs:
        err("aml-site.js: no fixed practice bridge destinations extracted")
        return
    indexed = {a.get("slug") for a in articles}
    seen = set()
    for article_path, href in pairs:
        slug = article_path.rsplit("/", 1)[-1]
        if slug in seen:
            err(f"aml-site.js: duplicate fixed practice bridge for {slug}")
        seen.add(slug)
        if slug not in indexed:
            err(f"aml-site.js: practice bridge references unknown article {slug}")
        if not href.startswith("/"):
            warn(f"aml-site.js: review external practice destination for {slug}: {href}")
            continue
        target = local_path(href)
        if target is None or not (
            target.is_file() or (target.is_dir() and (target / "index.html").is_file())
        ):
            err(f"aml-site.js: missing practice destination for {slug}: {href}")

def validate_sequence_and_practice(articles):
    """Guard ordered learning series and manifest-defined practice destinations."""
    ordered = {}
    for article in articles:
        slug = article.get("slug", "?")
        for entry in article.get("series", []):
            if not isinstance(entry, dict):
                continue  # String-only series are thematic; do not impose an order.
            series_id = entry.get("id")
            if not isinstance(series_id, str) or not series_id.strip():
                continue  # Already reported by metadata validation.
            position = entry.get("order", entry.get("stage"))
            if position is None:
                continue
            if type(position) is not int or position < 1:
                err(f"{slug}: {series_id} order/stage must be a positive integer")
                continue
            ordered.setdefault(series_id, []).append((position, slug))
        bridge = article.get("practiceBridge")
        if bridge is None:
            continue
        if not isinstance(bridge, dict) or not isinstance(bridge.get("href"), str):
            err(f"{slug}: practiceBridge must contain an href string")
            continue
        href = bridge["href"]
        if not href.startswith("/"):
            warn(f"{slug}: external/relative practiceBridge target needs manual review: {href}")
            continue
        target = local_path(href)
        if target is None or not (target.is_file() or (target.is_dir() and (target / "index.html").is_file())):
            err(f"{slug}: practiceBridge target missing: {href}")
    for series_id, entries in ordered.items():
        positions = [position for position, _slug in entries]
        if len(set(positions)) != len(positions):
            err(f"{series_id}: duplicate ordered stage(s) in {entries}")
        if sorted(positions) != list(range(1, len(positions) + 1)):
            err(f"{series_id}: ordered stages must be contiguous from 1; found {sorted(positions)}")

def validate_latest_article_links(articles):
    """Mandatory structure and reciprocal-link audit for the newest AML article."""
    if not articles:
        return
    newest = articles[0]
    slug = newest.get("slug", "")
    article_path = newest.get("articlePath", "").lstrip("/")
    file = ROOT / article_path
    if not file.is_file():
        return  # Reported by the existing article checks.

    html = file.read_text(encoding="utf-8")
    def exactly_one(label, pattern):
        count = len(re.findall(pattern, html, flags=re.I))
        if count != 1:
            err(f"{slug}: expected exactly one {label}, found {count}")

    exactly_one("main element", r"<main\b")
    exactly_one("article table of contents", r'class="[^"]*\baml-article-toc\b')
    exactly_one("article share section", r'class="[^"]*\baml-article-share\b')
    exactly_one("footer navigation", r'class="[^"]*\baml-article-footer-nav\b')
    if 'id="top"' not in html or 'href="#top"' not in html:
        err(f"{slug}: missing working back-to-top link")

    footer_match = re.search(
        r'<section\b[^>]*class="[^"]*\baml-article-footer-nav\b[\s\S]*?</section>',
        html, flags=re.I)
    if footer_match:
        footer = footer_match.group(0)
        if 'aml-article-footer-nav__card--prev' not in footer:
            err(f"{slug}: footer missing previous article card")
        if 'aml-article-footer-nav__card--next' not in footer:
            err(f"{slug}: footer missing next-article card or explicit unpublished state")
        for href in ("/articles.html", "/library.html",
                     f"/{newest.get('primaryDomain', '')}.html", "#top"):
            if f'href="{href}"' not in footer:
                err(f"{slug}: footer missing {href}")
        for domain in newest.get("domains", []):
            if domain != newest.get("primaryDomain") and f'href="/{domain}.html"' not in footer:
                err(f"{slug}: footer missing cross-domain hub /{domain}.html")

    prev = next((n for n in newest.get("navigation", [])
                 if n.get("kind") == "previous"), None)
    if prev:
        previous_path = prev.get("href", "")
        if previous_path and previous_path not in html:
            err(f"{slug}: previous navigation missing in HTML: {previous_path}")
        prior = next((a for a in articles if a.get("articlePath") == previous_path), None)
        if prior:
            expected = newest.get("articlePath")
            if not any(n.get("kind") == "next" and n.get("href") == expected
                       for n in prior.get("navigation", [])):
                err(f"{slug}: {prior['slug']} manifest next link must point back to newest article")
            prior_file = ROOT / previous_path.lstrip("/")
            if prior_file.is_file() and expected not in prior_file.read_text(encoding="utf-8"):
                err(f"{slug}: previous article HTML lacks reciprocal next link")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--changed", nargs="*", default=[], help="Changed repository paths; validate affected article pages and their references")
    args = parser.parse_args()
    if not MANIFEST.is_file():
        err("Missing data/articles-manifest.json")
        report()
    try:
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError) as exc:
        err(f"Manifest parse failed: {exc}")
        report()
    articles = manifest.get("articles", [])
    if not isinstance(articles, list):
        err("Manifest articles must be a list")
        report()
    if manifest.get("counts", {}).get("total") != len(articles):
        err(f"counts.total != articles length ({len(articles)})")
    slugs, paths, canonical = set(), set(), set()
    expected_counts = {k: 0 for k in ("ot", "mind", "pbs", "education", "management", "ai", "notes")}
    for i, a in enumerate(articles):
        slug = a.get("slug", "")
        path = a.get("articlePath", "")
        url = a.get("canonical", "")
        if not SLUG.fullmatch(slug):
            err(f"Article #{i}: invalid slug {slug!r}")
        if slug in slugs: err(f"Duplicate slug: {slug}")
        if path in paths: err(f"Duplicate articlePath: {path}")
        if url in canonical: err(f"Duplicate canonical: {url}")
        slugs.add(slug); paths.add(path); canonical.add(url)
        if path != f"/articles/{slug}.html":
            err(f"{slug}: articlePath does not match slug")
        if url != f"https://allenmindlab.com/articles/{slug}":
            err(f"{slug}: canonical mismatch")
        if not a.get("title") or not a.get("date"):
            err(f"{slug}: missing title/date")
        if not isinstance(a.get("domains"), list):
            err(f"{slug}: domains must be list")
        else:
            for domain in set(a["domains"]):
                if domain in expected_counts: expected_counts[domain] += 1
        # Knowledge-network metadata supports string series IDs and {id, ...} records.
        series = a.get("series", [])
        if not isinstance(series, list):
            err(f"{slug}: series must be a list")
        else:
            series_ids = []
            for entry in series:
                series_id = entry if isinstance(entry, str) else entry.get("id") if isinstance(entry, dict) else None
                if not isinstance(series_id, str) or not series_id.strip():
                    err(f"{slug}: series entry must be a nonempty ID or object with nonempty id")
                else:
                    series_ids.append(series_id)
            if len(set(series_ids)) != len(series_ids):
                err(f"{slug}: duplicate series IDs")
        reading_paths = a.get("readingPaths", [])
        if not isinstance(reading_paths, list) or any(
            not isinstance(value, str) or not value.strip() for value in reading_paths
        ):
            err(f"{slug}: readingPaths must be a list of nonempty strings")
        # Existing legacy entries may reference missing files; enforce file presence on changed articles.
    for domain, count in expected_counts.items():
        declared = manifest.get("counts", {}).get(domain)
        if declared != count:
            warn(f"Legacy domain count {domain}: declared {declared}, calculated {count}; review before changing totals")
    check_visible_article_counts(len(articles), expected_counts)
    validate_sequence_and_practice(articles)
    validate_latest_article_links(articles)
    validate_scripted_practice_bridges(articles)
    changed = {p.lstrip("./") for p in args.changed}
    if changed:
        targets = {p for p in changed if p.startswith("articles/") and p.endswith(".html") and p.count("/") == 1}
        if "data/articles-manifest.json" in changed:
            # Validate newest entries, plus every article whose path was changed.
            targets.update(a.get("articlePath", "").lstrip("/") for a in articles[:5])
    else:
        targets = {a.get("articlePath", "").lstrip("/") for a in articles}
    indexed = {a.get("articlePath", "").lstrip("/"): a for a in articles}
    for p in sorted(targets):
        if not p: continue
        file = ROOT / p
        if p not in indexed:
            err(f"UNINDEXED ARTICLE: {p} is missing from manifest")
            continue
        if not file.is_file():
            err(f"MISSING ARTICLE FILE: {p}")
            continue
        html = file.read_text(encoding="utf-8")
        required_markers = ("aml-global-nav", "aml-article-footer-nav", "aml-global-footer") if indexed[p].get("isNote") else REQUIRED
        for marker in required_markers:
            if marker not in html: err(f"{p}: missing AML template component {marker}")
        if "<h1" not in html or "<main" not in html:
            err(f"{p}: missing h1 or main")
        if 'lang="zh-Hant"' not in html:
            err(f"{p}: missing Traditional Chinese document language")
        if indexed[p]["title"] not in html:
            err(f"{p}: manifest title absent from HTML")
        for raw in IMAGE_REF.findall(html):
            candidate = local_path(raw.split()[0])
            if candidate and candidate.as_posix().startswith((ROOT / "images/").as_posix()) and not candidate.is_file():
                err(f"{p}: missing image {raw}")
        for raw in ARTICLE_LINK.findall(html):
            if raw.startswith("/articles/") and not raw.startswith("/articles.html"):
                target = local_path(raw)
                if target and not target.suffix: target = target.with_suffix(".html")
                if target and not target.is_file():
                    err(f"{p}: broken article link {raw}")
        if "aml-article-footer-nav__card--next" in html and BAD_NEXT.search(html[html.find("aml-article-footer-nav__card--next"):html.find("aml-article-footer-nav__card--next")+250]):
            warn(f"{p}: next-article card still says 'coming soon'; verify publication sequence")
    report()

def report():
    for message in warnings: print("WARNING:", message)
    for message in errors: print("ERROR:", message)
    print(f"AML publishing guard: {len(errors)} error(s), {len(warnings)} warning(s)")
    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()
