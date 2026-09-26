/* AML 3.3 Interactive Lab global dual-bay navigation */
(function () {
  function ensureDualBayNavStyles() {
    if (document.getElementById('aml-lab-subnav-style')) return;
    const style = document.createElement('style');
    style.id = 'aml-lab-subnav-style';
    style.textContent = `
      .aml-nav-group[data-aml-lab-nav] .aml-nav-panel{min-width:240px}
      .aml-nav-group[data-aml-lab-nav] .aml-nav-panel .aml-lab-subnav{position:relative;display:block;padding-left:2.15rem}
      .aml-nav-group[data-aml-lab-nav] .aml-nav-panel .aml-lab-subnav::before{content:"";position:absolute;left:1rem;top:50%;width:.52rem;height:.52rem;border-radius:50%;transform:translateY(-50%);box-shadow:0 0 0 4px rgba(100,210,255,.08)}
      .aml-nav-group[data-aml-lab-nav] .aml-nav-panel .aml-lab-subnav--explore::before{background:#68dcff;box-shadow:0 0 13px rgba(104,220,255,.48)}
      .aml-nav-group[data-aml-lab-nav] .aml-nav-panel .aml-lab-subnav--support::before{background:#8bf2c6;box-shadow:0 0 13px rgba(139,242,198,.42)}
      .aml-nav-group[data-aml-lab-nav] .aml-nav-panel .aml-lab-subnav:hover,.aml-nav-group[data-aml-lab-nav] .aml-nav-panel .aml-lab-subnav:focus-visible{background:linear-gradient(90deg,rgba(83,201,255,.10),rgba(111,103,255,.05));outline:none}
      @media(max-width:720px){.aml-mobile-menu .aml-lab-subnav{position:relative;padding-left:1.55rem}.aml-mobile-menu .aml-lab-subnav::before{content:"";position:absolute;left:.55rem;top:50%;width:.42rem;height:.42rem;border-radius:50%;transform:translateY(-50%);background:#68dcff}.aml-mobile-menu .aml-lab-subnav--support::before{background:#8bf2c6}}
    `;
    document.head.appendChild(style);
  }

  function buildDualBayNav() {
    ensureDualBayNavStyles();
    document.querySelectorAll('.aml-desktop-links').forEach((links) => {
      const existing = links.querySelector('.aml-nav-group[data-aml-lab-nav]');
      if (existing) return;
      const direct = Array.from(links.querySelectorAll('a.aml-nav-direct, a[href="/tools.html"]')).find((a) => {
        const t = a.textContent.trim();
        return t === 'Interactive Lab' || t === '互動實驗室';
      });
      if (!direct) return;

      const details = document.createElement('details');
      details.className = 'aml-nav-group';
      details.dataset.amlLabNav = 'true';
      const summary = document.createElement('summary');
      summary.textContent = '互動實驗室';
      const panel = document.createElement('div');
      panel.className = 'aml-nav-panel';
      const explore = document.createElement('a');
      explore.href = '/tools.html#lab-halls';
      explore.className = 'aml-lab-subnav aml-lab-subnav--explore';
      explore.textContent = '互動探索艙';
      const support = document.createElement('a');
      support.href = '/tools.html#practice-tools';
      support.className = 'aml-lab-subnav aml-lab-subnav--support';
      support.textContent = '智能支援艙';
      panel.append(explore, support);
      details.append(summary, panel);
      direct.replaceWith(details);

      if (!links.querySelector('a[href="/self-study.html"]')) {
        const selfStudy = document.createElement('a');
        selfStudy.href = '/self-study.html';
        selfStudy.className = 'aml-nav-direct';
        selfStudy.textContent = '自學館';
        details.before(selfStudy);
      }
    });

    document.querySelectorAll('.aml-mobile-menu').forEach((menu) => {
      const labels = Array.from(menu.querySelectorAll('.aml-mobile-label'));
      const label = labels.find((el) => {
        const t = el.textContent.trim();
        return t === 'Interactive Lab' || t === '互動實驗室';
      });
      if (!label) return;

      if (!menu.querySelector('a[href="/self-study.html"]')) {
        const selfLabel = document.createElement('span');
        selfLabel.className = 'aml-mobile-label';
        selfLabel.textContent = '自學館';
        const selfLink = document.createElement('a');
        selfLink.href = '/self-study.html';
        selfLink.textContent = '進入自學館';
        label.before(selfLabel, selfLink);
      }

      label.textContent = '互動實驗室';
      let node = label.nextElementSibling;
      while (node && !node.classList.contains('aml-mobile-label')) {
        const next = node.nextElementSibling;
        if (node.matches('a[href="/tools.html"], a[href="/tools.html#lab-halls"], a[href="/tools.html#practice-tools"]')) node.remove();
        node = next;
      }
      const explore = document.createElement('a');
      explore.href = '/tools.html#lab-halls';
      explore.className = 'aml-lab-subnav aml-lab-subnav--explore';
      explore.textContent = '互動探索艙';
      const support = document.createElement('a');
      support.href = '/tools.html#practice-tools';
      support.className = 'aml-lab-subnav aml-lab-subnav--support';
      support.textContent = '智能支援艙';
      label.after(explore, support);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildDualBayNav, { once: true });
  } else {
    buildDualBayNav();
  }
})();

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

    // Desktop/fine-pointer behavior: match the other AML dropdowns.
    // If a clicked <details> menu is left open, close it as soon as the
    // pointer leaves the whole summary + panel region. Touch/mobile remains
    // click-to-toggle because hover is not available there.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      details.addEventListener("mouseleave", () => {
        details.open = false;
      });
    }
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
          a.closest(".aml-nav-group")?.querySelector("summary")
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


  /* ===== AML Practice Tool Bridge v1.1 / Reader Journey ===== */
  const amlPracticeToolBridge = {
    "/articles/pbs-being-seen": {
      label: "PBS · PRACTICE TOOL",
      title: "把功能假設帶回現場：AML PBS Companion",
      desc: "如果你正在整理情緒行為案例，可用 Companion 協助彙整 ABC 資訊、形成初步功能假設與 PBS 策略草案，再由團隊依實際情境查證與修正。",
      href: "/tools.html",
      cta: "查看 PBS 實務工具 →"
    },
    "/articles/pbs-plan-contextual-fit": {
      label: "PBS · PRACTICE TOOL",
      title: "從計畫文字走向情境判斷：AML PBS Companion",
      desc: "把文章中的功能、情境與支持條件帶回案例討論，協助團隊先整理資訊，再檢查策略是否真的適配當下環境。",
      href: "/tools.html",
      cta: "查看 PBS 實務工具 →"
    },
    "/articles/pbs-support-transition-real-life": {
      label: "PBS · TRANSITION TOOL",
      title: "把轉銜條件整理成可討論的評估",
      desc: "使用「情緒行為支持服務轉銜評估與建議表」，從服務對象、照顧者與環境資源三個面向整理承接條件與後續支持需求。",
      href: "/tools/pbs-transition-assessment.html",
      cta: "開啟轉銜評估工具 →"
    },
    "/articles/ot-management-transition-support-life": {
      label: "PBS · TRANSITION TOOL",
      title: "把「有效的條件」帶進下一段生活",
      desc: "文章談轉銜的核心是找出真正需要被帶走的支持條件；評估表可協助團隊把能力、照顧者準備與環境資源整理成具體建議。",
      href: "/tools/pbs-transition-assessment.html",
      cta: "開啟轉銜評估工具 →"
    },
    "/articles/management-coach-leader-workflow": {
      label: "MANAGEMENT · LEARNING TOOL",
      title: "直接使用方案規劃管理助教系統",
      desc: "把十章方案內容交回一個共同架構，協助組長整理、檢查跨章連貫性與形成修訂版；AI 協助彙整，人仍負責查證與管理判斷。",
      href: "/tools/management-coach/",
      cta: "開啟管理助教系統 →"
    },
    "/articles/ot-management-organizational-planning": {
      label: "MANAGEMENT · LEARNING TOOL",
      title: "把願景、使命與服務方向繼續往下做",
      desc: "如果你正在規劃一項服務，可用方案規劃管理助教系統把需求、價值主張、策略、人力、流程與成果逐步整理成完整方案。",
      href: "/tools/management-coach/",
      cta: "開啟管理助教系統 →"
    },
    "/articles/ot-management-strategy-swot": {
      label: "MANAGEMENT · LEARNING TOOL",
      title: "把策略分析接回完整方案",
      desc: "SWOT 不是終點。可用方案規劃管理助教系統把策略選擇繼續連到人力、流程、品質、財務、合作與成果呈現。",
      href: "/tools/management-coach/",
      cta: "開啟管理助教系統 →"
    },
    "/articles/ot-management-service-development-choice": {
      label: "MANAGEMENT · LEARNING TOOL",
      title: "把服務選擇轉成可檢驗的方案",
      desc: "當你已經釐清「真正缺的是什麼」，可以進一步用方案規劃管理助教系統整理服務設計、資源條件、流程與成果假設。",
      href: "/tools/management-coach/",
      cta: "開啟管理助教系統 →"
    },

    /* Reader Journey 1.1：優先橋接真正有自然下一步的文章 */
    "/articles/management-no-single-right-answer": {
      label: "MANAGEMENT · INTERACTIVE LAB",
      title: "讀完之後，試著做一次管理判斷",
      desc: "管理沒有唯一正解，但可以練習看見情境、利害關係與決策代價。進入管理決策實驗室，用案例試一次你的判斷。",
      href: "/tools/management-decision-lab/",
      cta: "進入管理決策實驗室 →"
    },
    "/articles/ot-management-decision-accountability": {
      label: "MANAGEMENT · INTERACTIVE LAB",
      title: "把當責概念帶進管理情境",
      desc: "從文章走向情境判斷：看看不同管理選擇如何影響公平、責任、團隊信任與後續行動。",
      href: "/tools/management/",
      cta: "前往管理學館 →"
    },
    "/articles/ot-management-leadership-team-change": {
      label: "MANAGEMENT · INTERACTIVE LAB",
      title: "帶團隊，不只靠一種答案",
      desc: "把領導與團隊改變放進具體情境裡練習，看看你會如何在目標、人與現實條件之間做選擇。",
      href: "/tools/management/",
      cta: "前往管理學館 →"
    },
    "/articles/pbs-emotion-escalation-deescalation": {
      label: "PBS · INTERACTIVE LAB",
      title: "從情緒升高，練習看見行為功能",
      desc: "當情緒已經升高，第一步往往不是說服。進入 PBS 行為理解館，從情境線索與功能假設開始練習。",
      href: "/tools/pbs/",
      cta: "進入 PBS 行為理解館 →"
    },
    "/articles/pbs-crisis-safety-repair": {
      label: "PBS · INTERACTIVE LAB",
      title: "危機之後，回到理解與支持",
      desc: "安全處理只是其中一段。透過互動案例練習從事件、前因與後果重新理解行為，為下一次支持留下線索。",
      href: "/tools/pbs/",
      cta: "進入 PBS 行為理解館 →"
    },
    "/articles/adult-adhd-sensory-processing": {
      label: "SELF-AWARENESS · INTERACTIVE TOOL",
      title: "把感覺處理概念帶回自己的日常",
      desc: "如果你想從閱讀往自我探索再走一步，可以用「我的感覺使用說明書」整理自己的刺激偏好、負荷與調節線索。",
      href: "/tools/sensory/",
      cta: "開始我的感覺探索 →"
    },
    "/articles/caregiver-stress-coping-skills": {
      label: "SELF-AWARENESS · INTERACTIVE LAB",
      title: "看看自己的壓力與能量節奏",
      desc: "壓力不只是一個分數，也和一天中的能量起伏、恢復方式與負荷累積有關。可用自我覺察工具整理自己的節奏。",
      href: "/tools/energy-rhythm/",
      cta: "探索壓力與能量節奏 →"
    },
    "/articles/ai-review-quality-collaboration": {
      label: "AI · INTERACTIVE LAB",
      title: "AI 可以幫忙，但判斷仍要留下來",
      desc: "進入 AI 共作館，用具體情境練習哪些工作適合交給 AI、哪些需要人保留查證、責任與最後判斷。",
      href: "/tools/ai/",
      cta: "進入 AI 共作館 →"
    },
    "/articles/ai-era-teaching-learning": {
      label: "AI · INTERACTIVE LAB",
      title: "從『會用 AI』走向『會判斷怎麼用』",
      desc: "把文章裡的人機分工帶進互動情境，練習辨識 AI 適合參與的位置，以及人需要保留的學習與判斷。",
      href: "/tools/ai/",
      cta: "進入 AI 共作館 →"
    }
  };

  const renderPracticeBridge = (toolBridge) => {
    if (!toolBridge || document.querySelector(".aml-practice-bridge")) return;
    const footer = document.querySelector(".aml-global-footer");
    if (!footer) return;

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
  };

  const toolBridge = amlPracticeToolBridge[currentPath];
  if (toolBridge) {
    renderPracticeBridge(toolBridge);
  } else if (currentPath.startsWith("/articles/")) {
    /* 第 50 篇之後：若上稿流程在 manifest 寫入 practiceBridge，前端可自動接上。 */
    fetch("/data/articles-manifest.json", { cache: "no-cache" })
      .then(response => response.ok ? response.json() : null)
      .then(manifest => {
        const slug = currentPath.split("/").filter(Boolean).pop();
        const article = manifest?.articles?.find(item => item.slug === slug);
        if (article?.practiceBridge) renderPracticeBridge(article.practiceBridge);
      })
      .catch(() => {});
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

/* =========================================================
   AML PBS Self-study: article completion return card
   Shows only when an article is opened from the PBS course:
   ?course=pbs&lesson=<lesson-id>
   ========================================================= */
(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('course') !== 'pbs') return;

  const lesson = params.get('lesson');
  const lessons = {
    abc: { no: '第 1 堂', title: '先把事情看清楚' },
    function: { no: '第 2 堂', title: '行為可能正在完成什麼' },
    strategy: { no: '第 3 堂', title: '看似有效，不一定真的有幫助' },
    replacement: { no: '第 4 堂', title: '不要只阻止，也要教會新的方法' },
    emotion: { no: '第 5 堂', title: '在情緒升高以前看見訊號' },
    family: { no: '第 6 堂', title: '先接住，再回到支持' }
  };
  const meta = lessons[lesson];
  if (!meta) return;

  const KEY = 'amlPbsSelfStudyV1';
  const emptyState = () => ({
    articles: {},
    games: {},
    quiz: { passed: false, score: 0, date: null, certificateId: null, name: null }
  });

  function markArticleRead() {
    let state;
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      state = raw && typeof raw === 'object' ? raw : emptyState();
    } catch (e) {
      state = emptyState();
    }
    state.articles = state.articles && typeof state.articles === 'object' ? state.articles : {};
    state.games = state.games && typeof state.games === 'object' ? state.games : {};
    state.quiz = state.quiz && typeof state.quiz === 'object' ? state.quiz : emptyState().quiz;
    state.articles[lesson] = true;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function injectStyles() {
    if (document.getElementById('aml-pbs-course-return-style')) return;
    const style = document.createElement('style');
    style.id = 'aml-pbs-course-return-style';
    style.textContent = `
      .aml-pbs-course-return{max-width:900px;margin:10px auto 34px;padding:0 28px;box-sizing:border-box}
      .aml-pbs-course-return__card{border:1px solid #d9d0bf;border-radius:22px;background:linear-gradient(135deg,#fffdf9,#f6f2e9);padding:25px 26px;box-shadow:0 10px 30px rgba(12,35,63,.07)}
      .aml-pbs-course-return__eyebrow{font-size:.76rem;font-weight:900;letter-spacing:.12em;color:#8b681f;margin-bottom:8px}
      .aml-pbs-course-return h2{font-family:inherit;font-size:1.35rem;line-height:1.4;color:#102a4d;margin:0 0 8px}
      .aml-pbs-course-return p{color:#5c6673;line-height:1.75;margin:0 0 17px}
      .aml-pbs-course-return__actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
      .aml-pbs-course-return__btn{appearance:none;border:1px solid #285f55;background:#285f55;color:#fff;border-radius:999px;padding:12px 18px;font:inherit;font-weight:850;cursor:pointer;min-height:44px}
      .aml-pbs-course-return__btn:hover{background:#214f47}
      .aml-pbs-course-return__note{font-size:.82rem;color:#7b8490}
      @media(max-width:640px){.aml-pbs-course-return{padding:0 18px}.aml-pbs-course-return__card{padding:21px 19px}.aml-pbs-course-return__btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function renderCard() {
    if (document.querySelector('.aml-pbs-course-return')) return;
    injectStyles();

    const section = document.createElement('section');
    section.className = 'aml-pbs-course-return';
    section.setAttribute('aria-label', 'PBS 自學路徑閱讀完成');
    section.innerHTML = `
      <div class="aml-pbs-course-return__card">
        <div class="aml-pbs-course-return__eyebrow">PBS SELF-STUDY · ${meta.no}</div>
        <h2>本課文章閱讀完成</h2>
        <p>回到自學路徑，系統會標記這篇文章為已閱讀，接著可以進行本課的小遊戲。</p>
        <div class="aml-pbs-course-return__actions">
          <button class="aml-pbs-course-return__btn" type="button" data-aml-pbs-complete-read>✓ 完成閱讀，回到${meta.no}</button>
          <span class="aml-pbs-course-return__note">學習進度只保存在這台裝置的瀏覽器。</span>
        </div>
      </div>`;

    const footerNav = document.querySelector('.aml-article-footer-nav');
    const main = document.querySelector('main');
    if (footerNav && footerNav.parentNode) {
      footerNav.parentNode.insertBefore(section, footerNav);
    } else if (main && main.parentNode) {
      main.parentNode.insertBefore(section, main.nextSibling);
    } else {
      document.body.appendChild(section);
    }

    const btn = section.querySelector('[data-aml-pbs-complete-read]');
    btn.addEventListener('click', () => {
      markArticleRead();
      try { sessionStorage.removeItem('amlPbsSelfStudyPendingArticle'); } catch (e) {}
      window.location.href = `/pbs-self-study.html#lesson-${lesson}`;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCard, { once: true });
  } else {
    renderCard();
  }
})();

