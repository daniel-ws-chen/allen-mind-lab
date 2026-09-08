/* AML Domain Sync
   Source of truth: the official cards in /articles.html.
   The static HTML is retained as a readable fallback when JavaScript/network fails.
*/
(() => {
  "use strict";
  const sections = Array.from(document.querySelectorAll(".aml-domain-catalog[data-domain]"));
  const badges = Array.from(document.querySelectorAll("[data-aml-count]"));
  if (!sections.length && !badges.length) return;

  const allowed = new Set(["ot","mind","pbs","education","management","ai"]);
  const source = "/articles.html";
  const parse = text => {
    const doc = new DOMParser().parseFromString(text,"text/html");
    const nodes = Array.from(doc.querySelectorAll("#aml-article-grid > a.article-card"));
    if (!nodes.length) throw new Error("Article catalog unavailable");
    return nodes.map((card,index) => {
      const link = card.getAttribute("href") || "";
      const url = new URL(link,location.origin + "/");
      if (url.origin !== location.origin || !url.pathname.startsWith("/articles/")) return null;
      const heading = card.querySelector("h2");
      if (!heading) return null;
      return {
        href:url.pathname, date:card.dataset.date || "",
        order:Number(card.dataset.order || index),
        categories:(card.dataset.category || "").split(/\s+/).filter(Boolean),
        tag:card.querySelector(".tag")?.textContent.trim() || "",
        title:heading.textContent.trim(),
        summary:card.querySelector("p")?.textContent.trim() || ""
      };
    }).filter(Boolean);
  };
  const make = (tag,className,text) => {
    const node=document.createElement(tag);
    if(className) node.className=className;
    node.textContent=text;
    return node;
  };
  const renderCard = record => {
    const a=make("a","aml-domain-catalog__card","");
    a.href=record.href;
    a.append(
      make("div","aml-domain-catalog__meta",record.date.replace(/-/g,".")+" · "+record.tag),
      make("h3","",record.title),
      make("p","",record.summary),
      make("span","aml-domain-catalog__read","閱讀文章 →")
    );
    return a;
  };
  fetch(source,{cache:"no-store",credentials:"same-origin"})
    .then(response => {
      if(!response.ok) throw new Error("Catalog HTTP "+response.status);
      return response.text();
    })
    .then(parse)
    .then(records => {
      const counts={};
      for(const domain of allowed) {
        counts[domain]=records.filter(r=>r.categories.includes(domain)).length;
      }
      sections.forEach(section => {
        const domain=section.dataset.domain;
        if(!allowed.has(domain)) return;
        const matching=records.filter(r=>r.categories.includes(domain))
          .sort((a,b)=>b.date.localeCompare(a.date)||a.order-b.order);
        const grid=section.querySelector(".aml-domain-catalog__grid");
        const count=section.querySelector(".aml-domain-catalog__count");
        if(!grid || !count) return;
        const fragment=document.createDocumentFragment();
        matching.forEach(r=>fragment.appendChild(renderCard(r)));
        grid.replaceChildren(fragment);
        count.querySelector("strong").textContent=String(matching.length).padStart(2,"0");
        count.setAttribute("aria-label",`本領域收錄 ${matching.length} 篇文章`);
      });
      badges.forEach(badge => {
        const domain=badge.dataset.amlCount;
        if(allowed.has(domain)) badge.textContent=String(counts[domain]).padStart(2,"0")+" 篇文章";
      });
    })
    .catch(error => {
      // Keep the verified static fallback visible. Do not replace it with an empty state.
      console.warn("AML domain sync: using static fallback.",error);
    });
})();