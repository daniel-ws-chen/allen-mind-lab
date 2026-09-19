(() => {
  /* ===== Accessible Explore & Mobile Navigation ===== */
  const toggle = document.querySelector(".aml-menu-toggle");
  const menu = document.querySelector(".aml-mobile-menu");
  const exploreMenus = Array.from(document.querySelectorAll(".aml-nav-group"));

  const closeExplore = (except = null) => {
    exploreMenus.forEach(details => {
      if (details !== except) details.open = false;
    });
  };

  const closeMenu = () => {
    closeExplore();
    if (!toggle || !menu) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
  };

  exploreMenus.forEach(details => {
    details.addEventListener("toggle", () => {
      if (details.open) closeExplore(details);
    });
  });

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      if (menu.classList.contains("is-open")) {
        closeMenu();
      } else {
        closeExplore();
        menu.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";
      }
    });

    menu.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", closeMenu)
    );
  }

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const activeExplore = exploreMenus.find(details => details.open);
    if (activeExplore) {
      activeExplore.open = false;
      activeExplore.querySelector("summary")?.focus();
      return;
    }
    if (menu?.classList.contains("is-open")) {
      closeMenu();
      toggle?.focus();
    }
  });

  document.addEventListener("click", e => {
    const target = e.target;
    if (!target.closest(".aml-nav-group")) closeExplore();
    if (menu?.classList.contains("is-open") &&
        !menu.contains(target) && !toggle?.contains(target)) {
      closeMenu();
    }
  });

  /* ===== Current Page State ===== */
  const normalizePath = path => {
    const normalized = path.replace(/\/index(?:\.html)?\/?$/, "/")
      .replace(/\.html\/?$/, "").replace(/\/+$/, "");
    return normalized || "/";
  };
  const currentPath = normalizePath(location.pathname);
  document.querySelectorAll(".aml-global-nav a, .aml-global-footer a")
    .forEach(a => {
      try {
        const url = new URL(a.href, location.href);
        if (url.origin === location.origin &&
            normalizePath(url.pathname) === currentPath) {
          a.setAttribute("aria-current", "page");
          a.closest(".aml-explore")?.querySelector("summary")
            ?.setAttribute("aria-current", "page");
        }
      } catch (_) {}
    });

  /* ===== AML Article Share v1.1 ===== */

  const shareButton =
    document.querySelector("[data-aml-share]");

  const lineShareButton =
    document.querySelector("[data-aml-line-share]");

  const copyButton =
    document.querySelector("[data-aml-copy-link]");

  const shareStatus =
    document.querySelector("[data-aml-share-status]");

  if (shareButton || lineShareButton || copyButton) {

    const getShareData = () => ({
      title:
        document
          .querySelector("h1")
          ?.textContent
          .trim()
        || document.title,

      text:
        document
          .querySelector(
            'meta[name="description"]'
          )
          ?.getAttribute("content")
        || "",

      url:
        document
          .querySelector(
            'link[rel="canonical"]'
          )
          ?.href
        || window.location.href
    });


    const showStatus = (message) => {
      if (!shareStatus) return;

      shareStatus.textContent = message;

      window.setTimeout(() => {
        shareStatus.textContent = "";
      }, 3000);
    };


    const copyArticleUrl = async () => {
      const url = getShareData().url;

      try {
        await navigator.clipboard.writeText(url);

        showStatus("文章連結已複製 ✓");

      } catch (_) {

        const textarea =
          document.createElement("textarea");

        textarea.value = url;
        textarea.setAttribute("readonly", "");

        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();
        textarea.setSelectionRange(
          0,
          textarea.value.length
        );

        const copied =
          document.execCommand("copy");

        textarea.remove();

        showStatus(
          copied
            ? "文章連結已複製 ✓"
            : "無法自動複製，請手動複製網址。"
        );
      }
    };


    /* ===== Native Share ===== */

    if (shareButton) {
      shareButton.addEventListener(
        "click",
        async () => {

          const shareData =
            getShareData();

          if (navigator.share) {
            try {
              await navigator.share(
                shareData
              );

            } catch (error) {

              /*
               * AbortError =
               * 使用者自行關閉分享視窗，
               * 不需要顯示錯誤。
               */

              if (
                error.name !== "AbortError"
              ) {
                await copyArticleUrl();
              }
            }

          } else {
            await copyArticleUrl();
          }
        }
      );
    }


    /* ===== LINE Share ===== */

    if (lineShareButton) {
      const shareData = getShareData();

      lineShareButton.href =
        "https://social-plugins.line.me/lineit/share?url=" +
        encodeURIComponent(shareData.url);
    }


    /* ===== Copy Link ===== */

    if (copyButton) {
      copyButton.addEventListener(
        "click",
        copyArticleUrl
      );
    }
  }


  /* ===== AML Practice Tool Bridge v1 ===== */
  const amlPracticeToolBridge = {"/articles/pbs-being-seen":{"label":"PBS · PRACTICE TOOL","title":"把功能假設帶回現場：AML PBS Companion","desc":"如果你正在整理情緒行為案例，可用 Companion 協助彙整 ABC 資訊、形成初步功能假設與 PBS 策略草案，再由團隊依實際情境查證與修正。","href":"/tools.html","cta":"查看 PBS 實務工具 →"},"/articles/pbs-plan-contextual-fit":{"label":"PBS · PRACTICE TOOL","title":"從計畫文字走向情境判斷：AML PBS Companion","desc":"把文章中的功能、情境與支持條件帶回案例討論，協助團隊先整理資訊，再檢查策略是否真的適配當下環境。","href":"/tools.html","cta":"查看 PBS 實務工具 →"},"/articles/pbs-support-transition-real-life":{"label":"PBS · TRANSITION TOOL","title":"把轉銜條件整理成可討論的評估","desc":"使用「情緒行為支持服務轉銜評估與建議表」，從服務對象、照顧者與環境資源三個面向整理承接條件與後續支持需求。","href":"/tools/pbs-transition-assessment.html","cta":"開啟轉銜評估工具 →"},"/articles/ot-management-transition-support-life":{"label":"PBS · TRANSITION TOOL","title":"把「有效的條件」帶進下一段生活","desc":"文章談轉銜的核心是找出真正需要被帶走的支持條件；評估表可協助團隊把能力、照顧者準備與環境資源整理成具體建議。","href":"/tools/pbs-transition-assessment.html","cta":"開啟轉銜評估工具 →"},"/articles/management-coach-leader-workflow":{"label":"MANAGEMENT · LEARNING TOOL","title":"直接使用方案規劃管理助教系統","desc":"把十章方案內容交回一個共同架構，協助組長整理、檢查跨章連貫性與形成修訂版；AI 協助彙整，人仍負責查證與管理判斷。","href":"/tools/management-coach/","cta":"開啟管理助教系統 →"},"/articles/ot-management-organizational-planning":{"label":"MANAGEMENT · LEARNING TOOL","title":"把願景、使命與服務方向繼續往下做","desc":"如果你正在規劃一項服務，可用方案規劃管理助教系統把需求、價值主張、策略、人力、流程與成果逐步整理成完整方案。","href":"/tools/management-coach/","cta":"開啟管理助教系統 →"},"/articles/ot-management-strategy-swot":{"label":"MANAGEMENT · LEARNING TOOL","title":"把策略分析接回完整方案","desc":"SWOT 不是終點。可用方案規劃管理助教系統把策略選擇繼續連到人力、流程、品質、財務、合作與成果呈現。","href":"/tools/management-coach/","cta":"開啟管理助教系統 →"},"/articles/ot-management-service-development-choice":{"label":"MANAGEMENT · LEARNING TOOL","title":"把服務選擇轉成可檢驗的方案","desc":"當你已經釐清「真正缺的是什麼」，可以進一步用方案規劃管理助教系統整理服務設計、資源條件、流程與成果假設。","href":"/tools/management-coach/","cta":"開啟管理助教系統 →"}};
  const toolBridge = amlPracticeToolBridge[currentPath];

  if (toolBridge && !document.querySelector(".aml-practice-bridge")) {
    const footer = document.querySelector(".aml-global-footer");
    if (footer) {
      const section = document.createElement("section");
      section.className = "aml-practice-bridge";
      section.setAttribute("aria-labelledby", "aml-practice-bridge-title");
      section.innerHTML = `
        <div class="aml-practice-bridge__inner">
          <div class="aml-practice-bridge__copy">
            <div class="aml-practice-bridge__kicker">${toolBridge.label}</div>
            <h2 id="aml-practice-bridge-title">${toolBridge.title}</h2>
            <p>${toolBridge.desc}</p>
          </div>
          <a class="aml-practice-bridge__btn" href="${toolBridge.href}">${toolBridge.cta}</a>
        </div>
      `;
      footer.parentNode.insertBefore(section, footer);
    }
  }

  /* ===== AML Related Reading Network v1 ===== */
  const amlRelatedReading = {"/articles/ai-cultivation-inner-life":[["/articles/research-update-ai-digital-burnout-meditation","研究新知｜AI 愈方便，人反而更需要留白？","Research Update × AI × Mind"],["/articles/medical-care-and-inner-practice","醫療照顧身體，修習安頓身心","Mind & Well-being"],["/articles/helper-self-awareness","心安方能助人，理明方能成事","Mind & Well-being"]],"/articles/ai-era-teaching-learning":[["/articles/management-coach-leader-workflow","當組長不再一個人救火","Management × AI × Education"],["/articles/ai-review-quality-collaboration","當 GPT 開始審 GPT","AI × Practice"],["/articles/ai-human-occupation-moho","當 AI 開始參與我們的選擇","OT × AI"]],"/articles/ot-management-transition-support-life":[["/articles/pbs-support-transition-real-life","走出治療室以後","PBS × OT × Management"],["/articles/pbs-plan-contextual-fit","為什麼同一份 PBS 計畫，換個地方就不一定有效？","PBS × Disability Services"],["/articles/ot-management-service-development-choice","機會很多，但不是每一個都要抓住","Management & Leadership × OT"]],"/articles/ot-management-service-development-choice":[["/articles/ot-management-strategy-swot","好的策略，不是從填 SWOT 開始","Management & Leadership"],["/articles/ot-management-organizational-planning","組織為什麼存在？從願景、使命到可執行的服務方向","Management & Leadership"],["/articles/ot-management-transition-support-life","讓改變走得更遠","Management × PBS × OT"]],"/articles/ot-management-kpi-data-pdca":[["/articles/ot-management-functions-quality-improvement","從管理五大功能到品質改善","Management & Leadership"],["/articles/ot-management-strategy-swot","好的策略，不是從填 SWOT 開始","Management & Leadership"],["/articles/ot-management-decision-accountability","從管理決策到當責文化","Management & Leadership"]],"/articles/ot-management-strategy-swot":[["/articles/ot-management-organizational-planning","組織為什麼存在？從願景、使命到可執行的服務方向","Management & Leadership"],["/articles/ot-management-kpi-data-pdca","我們做了很多，然後呢？","Management & Leadership"],["/articles/ot-management-service-development-choice","機會很多，但不是每一個都要抓住","Management & Leadership × OT"]],"/articles/pbs-plan-contextual-fit":[["/articles/pbs-support-transition-real-life","走出治療室以後","PBS × OT × Management"],["/articles/ot-management-transition-support-life","讓改變走得更遠","Management × PBS × OT"],["/articles/pbs-being-seen","當「被看見」成為高挑戰行為","PBS"]],"/articles/ai-manager-leadership-human-ai-collaboration":[["/articles/ot-management-decision-accountability","從管理決策到當責文化","Management & Leadership"],["/articles/ot-management-leadership-team-change","管理與領導：如何帶領團隊一起前進？","Management & Leadership"],["/articles/management-coach-leader-workflow","當組長不再一個人救火","Management × AI × Education"]],"/articles/ot-management-organizational-planning":[["/articles/ot-management-strategy-swot","好的策略，不是從填 SWOT 開始","Management & Leadership"],["/articles/ot-management-service-development-choice","機會很多，但不是每一個都要抓住","Management & Leadership × OT"],["/articles/ot-management-why-management-matters","職能治療師為什麼需要學管理？","Management & Leadership"]],"/articles/management-coach-leader-workflow":[["/articles/ai-manager-leadership-human-ai-collaboration","當 AI 越來越會管事，管理者該如何帶人？","Management × AI"],["/articles/ai-era-teaching-learning","當學生已經有了 AI，老師還要教什麼？","Education × AI × OT"],["/articles/ai-review-quality-collaboration","當 GPT 開始審 GPT","AI × Practice"]],"/articles/pbs-support-transition-real-life":[["/articles/ot-management-transition-support-life","讓改變走得更遠","Management × PBS × OT"],["/articles/pbs-plan-contextual-fit","為什麼同一份 PBS 計畫，換個地方就不一定有效？","PBS × Disability Services"],["/articles/pbs-being-seen","當「被看見」成為高挑戰行為","PBS"]],"/articles/ai-review-quality-collaboration":[["/articles/management-coach-leader-workflow","當組長不再一個人救火","Management × AI × Education"],["/articles/ai-era-teaching-learning","當學生已經有了 AI，老師還要教什麼？","Education × AI × OT"],["/articles/digital-communication-boundaries","不是不想回，是不能一直在線","AI × Practice"]],"/articles/ot-management-decision-accountability":[["/articles/ot-management-leadership-team-change","管理與領導：如何帶領團隊一起前進？","Management & Leadership"],["/articles/ot-management-functions-quality-improvement","從管理五大功能到品質改善","Management & Leadership"],["/articles/ot-management-kpi-data-pdca","我們做了很多，然後呢？","Management & Leadership"]],"/articles/ot-management-leadership-team-change":[["/articles/ai-manager-leadership-human-ai-collaboration","當 AI 越來越會管事，管理者該如何帶人？","Management × AI"],["/articles/ot-management-decision-accountability","從管理決策到當責文化","Management & Leadership"],["/articles/helper-support-system","助人者也需要被支持","Management & Leadership"]],"/articles/ot-management-functions-quality-improvement":[["/articles/ot-management-kpi-data-pdca","我們做了很多，然後呢？","Management & Leadership"],["/articles/ot-management-why-management-matters","職能治療師為什麼需要學管理？","Management & Leadership"],["/articles/ot-management-strategy-swot","好的策略，不是從填 SWOT 開始","Management & Leadership"]],"/articles/ot-management-why-management-matters":[["/articles/ot-management-functions-quality-improvement","從管理五大功能到品質改善","Management & Leadership"],["/articles/ot-management-organizational-planning","組織為什麼存在？從願景、使命到可執行的服務方向","Management & Leadership"],["/articles/ot-management-leadership-team-change","管理與領導：如何帶領團隊一起前進？","Management & Leadership"]],"/articles/ai-human-occupation-moho":[["/articles/ai-cultivation-inner-life","當 AI 愈來愈強，人為什麼反而更需要修行？","Mind × AI × OT"],["/articles/ai-era-teaching-learning","當學生已經有了 AI，老師還要教什麼？","Education × AI × OT"],["/articles/ai-review-quality-collaboration","當 GPT 開始審 GPT","AI × Practice"]],"/articles/pbs-being-seen":[["/articles/pbs-plan-contextual-fit","為什麼同一份 PBS 計畫，換個地方就不一定有效？","PBS × Disability Services"],["/articles/pbs-support-transition-real-life","走出治療室以後","PBS × OT × Management"],["/articles/ot-management-transition-support-life","讓改變走得更遠","Management × PBS × OT"]],"/articles/digital-communication-boundaries":[["/articles/research-update-ai-digital-burnout-meditation","研究新知｜AI 愈方便，人反而更需要留白？","Research Update × AI × Mind"],["/articles/ai-review-quality-collaboration","當 GPT 開始審 GPT","AI × Practice"],["/articles/helper-support-system","助人者也需要被支持：自我照顧之外，還有團隊與組織的責任","Management & Leadership"]],"/articles/helper-support-system":[["/articles/helper-self-awareness","心安方能助人，理明方能成事","Mind & Well-being"],["/articles/digital-communication-boundaries","不是不想回，是不能一直在線","AI × Practice"],["/articles/ot-management-leadership-team-change","管理與領導：如何帶領團隊一起前進？","Management & Leadership"]],"/articles/helper-self-awareness":[["/articles/research-update-ai-digital-burnout-meditation","研究新知｜AI 愈方便，人反而更需要留白？","Research Update × AI × Mind"],["/articles/helper-support-system","助人者也需要被支持：自我照顧之外，還有團隊與組織的責任","Management & Leadership"],["/articles/medical-care-and-inner-practice","醫療照顧身體，修習安頓身心","Mind & Well-being"]],"/articles/medical-care-and-inner-practice":[["/articles/helper-self-awareness","心安方能助人，理明方能成事","Mind & Well-being"],["/articles/ai-cultivation-inner-life","當 AI 愈來愈強，人為什麼反而更需要修行？","Mind × AI × OT"],["/articles/helper-support-system","助人者也需要被支持","Management & Leadership"]],"/articles/research-update-ai-digital-burnout-meditation":[["/articles/ai-cultivation-inner-life","當 AI 愈來愈強，人為什麼反而更需要修行？","Mind × AI × OT"],["/articles/helper-self-awareness","心安方能助人，理明方能成事","Mind & Well-being"],["/articles/digital-communication-boundaries","不是不想回，是不能一直在線","AI × Practice"]]};
  const relatedItems = amlRelatedReading[currentPath];

  if (relatedItems && !document.querySelector(".aml-related-reading")) {
    const footer = document.querySelector(".aml-global-footer");
    if (footer) {
      const section = document.createElement("section");
      section.className = "aml-related-reading";
      section.setAttribute("aria-labelledby", "aml-related-reading-title");

      const cards = relatedItems.map(([href, title, label]) => `
        <a class="aml-related-reading__card" href="${href}">
          <span class="aml-related-reading__label">${label}</span>
          <strong>${title}</strong>
          <span class="aml-related-reading__go">繼續閱讀 →</span>
        </a>
      `).join("");

      section.innerHTML = `
        <div class="aml-related-reading__inner">
          <div class="aml-related-reading__kicker">KEEP EXPLORING</div>
          <h2 id="aml-related-reading-title">沿著這個問題，繼續讀下去。</h2>
          <p>從相近的主題、實務情境與思考路徑延伸閱讀。</p>
          <div class="aml-related-reading__grid">${cards}</div>
          <a class="aml-related-reading__all" href="/articles.html">瀏覽全部文章 →</a>
        </div>
      `;
      footer.parentNode.insertBefore(section, footer);
    }
  }

})();
