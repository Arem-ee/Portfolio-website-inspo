/**
 * ==========================================================================
 * Kinetic Portfolio & Zigzag Showcase - Main Script
 * ==========================================================================
 */

/**
 * FIX 2.A: Link drawing scale constant
 * Every link is drawn at this scale so a wide link ends up ~20px wide and ~32px long.
 */
const LINK_SCALE = 0.5;

/**
 * FIX 6: Global Site Content with Neutral Placeholders
 * Modify this object to change any textual content across the entire page.
 */
const SITE_CONTENT = {
  brand: {
    name: "Your Name",
    description: "A short sentence describing your creative perspective and practice."
  },
  navigation: [
    { label: "Work", href: "#projects" },
    { label: "About", href: "#statement" },
    { label: "Contact", href: "#contact" }
  ],
  hero: {
    headlineLeft: "YOUR",
    headlineRight: "NAME",
    subtextLeft: "A concise introductory sentence describing your perspective.",
    subtextRight: "A second concise sentence highlighting your core practice."
  },
  projects: [
    {
      id: 1,
      title: "Project One",
      description: "A short plain sentence describing the scope and outcome of this project.",
      linkText: "View project",
      url: "#",
      image: "assets/project-1.jpg",
      alt: "Project One overview"
    },
    {
      id: 2,
      title: "Project Two",
      description: "A short plain sentence describing the scope and outcome of this project.",
      linkText: "View project",
      url: "#",
      image: "assets/project-2.jpg",
      alt: "Project Two overview"
    },
    {
      id: 3,
      title: "Project Three",
      description: "A short plain sentence describing the scope and outcome of this project.",
      linkText: "View project",
      url: "#",
      image: "assets/project-3.jpg",
      alt: "Project Three overview"
    },
    {
      id: 4,
      title: "Project Four",
      description: "A short plain sentence describing the scope and outcome of this project.",
      linkText: "View project",
      url: "#",
      image: "assets/project-4.jpg",
      alt: "Project Four overview"
    },
    {
      id: 5,
      title: "Project Five",
      description: "A short plain sentence describing the scope and outcome of this project.",
      linkText: "View project",
      url: "#",
      image: "assets/project-5.jpg",
      alt: "Project Five overview"
    }
  ],
  remainingBody: {
    statement: "A clear two-line statement summarizing your perspective.",
    paragraph: "A single paragraph of placeholder text offering further detail about your methodology, principles, and collaborative approach without extraneous decorative elements."
  },
  footer: {
    description: "A brief concluding sentence about your work and availability.",
    pages: [
      { label: "Work", href: "#projects" },
      { label: "About", href: "#statement" },
      { label: "Contact", href: "#contact" }
    ],
    social: [
      { label: "Link One", href: "#" },
      { label: "Link Two", href: "#" },
      { label: "Link Three", href: "#" }
    ],
    copyrightName: "Your Name. All rights reserved."
  },
  contact: {
    options: [
      { value: "option-1", label: "Option One" },
      { value: "option-2", label: "Option Two" },
      { value: "option-3", label: "Option Three" },
      { value: "option-4", label: "Option Four" }
    ],
    successTitle: "Message received.",
    successBody: "Thank you for reaching out. We will respond shortly."
  }
};

/**
 * Handle form submission
 * @param {Object} data - Cleaned form field values
 */
function submitForm(data) {
  // TODO: Plug in your real backend API or form endpoint here (e.g. fetch('/api/contact', ...))
  console.log("Contact form submitted with data:", data);
}

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  populateSiteContent();
  setupScrollProgress();

  // Hero background-removal fallback on character and cat before reveal animation
  const characterImg = document.querySelector(".hero__character-img");
  const catImg = document.querySelector(".hero__cat-img");

  let charReady = false;
  let catReady = !catImg;

  function onHeroReady() {
    if (charReady && catReady) {
      setupHeroInteractions(prefersReducedMotion);
    }
  }

  prepareCharacterImage(characterImg, () => {
    charReady = true;
    onHeroReady();
  });

  if (catImg) {
    prepareCharacterImage(catImg, () => {
      catReady = true;
      onHeroReady();
    });
  }

  setupProjectEntrance(prefersReducedMotion);
  setupChains(prefersReducedMotion);
  setupStatementEntrance(prefersReducedMotion);
  setupPaperAnimation(prefersReducedMotion);
  setupContactForm();
  setupSmoothScroll();
});

