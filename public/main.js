/**
 * ==========================================================================
 * Kinetic Portfolio & Zigzag Showcase - Main Script
 * ==========================================================================
 */

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

  // FIX A.2: Execute background-removal fallback on character before reveal animation
  const characterImg = document.querySelector(".hero__character-img");
  prepareCharacterImage(characterImg, () => {
    setupHeroInteractions(prefersReducedMotion);
  });

  setupProjectEntrance(prefersReducedMotion);
  setupChains(prefersReducedMotion);
  setupStatementEntrance(prefersReducedMotion);
  setupContactForm();
  setupSmoothScroll();
});

/**
 * FIX A.2: Automatic background-removal fallback
 * Draws character onto canvas, averages 4 corners, flood-fills background to transparent,
 * softens halo edges, and removes baked-in floor shadow under feet.
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

      // Read average colour of 4 corner pixels
      let rSum = 0, gSum = 0, bSum = 0;
      cIndices.forEach((idx) => {
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
      });
      const bgR = rSum / 4;
      const bgG = gSum / 4;
      const bgB = bSum / 4;

      const tolerance = 28;
      const visited = new Uint8Array(w * h);
      const queue = [0, w - 1, (h - 1) * w, (h - 1) * w + (w - 1)];
      visited[0] = 1;
      visited[w - 1] = 1;
      visited[(h - 1) * w] = 1;
      visited[(h - 1) * w + (w - 1)] = 1;

      function matchesBg(idx) {
        const dr = Math.abs(data[idx] - bgR);
        const dg = Math.abs(data[idx + 1] - bgG);
        const db = Math.abs(data[idx + 2] - bgB);
        return dr <= tolerance && dg <= tolerance && db <= tolerance;
      }

      // Check baked-in ground shadow near bottom
      const floorThresholdY = Math.floor(h * 0.76);
      function isFloorShadowPixel(cy, idx) {
        if (cy < floorThresholdY) return false;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const maxChroma = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        const diffR = bgR - r;
        const diffG = bgG - g;
        const diffB = bgB - b;
        return maxChroma < 26 && diffR >= -12 && diffR < 70 && diffG >= -12 && diffG < 70 && diffB >= -12 && diffB < 70;
      }

      // Flood-fill inward from all four corners
      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++];
        const cx = curr % w;
        const cy = Math.floor(curr / w);
        const pIdx = curr * 4;

        data[pIdx + 3] = 0; // Set reached pixel transparent

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
            const ny = Math.floor(n / w);
            const nIdx = n * 4;
            if (matchesBg(nIdx) || isFloorShadowPixel(ny, nIdx)) {
              queue.push(n);
            }
          }
        }
      }

      // Soften edge: remaining pixels touching transparent pixels have alpha reduced by 40%
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
              data[idx + 3] = Math.round(data[idx + 3] * 0.6);
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
  const shadow = document.querySelector(".hero__shadow");
  const scrollHint = document.querySelector(".hero__scroll-hint");

  if (!character || !shadow) return;

  if (prefersReducedMotion) {
    if (nav) nav.style.opacity = "1";
    if (headlineLeft) headlineLeft.style.opacity = "1";
    if (headlineRight) headlineRight.style.opacity = "1";
    if (characterWrapper) characterWrapper.style.opacity = "1";
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

    // Float loop (about 14px up and down, 5 to 6s, sine ease-in-out, 1deg rotation)
    gsap.to(character, {
      y: -14,
      rotation: 1,
      duration: 2.7,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    // In-sync floor shadow breathing: shrinks & lightens as character rises, darkens as it descends
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
 * FIX B: REAL, CLEARLY READABLE METAL CHAINS
 * Builds exactly 4 hanging chains with 26x44px alternating face-on and edge-on links,
 * true over-under interlocking via clipPath, SVG metal gradient, and end anchors.
 */
let chainInstances = [];

