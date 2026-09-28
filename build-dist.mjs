import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

// These belong to the repository/deployment process, not to the public website.
const skipExact = new Set([
  ".git",
  ".github",
  ".wrangler",
  "node_modules",
  "dist",
  ".assetsignore",
  "wrangler.json",
  "wrangler.jsonc",
  "wrangler.toml",
  "build-dist.mjs",
  "validate-aml.mjs",
  "publish-aml-article.mjs",
  "audit-aml-assets.mjs",
  "package.json",
  "package-lock.json",
  "README_fix.txt"
]);

const skipPrefixes = [
  "README_",
  ".env",
  ".dev.vars",
  ".aml-publish"
];

function shouldSkip(name) {
  if (skipExact.has(name)) return true;
  return skipPrefixes.some(prefix => name.startsWith(prefix));
}

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const name of readdirSync(root)) {
  if (shouldSkip(name)) continue;
  const src = join(root, name);
  const dst = join(dist, name);
  cpSync(src, dst, { recursive: true });
}

// Repository-only / superseded assets.
// Keep source originals in the repository for editing/rollback, but do not
// publish them when runtime pages already use lighter WebP/shared copies.
const sourceOnlyAssets = [
  // Legacy global artwork already replaced in runtime pages.
  "images/allen-banner.png",
  "images/allen-banner-mobile.png",
  "images/aml-campus-map.png",
  "images/aml-core-framework.png",
  "images/newsletter/notes-from-the-lab.png",
  "images/xier-support-avatar.png",

  // Resource thumbnails replaced by WebP in resources.html.
  "images/resources/happiness-qigong-home.png",
  "images/resources/daan-clinic-home.png",
  "images/resources/happiness-village-home.png",
  "images/resources/dr-kao-home.png",
  "images/resources/taipei-emotional-behavior-support-center.png",

  // Tool artwork replaced by WebP.
  "tools/assets/case001-comic.png",
  "images/tools/pbs-interactive/abc-detective.png",
  "images/tools/pbs-interactive/emotion-thermometer.png",
  "images/tools/pbs-interactive/family-response.png",
  "images/tools/pbs-interactive/function-guess.png",
  "images/tools/pbs-interactive/replacement-helper.png",
  "images/tools/pbs-interactive/strategy-light.png",

  // Older MOHO source artwork retained only for archive/rollback.
  "images/articles/ai-human-occupation-moho-hero.png",
  "images/articles/3c-vs-ai.png",
  "images/articles/moho-concept.png",
  "images/articles/ai-moho-four-layers.png",
  "images/articles/human-ai-feedback-loop.png",

  // Exact duplicates: canonical public copies live under /images/articles/.
  "articles/ai-cultivation-inner-life-hero.png",
  "articles/ai-cultivation-inner-life-hero.webp",
  "articles/ai-cultivation-inner-life-social.png",

  // Non-public templates / superseded pages.
  "articles/article-template.html",
  "articles/emptiness-meets-moho_updated.html",
  "tools/management-interactive/index.full.html"
];

for (const sourceOnlyAsset of sourceOnlyAssets) {
  const target = join(dist, sourceOnlyAsset);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}

function countFiles(dir) {
  let count = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) count += countFiles(p);
    else count++;
  }
  return count;
}

console.log(`AML build complete: ${countFiles(dist)} public files copied to dist/`);