/**
 * Automatic background-removal fallback for flat pure white background
 * Draws character onto canvas, flood-fills inward from 4 corners within tolerance
 * of 18 per channel of pure white (255,255,255), and softens the edge by lowering
 * the alpha of perimeter pixels by ~35%.
 */
function prepareCharacterImage(imgEl, onReady) {
  if (!imgEl) return onReady();

  function process() {
    try {
      const w = imgEl.naturalWidth || imgEl.width;
      const h = imgEl.naturalHeight || imgEl.height;
      if (!w || !h) return onReady();

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return onReady();

      ctx.drawImage(imgEl, 0, 0);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Check corner pixel alphas
      const cIndices = [
        0,                            // top-left
        (w - 1) * 4,                  // top-right
        (h - 1) * w * 4,              // bottom-left
        ((h - 1) * w + (w - 1)) * 4   // bottom-right
      ];

      const alreadyTransparent = cIndices.every((idx) => data[idx + 3] < 10);
      if (alreadyTransparent) {
        return onReady();
      }

      const tolerance = 18;
      // Pixel is connected white background if within tolerance of 18 per channel of pure white (255, 255, 255)
      function isWhiteBg(idx) {
        return (
          data[idx] >= 255 - tolerance &&
          data[idx + 1] >= 255 - tolerance &&
          data[idx + 2] >= 255 - tolerance
        );
      }

      const visited = new Uint8Array(w * h);
      const queue = [];
      const cornerCoords = [0, w - 1, (h - 1) * w, (h - 1) * w + (w - 1)];

      cornerCoords.forEach((pos) => {
        if (isWhiteBg(pos * 4)) {
          visited[pos] = 1;
          queue.push(pos);
        }
      });

      // Flood-fill inward from four corners
      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++];
        const cx = curr % w;
        const cy = Math.floor(curr / w);
        const pIdx = curr * 4;

        data[pIdx + 3] = 0; // Make connected white pixel transparent

        // Check 4-connected neighbors
        const nList = [];
        if (cx > 0) nList.push(curr - 1);
        if (cx < w - 1) nList.push(curr + 1);
        if (cy > 0) nList.push(curr - w);
        if (cy < h - 1) nList.push(curr + w);

        for (let i = 0; i < nList.length; i++) {
          const n = nList[i];
          if (!visited[n]) {
            visited[n] = 1;
            if (isWhiteBg(n * 4)) {
              queue.push(n);
            }
          }
        }
      }

      // Soften edge: remaining pixels touching transparent pixels have alpha reduced by ~35%
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          if (data[idx + 3] > 0) {
            const hasTransparentNeighbor =
              data[((y - 1) * w + x) * 4 + 3] === 0 ||
              data[((y + 1) * w + x) * 4 + 3] === 0 ||
              data[(y * w + (x - 1)) * 4 + 3] === 0 ||
              data[(y * w + (x + 1)) * 4 + 3] === 0;

            if (hasTransparentNeighbor) {
              data[idx + 3] = Math.round(data[idx + 3] * 0.65);
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      imgEl.src = canvas.toDataURL("image/png");
      onReady();
    } catch (err) {
      console.warn("Transparency fallback error, showing original:", err);
      onReady();
    }
  }

  if (imgEl.complete && imgEl.naturalWidth > 0) {
    process();
  } else {
    imgEl.addEventListener("load", process, { once: true });
    imgEl.addEventListener("error", () => onReady(), { once: true });
  }
}

