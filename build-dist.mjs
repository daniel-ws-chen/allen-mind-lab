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
  "package.json",
  "package-lock.json",
  "README_fix.txt"
]);

const skipPrefixes = [
  "README_",
  ".env",
  ".dev.vars"
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

// Optimized site assets replace the legacy PNG hero banners in production.
// Keep the originals in the repository as source/archive files, but do not ship
// them to the public dist once the WebP versions exist.
for (const legacyAsset of [
  "images/allen-banner.png",
  "images/allen-banner-mobile.png"
]) {
  const target = join(dist, legacyAsset);
  if (existsSync(target)) rmSync(target, { force: true });
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
