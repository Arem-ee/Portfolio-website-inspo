// Order of the page's sections: 
// 1. Hero, 2. Projects (the zigzag items), 3. Remaining Body (statement section), 4. Footer (with paper form)

/**
 * ==========================================================================
 * Kinetic Portfolio & Zigzag Showcase - Main Script
 * ==========================================================================
 */

const LINK_SCALE = 0.5;

/**
 * Global Site Content from content.js (window.SITE)
 */
const SITE_CONTENT = window.SITE || {};

/**
 * Background-removal helper for character image
 */
function prepareCharacterImage(imgEl) {
  return new Promise((resolve) => {
    if (!imgEl) return resolve();

    function process() {
      try {
        const w = imgEl.naturalWidth || imgEl.width;
        const h = imgEl.naturalHeight || imgEl.height;
        if (!w || !h) return resolve();

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve();

        ctx.drawImage(imgEl, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Check corner pixel alphas to see if already transparent
        const cIndices = [
          0,
          (w - 1) * 4,
          (h - 1) * w * 4,
          ((h - 1) * w + (w - 1)) * 4
        ];
        const alreadyTransparent = cIndices.every((idx) => data[idx + 3] < 10);
        if (alreadyTransparent) {
          return resolve();
        }

        const tolerance = 18;
        function isWhiteBg(idx) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (a < 10) return false;
          return (255 - r <= tolerance) && (255 - g <= tolerance) && (255 - b <= tolerance);
        }

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        function pushPixel(px, py) {
          if (px < 0 || px >= w || py < 0 || py >= h) return;
          const i = py * w + px;
          if (visited[i]) return;
          visited[i] = 1;
          if (isWhiteBg(i * 4)) {
            queue[tail++] = i;
          }
        }

        // Seed all border pixels
        for (let x = 0; x < w; x++) {
          pushPixel(x, 0);
          pushPixel(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          pushPixel(0, y);
          pushPixel(w - 1, y);
        }

        // 4-way BFS flood-fill inward
        while (head < tail) {
          const curr = queue[head++];
          const cx = curr % w;
          const cy = Math.floor(curr / w);
          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
          ];
          for (let i = 0; i < 4; i++) {
            const nx = neighbors[i][0];
            const ny = neighbors[i][1];
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nIdx = ny * w + nx;
              if (!visited[nIdx]) {
                visited[nIdx] = 1;
                if (isWhiteBg(nIdx * 4)) {
                  queue[tail++] = nIdx;
                }
              }
            }
          }
        }

        // Mark cleared pixels
        for (let i = 0; i < tail; i++) {
          const pIdx = queue[i] * 4;
          data[pIdx + 3] = 0;
        }

        // Perimeter softening: lower alpha of pixels adjacent to cleared pixels by ~35%
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            const idx = i * 4;
            if (data[idx + 3] > 0) {
              const hasClearedNeighbor =
                data[(idx - 4) + 3] === 0 ||
                data[(idx + 4) + 3] === 0 ||
                data[(idx - w * 4) + 3] === 0 ||
                data[(idx + w * 4) + 3] === 0;

              if (hasClearedNeighbor) {
                data[idx + 3] = Math.round(data[idx + 3] * 0.65);
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        imgEl.src = canvas.toDataURL("image/png");
        try {
          imgEl.decode().then(resolve).catch(resolve);
        } catch {
          resolve();
        }
      } catch (e) {
        console.warn("Background removal error:", e);
        resolve();
      }
    }

    if (imgEl.complete && imgEl.naturalWidth !== 0) {
      process();
    } else {
      imgEl.addEventListener("load", process, { once: true });
      imgEl.addEventListener("error", resolve, { once: true });
    }
  });
}

// PART 1 - NO FLASH ON LOAD GATING
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function triggerAppInit() {
  const characterImg = document.querySelector(".hero__character-img");
  const characterReady = prepareCharacterImage(characterImg);
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  const readyTimeout = new Promise((resolve) => setTimeout(resolve, 2500));

  Promise.race([
    Promise.all([fontsReady, characterReady]),
    readyTimeout
  ]).then(() => {
    document.documentElement.classList.add("is-ready");
    requestAnimationFrame(() => {
      initLandingApp(prefersReducedMotion);
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", triggerAppInit);
} else {
  triggerAppInit();
}

/**
 * Initialize all landing page components after readiness gate
 */
function initLandingApp(prefersReducedMotion) {
  populateSiteContent();
  setupScrollProgress();
  setupHeroInteractions(prefersReducedMotion);
  setupProjectEntrance(prefersReducedMotion);
  setupChainsLifecycle(prefersReducedMotion);
  setupStatementEntrance(prefersReducedMotion);
  initContactForm(prefersReducedMotion);
  setupSmoothScroll();
  setupProjectTransitions(prefersReducedMotion);
}

/**
 * Populate dynamic placeholder data from content.js
 */
function populateSiteContent() {
  const brand = SITE_CONTENT.brand || {};
  const hero = SITE_CONTENT.hero || {};
  const remaining = SITE_CONTENT.remainingBody || {};
  const projects = SITE_CONTENT.projects || [];
  const footer = SITE_CONTENT.footer || {};

  const logo = document.querySelector(".nav__logo");
  if (logo && brand.name) {
    logo.textContent = brand.name;
    document.title = brand.name;
  }

  const footerLogo = document.querySelector(".footer-logo");
  if (footerLogo && brand.name) {
    footerLogo.textContent = brand.name;
  }

  const footerSentence = document.querySelector(".footer-sentence");
  if (footerSentence && footer.description) {
    footerSentence.textContent = footer.description;
  }

  const copyrightText = document.getElementById("copyright-text");
  if (copyrightText && brand.name) {
    const year = new Date().getFullYear();
    copyrightText.innerHTML = `&copy; <span id="copyright-year">${year}</span> ${footer.copyrightName || `${brand.name}. All rights reserved.`}`;
  }

  const hTitleLeft = document.getElementById("hero-title-left");
  const hTitleRight = document.getElementById("hero-title-right");
  const hSubLeft = document.getElementById("hero-subtext-left");
  const hSubRight = document.getElementById("hero-subtext-right");

  if (hTitleLeft && hero.headlineLeft) hTitleLeft.textContent = hero.headlineLeft;
  if (hTitleRight && hero.headlineRight) hTitleRight.textContent = hero.headlineRight;
  if (hSubLeft && hero.subtextLeft) hSubLeft.textContent = hero.subtextLeft;
  if (hSubRight && hero.subtextRight) hSubRight.textContent = hero.subtextRight;

  const stTitle = document.getElementById("statement-title");
  const stText = document.getElementById("statement-text");
  if (stTitle && remaining.statement) stTitle.textContent = remaining.statement;
  if (stText && remaining.paragraph) stText.textContent = remaining.paragraph;

  const rows = document.querySelectorAll(".project-row");
  rows.forEach((row, idx) => {
    const pData = projects[idx];
    if (!pData) return;

    row.setAttribute("data-slug", pData.slug);
    const titleEl = row.querySelector(".project-info__title");
    const descEl = row.querySelector(".project-info__desc");
    const linkEl = row.querySelector(".project-info__link");
    const imgEl = row.querySelector(".project-card__img");

    if (titleEl) titleEl.textContent = pData.title;
    if (descEl) descEl.textContent = pData.summary;
    if (linkEl) {
      linkEl.href = `project.html?p=${pData.slug}`;
      linkEl.innerHTML = `View project <span class="project-info__arrow" aria-hidden="true">&rarr;</span>`;
    }
    if (imgEl && pData.image) {
      imgEl.src = pData.image;
      imgEl.alt = pData.alt || `${pData.title} overview`;
    }
  });
}

/**
 * Reading progress line synchronized with window scroll
 */
function setupScrollProgress() {
  const progressBar = document.getElementById("scroll-progress");
  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", Math.round(progress));
  }, { passive: true });
}

/**
 * Hero section animations, float loops, and responsive mouse parallax
 */
function setupHeroInteractions(prefersReducedMotion) {
  const heroWrapper = document.querySelector(".hero__character-wrapper");
  const heroFigure = document.querySelector(".hero__figure");
  const characterImg = document.querySelector(".hero__character-img");
  const catImg = document.querySelector(".hero__cat-img");
  const heroShadow = document.querySelector(".hero__shadow");
  const titleLeft = document.getElementById("hero-title-left");
  const titleRight = document.getElementById("hero-title-right");
  const subLeft = document.getElementById("hero-subtext-left");
  const subRight = document.getElementById("hero-subtext-right");
  const heroSection = document.querySelector(".hero");

  if (!heroWrapper || !heroFigure || !heroShadow) return;

  if (prefersReducedMotion || typeof gsap === "undefined") {
    gsap.set([heroWrapper, heroShadow, titleLeft, titleRight, subLeft, subRight], {
      opacity: 1,
      y: 0,
      scale: 1
    });
    return;
  }

  // Hero entrance reveal
  const introTl = gsap.timeline({ defaults: { ease: "power2.out" } });

  introTl
    .fromTo(
      heroShadow,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1.2 }
    )
    .fromTo(
      [titleLeft, titleRight],
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.15 },
      "-=0.9"
    )
    .fromTo(
      heroFigure,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" },
      "-=0.8"
    )
    .fromTo(
      [subLeft, subRight],
      { opacity: 0, y: 16 },
      { opacity: 0.8, y: 0, duration: 0.7, stagger: 0.1 },
      "-=0.5"
    );

  // Tactile floating loops for character and cat
  gsap.to(characterImg, {
    y: -8,
    duration: 3.2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  if (catImg) {
    gsap.to(catImg, {
      y: -6,
      rotation: 0.5,
      duration: 2.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 0.4
    });
  }

  gsap.to(heroShadow, {
    scaleX: 0.94,
    opacity: 0.22,
    duration: 3.2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  // Desktop subtle mouse parallax
  if (heroSection && window.innerWidth >= 900) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const xPercent = (e.clientX - rect.left) / rect.width - 0.5;
      const yPercent = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(heroWrapper, {
        x: xPercent * 14,
        y: yPercent * 10,
        duration: 0.8,
        ease: "power1.out"
      });

      gsap.to([titleLeft, titleRight], {
        x: xPercent * -6,
        duration: 0.8,
        ease: "power1.out"
      });
    });

    heroSection.addEventListener("mouseleave", () => {
      gsap.to([heroWrapper, titleLeft, titleRight], {
        x: 0,
        y: 0,
        duration: 1,
        ease: "power2.out"
      });
    });
  }
}

/**
 * Zigzag Project Rows Reveal Animation
 */
function setupProjectEntrance(prefersReducedMotion) {
  if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.querySelectorAll(".project-row").forEach((el) => {
      const card = el.querySelector(".project-card");
      const info = el.querySelector(".project-info");
      if (card) card.style.opacity = "1";
      if (info) info.style.opacity = "1";
    });
    return;
  }

  const rows = document.querySelectorAll(".project-row");
  rows.forEach((row) => {
    const card = row.querySelector(".project-card");
    const info = row.querySelector(".project-info");
    const isMobile = window.matchMedia("(max-width: 899px)").matches;
    const yDist = isMobile ? 24 : 40;

    gsap.fromTo(
      [card, info],
      { opacity: 0, y: yDist },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: row,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );
  });
}

/**
 * ==========================================================================
 * PART 2 & PART 3: REBUILT CHAIN ENGINE & LIFECYCLE
 * ==========================================================================
 */

// Global registry of chains data for window.__chainCheck
window.__chainData = [];

// Helper to compute element offsets relative to projects-wrapper
function getOffsetRelativeTo(el, ancestor) {
  let x = 0;
  let y = 0;
  let curr = el;
  while (curr && curr !== ancestor) {
    x += curr.offsetLeft;
    y += curr.offsetTop;
    curr = curr.offsetParent;
  }
  return {
    left: x,
    top: y,
    right: x + el.offsetWidth,
    bottom: y + el.offsetHeight,
    width: el.offsetWidth,
    height: el.offsetHeight
  };
}

let activeChainScrollTriggers = [];

function buildChains() {
  try {
    const wrapper = document.getElementById("projects-wrapper");
    if (!wrapper) return;

    // Clean up old chains and collars before rebuilding
    activeChainScrollTriggers.forEach((st) => st.kill());
    activeChainScrollTriggers = [];
    wrapper.querySelectorAll(".chain, .chain-collar").forEach((el) => el.remove());
    window.__chainData = [];

    const rows = Array.from(wrapper.querySelectorAll(".project-row"));
    if (rows.length < 2) return;

    const cards = rows.map((r) => r.querySelector(".project-card"));
    if (cards.some((c) => !c)) return;

    const isMobile = window.matchMedia("(max-width: 899px)").matches;
    const isNarrow = window.innerWidth < 600;
    const TILT = isNarrow ? 3 : 2;

    // Set card tilts on mobile or clear on desktop
    if (isMobile) {
      // Card 1: not tilted
      gsap.set(cards[0], { rotation: 0, clearProps: "transformOrigin" });
      // Card 2: +TILT, origin "28px 0px"
      gsap.set(cards[1], { rotation: TILT, transformOrigin: "28px 0px" });
      // Card 3: -TILT, origin (width - 28) + "px 0px"
      gsap.set(cards[2], { rotation: -TILT, transformOrigin: `${cards[2].offsetWidth - 28}px 0px` });
      // Card 4: +TILT, origin "28px 0px"
      gsap.set(cards[3], { rotation: TILT, transformOrigin: "28px 0px" });
      // Card 5: -TILT, origin (width - 28) + "px 0px"
      gsap.set(cards[4], { rotation: -TILT, transformOrigin: `${cards[4].offsetWidth - 28}px 0px` });
    } else {
      cards.forEach((card) => {
        gsap.set(card, { rotation: 0, clearProps: "transformOrigin" });
      });
    }

    const svgNS = "http://www.w3.org/2000/svg";

    // Build exactly four chains connecting neighbouring pairs
    for (let i = 1; i <= 4; i++) {
      const upperCard = cards[i - 1];
      const lowerCard = cards[i];

      const upper = getOffsetRelativeTo(upperCard, wrapper);
      const lower = getOffsetRelativeTo(lowerCard, wrapper);

      let S = { x: 0, y: 0 };
      let E = { x: 0, y: 0 };
      let upperCollarAngle = 0;
      let lowerCollarAngle = 0;

      if (isMobile) {
        // MOBILE HANGING GEOMETRY
        // E = attachment point of lower card
        E.y = lower.top;
        if (i % 2 === 1) {
          // Odd chain (1, 3): LEFT
          E.x = lower.left + 28;
        } else {
          // Even chain (2, 4): RIGHT
          E.x = lower.right - 28;
        }

        // Q = upper card bottom corner on same side
        const Q = {
          x: (i % 2 === 1) ? (upper.left + 28) : (upper.right - 28),
          y: upper.bottom
        };

        if (i === 1) {
          // Card 1 is not tilted
          S = { x: Q.x, y: Q.y };
        } else {
          // Card i >= 2 is tilted around Pu
          let Pu = { x: 0, y: upper.top };
          let cardAngleDeg = 0;

          if (i === 2) {
            // Card 2 tilted +TILT around LEFT attachment point
            Pu.x = upper.left + 28;
            cardAngleDeg = TILT;
          } else if (i === 3) {
            // Card 3 tilted -TILT around RIGHT attachment point
            Pu.x = upper.right - 28;
            cardAngleDeg = -TILT;
          } else if (i === 4) {
            // Card 4 tilted +TILT around LEFT attachment point
            Pu.x = upper.left + 28;
            cardAngleDeg = TILT;
          }

          const t = (cardAngleDeg * Math.PI) / 180;
          const dxPu = Q.x - Pu.x;
          const dyPu = Q.y - Pu.y;
          S.x = Pu.x + dxPu * Math.cos(t) - dyPu * Math.sin(t);
          S.y = Pu.y + dxPu * Math.sin(t) + dyPu * Math.cos(t);
        }

        upperCollarAngle = (i === 1) ? 0 : (i === 2 ? TILT : (i === 3 ? -TILT : TILT));
        lowerCollarAngle = (i === 1) ? TILT : (i === 2 ? -TILT : (i === 3 ? TILT : -TILT));
      } else {
        // DESKTOP GEOMETRY
        S.y = upper.bottom;
        E.y = lower.top;
        if (i % 2 === 1) {
          // Upper on left, Lower on right
          S.x = upper.right - 32;
          E.x = lower.left + 56;
        } else {
          // Upper on right, Lower on left
          S.x = upper.left + 32;
          E.x = lower.right - 56;
        }
        upperCollarAngle = 0;
        lowerCollarAngle = 0;
      }

      const dx = E.x - S.x;
      const dy = E.y - S.y;
      const L = Math.hypot(dx, dy);
      const d = { x: dx / L, y: dy / L };
      const angle = Math.atan2(dx, dy) * (180 / Math.PI);
      const P0 = { x: S.x + 14 * d.x, y: S.y + 14 * d.y };
      const Lp = L - 28;

      const n = 2 * Math.max(1, Math.round(Lp / 40)) + 1; // always odd
      const pitch = Lp / (n - 1);

      // Record geometry for window.__chainCheck
      window.__chainData.push({
        chainIndex: i,
        S,
        E,
        P0,
        L,
        Lp,
        d,
        angle,
        n,
        pitch
      });

      // Chain Div
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
      chainDiv.style.zIndex = "3";

      const swayWrapper = document.createElement("div");
      swayWrapper.className = "chain__sway";
      swayWrapper.style.transformOrigin = "20px 0";
      swayWrapper.style.overflow = "visible";

      const chainSvg = document.createElementNS(svgNS, "svg");
      chainSvg.setAttribute("width", "40");
      chainSvg.setAttribute("height", `${Lp}`);
      chainSvg.setAttribute("viewBox", `0 0 40 ${Lp}`);
      chainSvg.style.overflow = "visible";
      chainSvg.style.display = "block";

      const linkElements = [];
      for (let j = 0; j < n; j++) {
        const useEl = document.createElementNS(svgNS, "use");
        const symbolId = (j % 2 === 0) ? "#link-narrow" : "#link-wide";
        useEl.setAttribute("href", symbolId);
        useEl.setAttribute("transform", `translate(20 ${j * pitch}) scale(${LINK_SCALE})`);
        chainSvg.appendChild(useEl);
        linkElements.push({ el: useEl, baseTranslateY: j * pitch });
      }

      swayWrapper.appendChild(chainSvg);
      chainDiv.appendChild(swayWrapper);
      wrapper.appendChild(chainDiv);

      // Two Collars per chain
      const collarS = document.createElement("div");
      collarS.className = "chain-collar";
      collarS.style.left = `${S.x - 9}px`;
      collarS.style.top = `${S.y - 6}px`;
      collarS.innerHTML = '<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0.75" y="0.75" width="16.5" height="10.5" rx="4" fill="url(#metal)" stroke="#2a2a2a" stroke-width="1.5"/><rect x="3" y="2" width="12" height="2.2" rx="1.1" fill="#fff" opacity=".4"/><circle cx="9" cy="6.8" r="1.4" fill="#2a2a2a"/></svg>';

      const collarE = document.createElement("div");
      collarE.className = "chain-collar";
      collarE.style.left = `${E.x - 9}px`;
      collarE.style.top = `${E.y - 6}px`;
      collarE.innerHTML = '<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0.75" y="0.75" width="16.5" height="10.5" rx="4" fill="url(#metal)" stroke="#2a2a2a" stroke-width="1.5"/><rect x="3" y="2" width="12" height="2.2" rx="1.1" fill="#fff" opacity=".4"/><circle cx="9" cy="6.8" r="1.4" fill="#2a2a2a"/></svg>';

      gsap.set(collarS, { rotation: upperCollarAngle, transformOrigin: "50% 50%" });
      gsap.set(collarE, { rotation: lowerCollarAngle, transformOrigin: "50% 50%" });

      wrapper.appendChild(collarS);
      wrapper.appendChild(collarE);

      // Animations
      if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        gsap.set([collarS, collarE], { opacity: 1 });
        linkElements.forEach((l) => gsap.set(l.el, { opacity: 1 }));
      } else {
        // (1) Build timeline
        gsap.set([collarS, collarE], { opacity: 0 });
        linkElements.forEach((l) => {
          gsap.set(l.el, {
            opacity: 0,
            attr: { transform: `translate(20 ${l.baseTranslateY - 12}) scale(${LINK_SCALE})` }
          });
        });

        let hasTugged = false;
        function executeTug() {
          if (hasTugged) return;
          hasTugged = true;
          // chain__sway drops 2px and bounces back in 0.4s
          gsap.timeline()
            .to(swayWrapper, { y: 2, duration: 0.15, ease: "power1.in" })
            .to(swayWrapper, { y: 0, duration: 0.25, ease: "bounce.out" });

          // Desktop only: two connected cards move 2px and settle
          if (!isMobile) {
            gsap.timeline()
              .to([upperCard, lowerCard], { y: 2, duration: 0.15, ease: "power1.in" })
              .to([upperCard, lowerCard], { y: 0, duration: 0.25, ease: "power1.out" });
          }
        }

        const buildTl = gsap.timeline({
          scrollTrigger: {
            trigger: chainDiv,
            start: "top 85%",
            end: "bottom 60%",
            scrub: 0.6,
            onLeave: executeTug,
            onUpdate: (self) => {
              if (self.progress >= 0.99) executeTug();
            }
          }
        });

        activeChainScrollTriggers.push(buildTl.scrollTrigger);

        // Collars fade in over 0.2s at the start
        buildTl.to([collarS, collarE], { opacity: 1, duration: 0.2 }, 0);

        // Links build from top to bottom
        linkElements.forEach((item, idx) => {
          buildTl.to(
            item.el,
            {
              opacity: 1,
              attr: { transform: `translate(20 ${item.baseTranslateY}) scale(${LINK_SCALE})` },
              duration: 0.35,
              ease: "power2.out"
            },
            idx * (0.6 / n)
          );
        });

        // (3) Sway loop: chain__sway rotates between -0.8 and 0.8 degrees forever
        gsap.fromTo(
          swayWrapper,
          { rotation: -0.8 },
          { rotation: 0.8, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 }
        );
      }
    }
  } catch (err) {
    console.error("Chain build error:", err);
  }
}