/**
 * Injects content from SITE_CONTENT into the DOM
 */
function populateSiteContent() {
  const logoEl = document.querySelector(".nav__logo");
  if (logoEl) logoEl.textContent = SITE_CONTENT.brand.name;

  const navLinks = document.querySelectorAll(".nav__link");
  if (navLinks.length >= SITE_CONTENT.navigation.length) {
    SITE_CONTENT.navigation.forEach((item, idx) => {
      navLinks[idx].textContent = item.label;
      navLinks[idx].setAttribute("href", item.href);
    });
  }

  const titleLeft = document.getElementById("hero-title-left");
  if (titleLeft) titleLeft.textContent = SITE_CONTENT.hero.headlineLeft;

  const titleRight = document.getElementById("hero-title-right");
  if (titleRight) titleRight.textContent = SITE_CONTENT.hero.headlineRight;

  const subtextLeft = document.getElementById("hero-subtext-left");
  if (subtextLeft) subtextLeft.textContent = SITE_CONTENT.hero.subtextLeft;

  const subtextRight = document.getElementById("hero-subtext-right");
  if (subtextRight) subtextRight.textContent = SITE_CONTENT.hero.subtextRight;

  const projectRows = document.querySelectorAll(".project-row");
  projectRows.forEach((row, index) => {
    const proj = SITE_CONTENT.projects[index];
    if (!proj) return;
    const titleEl = row.querySelector(".project-info__title");
    const descEl = row.querySelector(".project-info__desc");
    const linkEl = row.querySelector(".project-info__link");
    const imgEl = row.querySelector(".project-card__img");

    if (titleEl) titleEl.textContent = proj.title;
    if (descEl) descEl.textContent = proj.description;
    if (linkEl) {
      linkEl.href = proj.url || "#";
      linkEl.innerHTML = `${proj.linkText || "View project"} <span class="project-info__arrow" aria-hidden="true">&rarr;</span>`;
    }
    if (imgEl && proj.image) {
      imgEl.src = proj.image;
      imgEl.alt = proj.alt || proj.title;
    }
  });

  const statementTitle = document.getElementById("statement-title");
  if (statementTitle) statementTitle.textContent = SITE_CONTENT.remainingBody.statement;

  const statementText = document.getElementById("statement-text");
  if (statementText) statementText.textContent = SITE_CONTENT.remainingBody.paragraph;

  const footerLogo = document.querySelector(".footer-logo");
  if (footerLogo) footerLogo.textContent = SITE_CONTENT.brand.name;

  const footerSentence = document.querySelector(".footer-sentence");
  if (footerSentence) footerSentence.textContent = SITE_CONTENT.footer.description;

  const footerPagesList = document.getElementById("footer-pages-list");
  if (footerPagesList) {
    footerPagesList.innerHTML = SITE_CONTENT.footer.pages
      .map((item) => `<li><a href="${item.href}" class="footer-link">${item.label}</a></li>`)
      .join("");
  }

  const footerSocialList = document.getElementById("footer-social-list");
  if (footerSocialList) {
    footerSocialList.innerHTML = SITE_CONTENT.footer.social
      .map((item) => `<li><a href="${item.href}" class="footer-link">${item.label}</a></li>`)
      .join("");
  }

  const copyrightYear = document.getElementById("copyright-year");
  if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

  const copyrightText = document.getElementById("copyright-text");
  if (copyrightText) copyrightText.textContent = ` © ${new Date().getFullYear()} ${SITE_CONTENT.footer.copyrightName}`;

  const needSelect = document.getElementById("field-need");
  if (needSelect) {
    needSelect.innerHTML = SITE_CONTENT.contact.options
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");
  }
}

/**
 * Thin scroll progress indicator at top of page
 */
