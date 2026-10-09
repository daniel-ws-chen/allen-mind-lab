/* AML Article Share resilient delegation — global, accessible, progressive enhancement. */
(function () {
  'use strict';
  function show(message, button) {
    var box = button.closest('.aml-share');
    var status = box && box.querySelector('[data-aml-share-status]');
    if (status) { status.setAttribute('role', 'status'); status.textContent = message; }
  }
  function shareUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    return canonical ? canonical.href : location.href;
  }
  function manual(url, button) {
    var box = button.closest('.aml-share');
    if (!box) return;
    var field = box.querySelector('[data-aml-manual-link]');
    if (!field) {
      field = document.createElement('input');
      field.type = 'text';
      field.readOnly = true;
      field.setAttribute('data-aml-manual-link', '');
      field.setAttribute('aria-label', '可手動複製的文章網址');
      field.style.cssText = 'display:block;width:min(100%,640px);margin-top:12px;padding:10px;border:1px solid #9cabb7;border-radius:8px;font-size:1rem';
      (box.querySelector('[data-aml-share-status]') || box).insertAdjacentElement('afterend', field);
    }
    field.value = url;
    field.focus();
    field.select();
    show('無法自動複製，請複製已選取的文章網址。', button);
  }
  async function copy(url, button) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        show('文章連結已複製 ✓', button);
        return;
      }
    } catch (_) {}
    var area = document.createElement('textarea');
    area.value = url;
    area.readOnly = true;
    area.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    document.body.appendChild(area);
    area.focus(); area.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (_) {}
    area.remove();
    if (copied) show('文章連結已複製 ✓', button);
    else manual(url, button);
  }
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    var button = target.closest('[data-aml-share], [data-aml-copy-link]');
    if (!button || !button.closest('.aml-share')) return;
    event.preventDefault();
    event.stopImmediatePropagation(); // Prevent legacy per-page/share handlers from double firing.
    var url = shareUrl();
    if (button.hasAttribute('data-aml-copy-link')) { void copy(url, button); return; }
    if (typeof navigator.share === 'function') {
      try {
        var title = document.querySelector('h1');
        var desc = document.querySelector('meta[name="description"]');
        Promise.resolve(navigator.share({
          title: title ? title.textContent.trim() : document.title,
          text: desc ? desc.content : '',
          url: url
        })).catch(function (err) {
          if (!err || err.name !== 'AbortError') { manual(url, button); }
        });
      } catch (_) { manual(url, button); }
    } else { void copy(url, button); }
  }, true);
})();