/* AML 互動實驗室：全站中文導覽名稱 */
(function () {
  const rename = (selector, from, to) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.textContent.trim() === from) el.textContent = to;
    });
  };
  rename('a[href="/tools.html"]', 'Interactive Lab', '互動實驗室');
  rename('.aml-mobile-label', 'Interactive Lab', '互動實驗室');
  document.querySelectorAll('.aml-footer-group h4').forEach((el) => {
    if (el.textContent.trim() === 'Interactive Lab') el.textContent = '互動實驗室';
  });
})();

/* AML Interactive Lab footer: keep the two bay entrances together site-wide. */
(function () {
  function syncInteractiveLabFooter() {
    document.querySelectorAll('.aml-footer-group').forEach((group) => {
      const heading = group.querySelector('h4');
      if (!heading) return;
      const title = heading.textContent.trim();
      if (title !== '互動實驗室' && title !== 'Interactive Lab') return;

      heading.textContent = '互動實驗室';
      group.querySelectorAll('a').forEach((link) => link.remove());

      const explore = document.createElement('a');
      explore.href = '/tools.html#lab-halls';
      explore.className = 'aml-lab-subnav aml-lab-subnav--explore';
      explore.textContent = '互動探索艙';

      const support = document.createElement('a');
      support.href = '/tools.html#practice-tools';
      support.className = 'aml-lab-subnav aml-lab-subnav--support';
      support.textContent = '智能支援艙';

      group.appendChild(explore);
      group.appendChild(support);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncInteractiveLabFooter, { once: true });
  } else {
    syncInteractiveLabFooter();
  }
})();