function setupScrollProgress() {
  const progressBar = document.getElementById("scroll-progress");
  if (!progressBar) return;

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight > 0) {
      const percentage = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

/**
 * Section 1: Hero entrance and floating physics simulation
 */
function setupHeroInteractions(prefersReducedMotion) {
  const nav = document.querySelector(".site-header");
  const headlineLeft = document.querySelector(".hero__headline-col--left");
  const headlineRight = document.querySelector(".hero__headline-col--right");
  const character = document.querySelector(".hero__character-img");
  const characterWrapper = document.querySelector(".hero__character-wrapper");
  const figure = document.querySelector(".hero__figure") || character;
  const shadow = document.querySelector(".hero__shadow");
  const scrollHint = document.querySelector(".hero__scroll-hint");

  if (!character || !shadow) return;

  if (prefersReducedMotion) {
    if (nav) nav.style.opacity = "1";
    if (headlineLeft) headlineLeft.style.opacity = "1";
    if (headlineRight) headlineRight.style.opacity = "1";
    if (characterWrapper) characterWrapper.style.opacity = "1";
    if (figure) figure.style.opacity = "1";
    if (shadow) shadow.style.opacity = "1";
    return;
  }

  if (typeof gsap !== "undefined") {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.fromTo(nav, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo([headlineLeft, headlineRight], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.3")
      .fromTo(characterWrapper, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
      .fromTo(shadow, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.8 }, "-=0.7")
      .fromTo(scrollHint, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.3");

    // Float loop (about 14px up and down, 5 to 6s, sine ease-in-out, 1deg rotation) applied to figure
    gsap.to(figure, {
      y: -14,
      rotation: 1,
      duration: 2.7,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    // In-sync floor shadow breathing: shrinks & lightens as figure rises, darkens as it descends
    gsap.to(shadow, {
      scaleX: 0.82,
      scaleY: 0.82,
      opacity: 0.2,
      duration: 2.7,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
  }
}

/**
 * Section 2: Project card entrance on scroll
 */
function setupProjectEntrance(prefersReducedMotion) {
  if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const rows = document.querySelectorAll(".project-row");
  rows.forEach((row) => {
    const card = row.querySelector(".project-card");
    const isLeft = row.classList.contains("project-row--left");
    const xOffset = isLeft ? -50 : 50;

    gsap.fromTo(
      card,
      { opacity: 0, x: xOffset },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: row,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  });
}

/**
 * Helper to compute an element's offset geometry relative to an ancestor wrapper.
 * Traverses offsetParent without getBoundingClientRect to remain completely unaffected by transforms.
 */
function getOffsetRectRelativeTo(el, wrapper) {
  let left = 0;
  let top = 0;
  let curr = el;
  while (curr && curr !== wrapper) {
    left += curr.offsetLeft;
    top += curr.offsetTop;
    curr = curr.offsetParent;
  }
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height
  };
}

/**
 * FIX 2: CHAINS & COLLARS REBUILD
 * Straight fine chains between neighboring cards inside .projects-wrapper.
 * 1. S.y = upper.bottom, E.y = lower.top (no vertical offset).
 *    S.x = upperIsLeft ? upper.right - 32 : upper.left + 32.
 *    E.x = lowerIsRight ? lower.left + (isDesktop ? 56 : 32) : lower.right - (isDesktop ? 56 : 32).
 * 2. L = distance S to E, d = unit vector from S to E, angle = -atan2(E.x - S.x, E.y - S.y) in degrees.
 *    P0 = S + 14 * d, P1 = E - 14 * d, Lp = L - 28.
 *    Chain div at left = P0.x - 20, top = P0.y, width = 40, height = Lp, transform-origin = 20px 0, rotate(angle deg).
 *    SVG viewBox "0 0 40 Lp", width 40, height Lp.
 *    Odd link count: n = 2 * max(1, round(Lp / 40)) + 1, pitch = Lp / (n - 1).
 *    Link i: #link-narrow when even, #link-wide when odd, transform translate(20 {i * pitch}) scale(LINK_SCALE).
 * 3. Collars: metal collars centred on S and E, sitting half on card and half outside (z-index: 4).
 * 4. Layering: cards z-index 2, chain z-index 3, collars z-index 4.
 * 5. Animation: sway amplitude 0.8 degrees, tug 2px. Collars fade in over 0.2s at timeline start.
 */
let activeChainTweens = [];
let activeChainTriggers = [];

function setupChains(prefersReducedMotion) {
  const wrapper = document.getElementById("projects-wrapper");
  if (!wrapper) return;

  function constructAllChains() {
    // Kill previous GSAP animations and remove previous chain and collar DOM elements
    activeChainTweens.forEach((t) => t.kill());
    activeChainTriggers.forEach((tr) => tr.kill());
    activeChainTweens = [];
    activeChainTriggers = [];

    wrapper.querySelectorAll(".chain, .chain-collar").forEach((el) => el.remove());

    const rows = Array.from(wrapper.querySelectorAll(".project-row"));
    if (rows.length < 2) return;

    const isDesktop = !window.matchMedia("(max-width: 899px)").matches;

    // Connect Card i to Card i+1 (exactly 4 chains for 5 cards)
    for (let i = 0; i < rows.length - 1; i++) {
      const upperRow = rows[i];
      const lowerRow = rows[i + 1];
      const upperCard = upperRow.querySelector(".project-card");
      const lowerCard = lowerRow.querySelector(".project-card");

      if (!upperCard || !lowerCard) continue;

      const upper = getOffsetRectRelativeTo(upperCard, wrapper);
      const lower = getOffsetRectRelativeTo(lowerCard, wrapper);

      const upperIsLeft = upperRow.classList.contains("project-row--left");
      const lowerIsRight = lowerRow.classList.contains("project-row--right");

      // 1. END POINTS: exact card edge attachments with no vertical offset
      const S = {
        x: upperIsLeft ? upper.right - 32 : upper.left + 32,
        y: upper.bottom
      };

      const E = {
        x: lowerIsRight
          ? lower.left + (isDesktop ? 56 : 32)
          : lower.right - (isDesktop ? 56 : 32),
        y: lower.top
      };

      // 2. CHAIN PLACEMENT
      const dxRaw = E.x - S.x;
      const dyRaw = E.y - S.y;
      const L = Math.hypot(dxRaw, dyRaw);
      if (L <= 28) continue;

      const dx = dxRaw / L;
      const dy = dyRaw / L;
      const angle = -Math.atan2(dxRaw, dyRaw) * (180 / Math.PI);

      const P0 = {
        x: S.x + 14 * dx,
        y: S.y + 14 * dy
      };
      const Lp = L - 28;

      // Create chain div (z-index: 3)
      const chainDiv = document.createElement("div");
      chainDiv.className = "chain";
      chainDiv.style.position = "absolute";
      chainDiv.style.left = `${P0.x - 20}px`;
      chainDiv.style.top = `${P0.y}px`;
      chainDiv.style.width = "40px";
      chainDiv.style.height = `${Lp}px`;
      chainDiv.style.transformOrigin = "20px 0";
      chainDiv.style.transform = `rotate(${angle}deg)`;
      chainDiv.style.overflow = "visible";
      chainDiv.style.pointerEvents = "none";
      chainDiv.style.zIndex = "3"; // Cards 2, Chain 3, Collars 4

      // Inner sway container
      const swayDiv = document.createElement("div");
      swayDiv.className = "chain__sway";
      swayDiv.style.transformOrigin = "20px 0";
      swayDiv.style.width = "40px";
      swayDiv.style.height = `${Lp}px`;

      // SVG holding straight chain links
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "40");
      svg.setAttribute("height", `${Lp}`);
      svg.setAttribute("viewBox", `0 0 40 ${Lp}`);
      svg.style.overflow = "visible";

      // Odd number of links so both ends are narrow
      const n = 2 * Math.max(1, Math.round(Lp / 40)) + 1;
      const pitch = Lp / (n - 1);

      const linkElements = [];
      for (let j = 0; j < n; j++) {
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        const linkHref = j % 2 === 0 ? "#link-narrow" : "#link-wide";
        use.setAttribute("href", linkHref);
        use.setAttribute("xlink:href", linkHref);
        use.setAttribute("transform", `translate(20 ${j * pitch}) scale(${LINK_SCALE})`);
        svg.appendChild(use);
        linkElements.push(use);
      }

      swayDiv.appendChild(svg);
      chainDiv.appendChild(swayDiv);
      wrapper.appendChild(chainDiv);

      // 3. COLLARS: small metal collars centred on S and E (z-index: 4)
      function createCollar(point) {
        const collar = document.createElement("div");
        collar.className = "chain-collar";
        collar.style.position = "absolute";
        collar.style.left = `${point.x - 9}px`;
        collar.style.top = `${point.y - 6}px`;
        collar.style.width = "18px";
        collar.style.height = "12px";
        collar.style.pointerEvents = "none";
        collar.style.zIndex = "4";
        collar.innerHTML = '<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0.75" y="0.75" width="16.5" height="10.5" rx="4" fill="url(#metal)" stroke="#2a2a2a" stroke-width="1.5"/><rect x="3" y="2" width="12" height="2.2" rx="1.1" fill="#fff" opacity=".4"/><circle cx="9" cy="6.8" r="1.4" fill="#2a2a2a"/></svg>';
        return collar;
      }

      const collarS = createCollar(S);
      const collarE = createCollar(E);
      wrapper.appendChild(collarS);
      wrapper.appendChild(collarE);

      // Reduced motion or missing libraries: display collars and fully built chain still
      if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        collarS.style.opacity = "1";
        collarE.style.opacity = "1";
        linkElements.forEach((el, idx) => {
          el.style.opacity = "1";
          el.setAttribute("transform", `translate(20 ${idx * pitch}) scale(${LINK_SCALE})`);
        });
        continue;
      }

      // 5. ANIMATION: sway amplitude 0.8 degrees, tug 2px, collars fade in over 0.2s
      let tugged = false;
      let swayTween = null;

      function startSway() {
        if (swayTween) return;
        swayTween = gsap.fromTo(
          swayDiv,
          { rotation: -0.8 },
          {
            rotation: 0.8,
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            transformOrigin: "20px 0"
          }
        );
        activeChainTweens.push(swayTween);
      }

      function triggerTug() {
        if (tugged) return;
        tugged = true;

        const tugTween = gsap.to(swayDiv, {
          y: 2,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
          onComplete: () => {
            startSway();
          }
        });
        activeChainTweens.push(tugTween);

        const cardTween = gsap.to([upperCard, lowerCard], {
          y: "+=2",
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut"
        });
        activeChainTweens.push(cardTween);
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: chainDiv,
          start: "top 85%",
          end: "bottom 60%",
          scrub: 0.6,
          onUpdate: (self) => {
            if (self.progress >= 0.99 && !tugged) {
              triggerTug();
            }
          }
        }
      });

      // Collars fade in over 0.2s at the start of the build timeline
      tl.fromTo(
        [collarS, collarE],
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "none" },
        0
      );

      tl.fromTo(
        linkElements,
        {
          opacity: 0,
          y: (k) => k * pitch - 12
        },
        {
          opacity: 1,
          y: (k) => k * pitch,
          stagger: 0.05,
          ease: "none"
        },
        0
      );

      activeChainTweens.push(tl);
      if (tl.scrollTrigger) {
        activeChainTriggers.push(tl.scrollTrigger);
      }
    }
  }

  constructAllChains();

  // FIX 2.E: Recalculate everything after fonts & images load, on resize, and with ResizeObserver
  window.addEventListener("load", () => {
    constructAllChains();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });

  if (document.fonts) {
    document.fonts.ready.then(() => {
      constructAllChains();
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      constructAllChains();
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    }, 100);
  });

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      constructAllChains();
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    });
    ro.observe(wrapper);
  }
}

