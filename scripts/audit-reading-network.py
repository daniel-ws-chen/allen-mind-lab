#!/usr/bin/env python3
"""AML 3.6: verify local article and tool destinations across all published articles.

This is a static inventory, not HTTP/browser validation. Deliberately does not
assume that editorial 'next' cards have to follow publication chronology.
"""
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/articles-manifest.json"

class Anchors(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hrefs = []
    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        attributes = dict(attrs)
        if attributes.get("href"):
            self.hrefs.append(attributes["href"])

def destination_exists(raw, article_path):
    """Return (checked, exists, reason) for AML article or tool links."""
    parsed = urlparse(raw)
    if parsed.scheme or parsed.netloc or raw.startswith("//"):
        return (False, True, "")
    if not parsed.path:
        return (False, True, "")  # same-document fragment or empty link
    normalized = urlparse(urljoin("https://allenmindlab.com/" + article_path, raw))
    path = unquote(normalized.path)
    # Check only destinations in the knowledge network and practice tools.
    if not (path.startswith("/articles/") or path.startswith("/tools/") or path == "/tools.html"):
        return (False, True, "")
    segments = Path(path.lstrip("/")).parts
    if ".." in segments:
        return (True, False, "parent-directory traversal")
    base = ROOT / path.lstrip("/")
    candidates = [base]
    if not base.suffix:
        candidates += [base.with_suffix(".html"), base / "index.html"]
    elif base.suffix == ".html":
        candidates += [base.with_suffix("") / "index.html"]
    if path.endswith("/"):
        candidates.append(base / "index.html")
    return (True, any(candidate.is_file() for candidate in candidates), path)

def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    articles = manifest["articles"]
    failures = []
    inspected = 0
    edges = 0
    checked = 0
    for article in articles:
        article_path = article["articlePath"].lstrip("/")
        page = ROOT / article_path
        if not page.is_file():
            failures.append((article_path, "article file missing"))
            continue
        inspected += 1
        parser = Anchors()
        parser.feed(page.read_text(encoding="utf-8"))
        for href in parser.hrefs:
            edges += 1
            relevant, exists, destination = destination_exists(href, article_path)
            if relevant:
                checked += 1
                if not exists:
                    failures.append((article_path, "broken local reading/tool link " + href + " → " + destination))
    print(f"AML 3.6 full-article link audit: {inspected}/{len(articles)} published articles, "
          f"{edges} HTML anchor links, {checked} article/tool links verified")
    for source, problem in failures:
        print(f"ERROR {source}: {problem}")
    if failures:
        print(f"FAIL {len(failures)} broken or missing destinations")
        return 1
    print("PASS no missing local article/tool destinations across published inventory")
    return 0

if __name__ == "__main__":
    sys.exit(main())