/**
 * Setup chains lifecycle with ResizeObserver, image loads, and matchMedia
 */
function setupChainsLifecycle(prefersReducedMotion) {
  buildChains();

  const wrapper = document.getElementById("projects-wrapper");
  if (wrapper && typeof ResizeObserver !== "undefined") {
    let roTimeout;
    const ro = new ResizeObserver(() => {
      clearTimeout(roTimeout);
      roTimeout = setTimeout(() => {
        buildChains();
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      }, 50);
    });
    ro.observe(wrapper);
  }

  // Media query listener for mobile hanging layout toggle
  const mediaQuery = window.matchMedia("(max-width: 899px)");
  mediaQuery.addEventListener("change", () => {
    buildChains();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });

  window.addEventListener("resize", () => {
    buildChains();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });

  // Re-measure after images load
  document.querySelectorAll(".project-card__img").forEach((img) => {
    if (!img.complete) {
      img.addEventListener("load", () => {
        buildChains();
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      }, { once: true });
    }
  });
}

/**
 * Statement Section Reveal Animation
 */
function setupStatementEntrance(prefersReducedMotion) {
  if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  const section = document.querySelector(".statement-section");
  const title = document.querySelector(".statement-title");
  const text = document.querySelector(".statement-text");

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
 * Global form submission handler
 */
function submitForm(data) {
  console.log("Contact form submitted with data:", data);
}

/**
 * Section 5 & 6: Contact Form Validation, Floating Labels, Drop-in Animation
 */
function initContactForm(prefersReducedMotion) {
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

  // Paper stack drop-in entrance animation
  const paperStack = document.getElementById("paper-stack");
  const footer = document.querySelector(".site-footer");

  if (paperStack && footer) {
    if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      paperStack.style.opacity = "1";
      paperStack.style.transform = "none";
    } else {
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
  }
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

/**
 * Expand Transition from Landing Page to Project Page
 */
function setupProjectTransitions(prefersReducedMotion) {
  const rows = document.querySelectorAll(".project-row");
  rows.forEach((row, index) => {
    const proj = (window.SITE && window.SITE.projects && window.SITE.projects[index]) || null;
    if (!proj) return;

    const card = row.querySelector(".project-card");
    const link = row.querySelector(".project-info__link");
    const targetUrl = `project.html?p=${proj.slug}`;

    function handleCardClick(e) {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return;
      }
      e.preventDefault();

      if (prefersReducedMotion || typeof gsap === "undefined") {
        window.location.href = targetUrl;
        return;
      }

      const rect = card ? card.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
      const clickX = e.clientX || rect.left + rect.width / 2;
      const clickY = e.clientY || rect.top + rect.height / 2;

      const worldColor = proj.world === "sage" ? "var(--sage)" : "var(--cream)";

      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.backgroundColor = worldColor;
      overlay.style.zIndex = "99999";
      overlay.style.pointerEvents = "none";
      overlay.style.clipPath = `circle(0px at ${clickX}px ${clickY}px)`;
      overlay.style.webkitClipPath = `circle(0px at ${clickX}px ${clickY}px)`;
      document.body.appendChild(overlay);

      const dx = Math.max(clickX, window.innerWidth - clickX);
      const dy = Math.max(clickY, window.innerHeight - clickY);
      const Rmax = Math.hypot(dx, dy) + 50;

      const animObj = { r: 0 };
      gsap.to(animObj, {
        r: Rmax,
        duration: 0.7,
        ease: "power2.inOut",
        onUpdate: () => {
          overlay.style.clipPath = `circle(${animObj.r}px at ${clickX}px ${clickY}px)`;
          overlay.style.webkitClipPath = `circle(${animObj.r}px at ${clickX}px ${clickY}px)`;
        },
        onComplete: () => {
          window.location.href = targetUrl;
        }
      });
    }

    if (card) {
      card.style.cursor = "pointer";
      card.addEventListener("click", handleCardClick);
    }
    if (link) {
      link.addEventListener("click", handleCardClick);
    }
  });
}

/**
 * PART 4: Verification helper for chains
 */
window.__chainCheck = () => {
  if (!window.__chainData || window.__chainData.length === 0) {
    console.log("No chains recorded.");
    return;
  }

  window.__chainData.forEach((cd, index) => {
    const chainNum = index + 1;
    const { S, E, P0, Lp, d, n } = cd;

    // Top end of link 0 geometry inside chain div reaches 14.5px backwards from P0
    const topEnd = { x: P0.x - 14.5 * d.x, y: P0.y - 14.5 * d.y };
    // Bottom end of link n-1 geometry reaches 14.5px forward from P0 + Lp * d
    const bottomEnd = { x: P0.x + (Lp + 14.5) * d.x, y: P0.y + (Lp + 14.5) * d.y };

    const distTop = Math.hypot(topEnd.x - S.x, topEnd.y - S.y);
    const distBottom = Math.hypot(bottomEnd.x - E.x, bottomEnd.y - E.y);

    const ok = distTop <= 4 && distBottom <= 4;
    if (ok) {
      console.log(`chain ${chainNum}: OK (${n} links)`);
    } else {
      const reason = `top dist: ${distTop.toFixed(2)}px, bottom dist: ${distBottom.toFixed(2)}px`;
      console.log(`chain ${chainNum}: FAIL (${reason}) (${n} links)`);
    }
  });
};