/**
 * Section 4: Remaining body entrance animation (0.1s delay between statement and paragraph)
 */
function setupStatementEntrance(prefersReducedMotion) {
  if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  const section = document.getElementById("statement");
  const title = document.getElementById("statement-title");
  const text = document.getElementById("statement-text");

  if (!section || !title || !text) return;

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  })
    .fromTo(title, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
    .fromTo(text, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "+=0.1");
}

/**
 * FIX 3: Paper Stack Entrance Animation
 * When footer enters screen, paper stack drops in over 0.9s from translateY(48px), rotate(3deg) and opacity 0
 */
function setupPaperAnimation(prefersReducedMotion) {
  const paperStack = document.getElementById("paper-stack");
  const footer = document.querySelector(".site-footer");
  if (!paperStack || !footer) return;

  if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    paperStack.style.opacity = "1";
    paperStack.style.transform = "none";
    return;
  }

  gsap.fromTo(
    paperStack,
    {
      opacity: 0,
      y: 48,
      rotation: 3
    },
    {
      opacity: 1,
      y: 0,
      rotation: 0,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footer,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    }
  );
}

/**
 * Section 6: Contact form validation, floating labels & submission
 */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const successState = document.getElementById("contact-success");
  if (!form) return;

  const nameInput = document.getElementById("field-name");
  const emailInput = document.getElementById("field-email");
  const needSelect = document.getElementById("field-need");
  const messageInput = document.getElementById("field-message");
  const botTrap = document.getElementById("field-trap");
  const submitBtn = document.getElementById("form-submit-btn");

  const inputs = [nameInput, emailInput, needSelect, messageInput];
  inputs.forEach((input) => {
    if (!input) return;

    function checkActive() {
      const parent = input.closest(".floating-group");
      if (!parent) return;
      if (input.value && input.value.trim().length > 0) {
        parent.classList.add("is-active");
      } else {
        parent.classList.remove("is-active");
      }
    }

    input.addEventListener("input", checkActive);
    input.addEventListener("change", checkActive);
    input.addEventListener("focus", () => {
      const parent = input.closest(".floating-group");
      if (parent) parent.classList.add("is-active");
    });
    input.addEventListener("blur", checkActive);
    checkActive();
  });

  function validateField(input, errorId, validatorFn, errorMessage) {
    const errorEl = document.getElementById(errorId);
    const isValid = validatorFn(input.value.trim());

    if (!isValid) {
      if (errorEl) {
        errorEl.textContent = errorMessage;
        errorEl.classList.add("is-visible");
      }
      return false;
    } else {
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.remove("is-visible");
      }
      return true;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (botTrap && botTrap.value.trim().length > 0) {
      console.warn("Spam submission prevented.");
      return;
    }

    const isNameValid = validateField(
      nameInput,
      "error-name",
      (val) => val.length > 0,
      "Please enter your full name."
    );

    const isEmailValid = validateField(
      emailInput,
      "error-email",
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email address."
    );

    const isMessageValid = validateField(
      messageInput,
      "error-message",
      (val) => val.length >= 10,
      "Please provide at least 10 characters."
    );

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending... <span aria-hidden="true">&rarr;</span>';

    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      need: needSelect.value,
      message: messageInput.value.trim()
    };

    submitForm(formData);

    setTimeout(() => {
      form.style.display = "none";
      if (successState) {
        successState.classList.add("is-visible");
      }
    }, 700);
  });
}

/**
 * Smooth scrolling for navigation and back-to-top links
 */
function setupSmoothScroll() {
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}