/* AML 3.3 global navigation: dual-bay + advanced self-study dropdown */
(function () {
  function ensureNavStyles() {
    if (document.getElementById('aml-global-subnav-style')) return;
    const style = document.createElement('style');
    style.id = 'aml-global-subnav-style';
    style.textContent = `
      .aml-nav-group .aml-nav-panel{max-width:calc(100vw - 28px)}
      .aml-nav-group .aml-nav-panel::after{content:"";position:absolute;left:0;right:0;top:-10px;height:10px}
      .aml-nav-group .aml-nav-panel a{position:relative;display:block;padding-left:2.15rem}
      .aml-nav-group .aml-nav-panel a::before{content:"";position:absolute;left:1rem;top:50%;width:.46rem;height:.46rem;border-radius:50%;transform:translateY(-50%);background:#d7a84f;box-shadow:0 0 10px rgba(215,168,79,.30)}
      .aml-nav-group[data-aml-lab-nav] .aml-nav-panel{min-width:240px}
      .aml-nav-group[data-aml-lab-nav] .aml-nav-panel .aml-lab-subnav--explore::before{background:#68dcff;box-shadow:0 0 13px rgba(104,220,255,.48)}
      .aml-nav-group[data-aml-lab-nav] .aml-nav-panel .aml-lab-subnav--support::before{background:#8bf2c6;box-shadow:0 0 13px rgba(139,242,198,.42)}
      .aml-nav-group[data-aml-study-nav] .aml-nav-panel,.aml-nav-group[data-aml-selfstudy-nav] .aml-nav-panel{min-width:230px}
      .aml-nav-group[data-aml-study-nav] .aml-nav-panel .aml-study-subnav--home::before,.aml-nav-group[data-aml-selfstudy-nav] .aml-nav-panel .aml-study-subnav--home::before{background:#d7a84f;box-shadow:0 0 13px rgba(215,168,79,.38)}
      .aml-nav-group[data-aml-study-nav] .aml-nav-panel .aml-study-subnav--management::before,.aml-nav-group[data-aml-selfstudy-nav] .aml-nav-panel .aml-study-subnav--management::before{background:#7da9ff;box-shadow:0 0 13px rgba(125,169,255,.42)}
      .aml-nav-group[data-aml-study-nav] .aml-nav-panel .aml-study-subnav--pbs::before,.aml-nav-group[data-aml-selfstudy-nav] .aml-nav-panel .aml-study-subnav--pbs::before{background:#8bf2c6;box-shadow:0 0 13px rgba(139,242,198,.42)}
      .aml-nav-group .aml-nav-panel a:hover,.aml-nav-group .aml-nav-panel a:focus-visible{background:linear-gradient(90deg,rgba(215,168,79,.08),rgba(111,103,255,.04));outline:none}
      .aml-nav-group[data-aml-collection-nav] .aml-nav-panel{min-width:270px}
      .aml-nav-group[data-aml-collection-nav] .aml-nav-panel a.aml-collection-entry--overview{font-weight:800;color:#173d63;padding-top:.9rem;padding-bottom:.85rem}
      .aml-nav-group[data-aml-collection-nav] .aml-nav-panel a.aml-collection-entry--overview::before{background:#315d8b;box-shadow:0 0 10px rgba(49,93,139,.28)}
      .aml-nav-group[data-aml-collection-nav] .aml-nav-panel a.aml-collection-entry--core-start,
      .aml-nav-group[data-aml-collection-nav] .aml-nav-panel a.aml-collection-entry--notes,
      .aml-nav-group[data-aml-collection-nav] .aml-nav-panel a.aml-collection-entry--library{border-top:1px solid rgba(15,23,42,.10);margin-top:.22rem;padding-top:.82rem}
      .aml-nav-group[data-aml-collection-nav] .aml-nav-panel a.aml-collection-entry--notes::before{background:#9a6d9f;box-shadow:0 0 10px rgba(154,109,159,.28)}
      .aml-nav-group[data-aml-collection-nav] .aml-nav-panel a.aml-collection-entry--library{font-weight:750;color:#173d63}
      .aml-nav-group[data-aml-collection-nav] .aml-nav-panel a.aml-collection-entry--library::before{content:"⌕";width:auto;height:auto;border-radius:0;background:none;box-shadow:none;font-size:.95rem;font-weight:900;line-height:1;color:#315d8b}

      /* AML inner-page hero normalization — keep homepage and article detail pages unchanged. */
      body.aml-inner-compact-hero .hero,
      body.aml-inner-compact-hero .topic-hero,
      body.aml-inner-compact-hero .resource-hero,
      body.aml-inner-compact-hero .aml-compact-hero{
        padding-top:clamp(58px,5.5vw,76px)!important;
        padding-bottom:clamp(38px,3.8vw,52px)!important;
      }
      body.aml-inner-compact-hero .hero h1,
      body.aml-inner-compact-hero .topic-hero h1,
      body.aml-inner-compact-hero .resource-hero h1,
      body.aml-inner-compact-hero .aml-compact-hero h1{
        font-size:clamp(2.25rem,4.2vw,3.75rem)!important;
        line-height:1.14!important;
        margin-top:12px!important;
        margin-bottom:14px!important;
      }
      body.aml-inner-compact-hero .hero p,
      body.aml-inner-compact-hero .topic-hero p,
      body.aml-inner-compact-hero .resource-hero p,
      body.aml-inner-compact-hero .aml-compact-hero p{
        line-height:1.72!important;
      }
      body.aml-inner-compact-hero .notes-hero:after{
        top:38px!important;
        width:250px!important;
        height:165px!important;
        opacity:.72;
      }
      @media(max-width:720px){
        .aml-menu-toggle{min-width:44px;min-height:44px}
        .aml-mobile-menu a{min-height:44px;display:flex;align-items:center}
        .aml-mobile-menu .aml-lab-subnav,.aml-mobile-menu .aml-study-subnav{position:relative;padding-left:1.55rem}
        .aml-mobile-menu .aml-lab-subnav::before,.aml-mobile-menu .aml-study-subnav::before{content:"";position:absolute;left:.55rem;top:50%;width:.42rem;height:.42rem;border-radius:50%;transform:translateY(-50%);background:#d7a84f}
        .aml-mobile-menu .aml-lab-subnav--explore::before{background:#68dcff}.aml-mobile-menu .aml-lab-subnav--support::before{background:#8bf2c6}
        .aml-mobile-menu .aml-study-subnav--management::before{background:#7da9ff}.aml-mobile-menu .aml-study-subnav--pbs::before{background:#8bf2c6}
      }
    `;
    document.head.appendChild(style);
  }

  function markCompactInnerHero() {
    const path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    const compactPaths = new Set([
      '/articles','/articles.html',
      '/library','/library.html',
      '/notes','/notes.html',
      '/ot','/ot.html',
      '/pbs','/pbs.html',
      '/management','/management.html',
      '/education','/education.html',
      '/ai','/ai.html',
      '/mind','/mind.html',
      '/reading-paths','/reading-paths.html',
      '/research','/research.html',
      '/resources','/resources.html',
      '/publications','/publications.html',
      '/recognition','/recognition.html'
    ]);
    if (compactPaths.has(path)) document.body.classList.add('aml-inner-compact-hero');
  }

  function makeDetails(label, attrName, links) {
    const details = document.createElement('details');
    details.className = 'aml-nav-group';
    details.setAttribute('name', 'aml-primary-nav');
    details.dataset[attrName] = 'true';
    const summary = document.createElement('summary');
    summary.textContent = label;
    const panel = document.createElement('div');
    panel.className = 'aml-nav-panel';
    links.forEach(item => {
      const a = document.createElement('a');
      a.href = item.href;
      a.className = item.className || '';
      a.textContent = item.label;
      panel.appendChild(a);
    });
    details.append(summary, panel);
    return details;
  }

  function normalizeCollectionNav() {
    const order = [
      {href:'/articles.html', label:'探索主題館藏', className:'aml-collection-entry aml-collection-entry--overview'},
      {href:'/ot.html', label:'職能治療與人類職能', className:'aml-collection-entry aml-collection-entry--core aml-collection-entry--core-start'},
      {href:'/pbs.html', label:'PBS 正向行為支持', className:'aml-collection-entry aml-collection-entry--core'},
      {href:'/management.html', label:'管理與領導', className:'aml-collection-entry aml-collection-entry--core'},
      {href:'/education.html', label:'教育與學習', className:'aml-collection-entry aml-collection-entry--core'},
      {href:'/ai.html', label:'AI × 實務', className:'aml-collection-entry aml-collection-entry--core'},
      {href:'/mind.html', label:'身心與福祉', className:'aml-collection-entry aml-collection-entry--core'},
      {href:'/notes.html', label:'AML 小品集', className:'aml-collection-entry aml-collection-entry--notes'},
      {href:'/library.html', label:'搜尋全部文章', className:'aml-collection-entry aml-collection-entry--library'}
    ];

    document.querySelectorAll('.aml-desktop-links .aml-nav-group').forEach((details) => {
      const summary = details.querySelector(':scope > summary');
      if (!summary || summary.textContent.trim() !== '主題館藏') return;
      details.dataset.amlCollectionNav = 'true';
      const panel = details.querySelector(':scope > .aml-nav-panel');
      if (!panel) return;
      panel.textContent = '';
      order.forEach(item => {
        const a = document.createElement('a');
        a.href = item.href;
        a.className = item.className;
        a.textContent = item.label;
        panel.appendChild(a);
      });
    });

    document.querySelectorAll('.aml-mobile-menu').forEach((menu) => {
      const label = Array.from(menu.querySelectorAll('.aml-mobile-label'))
        .find(el => el.textContent.trim() === '主題館藏');
      if (!label) return;
      let node = label.nextElementSibling;
      while (node && !node.classList.contains('aml-mobile-label')) {
        const next = node.nextElementSibling;
        node.remove();
        node = next;
      }
      order.forEach((item, index) => {
        const a = document.createElement('a');
        a.href = item.href;
        a.className = item.className;
        a.textContent = item.label;
        if (index === 1 || index === 7 || index === 8) a.style.borderTop = '1px solid rgba(15,23,42,.10)';
        menu.insertBefore(a, node || null);
      });
    });
  }

  function buildDesktopNav() {
    document.querySelectorAll('.aml-desktop-links').forEach((links) => {
      // Interactive Lab
      if (!links.querySelector('.aml-nav-group[data-aml-lab-nav]')) {
        const direct = Array.from(links.querySelectorAll('a.aml-nav-direct, a[href="/tools.html"]')).find((a) => {
          const t = a.textContent.trim();
          return t === 'Interactive Lab' || t === '互動實驗室';
        });
        if (direct) {
          direct.replaceWith(makeDetails('互動實驗室', 'amlLabNav', [
            {href:'/tools.html#lab-halls', className:'aml-lab-subnav aml-lab-subnav--explore', label:'互動探索艙'},
            {href:'/tools.html#practice-tools', className:'aml-lab-subnav aml-lab-subnav--support', label:'智能支援艙'}
          ]));
        }
      }

      // Advanced Self-Study Room — normalize legacy marker first, then inject only if absent.
      const existingStudyNav = links.querySelector(
        '.aml-nav-group[data-aml-study-nav], .aml-nav-group[data-aml-selfstudy-nav]'
      );
      if (existingStudyNav && existingStudyNav.hasAttribute('data-aml-selfstudy-nav')) {
        existingStudyNav.setAttribute('data-aml-study-nav', 'true');
        existingStudyNav.removeAttribute('data-aml-selfstudy-nav');
      }
      if (!existingStudyNav) {
        const studyNav = makeDetails('進階自學室', 'amlStudyNav', [
          {href:'/self-study.html', className:'aml-study-subnav aml-study-subnav--home', label:'進階自學室總覽'},
          {href:'/management-self-study.html', className:'aml-study-subnav aml-study-subnav--management', label:'管理學自學'},
          {href:'/pbs-self-study.html', className:'aml-study-subnav aml-study-subnav--pbs', label:'PBS 自學'}
        ]);
        const directStudy = Array.from(links.querySelectorAll('a[href="/self-study.html"], a.aml-nav-direct')).find((a) =>
          a.getAttribute('href') === '/self-study.html' || a.textContent.trim() === '進階自學室'
        );
        if (directStudy) {
          directStudy.replaceWith(studyNav);
        } else {
          // Keep global order: 閱讀路徑 → 進階自學室 → 互動實驗室 → 資源與聯繫
          const labNav = links.querySelector('.aml-nav-group[data-aml-lab-nav]');
          const resourcesAnchor = Array.from(links.children).find((el) => {
            const t = (el.textContent || '').trim();
            return t.includes('資源與聯繫');
          });
          if (labNav) links.insertBefore(studyNav, labNav);
          else if (resourcesAnchor) links.insertBefore(studyNav, resourcesAnchor);
          else links.appendChild(studyNav);
        }
      }
    });
  }

  function buildMobileNav() {
    document.querySelectorAll('.aml-mobile-menu').forEach((menu) => {
      // Interactive Lab section
      const labels = Array.from(menu.querySelectorAll('.aml-mobile-label'));
      const labLabel = labels.find(el => ['Interactive Lab','互動實驗室'].includes(el.textContent.trim()));
      if (labLabel) {
        labLabel.textContent = '互動實驗室';
        let n = labLabel.nextElementSibling;
        while (n && !n.classList.contains('aml-mobile-label')) {
          const next=n.nextElementSibling;
          if (n.matches('a[href="/tools.html"],a[href="/tools.html#lab-halls"],a[href="/tools.html#practice-tools"]')) n.remove();
          n=next;
        }
        const explore=document.createElement('a'); explore.href='/tools.html#lab-halls'; explore.className='aml-lab-subnav aml-lab-subnav--explore'; explore.textContent='互動探索艙';
        const support=document.createElement('a'); support.href='/tools.html#practice-tools'; support.className='aml-lab-subnav aml-lab-subnav--support'; support.textContent='智能支援艙';
        labLabel.after(explore,support);
      }

      // Self-study section: normalize to one label + three links.
      let studyLabel = Array.from(menu.querySelectorAll('.aml-mobile-label')).find(el => el.textContent.trim()==='進階自學室');
      if (!studyLabel) {
        studyLabel=document.createElement('span'); studyLabel.className='aml-mobile-label'; studyLabel.textContent='進階自學室';
        if (labLabel) labLabel.before(studyLabel); else menu.appendChild(studyLabel);
      }
      let n=studyLabel.nextElementSibling;
      while(n && !n.classList.contains('aml-mobile-label')){
        const next=n.nextElementSibling;
        if (n.matches('a[href="/self-study.html"],a[href="/management-self-study.html"],a[href="/pbs-self-study.html"]')) n.remove();
        n=next;
      }
      const sh=document.createElement('a'); sh.href='/self-study.html'; sh.className='aml-study-subnav aml-study-subnav--home'; sh.textContent='進階自學室總覽';
      const sm=document.createElement('a'); sm.href='/management-self-study.html'; sm.className='aml-study-subnav aml-study-subnav--management'; sm.textContent='管理學自學';
      const sp=document.createElement('a'); sp.href='/pbs-self-study.html'; sp.className='aml-study-subnav aml-study-subnav--pbs'; sp.textContent='PBS 自學';
      studyLabel.after(sh,sm,sp);
    });
  }

  function buildGlobalNav() {
    /* Native HTML mutual-exclusion group: only one primary desktop dropdown can stay open.
       Supported by current Chromium and works even if later event handlers fail. */
    document.querySelectorAll('.aml-desktop-links > details.aml-nav-group').forEach((details) => {
      details.setAttribute('name', 'aml-primary-nav');
    });
    ensureNavStyles();
    markCompactInnerHero();
    normalizeCollectionNav();
    buildDesktopNav();
    buildMobileNav();
    document.dispatchEvent(new CustomEvent('aml:nav-updated'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildGlobalNav, {once:true});
  else buildGlobalNav();
})();

(() => {
  /* ===== Accessible Explore & Mobile Navigation ===== */
  const toggle = document.querySelector(".aml-menu-toggle");
  const menu = document.querySelector(".aml-mobile-menu");
  const getExploreMenus = () => Array.from(document.querySelectorAll(".aml-nav-group"));

  const closeExplore = (except = null) => {
    getExploreMenus().forEach(details => {
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

  const fitNavPanel = (details) => {
    const panel = details.querySelector(".aml-nav-panel");
    if (!panel || !details.open) return;
    panel.style.left = "";
    panel.style.right = "";
    panel.style.transform = "";
    requestAnimationFrame(() => {
      const margin = 14;
      let rect = panel.getBoundingClientRect();
      if (rect.left < margin) {
        panel.style.left = "0";
        panel.style.right = "auto";
      }
      requestAnimationFrame(() => {
        rect = panel.getBoundingClientRect();
        if (rect.right > window.innerWidth - margin) {
          panel.style.right = "0";
          panel.style.left = "auto";
        }
        requestAnimationFrame(() => {
          rect = panel.getBoundingClientRect();
          if (rect.left < margin) {
            const dx = margin - rect.left;
            panel.style.transform = `translateX(${dx}px)`;
          } else if (rect.right > window.innerWidth - margin) {
            const dx = (window.innerWidth - margin) - rect.right;
            panel.style.transform = `translateX(${dx}px)`;
          }
        });
      });
    });
  };

  const bindExploreMenus = () => {
    getExploreMenus().forEach(details => {
      if (details.dataset.amlNavBound === "true") return;
      details.dataset.amlNavBound = "true";
      let closeTimer = null;
      const cancelClose = () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } };
      const scheduleClose = () => {
        cancelClose();
        closeTimer = setTimeout(() => { details.open = false; closeTimer = null; }, 220);
      };

      const summary = details.querySelector(":scope > summary");

      details.addEventListener("toggle", () => {
        if (details.open) { closeExplore(details); fitNavPanel(details); }
        else cancelClose();
      });
      details.querySelectorAll(".aml-nav-panel a").forEach(a => a.addEventListener("click", () => { details.open = false; }));

      /* Open only one desktop dropdown at a time.
         Moving directly from one menu trigger to another closes the previous menu immediately,
         avoiding overlapping panels that can trap the pointer between two <details> elements. */
      const activateThisMenu = () => {
        closeExplore(details);
        cancelClose();
      };
      summary?.addEventListener("pointerenter", activateThisMenu);
      summary?.addEventListener("focusin", activateThisMenu);
      summary?.addEventListener("click", () => closeExplore(details));

      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        details.addEventListener("pointerenter", cancelClose);
        details.addEventListener("pointerleave", scheduleClose);
        details.querySelector(".aml-nav-panel")?.addEventListener("pointerenter", cancelClose);
      }
      details.addEventListener("focusout", e => { if (!details.contains(e.relatedTarget)) scheduleClose(); });
    });
  };

  bindExploreMenus();

  /* Hard guard: at desktop size, pointer/focus activity inside one nav group
     immediately closes every other open <details>. This runs in capture phase
     so it also works when moving directly between overlapping dropdown panels. */
  const closeOtherNavGroups = (target) => {
    const active = target && target.closest ? target.closest(".aml-nav-group") : null;
    if (!active) return;
    getExploreMenus().forEach((details) => {
      if (details !== active && details.open) details.open = false;
    });
  };
  document.addEventListener("pointerover", (e) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    closeOtherNavGroups(e.target);
  }, true);
  document.addEventListener("focusin", (e) => closeOtherNavGroups(e.target), true);

  document.addEventListener("aml:nav-updated", bindExploreMenus);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindExploreMenus, { once: true });
  }
  window.addEventListener("resize", () => getExploreMenus().forEach(d => { if (d.open) fitNavPanel(d); }));

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
    const activeExplore = getExploreMenus().find(details => details.open);
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
      title: "把功能假設帶回現場：PBS 行為分析與對策研擬智能助理 2.0",
      desc: "如果你正在整理情緒行為案例，可用 PBS 行為分析與對策研擬智能助理 2.0 協助彙整 ABC 資訊、形成初步功能假設與 PBS 策略草案，再由團隊依實際情境查證與修正。",
      href: "/tools.html",
      cta: "查看 PBS 實務工具 →"
    },
    "/articles/pbs-plan-contextual-fit": {
      label: "PBS · PRACTICE TOOL",
      title: "從計畫文字走向情境判斷：PBS 行為分析與對策研擬智能助理 2.0",
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
      title: "直接使用方案規劃與管理智能助理 2.0",
      desc: "把十章方案內容交回一個共同架構，協助組長整理、檢查跨章連貫性與形成修訂版；AI 協助彙整，人仍負責查證與管理判斷。",
      href: "/tools/management-coach/",
      cta: "開啟方案規劃與管理智能助理 2.0 →"
    },
    "/articles/ot-management-organizational-planning": {
      label: "MANAGEMENT · LEARNING TOOL",
      title: "把願景、使命與服務方向繼續往下做",
      desc: "如果你正在規劃一項服務，可用方案規劃與管理智能助理 2.0 把需求、價值主張、策略、人力、流程與成果逐步整理成完整方案。",
      href: "/tools/management-coach/",
      cta: "開啟方案規劃與管理智能助理 2.0 →"
    },
    "/articles/ot-management-strategy-swot": {
      label: "MANAGEMENT · LEARNING TOOL",
      title: "把策略分析接回完整方案",
      desc: "SWOT 不是終點。可用方案規劃與管理智能助理 2.0 把策略選擇繼續連到人力、流程、品質、財務、合作與成果呈現。",
      href: "/tools/management-coach/",
      cta: "開啟方案規劃與管理智能助理 2.0 →"
    },
    "/articles/ot-management-service-development-choice": {
      label: "MANAGEMENT · LEARNING TOOL",
      title: "把服務選擇轉成可檢驗的方案",
      desc: "當你已經釐清「真正缺的是什麼」，可以進一步用方案規劃與管理智能助理 2.0 整理服務設計、資源條件、流程與成果假設。",
      href: "/tools/management-coach/",
      cta: "開啟方案規劃與管理智能助理 2.0 →"
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

  /* ===== AML Related Reading Network v2 ===== */
  (() => {
    if (!currentPath.startsWith("/articles/")) return;

    const normalizeArticlePath = (path) =>
      normalizePath(String(path || "").replace(/^https?:\/\/[^/]+/i, ""));

    const domainLabels = {
      ot: "OT & Human Occupation",
      mind: "Mind & Well-being",
      pbs: "PBS",
      education: "Education",
      management: "Management & Leadership",
      ai: "AI × Practice",
      notes: "AML Notes"
    };

    const labelFor = (article) =>
      article?.tag ||
      domainLabels[article?.primaryDomain] ||
      "Allen Mind Lab";

    const collectManualRelated = () => {
      const headings = Array.from(document.querySelectorAll("main h2, main h3"));
      const heading = headings.find((el) =>
        el.id === "section-related" ||
        el.textContent.trim() === "延伸閱讀"
      );
      if (!heading) return { items: [], nodes: [] };

      const list = heading.nextElementSibling;
      if (!list || !["UL", "OL"].includes(list.tagName)) {
        return { items: [], nodes: [] };
      }

      const items = Array.from(list.querySelectorAll("a[href]"))
        .map((a) => ({
          path: normalizeArticlePath(a.getAttribute("href")),
          title: a.textContent.trim()
        }))
        .filter((x) => x.path.startsWith("/articles/"));

      return { items, nodes: [heading, list] };
    };

    const scoreCandidate = (current, candidate) => {
      if (!candidate || candidate.slug === current.slug || candidate.isNote) return -Infinity;

      let score = 0;
      const currentDomains = new Set(current.domains || []);
      const candidateDomains = new Set(candidate.domains || []);
      const sharedDomains = [...currentDomains].filter((d) => candidateDomains.has(d));

      if (candidate.primaryDomain && candidate.primaryDomain === current.primaryDomain) score += 12;
      score += sharedDomains.length * 4;

      const currentSeries = new Set(current.series || []);
      const candidateSeries = new Set(candidate.series || []);
      score += [...currentSeries].filter((s) => candidateSeries.has(s)).length * 8;

      const currentPaths = new Set(current.readingPaths || []);
      const candidatePaths = new Set(candidate.readingPaths || []);
      score += [...currentPaths].filter((p) => candidatePaths.has(p)).length * 7;

      const currentKeywords = new Set((current.keywords || []).map((k) => String(k).toLocaleLowerCase()));
      const candidateKeywords = new Set((candidate.keywords || []).map((k) => String(k).toLocaleLowerCase()));
      score += Math.min(
        6,
        [...currentKeywords].filter((k) => candidateKeywords.has(k)).length
      ) * 1.5;

      if (current.tag && candidate.tag && current.tag === candidate.tag) score += 2;

      const a = Date.parse(current.date || "");
      const b = Date.parse(candidate.date || "");
      if (Number.isFinite(a) && Number.isFinite(b)) {
        const days = Math.abs(a - b) / 86400000;
        score += Math.max(0, 2 - Math.min(days, 180) / 90);
      }

      return score;
    };

    const renderRelated = async () => {
      if (document.querySelector(".aml-related-reading")) return;

      let manifest;
      try {
        const res = await fetch("/data/articles-manifest.json", { cache: "no-cache" });
        if (!res.ok) return;
        manifest = await res.json();
      } catch (_) {
        return;
      }

      const articles = Array.isArray(manifest?.articles) ? manifest.articles : [];
      const current = articles.find((a) =>
        normalizeArticlePath(a.articlePath || a.canonical) === currentPath
      );
      if (!current || current.isNote) return;

      const byPath = new Map(
        articles.map((a) => [
          normalizeArticlePath(a.articlePath || a.canonical),
          a
        ])
      );

      const manual = collectManualRelated();
      const picked = [];
      const seen = new Set([currentPath]);

      manual.items.forEach((item) => {
        const article = byPath.get(item.path);
        if (!article || article.isNote || seen.has(item.path)) return;
        seen.add(item.path);
        picked.push(article);
      });

      if (picked.length < 3) {
        articles
          .map((candidate) => ({ candidate, score: scoreCandidate(current, candidate) }))
          .filter(({ candidate, score }) => {
            const path = normalizeArticlePath(candidate.articlePath || candidate.canonical);
            return Number.isFinite(score) && !seen.has(path);
          })
          .sort((a, b) =>
            b.score - a.score ||
            String(b.candidate.date || "").localeCompare(String(a.candidate.date || ""))
          )
          .forEach(({ candidate }) => {
            if (picked.length >= 3) return;
            const path = normalizeArticlePath(candidate.articlePath || candidate.canonical);
            seen.add(path);
            picked.push(candidate);
          });
      }

      if (!picked.length) return;

      const footer = document.querySelector(".aml-global-footer");
      if (!footer) return;

      const section = document.createElement("section");
      section.className = "aml-related-reading";
      section.setAttribute("aria-labelledby", "aml-related-reading-title");

      const cards = picked.slice(0, 3).map((article) => {
        const href = article.articlePath || ("/articles/" + article.slug + ".html");
        return `
          <a class="aml-related-reading__card" href="${href}">
            <span class="aml-related-reading__label">${labelFor(article)}</span>
            <strong>${article.title}</strong>
            <p>${article.summary || ""}</p>
            <span class="aml-related-reading__go">延伸閱讀 →</span>
          </a>
        `;
      }).join("");

      section.innerHTML = `
        <div class="aml-related-reading__inner">
          <div class="aml-related-reading__head">
            <div>
              <div class="aml-related-reading__kicker">KEEP EXPLORING</div>
              <h2 id="aml-related-reading-title">延伸閱讀</h2>
            </div>
            <p>依文章主題、系列與關鍵字推薦</p>
          </div>
          <div class="aml-related-reading__grid">${cards}</div>
          <a class="aml-related-reading__all" href="/articles.html">瀏覽全部文章 →</a>
        </div>
      `;

      footer.parentNode.insertBefore(section, footer);

      /* Manual text links are preserved as priority recommendations,
         then removed from the article body to avoid duplicate presentation. */
      manual.nodes.forEach((node) => node.remove());
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderRelated, { once: true });
    } else {
      renderRelated();
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
  // PBS core-course articles already ship their own completion block.
  // Keep this global fallback only for articles without that dedicated UI.
  if (document.querySelector('[data-pbs-reading-complete]')) return;

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


/* AML advanced self-study room: site-wide navigation/footer naming. */
(function () {
  function syncAdvancedSelfStudy() {
    document.querySelectorAll('a[href="/self-study.html"]').forEach((link) => {
      const t = link.textContent.trim();
      if (t === '自學館' || t === '進入自學館' || t === '自學館總覽') {
        link.textContent = t.startsWith('進入') ? '進入進階自學室' : '進階自學室';
      }
    });
    document.querySelectorAll('.aml-mobile-label').forEach((label) => {
      if (label.textContent.trim() === '自學館') label.textContent = '進階自學室';
    });
    document.querySelectorAll('.aml-footer-group h4').forEach((h) => {
      if (h.textContent.trim() === '自學館') h.textContent = '進階自學室';
    });

    document.querySelectorAll('.aml-footer-links').forEach((footerLinks) => {
      let group = Array.from(footerLinks.querySelectorAll('.aml-footer-group')).find((g) => {
        const h = g.querySelector('h4');
        return h && h.textContent.trim() === '進階自學室';
      });
      if (!group) {
        group = document.createElement('div');
        group.className = 'aml-footer-group';
        const h = document.createElement('h4');
        h.textContent = '進階自學室';
        group.appendChild(h);
        const labGroup = Array.from(footerLinks.querySelectorAll('.aml-footer-group')).find((g) => {
          const h = g.querySelector('h4');
          return h && h.textContent.trim() === '互動實驗室';
        });
        if (labGroup) footerLinks.insertBefore(group, labGroup);
        else footerLinks.appendChild(group);
      }
      group.querySelectorAll('a').forEach((a) => a.remove());
      const hub = document.createElement('a'); hub.href='/self-study.html'; hub.textContent='進階自學室';
      const m = document.createElement('a'); m.href='/management-self-study.html'; m.textContent='管理學自學';
      const p = document.createElement('a'); p.href='/pbs-self-study.html'; p.textContent='PBS 自學';
      group.append(hub,m,p);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncAdvancedSelfStudy, {once:true});
  else syncAdvancedSelfStudy();
})();

/* ===== AML Related Reading Engine v1 · 2026-10-01 =====
   Auto-injects three relevant articles into legacy article pages.
   Ranking: same series > same learning path > same primary domain > shared domains > keyword overlap.
   Existing manual related-reading sections are preserved.
*/
(function () {
  const pathMatch = location.pathname.match(/^\/articles\/([^/]+?)(?:\.html)?\/?$/i);
  if (!pathMatch) return;

  function idsOf(items) {
    return new Set((items || []).map((x) => typeof x === 'string' ? x : x && x.id).filter(Boolean));
  }
  function normKeyword(x) {
    return String(x || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }
  function domainLabel(id) {
    return ({
      ot: 'OT & Human Occupation',
      mind: 'Mind & Well-being',
      pbs: 'PBS',
      education: 'Education',
      management: 'Management & Leadership',
      ai: 'AI × Practice'
    })[id] || 'AML';
  }
  function hasExistingRelated(main) {
    if (main.querySelector('#section-related, .aml-related-reading, [data-aml-auto-related]')) return true;
    return Array.from(main.querySelectorAll('h2,h3')).some((h) => /^(延伸閱讀|相關文章)/.test(h.textContent.trim()));
  }
  function scoreRelated(source, target) {
    let score = 0;
    const sourceSeries = idsOf(source.series);
    const targetSeries = idsOf(target.series);
    const sourcePaths = idsOf(source.readingPaths);
    const targetPaths = idsOf(target.readingPaths);
    const sourceDomains = new Set(source.domains || [source.primaryDomain].filter(Boolean));
    const targetDomains = new Set(target.domains || [target.primaryDomain].filter(Boolean));
    const sourceKeywords = new Set((source.keywords || []).map(normKeyword).filter((x) => x.length >= 2));
    const targetKeywords = new Set((target.keywords || []).map(normKeyword).filter((x) => x.length >= 2));

    const seriesHits = [...sourceSeries].filter((x) => targetSeries.has(x)).length;
    const pathHits = [...sourcePaths].filter((x) => targetPaths.has(x)).length;
    const domainHits = [...sourceDomains].filter((x) => targetDomains.has(x)).length;
    const keywordHits = [...sourceKeywords].filter((x) => targetKeywords.has(x)).length;

    score += seriesHits * 24;
    score += pathHits * 18;
    if (source.primaryDomain && target.primaryDomain === source.primaryDomain) score += 12;
    score += domainHits * 4;
    score += Math.min(keywordHits, 6);
    if (target.isNote) score -= 2;
    return score;
  }
  function render(main, source, candidates) {
    if (hasExistingRelated(main) || !candidates.length) return;
    const section = document.createElement('section');
    section.className = 'aml-related-reading';
    section.dataset.amlAutoRelated = 'true';
    section.setAttribute('aria-labelledby', 'section-related');

    const head = document.createElement('div');
    head.className = 'aml-related-reading__head';
    const h2 = document.createElement('h2');
    h2.id = 'section-related';
    h2.textContent = '延伸閱讀';
    const p = document.createElement('p');
    p.textContent = '依文章主題、系列與關鍵字推薦';
    head.append(h2, p);

    const grid = document.createElement('div');
    grid.className = 'aml-related-reading__grid';
    candidates.forEach((a) => {
      const card = document.createElement('a');
      card.className = 'aml-related-reading__card';
      card.href = `/articles/${a.slug}.html`;

      const small = document.createElement('small');
      small.textContent = domainLabel(a.primaryDomain);
      const strong = document.createElement('strong');
      strong.textContent = a.title;
      const summary = document.createElement('span');
      summary.textContent = a.summary || '';
      const cta = document.createElement('b');
      cta.textContent = '延伸閱讀 →';
      card.append(small, strong);
      if (a.summary) card.append(summary);
      card.append(cta);
      grid.appendChild(card);
    });
    section.append(head, grid);

    const share = main.querySelector('.aml-share');
    if (share) main.insertBefore(section, share);
    else main.appendChild(section);
  }

  async function init() {
    const main = document.querySelector('main');
    if (!main || hasExistingRelated(main)) return;
    const slug = pathMatch[1];
    try {
      const res = await fetch('/data/articles-manifest.json', { cache: 'no-cache' });
      if (!res.ok) return;
      const manifest = await res.json();
      const articles = Array.isArray(manifest.articles) ? manifest.articles : [];
      const source = articles.find((a) => a.slug === slug);
      if (!source) return;
      const candidates = articles
        .filter((a) => a && a.slug && a.slug !== slug)
        .map((a) => ({ ...a, __score: scoreRelated(source, a) }))
        .filter((a) => a.__score > 0)
        .sort((a, b) => b.__score - a.__score || String(b.date || '').localeCompare(String(a.date || '')) || String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hant'))
        .slice(0, 3);
      render(main, source, candidates);
    } catch (e) {
      // Related reading is progressive enhancement; article reading must never depend on it.
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
/* ===== /AML Related Reading Engine v1 ===== */
