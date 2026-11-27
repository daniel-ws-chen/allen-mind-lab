import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

// These belong to the repository/deployment process, not to the public website.
const skipExact = new Set([
  ".git",
  ".github",
  ".wrangler",
  "node_modules",
  "worker",
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
  "README_fix.txt",
  "DELETE_FILES.txt"
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


  // Phase 7 publication source PNGs. Runtime pages now load matching WebP files.
  "images/books/adolescent-adult-sensory-profile-chinese-manual.png",
  "images/books/autism-checklist.png",
  "images/books/building-bridges-sensory-integration.png",
  "images/books/children-adolescent-mental-health-ot.png",
  "images/books/clinical-documentation-ot-third-edition.png",
  "images/books/handbook-of-preschool-mental-health.png",
  "images/books/introduction-to-early-childhood-education.png",
  "images/books/occupational-therapy-in-mental-health.png",
  "images/books/sensory-integration-for-preschool-teachers.png",
  "images/books/taipei-disability-living-survey-easy-read.png",
  "sera-phina/assets/books/autism-checklist.png",
  "sera-phina/assets/books/building-bridges-sensory-integration.png",
  "sera-phina/assets/books/children-adolescent-mental-health-ot.png",
  "sera-phina/assets/books/clinical-documentation-ot-third-edition.png",
  "sera-phina/assets/books/contemporary-ot-introduction-ethics.png",
  "sera-phina/assets/books/evidence-based-occupational-therapy.png",
  "sera-phina/assets/books/handbook-of-preschool-mental-health.png",
  "sera-phina/assets/books/introduction-to-early-childhood-education.png",
  "sera-phina/assets/books/mental-occupational-therapy-exam-guide-4.png",
  "sera-phina/assets/books/occupational-therapy-in-mental-health.png",
  "sera-phina/assets/books/sensory-integration-for-preschool-teachers.png",

  // Phase 14 metadata-only originals. OG/Twitter/JSON-LD now use optimized JPEG copies.
  "images/articles/pbs-being-seen.png",
  "images/articles/autism-support-intervention-map-hero.png",
  "images/articles/ot-management-transition-support-life-hero.png",
  "images/articles/next-generation-teacher-transformation-empowerment-hero.png",
  "images/articles/if-life-had-a-homepage-hero.png",
  "images/articles/ot-management-service-development-choice-hero.png",
  "images/articles/ot-management-kpi-data-pdca-hero.png",
  "images/articles/emptiness-meets-moho-hero.png",
  "images/articles/ot-management-organizational-planning-hero.png",
  "images/articles/helper-support-system.png",
  "images/articles/ot-management-strategy-swot-hero.png",
  "images/articles/ai-occupational-balance-new-equilibrium-hero.png",
  "images/articles/enter-the-play-hero.png",
  "images/articles/ot-management-care-transition-continuity-hero.png",
  "images/articles/pbs-supportive-care-environment-hero.png",
  "images/articles/ot-management-why-management-matters-hero.png",
  "images/articles/adhd-adolescent-development-support-hero.png",
  "images/articles/pbs-emotional-cycle-intervention-timing-hero.png",
  "images/articles/adult-adhd-sensory-processing-hero.png",
  "images/articles/cultivation-first-thought-hero.png",
  "images/articles/pbs-system-team-support.png",
  "images/articles/ot-management-public-policy-professional-practice-hero.png",
  "images/articles/ot-management-case-to-collective-action-hero.png",
  "images/articles/pbs-emotion-escalation-deescalation.png",
  "images/articles/pbs-self-study-entry-hero.png",
  "images/articles/pbs-crisis-safety-repair.png",
  "images/articles/ai-practice-refined-learning-hero.png",
  "images/articles/ai-manager-manage-people-and-ai-hero.png",
  "images/articles/ot-management-professional-advocacy-system-improvement-hero.png",
  "images/articles/caregiver-stress-coping-skills-hero.png",
  "images/articles/ot-management-cross-system-service-integration-hero.png",
  "images/articles/ot-management-health-service-last-mile-hero.png",
  "images/articles/management-no-single-right-answer-hero.png",
  "images/articles/digital-communication-boundaries.png",
  "images/articles/ot-management-interprofessional-cross-system-collaboration-hero.png",
  "images/articles/ot-management-needs-based-service-design-hero.png",
  "images/articles/schedule-empty-space-hero.png",
  "images/articles/ai-human-occupation-moho-social.png",

  // Repository-only maintenance snippets.
  "sera-phina/learning-lab/national-exam/LOGOUT_LINK_PATCH.html",

  // Non-public templates / superseded pages.
  "articles/article-template.html",
  "articles/emptiness-meets-moho_updated.html",
  "tools/management-interactive/index.full.html"
];

for (const sourceOnlyAsset of sourceOnlyAssets) {
  const target = join(dist, sourceOnlyAsset);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}


const skipLinkStyle = `
<style data-aml-skip-link-a11y>
.aml-skip-link{position:fixed;left:16px;top:-80px;z-index:10000;padding:10px 16px;border-radius:10px;background:#fff;color:#0d1b2a;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.15)}
.aml-skip-link:focus{top:12px}
</style>`;

function ensureSkipLink(html) {
  if (!/<body\b/i.test(html)) return html;

  let targetId = null;
  const mainWithId = html.match(/<main\b[^>]*\bid=["']([^"']+)["'][^>]*>/i);
  if (mainWithId) {
    targetId = mainWithId[1];
  } else if (/<main\b/i.test(html)) {
    targetId = "aml-main";
    html = html.replace(/<main\b(?![^>]*\bid=)([^>]*)>/i, '<main id="aml-main"$1>');
  } else {
    const h1WithId = html.match(/<h1\b[^>]*\bid=["']([^"']+)["'][^>]*>/i);
    if (h1WithId) {
      targetId = h1WithId[1];
    } else if (/<h1\b/i.test(html)) {
      targetId = "aml-main";
      html = html.replace(/<h1\b(?![^>]*\bid=)([^>]*)>/i, '<h1 id="aml-main"$1>');
    }
  }

  if (!targetId) return html;

  const skipPattern = /<a\b([^>]*\bclass=["'][^"']*aml-skip-link[^"']*["'][^>]*)>[\s\S]*?<\/a>/i;
  if (skipPattern.test(html)) {
    html = html.replace(skipPattern, (link) =>
      /\bhref=["'][^"']*["']/i.test(link)
        ? link.replace(/\bhref=["'][^"']*["']/i, `href="#${targetId}"`)
        : link.replace(/<a\b/i, `<a href="#${targetId}"`)
    );
  } else {
    html = html.replace(/<body\b([^>]*)>/i, `<body$1><a class="aml-skip-link" href="#${targetId}">跳至主要內容</a>`);
  }

  if (!/data-aml-skip-link-a11y/i.test(html) && /<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${skipLinkStyle}</head>`);
  }

  return html;
}


const gardenFooterStyle = "<style data-aml-garden-footer>\nfooter.aml-global-footer.aml-garden-footer{display:block!important;position:static!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;background:#11292b!important;color:#e0ebe4!important;border:0!important;text-align:center!important;box-sizing:border-box}\n.aml-garden-footer *{box-sizing:border-box}\n.aml-garden-footer .aml-garden-footer-mission{display:block;position:static;max-width:none;margin:0;padding:clamp(42px,7vw,88px) 6vw;background:#11292b;color:#e0ebe4;text-align:center;border-bottom:1px solid #58716b}\n.aml-garden-footer .aml-garden-footer-mission strong{display:block;font-size:clamp(1.4rem,3.3vw,2.55rem);line-height:1.5;letter-spacing:.02em;color:#f0d8a0;font-weight:800}\n.aml-garden-footer .aml-garden-footer-mission p{font-size:1rem;line-height:1.6;letter-spacing:.06em;margin:14px 0 24px;color:#e4c78e;font-weight:700}\n.aml-garden-footer .aml-garden-footer-actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center}\n.aml-garden-footer .aml-garden-footer-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:10px 18px;border:1px solid #b8a378;border-radius:999px;background:#183a3a;color:#f0d8a0!important;font-weight:700;text-decoration:none;line-height:1.5}\n.aml-garden-footer .aml-garden-footer-actions a:hover{background:#254b48;text-decoration:underline}\n.aml-garden-footer .aml-garden-footer-info{max-width:1200px;margin:auto;padding:30px 5vw 24px}\n.aml-garden-footer .aml-garden-footer-name{font-family:Georgia,\"Times New Roman\",serif;font-size:1.4rem;color:#f0d8a0;line-height:1.5}\n.aml-garden-footer .aml-garden-footer-sub{color:#d3e3da;font-size:.9rem;margin:4px 0 16px}\n.aml-garden-footer details.aml-garden-footer-directory{display:block;position:static;width:100%;max-width:none;margin:0 auto 18px;padding:0;border:1px solid #58716b;border-radius:12px;background:transparent;color:#e0ebe4;text-align:left}\n.aml-garden-footer details.aml-garden-footer-directory>summary{display:list-item;cursor:pointer;padding:12px 18px;min-height:44px;color:#f1d9a5;font-weight:700;text-align:center;list-style-position:inside}\n.aml-garden-footer details.aml-garden-footer-directory:not([open])>.aml-footer-top{display:none!important}\n.aml-garden-footer details.aml-garden-footer-directory[open]>.aml-footer-top{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:20px!important;padding:20px!important;margin:0;border-top:1px solid #58716b;text-align:left}\n.aml-garden-footer .aml-footer-links{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr))!important;gap:22px!important}\n.aml-garden-footer .aml-footer-brand,.aml-garden-footer .aml-footer-tagline,.aml-garden-footer .aml-footer-group h3,.aml-garden-footer .aml-footer-group h4{color:#f1d9a5!important}\n.aml-garden-footer .aml-footer-copy,.aml-garden-footer .aml-footer-group a,.aml-garden-footer .aml-footer-bottom,.aml-garden-footer .aml-footer-mini-links a{color:#e0ebe4!important}\n.aml-garden-footer .aml-footer-bottom{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:14px!important;border-top:1px solid #58716b!important;padding:20px 0 0!important;text-align:center!important;margin:0!important}\n.aml-garden-footer .aml-footer-mini-links{display:flex!important;justify-content:center!important;align-items:center!important;flex-wrap:wrap!important;gap:12px 18px!important}\n.aml-garden-footer .aml-footer-mini-links a{display:inline-flex;align-items:center;min-height:32px}\n.aml-garden-footer a:focus-visible,.aml-garden-footer summary:focus-visible{outline:3px solid #f0d8a0!important;outline-offset:3px}\n.aml-garden-footer .aml-garden-footer-actions a:focus-visible{outline-color:#f0d8a0!important}\n@media(max-width:520px){.aml-garden-footer .aml-garden-footer-actions{gap:8px}.aml-garden-footer .aml-garden-footer-actions a{flex:1 1 42%;padding:9px 8px}.aml-garden-footer .aml-garden-footer-info{padding:24px 5vw}}\n</style>";
function transform(html,filename,style){
  if(html.includes('data-aml-garden-footer'))return html;
  const pattern=/<footer\b[^>]*\bclass=["'][^"']*\baml-global-footer\b[^"']*["'][^>]*>[\s\S]*?<\/footer>/i;
  const original=html.match(pattern)?.[0];if(!original)return html;
  const open=original.match(/^<footer\b[^>]*>/i)?.[0];const top=original.search(/<div\b[^>]*\bclass=["'][^"']*\baml-footer-top\b[^"']*["']/i);const bottom=original.search(/<div\b[^>]*\bclass=["'][^"']*\baml-footer-bottom\b[^"']*["']/i);
  if(!open||top<open.length||bottom<=top||!/<\/head>/i.test(html))return html;
  const prefix=original.slice(open.length,top),directory=original.slice(top,bottom),visible=original.slice(bottom,-9);
  const footer=open.replace(/\bclass=(["'])([^"']*)\1/i,(_,q,c)=>`class=${q}${c} aml-garden-footer${q}`)+
  `<div class="aml-garden-footer-mission"><strong>航行沒有終點，助人始終是方向。</strong><p lang="en">Building A Meaningful Life.</p><div class="aml-garden-footer-actions" role="navigation" aria-label="頁尾快速探索"><a href="/articles.html">探索知識館藏 →</a><a href="/reading-paths.html">從閱讀路徑開始 →</a><a href="/resources.html">探索精選資源 →</a><a href="/contribute.html">投稿與協作 →</a><a href="/contact.html">聯繫 AML →</a><a href="/">← 回到首頁</a></div></div><div class="aml-garden-footer-info"><div class="aml-garden-footer-name">Allen Mind Lab</div><div class="aml-garden-footer-sub">一座移動的花園城市</div>${prefix}<details class="aml-garden-footer-directory"><summary>全站導覽</summary>${directory}</details>${visible}</div></footer>`;
  // Preserve every existing footer anchor verbatim (including badges/legal links).
  if([...original.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].some(m=>!footer.includes(m[0])))throw new Error("Footer link preservation failed: "+filename);
  html=html.replace(original,footer).replace(/<\/head>/i,style+"</head>");
  // About's existing closing block is represented by the shared brand mission.
  // Only remove the exact known block, never other page-specific ending content.
  if(filename==="about.html")html=html.replace(/<section class="ending">\s*<h2>航行沒有終點，助人始終是方向。<\/h2>\s*<p>Building A Meaningful Life\.<\/p>\s*<p>ALLEN MIND LAB<\/p>\s*<div class="about-actions">\s*<a class="btn" href="reading-paths\.html">從閱讀路徑開始 →<\/a>\s*<a class="btn-secondary" href="resources\.html">探索精選資源 →<\/a>\s*<a class="btn-secondary" href="contact\.html">聯繫 AML →<\/a>\s*<a class="btn-secondary" href="index\.html">← 回到首頁<\/a>\s*<\/div>\s*<\/section>/,"");
  return html;
}

function addContributionEntry(html) {
  // Only extend recognized global navigation and footer landmarks.
  const entry = '<a href="/contribute.html">投稿與協作</a>';
  return html.replace(/<(?:nav|footer)\b[^>]*\bclass=["'][^"']*\baml-global-(?:nav|footer)\b[^"']*["'][^>]*>[\s\S]*?<\/(?:nav|footer)>/gi, block => {
    if (block.includes('href="/contribute.html"')) return block;
    return block.replace(/<a\b[^>]*href=["']\/contact\.html["'][^>]*>聯繫 AML<\/a>/g, match => entry + match);
  });
}

function addReadingRouteEntries(html) {
  const entries = [
    ["/disability-learning.html","認識身心障礙"],
    ["/ot-beyond-clinic-learning.html","OT Beyond the Clinic"],
    ["/adhd-self-understanding-learning.html","ADHD × 自我理解"]
  ];
  const extend = block => {
    const additions = entries.filter(([href]) => !block.includes('href="'+href+'"')).map(([href,label]) => '<a href="'+href+'">'+label+'</a>').join("");
    if (!additions) return block;
    return block.replace(/<a\b[^>]*href=["']\/helper-learning\.html["'][^>]*>[\s\S]*?<\/a>/i, match => match + additions);
  };
  return html.replace(/<nav\b[^>]*\bclass=["'][^"']*\baml-global-nav\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/gi, block => block
    .replace(/<details\b[^>]*>\s*<summary>閱讀路徑<\/summary>[\s\S]*?<\/details>/gi, extend)
    .replace(/<span\b[^>]*class=["'][^"']*\baml-mobile-label\b[^"']*["'][^>]*>閱讀路徑<\/span>[\s\S]*?(?=<span\b[^>]*class=["'][^"']*\baml-mobile-label\b)/gi, extend));
}

function normalizePublicNavigation(html) {
  const routes = [
    ["/reading-paths.html","閱讀路徑總覽"],["/pbs-learning.html","PBS 實務學習"],["/management-learning.html","管理實務學習"],["/disability-learning.html","認識身心障礙"],["/ot-beyond-clinic-learning.html","OT Beyond the Clinic"],["/adhd-self-understanding-learning.html","ADHD × 自我理解"],["/helper-learning.html","助人者永續實踐"]
  ];
  const study = [["/self-study.html","進階自學室總覽"],["/management-self-study.html","管理學自學"],["/pbs-self-study.html","PBS 自學"],["/disability-self-study.html","認識身心障礙自學"]];
  const anchors = entries => entries.map(([href,label])=>'<a href="'+href+'">'+label+'</a>').join("");
  const order = (block,entries) => {
    const links = [...block.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi)];
    if (!links.length) return block;
    const known = new Set(entries.map(x=>x[0]));
    const existing = new Map(links.filter(m=>known.has(m[1])).map(m=>[m[1],m[0]]));
    const ordered = entries.map(e=>existing.get(e[0])||anchors([e])).join("");
    let inserted=false;
    return block.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi,(a,href)=>{
      if(!known.has(href))return a;
      if(inserted)return "";
      inserted=true;return ordered;
    });
  };
  return html.replace(/<nav\b[^>]*\bclass=["'][^"']*\baml-global-nav\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/gi, block=>{
    let nav=block.replace(/<details\b[^>]*>\s*<summary>閱讀路徑<\/summary>[\s\S]*?<\/details>/gi,b=>order(b,routes))
      .replace(/<span\b[^>]*class=["'][^"']*\baml-mobile-label\b[^"']*["'][^>]*>閱讀路徑<\/span>[\s\S]*?(?=<span\b[^>]*class=["'][^"']*\baml-mobile-label\b)/gi,b=>order(b,routes))
      .replace(/<details\b[^>]*>\s*<summary>進階自學室<\/summary>[\s\S]*?<\/details>/gi,b=>order(b,study))
      .replace(/<span\b[^>]*class=["'][^"']*\baml-mobile-label\b[^"']*["'][^>]*>進階自學室<\/span>[\s\S]*?(?=<span\b[^>]*class=["'][^"']*\baml-mobile-label\b)/gi,b=>order(b,study));
    if(!/<summary>進階自學室<\/summary>/.test(nav)){
      nav=nav.replace(/<details\b[^>]*>\s*<summary>互動實驗室<\/summary>/i,m=>'<details class="aml-nav-group" name="aml-primary-nav" data-aml-study-nav="true"><summary>進階自學室</summary><div class="aml-nav-panel">'+anchors(study)+'</div></details>'+m);
    }
    return nav;
  });
}

function patchHtmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      patchHtmlFiles(p);
      continue;
    }
    if (!/\.html?$/i.test(name)) continue;
    const before = readFileSync(p, "utf8");
    const after = transform(normalizePublicNavigation(addReadingRouteEntries(addContributionEntry(ensureSkipLink(before)))), name, gardenFooterStyle);
    if (after !== before) writeFileSync(p, after, "utf8");
  }
}

patchHtmlFiles(dist);

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
