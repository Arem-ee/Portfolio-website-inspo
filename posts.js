/**
 * ==========================================================================
 * Static Post Page Script (posts.js)
 * Initializes shared footer and post interactions if present.
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize shared footer if buildFooter exists
  const footerEl = document.getElementById("contact");
  if (footerEl && window.buildFooter) {
    window.buildFooter(footerEl);
  }
});
