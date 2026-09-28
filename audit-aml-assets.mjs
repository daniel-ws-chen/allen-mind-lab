#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const ignored = new Set([".git", "node_modules", "dist", ".aml-publish"]);
const assetExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const textExt = new Set([".html", ".css", ".js", ".mjs", ".json", ".jsonc", ".xml", ".txt", ".md"]);
const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (ignored.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else files.push({ p, st });
  }
}
walk(root);

const assets = files.filter(({p}) => assetExt.has(extname(p).toLowerCase()));
const textCorpus = files
  .filter(({p}) => textExt.has(extname(p).toLowerCase()))
  .map(({p}) => readFileSync(p, "utf8"))
  .join("\n");

const groups = new Map();
for (const {p, st} of assets) {
  if (st.size < 50_000) continue;
  const hash = createHash("sha256").update(readFileSync(p)).digest("hex");
  const key = `${st.size}:${hash}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(p);
}

const duplicates = [...groups.entries()]
  .filter(([, paths]) => paths.length > 1)
  .map(([key, paths]) => ({ size: Number(key.split(":",1)[0]), paths }))
  .sort((a,b) => b.size * (b.paths.length-1) - a.size * (a.paths.length-1));

function rel(p){ return relative(root,p).replaceAll("\\","/"); }
function basename(p){ return p.split(/[\\/]/).at(-1); }
function directRefCount(p){
  const r = rel(p);
  const b = basename(p);
  return Math.max(
    textCorpus.split(r).length - 1,
    textCorpus.split(`/${r}`).length - 1,
    textCorpus.split(b).length - 1
  );
}

console.log("AML ASSET AUDIT");
console.log("===============");
console.log(`Assets scanned: ${assets.length}`);
console.log(`Exact duplicate groups (>50 KB): ${duplicates.length}`);
for (const d of duplicates) {
  console.log(`\n${(d.size/1024/1024).toFixed(2)} MB × ${d.paths.length}`);
  for (const p of d.paths) console.log(`  - ${rel(p)}`);
}

const large = assets.filter(({st}) => st.size >= 1_000_000).sort((a,b)=>b.st.size-a.st.size);
console.log(`\nLarge assets (>=1 MB): ${large.length}`);
for (const {p,st} of large) console.log(`  ${(st.size/1024/1024).toFixed(2)} MB  ${rel(p)}`);

const webpBackups = assets
  .filter(({p}) => extname(p).toLowerCase() === ".png")
  .filter(({p}) => existsSync(p.slice(0,-4)+".webp"))
  .filter(({p}) => directRefCount(p) === 0)
  .sort((a,b)=>b.st.size-a.st.size);
console.log(`\nPNG source originals with a matching WebP and no direct runtime reference: ${webpBackups.length}`);
for (const {p,st} of webpBackups) console.log(`  ${(st.size/1024).toFixed(0)} KB  ${rel(p)}`);

const orphanCandidates = assets
  .filter(({p}) => directRefCount(p) === 0)
  .sort((a,b)=>b.st.size-a.st.size);
console.log(`\nZero-direct-reference candidates: ${orphanCandidates.length}`);
for (const {p,st} of orphanCandidates.slice(0,40)) console.log(`  ${(st.size/1024).toFixed(0)} KB  ${rel(p)}`);
if (orphanCandidates.length > 40) console.log(`  ... ${orphanCandidates.length-40} more`);

console.log("\nAudit is read-only. Zero references are candidates only; runtime-generated or externally linked URLs can be indirect.");
