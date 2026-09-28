#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const ignored = new Set([".git", "node_modules", "dist", ".aml-publish"]);
const assetExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
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

console.log("AML ASSET AUDIT");
console.log("===============");
console.log(`Assets scanned: ${assets.length}`);
console.log(`Exact duplicate groups (>50 KB): ${duplicates.length}`);
for (const d of duplicates) {
  console.log(`\n${(d.size/1024/1024).toFixed(2)} MB × ${d.paths.length}`);
  for (const p of d.paths) console.log(`  - ${relative(root,p).replaceAll("\\","/")}`);
}

const large = assets.filter(({st}) => st.size >= 1_000_000).sort((a,b)=>b.st.size-a.st.size);
console.log(`\nLarge assets (>=1 MB): ${large.length}`);
for (const {p,st} of large) console.log(`  ${(st.size/1024/1024).toFixed(2)} MB  ${relative(root,p).replaceAll("\\","/")}`);
console.log("\nAudit is read-only. Review before deleting anything.");
