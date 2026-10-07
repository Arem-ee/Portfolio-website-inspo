/**
 * ==========================================================================
 * Kinetic Portfolio & Zigzag Showcase - Shared Utility Script
 * Handles universal navigation and accessibility across all pages.
 * ==========================================================================
 */

(function () {
  function initSharedNav() {
    const SITE = window.SITE;
    if (!SITE) return;

    const navContainer = document.querySelector(".site-header");
    if (!navContainer) return;

    const logoEl = navContainer.querySelector(".nav__logo");
    if (logoEl && SITE.brand) {
      logoEl.textContent = SITE.brand.name;
    }

    const navList = navContainer.querySelector(".nav__list");
    if (navList && SITE.navigation) {
      navList.innerHTML = SITE.navigation
        .map((item) => `<li><a href="${item.href}" class="nav__link">${item.label}</a></li>`)
        .join("");
    }

    // Intercept clicks to non-existent placeholder pages (Design, Writing, About) -> open 404.html
    navContainer.querySelectorAll(".nav__link").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === "design.html" || href === "writing.html" || href === "about.html") {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "404.html";
        });
      }
    });
  }

  window.initSharedNav = initSharedNav;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSharedNav);
  } else {
    initSharedNav();
  }
})();
