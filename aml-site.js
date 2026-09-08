(() => {
  /* ===== Accessible Explore & Mobile Navigation ===== */
  const toggle = document.querySelector(".aml-menu-toggle");
  const menu = document.querySelector(".aml-mobile-menu");
  const exploreMenus = Array.from(document.querySelectorAll(".aml-explore"));

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
    if (!target.closest(".aml-explore")) closeExplore();
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

})();
