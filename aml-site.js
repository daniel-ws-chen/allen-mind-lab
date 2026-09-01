
(() => {
  const toggle = document.querySelector(".aml-menu-toggle");
  const menu = document.querySelector(".aml-mobile-menu");

  if (toggle && menu) {
    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    };

    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });

    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("is-open")) return;
      if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
  }

  const currentPath = location.pathname.replace(/\/$/, "/index.html");
  document.querySelectorAll(".aml-global-nav a, .aml-global-footer a").forEach(a => {
    try {
      const p = new URL(a.href, location.href).pathname.replace(/\/$/, "/index.html");
      if (p === currentPath) a.setAttribute("aria-current", "page");
    } catch (_) {}
  });
})();
