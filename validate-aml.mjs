import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const manifestPath = join(root, 'data', 'articles-manifest.json');
const errors = [];
const warnings = [];
const ok = [];

function text(path) { return readFileSync(path, 'utf8'); }
function addError(msg){ errors.push(msg); }
function addWarn(msg){ warnings.push(msg); }
function addOk(msg){ ok.push(msg); }
function localPathFromHref(href){
  if (!href || !href.startsWith('/') || href.startsWith('//')) return null;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return join(root, 'index.html');
  const rel = clean.replace(/^\//, '');
  if (rel.endsWith('/')) return join(root, rel, 'index.html');
  if (/\.[a-z0-9]+$/i.test(rel)) return join(root, rel);
  return join(root, rel + '.html');
}
function expectedCanonical(slug){ return `https://allenmindlab.com/articles/${slug}`; }
function has(html, re){ return re.test(html); }

if (!existsSync(manifestPath)) {
  addError('Missing /data/articles-manifest.json');
} else {
  let manifest;
  try { manifest = JSON.parse(text(manifestPath)); }
  catch (e) { addError(`Manifest JSON parse failed: ${e.message}`); }

  if (manifest) {
    const articles = Array.isArray(manifest.articles) ? manifest.articles : [];
    if (!articles.length) addError('Manifest has no articles.');
    if (manifest.counts?.total !== articles.length) addError(`counts.total=${manifest.counts?.total} but manifest contains ${articles.length} articles.`);
    else addOk(`Manifest total matches: ${articles.length} articles.`);

    const slugs = new Set();
    for (const a of articles) {
      const id = a.slug || '(missing slug)';
      for (const key of ['slug','title','summary','date','domains','primaryDomain','articlePath','canonical','hero','ogImage','navigation']) {
        if (a[key] === undefined || a[key] === null || a[key] === '' || (Array.isArray(a[key]) && a[key].length === 0)) addError(`${id}: missing required manifest field '${key}'.`);
      }
      if (slugs.has(a.slug)) addError(`${id}: duplicate slug.`);
      slugs.add(a.slug);
      if (!Array.isArray(a.domains) || !a.domains.includes(a.primaryDomain)) addError(`${id}: primaryDomain '${a.primaryDomain}' is not present in domains.`);
      if (a.canonical !== expectedCanonical(a.slug)) addWarn(`${id}: canonical differs from preferred ${expectedCanonical(a.slug)}.`);
      const articleFile = join(root, (a.articlePath || '').replace(/^\//,''));
      if (!existsSync(articleFile)) { addError(`${id}: article file missing: ${a.articlePath}`); continue; }
      const html = text(articleFile);
      if (!has(html, /<meta[^>]+name=["']description["'][^>]+content=/i) && !has(html, /<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i)) addWarn(`${id}: meta description not detected.`);
      if (!html.includes(`rel="canonical"`) && !html.includes(`rel='canonical'`)) addError(`${id}: canonical link missing in HTML.`);
      if (!html.includes(a.canonical)) addWarn(`${id}: manifest canonical not found verbatim in HTML.`);
      if (!has(html, /property=["']og:image["']/i)) addWarn(`${id}: og:image missing.`);
      if (!has(html, /name=["']twitter:card["']/i)) addWarn(`${id}: twitter:card missing.`);
      if (!has(html, /application\/ld\+json/i)) addWarn(`${id}: Article JSON-LD missing.`);
      if (!has(html, /data-aml-share/i) || !has(html, /data-aml-copy-link/i)) addError(`${id}: AML share/copy controls missing.`);
      if (!has(html, /aml-article-footer-nav/i)) addError(`${id}: article footer navigation missing.`);
      if (!html.includes('/aml-site.js')) addWarn(`${id}: shared /aml-site.js not detected.`);
      if (!has(html, /<h1\b/i)) addError(`${id}: H1 missing.`);
      if (has(html, /<meta[^>]+name=["']robots["'][^>]+noindex/i) || has(html, /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i)) addError(`${id}: published article contains noindex.`);
      const heroFile = join(root, String(a.hero||'').replace(/^\//,''));
      const ogFile = join(root, String(a.ogImage||'').replace(/^\//,''));
      if (!existsSync(heroFile)) addError(`${id}: hero file missing: ${a.hero}`);
      if (!existsSync(ogFile)) addError(`${id}: ogImage file missing: ${a.ogImage}`);
      for (const nav of (a.navigation || [])) {
        const p = localPathFromHref(nav.href);
        if (p && !existsSync(p)) addError(`${id}: navigation target missing: ${nav.href}`);
      }
    }

    // Domain counts are derived from membership and may overlap.
    for (const d of ['ot','mind','pbs','education','management','ai']) {
      const actual = articles.filter(a => Array.isArray(a.domains) && a.domains.includes(d)).length;
      if (manifest.counts?.[d] !== actual) addError(`counts.${d}=${manifest.counts?.[d]} but derived count is ${actual}.`);
    }

    const series = manifest.series || {};
    for (const a of articles) {
      for (const ref of (Array.isArray(a.series) ? a.series : [])) {
        const seriesId = typeof ref === 'string' ? ref : ref?.id;
        if (seriesId && !series[seriesId]) addError(`${a.slug}: references unknown series '${seriesId}'.`);
      }
    }
    for (const [seriesId, s] of Object.entries(series)) {
      const items = Array.isArray(s.items) ? s.items : [];
      for (const slug of items) if (!slugs.has(slug)) addError(`Series '${seriesId}' references missing article '${slug}'.`);
      const dupes = items.filter((x,i)=>items.indexOf(x)!==i);
      if (dupes.length) addError(`Series '${seriesId}' contains duplicate item(s): ${[...new Set(dupes)].join(', ')}`);
    }

    const sitemapPath = join(root,'sitemap.xml');
    if (existsSync(sitemapPath)) {
      const sm = text(sitemapPath);
      const missing = articles.filter(a => !sm.includes(a.canonical));
      if (missing.length) addError(`Sitemap missing ${missing.length} article canonical(s): ${missing.map(x=>x.slug).join(', ')}`);
      else addOk('All manifest article canonicals are present in sitemap.xml.');
    } else addError('sitemap.xml missing.');

    const rssPath = join(root,'rss.xml');
    if (existsSync(rssPath)) {
      const rss = text(rssPath);
      const missing = articles.filter(a => !rss.includes(a.canonical));
      if (missing.length) addWarn(`RSS does not include ${missing.length} article(s): ${missing.map(x=>x.slug).join(', ')}`);
      else addOk('All manifest article canonicals are present in rss.xml.');
    } else addWarn('rss.xml missing.');

    // Internal root-relative href/src references across public HTML files.
    const publicHtml = [];
    for (const name of readdirSync(root)) if (name.endsWith('.html')) publicHtml.push(join(root,name));
    const articlesDir = join(root,'articles');
    if (existsSync(articlesDir)) for (const name of readdirSync(articlesDir)) if (name.endsWith('.html') && name !== 'article-template.html') publicHtml.push(join(articlesDir,name));
    const broken = [];
    const attrRe = /(?:href|src)=["'](\/[^"'#?]*)/gi;
    for (const file of publicHtml) {
      const html = text(file); let m;
      while ((m = attrRe.exec(html))) {
        const href = m[1];
        if (href.startsWith('//')) continue;
        const p = localPathFromHref(href);
        if (p && !existsSync(p)) broken.push(`${relative(root,file)} -> ${href}`);
      }
    }
    if (broken.length) addError(`Broken internal references (${broken.length}):\n  ${broken.slice(0,30).join('\n  ')}${broken.length>30?'\n  ...':''}`);
    else addOk('No broken root-relative internal references detected in HTML pages.');
  }
}

console.log('\nAML PRE-PUBLISH VALIDATION');
console.log('='.repeat(30));
for (const x of ok) console.log(`✓ ${x}`);
if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length})`);
  for (const x of warnings) console.log(`! ${x}`);
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length})`);
  for (const x of errors) console.log(`✗ ${x}`);
}
console.log(`\nResult: ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exitCode = errors.length ? 1 : 0;