function setupChains(prefersReducedMotion) {
  const container = document.getElementById("projects-section");
  const svgLayer = document.getElementById("chains-layer");
  if (!container || !svgLayer) return;

  function constructAllChains() {
    chainInstances.forEach((inst) => {
      if (inst.trigger) inst.trigger.kill();
      if (inst.swayTween) inst.swayTween.kill();
    });
    chainInstances = [];
    svgLayer.innerHTML = "";

    // Inject Shared SVG Definitions (linearGradient, dropShadow, clipPaths)
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Metal Linear Gradient
    const metalGrad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    metalGrad.setAttribute("id", "chain-metal-grad");
    metalGrad.setAttribute("x1", "0%");
    metalGrad.setAttribute("y1", "0%");
    metalGrad.setAttribute("x2", "0%");
    metalGrad.setAttribute("y2", "100%");
    metalGrad.innerHTML = `
      <stop offset="0%" stop-color="#4A4A4A"/>
      <stop offset="35%" stop-color="#C2C2C2"/>
      <stop offset="70%" stop-color="#808080"/>
      <stop offset="100%" stop-color="#555555"/>
    `;
    defs.appendChild(metalGrad);

    // Filter for soft 2px drop shadow
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "chain-shadow");
    filter.setAttribute("x", "-20%");
    filter.setAttribute("y", "-20%");
    filter.setAttribute("width", "140%");
    filter.setAttribute("height", "140%");
    filter.innerHTML = `<feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#1A1918" flood-opacity="0.28"/>`;
    defs.appendChild(filter);

    svgLayer.appendChild(defs);

    const rows = Array.from(document.querySelectorAll(".project-row"));
    if (rows.length < 2) return;

    const containerRect = container.getBoundingClientRect();
    const isMobile = window.innerWidth <= 900;

    svgLayer.setAttribute("width", `${containerRect.width}`);
    svgLayer.setAttribute("height", `${containerRect.height}`);
    svgLayer.setAttribute("viewBox", `0 0 ${containerRect.width} ${containerRect.height}`);

    // Build exactly 4 chains connecting the 5 neighboring cards
    for (let i = 0; i < rows.length - 1; i++) {
      const upperRow = rows[i];
      const lowerRow = rows[i + 1];
      const upperCard = upperRow.querySelector(".project-card");
      const lowerCard = lowerRow.querySelector(".project-card");

      if (!upperCard || !lowerCard) continue;

      const upperRect = upperCard.getBoundingClientRect();
      const lowerRect = lowerCard.getBoundingClientRect();

      let x1, y1, x2, y2;

      if (isMobile) {
        // Vertical chain under 900px
        x1 = upperRect.left + upperRect.width / 2 - containerRect.left;
        y1 = upperRect.bottom - containerRect.top;
        x2 = lowerRect.left + lowerRect.width / 2 - containerRect.left;
        y2 = lowerRect.top - containerRect.top;
      } else {
        // Desktop: bottom corner of upper card facing page centre to top edge of lower card
        const upperIsLeft = upperRow.classList.contains("project-row--left");
        if (upperIsLeft) {
          x1 = upperRect.right - containerRect.left;
          y1 = upperRect.bottom - containerRect.top;
          // Arrives near top-left of lower card
          x2 = lowerRect.left + 54 - containerRect.left;
          y2 = lowerRect.top - containerRect.top;
        } else {
          x1 = upperRect.left - containerRect.left;
          y1 = upperRect.bottom - containerRect.top;
          // Arrives near top-right of lower card
          x2 = lowerRect.right - 54 - containerRect.left;
          y2 = lowerRect.top - containerRect.top;
        }
      }

      const chainData = createInterlockingChain(svgLayer, defs, x1, y1, x2, y2, i);

      if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        chainData.linkUnits.forEach((u) => {
          u.style.opacity = "1";
          u.style.transform = "none";
        });
        continue;
      }

      // FIX B.7 & B.8: Chain fully completes before user scrolls past it (top 95% to top 55%)
      let hasTugged = false;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: lowerRow,
          start: "top 95%",
          end: "top 55%",
          scrub: 0.35,
          onUpdate: (self) => {
            if (self.progress >= 0.98 && !hasTugged) {
              hasTugged = true;
              triggerTugEffect(chainData.group, upperCard, lowerCard);
            } else if (self.progress < 0.7) {
              hasTugged = false;
            }
          }
        }
      });

      // Links drop 12px into place while fading in
      tl.fromTo(
        chainData.linkUnits,
        { opacity: 0, y: -12 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 1,
          ease: "none"
        }
      );

      // Sway whole chain as one rigid unit (1.5 deg, 4s, pivoting at top anchor)
      const swayTween = gsap.to(chainData.group, {
        rotation: 1.5,
        transformOrigin: `${x1}px ${y1}px`,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      chainInstances.push({ trigger: tl.scrollTrigger, swayTween });
    }
  }

  constructAllChains();

  // FIX B.8: Recalculate after images and fonts load, on resize, and with ResizeObserver
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
    }, 120);
  });

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      constructAllChains();
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    });
    ro.observe(container);
    const allRows = document.querySelectorAll(".project-row");
    allRows.forEach((r) => ro.observe(r));
  }
}

