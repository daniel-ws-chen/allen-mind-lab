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
        # Existing legacy entries may reference missing files; enforce file presence on changed articles.
    for domain, count in expected_counts.items():
        declared = manifest.get("counts", {}).get(domain)
        if declared != count:
            warn(f"Legacy domain count {domain}: declared {declared}, calculated {count}; review before changing totals")
    changed = {p.lstrip("./") for p in args.changed}
    if changed:
        targets = {p for p in changed if p.startswith("articles/") and p.endswith(".html")}
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
        for marker in REQUIRED:
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
