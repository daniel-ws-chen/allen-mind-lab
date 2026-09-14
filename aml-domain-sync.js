/* AML Manifest Domain Sync · Phase 2
   Source of truth: /data/articles-manifest.json
   Static HTML stays visible as a fallback if JavaScript or network loading fails.
*/
(() => {
  "use strict";

  const sections = Array.from(document.querySelectorAll(".aml-domain-catalog[data-domain]"));
  const badges = Array.from(document.querySelectorAll("[data-aml-count]"));
  if (!sections.length && !badges.length) return;

  const allowed = new Set(["ot","mind","pbs","education","management","ai","notes","total"]);
  const source = "/data/articles-manifest.json";

  const make = (tag,className,text) => {
    const node=document.createElement(tag);
    if(className) node.className=className;
    node.textContent=text;
    return node;
  };

  const dateLabel = date => (date || "").replace(/-/g,".");

  const renderCard = article => {
    const a=make("a","aml-domain-catalog__card","");
    a.href=article.articlePath || (`/articles/${article.slug}.html`);
    const meta = article.cardMeta || [dateLabel(article.date), article.tag].filter(Boolean).join(" · ");
    a.append(
      make("div","aml-domain-catalog__meta",meta),
      make("h3","",article.title || "Untitled"),
      make("p","",article.summary || ""),
      make("span","aml-domain-catalog__read","閱讀文章 →")
    );
    return a;
  };

  const applyBadge = (badge, counts) => {
    const domain=badge.dataset.amlCount;
    if(!allowed.has(domain) || counts[domain] == null) return;
    const count=counts[domain];
    const template=badge.dataset.amlCountTemplate || "{count}";
    badge.textContent=template.replaceAll("{count}",String(count));
    if (badge.hasAttribute("aria-label")) {
      badge.setAttribute("aria-label", badge.getAttribute("aria-label").replace(/\d+/, String(count)));
    }
  };

  fetch(source,{cache:"no-store",credentials:"same-origin"})
    .then(response => {
      if(!response.ok) throw new Error("Manifest HTTP "+response.status);
      return response.json();
    })
    .then(manifest => {
      const articles=Array.isArray(manifest.articles) ? manifest.articles : [];
      if(!articles.length) throw new Error("Manifest contains no articles");

      const counts={total:articles.length,ot:0,mind:0,pbs:0,education:0,management:0,ai:0,notes:0};
      for(const article of articles){
        const domains=Array.isArray(article.domains) ? article.domains : [];
        for(const domain of domains){
          if(Object.prototype.hasOwnProperty.call(counts,domain)) counts[domain] += 1;
        }
      }

      // Update explicit count labels anywhere on the page.
      badges.forEach(badge => applyBadge(badge,counts));

      // Rebuild each topic-hall catalog from the same manifest.
      sections.forEach(section => {
        const domain=section.dataset.domain;
        if(!allowed.has(domain) || domain === "total") return;
        const matching=articles
          .filter(article => Array.isArray(article.domains) && article.domains.includes(domain))
          .sort((a,b)=>(b.date||"").localeCompare(a.date||"") || (Number(a.order)||0)-(Number(b.order)||0));

        const grid=section.querySelector(".aml-domain-catalog__grid");
        const countBox=section.querySelector(".aml-domain-catalog__count");
        if(grid){
          const fragment=document.createDocumentFragment();
          matching.forEach(article => fragment.appendChild(renderCard(article)));
          grid.replaceChildren(fragment);
        }
        if(countBox){
          const strong=countBox.querySelector("strong");
          if(strong) strong.textContent=String(matching.length).padStart(2,"0");
          countBox.setAttribute("aria-label",`本領域收錄 ${matching.length} 篇文章`);
        }
      });
    })
    .catch(error => {
      // Keep the verified static fallback visible rather than showing an empty state.
      console.warn("AML manifest sync: using static fallback.",error);
    });
})();
