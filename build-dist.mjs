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
  "worker",
  "dist",
  ".assetsignore",
  "wrangler.json",
  "wrangler.jsonc",
  "wrangler.toml",
  "build-dist.mjs",
  "validate-aml.mjs",
  "audit-accessibility.mjs",
  "accessibility-scope.json",
  "docs",
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

function countFiles(dir) {
  let count = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) count += countFiles(p);
    else count++;
  }
  return count;
}

// AML private build guard: internal audit / engineering artifacts must never enter public dist.
const privateBuildArtifacts = [
  "docs",
  "audit-accessibility.mjs",
  "accessibility-scope.json",
  "validate-aml.mjs",
  "wrangler.jsonc"
];

for (const privateArtifact of privateBuildArtifacts) {
  const target = join(dist, privateArtifact);
  if (existsSync(target)) {
    throw new Error(`AML private build guard failed: ${privateArtifact} was copied into public dist/`);
  }
}

// Restricted candidates are intentionally still deployed until a real edge/server auth boundary exists.
// Keep this warning visible in deployment logs so they are not accidentally treated as private.
const restrictedCandidatePaths = [
  "tools/infection-control-pilot",
  "sera-phina/learning-lab/national-exam"
];
for (const candidate of restrictedCandidatePaths) {
  if (existsSync(join(dist, candidate))) {
    console.warn(`AML access-scope warning: ${candidate} is still publicly deployed; do not classify it as private without verified edge/server authentication.`);
  }
}

console.log(`AML build complete: ${countFiles(dist)} public files copied to dist/`);