/**
 * Step 2 of Chain Animation:
 * Quick tug (3px drop & bounce back) and both cards move 2px and settle
 */
function triggerTugEffect(chainGroup, upperCard, lowerCard) {
  if (typeof gsap === "undefined") return;

  gsap.to(chainGroup, {
    y: "+=3",
    duration: 0.12,
    yoyo: true,
    repeat: 1,
    ease: "power1.inOut"
  });

  gsap.to([upperCard, lowerCard], {
    y: "+=2",
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: "power1.inOut"
  });
}

/**
 * FIX B: Mathematical curve & realistic interlocking metal chain builder
 * - Curve with ~6% sag, arriving nearly straight down at lower card
 * - Links 26px wide by 44px long, spacing ~31px
 * - Alternating Face-On oval rings & Edge-On capsules
 * - Over-under interlocking layers using clipPath
 * - Metal gradient, highlight line, 10px end anchors, and 2px drop shadow
 */
function createInterlockingChain(svgLayer, defs, x1, y1, x2, y2, chainIndex) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const sag = dist * 0.06;

  // Cubic Bezier: starts outward, sags with weight, arrives going straight down at (x2, y2)
  const c1x = x1 + (x2 - x1) * 0.35;
  const c1y = y1 + sag + (y2 - y1) * 0.2;
  const c2x = x2;
  const c2y = y2 - Math.max(35, (y2 - y1) * 0.45);

  function bezierPt(t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    const px = mt3 * x1 + 3 * mt2 * t * c1x + 3 * mt * t2 * c2x + t3 * x2;
    const py = mt3 * y1 + 3 * mt2 * t * c1y + 3 * mt * t2 * c2y + t3 * y2;

    // First derivative for tangent
    const dx = 3 * mt2 * (c1x - x1) + 6 * mt * t * (c2x - c1x) + 3 * t2 * (x2 - c2x);
    const dy = 3 * mt2 * (c1y - y1) + 6 * mt * t * (c2y - c1y) + 3 * t2 * (y2 - c2y);

    return { x: px, y: py, dx, dy };
  }

  // Pre-sample curve for accurate arc length parameterization
  const SAMPLES = 300;
  const arcLengths = [0];
  let prevPt = bezierPt(0);

  for (let s = 1; s <= SAMPLES; s++) {
    const t = s / SAMPLES;
    const curPt = bezierPt(t);
    const segDist = Math.hypot(curPt.x - prevPt.x, curPt.y - prevPt.y);
    arcLengths.push(arcLengths[s - 1] + segDist);
    prevPt = curPt;
  }

  const totalLength = arcLengths[SAMPLES];

  // Spacing: center-to-center ~31px
  const targetSpacing = 31;
  const numSteps = Math.max(4, Math.round(totalLength / targetSpacing));
  const actualSpacing = totalLength / numSteps;

  function getPointAtDist(d) {
    const target = Math.min(totalLength, Math.max(0, d));
    // Binary search sample index
    let low = 0, high = SAMPLES;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (arcLengths[mid] < target) low = mid + 1;
      else high = mid;
    }
    const idx = Math.max(1, low);
    const segLen = arcLengths[idx] - arcLengths[idx - 1];
    const frac = segLen > 0 ? (target - arcLengths[idx - 1]) / segLen : 0;
    const t = (idx - 1 + frac) / SAMPLES;
    return bezierPt(t);
  }

  // Main group for whole chain with soft 2px drop shadow
  const chainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  chainGroup.setAttribute("class", "chain-svg-group");
  chainGroup.setAttribute("id", `chain-group-${chainIndex}`);
  chainGroup.setAttribute("filter", "url(#chain-shadow)");

  // ClipPaths for over-under interlocking (front half vs back half of face-on rings)
  const clipBack = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  clipBack.setAttribute("id", `clip-back-${chainIndex}`);
  clipBack.innerHTML = `<rect x="-30" y="0" width="60" height="30"/>`;
  defs.appendChild(clipBack);

  const clipFront = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  clipFront.setAttribute("id", `clip-front-${chainIndex}`);
  clipFront.innerHTML = `<rect x="-30" y="-30" width="60" height="30"/>`;
  defs.appendChild(clipFront);

  const linkUnits = [];

  // Generate each link along curve (0 to numSteps)
  for (let k = 0; k <= numSteps; k++) {
    const pt = getPointAtDist(k * actualSpacing);
    const angleRad = Math.atan2(pt.dy, pt.dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    // Unit container for GSAP staggered drop animation
    const unitG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    unitG.setAttribute("class", "chain-link-unit");

    const isFaceOn = k % 2 === 1;

    if (!isFaceOn) {
      // EVEN: EDGE-ON solid capsule (8px wide by 40px long, turned 90 deg)
      const edgeG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      edgeG.setAttribute("transform", `translate(${pt.x}, ${pt.y}) rotate(${angleDeg})`);

      const capsule = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      capsule.setAttribute("x", "-4");
      capsule.setAttribute("y", "-20");
      capsule.setAttribute("width", "8");
      capsule.setAttribute("height", "40");
      capsule.setAttribute("rx", "4");
      capsule.setAttribute("fill", "url(#chain-metal-grad)");
      capsule.setAttribute("stroke", "#222222");
      capsule.setAttribute("stroke-width", "1");

      const edgeHighlight = document.createElementNS("http://www.w3.org/2000/svg", "line");
      edgeHighlight.setAttribute("x1", "-1");
      edgeHighlight.setAttribute("y1", "-16");
      edgeHighlight.setAttribute("x2", "-1");
      edgeHighlight.setAttribute("y2", "16");
      edgeHighlight.setAttribute("stroke", "rgba(255,255,255,0.75)");
      edgeHighlight.setAttribute("stroke-width", "1");

      edgeG.appendChild(capsule);
      edgeG.appendChild(edgeHighlight);
      unitG.appendChild(edgeG);
    } else {
      // ODD: FACE-ON hollow ring (26px wide by 44px long, stroke ~6px, see-through middle)
      // Rendered with two interlocking layers (back half and front half)
      const ringG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      ringG.setAttribute("transform", `translate(${pt.x}, ${pt.y}) rotate(${angleDeg})`);

      function createRingShape(clipId) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        if (clipId) g.setAttribute("clip-path", `url(#${clipId})`);

        // Outer oval stroke (6px thick metal ring)
        const outer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        outer.setAttribute("x", "-13");
        outer.setAttribute("y", "-22");
        outer.setAttribute("width", "26");
        outer.setAttribute("height", "44");
        outer.setAttribute("rx", "13");
        outer.setAttribute("fill", "none");
        outer.setAttribute("stroke", "url(#chain-metal-grad)");
        outer.setAttribute("stroke-width", "6");

        // Thin dark borders
        const darkOuter = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        darkOuter.setAttribute("x", "-13");
        darkOuter.setAttribute("y", "-22");
        darkOuter.setAttribute("width", "26");
        darkOuter.setAttribute("height", "44");
        darkOuter.setAttribute("rx", "13");
        darkOuter.setAttribute("fill", "none");
        darkOuter.setAttribute("stroke", "#222222");
        darkOuter.setAttribute("stroke-width", "1");

        const darkInner = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        darkInner.setAttribute("x", "-7");
        darkInner.setAttribute("y", "-16");
        darkInner.setAttribute("width", "14");
        darkInner.setAttribute("height", "32");
        darkInner.setAttribute("rx", "7");
        darkInner.setAttribute("fill", "none");
        darkInner.setAttribute("stroke", "#222222");
        darkInner.setAttribute("stroke-width", "1");

        // Top edge white highlight line
        const ringHighlight = document.createElementNS("http://www.w3.org/2000/svg", "path");
        ringHighlight.setAttribute("d", "M -8 -19 Q 0 -22 8 -19");
        ringHighlight.setAttribute("fill", "none");
        ringHighlight.setAttribute("stroke", "rgba(255,255,255,0.8)");
        ringHighlight.setAttribute("stroke-width", "1.2");

        g.appendChild(outer);
        g.appendChild(darkOuter);
        g.appendChild(darkInner);
        g.appendChild(ringHighlight);
        return g;
      }

      // Back half sits behind, front half sits in front for true over-under interlocking
      ringG.appendChild(createRingShape(`clip-back-${chainIndex}`));
      ringG.appendChild(createRingShape(`clip-front-${chainIndex}`));
      unitG.appendChild(ringG);
    }

    chainGroup.appendChild(unitG);
    linkUnits.push(unitG);
  }

  // FIX B.6: Small 10px round metal anchors where chain meets each card
  function createAnchor(cx, cy) {
    const anchorG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    anchorG.innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="5" fill="#252422" stroke="#111111" stroke-width="1.5"/>
      <circle cx="${cx - 1}" cy="${cy - 1}" r="2" fill="#88857F"/>
    `;
    return anchorG;
  }

  chainGroup.appendChild(createAnchor(x1, y1));
  chainGroup.appendChild(createAnchor(x2, y2));

  svgLayer.appendChild(chainGroup);
  return { group: chainGroup, linkUnits };
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
