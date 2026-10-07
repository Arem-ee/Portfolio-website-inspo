/**
 * ==========================================================================
 * Writing Index Page Script
 * Renders the list of posts from window.WRITINGS
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("writing-list");
  if (!container) return;

  const writings = window.WRITINGS || [];

  if (writings.length === 0) {
    container.innerHTML = `
      <p style="padding: 40px 0; opacity: 0.6;">No articles published yet.</p>
    `;
    return;
  }

  container.innerHTML = writings
    .map((post) => {
      return `
        <a href="${post.url}" class="writing-row">
          <time class="writing-row__date" datetime="${post.date}">${post.dateShort}</time>
          <div class="writing-row__content">
            <h2 class="writing-row__title">${post.title}</h2>
            <p class="writing-row__summary">${post.summary}</p>
          </div>
          <span class="writing-row__arrow" aria-hidden="true">&rarr;</span>
        </a>
      `;
    })
    .join("");

  // Initialize shared footer if buildFooter exists
  const footerEl = document.getElementById("contact");
  if (footerEl && window.buildFooter) {
    window.buildFooter(footerEl);
  }
});
