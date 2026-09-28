import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = "https://allenmindlab.com";
const walk = (dir) => fs.readdirSync(dir, {withFileTypes:true}).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
});
const htmlFiles = walk(root).filter((p) => p.endsWith(".html"));
const sitemapPath = path.join(root, "sitemap.xml");
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim()));
const issues = [];
let articleCount = 0;
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  if (rel === "articles/article-template.html" || rel === "articles/emptiness-meets-moho_updated.html") continue;
  const html = fs.readFileSync(file, "utf8");
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
  const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i)?.[1];
  const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  if (canonical && ogUrl && canonical.replace(/\/$/,"") !== ogUrl.replace(/\/$/,"")) {
    issues.push(`${rel}: canonical / og:url mismatch`);
  }
  if (canonical && !noindex && canonical.startsWith(site) && !rel.startsWith("sera-phina/") && !rel.startsWith("tools/")) {
    if (!sitemapUrls.has(canonical)) issues.push(`${rel}: canonical missing from sitemap -> ${canonical}`);
  }
  if (rel.startsWith("articles/")) {
    articleCount++;
    if (!/property=["']article:published_time["']/i.test(html)) issues.push(`${rel}: missing article:published_time`);
    if (!/property=["']article:modified_time["']/i.test(html)) issues.push(`${rel}: missing article:modified_time`);
  }
}
console.log(`SEO audit: ${htmlFiles.length} HTML files, ${articleCount} article pages, ${sitemapUrls.size} sitemap URLs`);
if (issues.length) {
  console.error(`Found ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log("SEO audit passed: 0 issues");
}
