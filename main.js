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
 * Global Site Content from content.js (window.SITE)
 */
const SITE_CONTENT = window.SITE || {};

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
  initContactForm(prefersReducedMotion);
  setupSmoothScroll();
  setupProjectTransitions(prefersReducedMotion);
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
      onReady();
    } catch (e) {
      console.warn("Canvas background processing skipped due to CORS/security context:", e);
      onReady();
    }
  }

  if (imgEl.complete && imgEl.naturalWidth !== 0) {
    process();
  } else {
    imgEl.addEventListener("load", process, { once: true });
    imgEl.addEventListener("error", onReady, { once: true });
  }
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
 * Top reading progress bar synchronized with window scroll
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

  if (prefersReducedMotion || typeof gsap === "undefined") {
    if (heroFigure) heroFigure.style.opacity = "1";
    if (characterImg) characterImg.style.opacity = "1";
    if (catImg) catImg.style.opacity = "1";
    if (heroShadow) heroShadow.style.opacity = "0.7";
    return;
  }

  // Entrance Timeline
  const entranceTl = gsap.timeline({ defaults: { ease: "power2.out" } });

  entranceTl
    .fromTo([titleLeft, titleRight], { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.15 })
    .fromTo([subLeft, subRight], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 }, "-=0.6")
    .fromTo(heroFigure, { opacity: 0, scale: 0.96, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "power3.out" }, "-=0.7")
    .fromTo(heroShadow, { opacity: 0, scale: 0.7 }, { opacity: 0.7, scale: 1, duration: 1.1, ease: "power3.out" }, "-=1.1");

  // Idle Floating Animation on heroFigure (character + cat together)
  const floatTl = gsap.timeline({ repeat: -1, yoyo: true });
  floatTl.to(heroFigure, {
    y: "-=16",
    duration: 3.2,
    ease: "sine.inOut"
  });

  // Shadow pulses opposite to the float
  gsap.to(heroShadow, {
    scaleX: 0.85,
    scaleY: 0.85,
    opacity: 0.45,
    duration: 3.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // Subtle Mouse Parallax inside Hero Section
  const heroSection = document.getElementById("hero");
  if (heroSection) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const yPercent = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      gsap.to(heroWrapper, {
        x: xPercent * 14,
        y: yPercent * 8,
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
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const rows = document.querySelectorAll(".project-row");
  rows.forEach((row) => {
    const card = row.querySelector(".project-card");
    const info = row.querySelector(".project-info");

    gsap.fromTo(
      [card, info],
      { opacity: 0, y: 40 },
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
 * SECTION 3: PHYSICAL INTERLOCKING METALLIC CHAINS
 * ==========================================================================
 */
function setupChains(prefersReducedMotion) {
  const container = document.getElementById("projects");
  const wrapper = document.getElementById("projects-wrapper");
  if (!container || !wrapper) return;

  const rows = Array.from(container.querySelectorAll(".project-row"));
  if (rows.length < 2) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const xlinkNS = "http://www.w3.org/1999/xlink";

  let chainSvg = document.getElementById("chain-overlay-svg");
  if (!chainSvg) {
    chainSvg = document.createElementNS(svgNS, "svg");
    chainSvg.id = "chain-overlay-svg";
    chainSvg.setAttribute("class", "chain-canvas");
    chainSvg.setAttribute("aria-hidden", "true");
    chainSvg.setAttribute("role", "presentation");
    wrapper.appendChild(chainSvg);
  }

  const chainsData = [];

  function buildAllChains() {
    chainSvg.innerHTML = "";
    chainsData.length = 0;

    const wrapRect = wrapper.getBoundingClientRect();
    const svgWidth = wrapper.scrollWidth || wrapRect.width;
    const svgHeight = wrapper.scrollHeight || wrapRect.height;

    chainSvg.setAttribute("width", svgWidth);
    chainSvg.setAttribute("height", svgHeight);
    chainSvg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    for (let i = 0; i < rows.length - 1; i++) {
      const fromRow = rows[i];
      const toRow = rows[i + 1];

      const fromCard = fromRow.querySelector(".project-card");
      const toCard = toRow.querySelector(".project-card");
      if (!fromCard || !toCard) continue;

      const fromRect = fromCard.getBoundingClientRect();
      const toRect = toCard.getBoundingClientRect();

      const startX = (fromRect.left + fromRect.width / 2) - wrapRect.left;
      const startY = (fromRect.top + fromRect.height / 2) - wrapRect.top;
      const endX = (toRect.left + toRect.width / 2) - wrapRect.left;
      const endY = (toRect.top + toRect.height / 2) - wrapRect.top;

      const dx = endX - startX;
      const dy = endY - startY;
      const straightDistance = Math.hypot(dx, dy);

      const targetLinkPitch = 24;
      const numLinks = Math.max(16, Math.round(straightDistance / targetLinkPitch));

      const isReduced = prefersReducedMotion || window.innerWidth < 768;
      const baseSag = isReduced ? 0 : 54;

      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "chain-group");
      chainSvg.appendChild(g);

      const linkElements = [];

      for (let j = 0; j < numLinks; j++) {
        const isWide = (j % 2 === 0);
        const symbolId = isWide ? "#link-wide" : "#link-narrow";

        const useEl = document.createElementNS(svgNS, "use");
        useEl.setAttributeNS(xlinkNS, "href", symbolId);
        useEl.setAttribute("href", symbolId);
        g.appendChild(useEl);
        linkElements.push(useEl);
      }

      chainsData.push({
        fromRow,
        toRow,
        fromCard,
        toCard,
        startX,
        startY,
        endX,
        endY,
        numLinks,
        baseSag,
        currentSag: baseSag,
        linkElements,
        targetSag: baseSag,
        swayAngle: 0,
        swayVelocity: 0
      });
    }

    renderChainsPositions();
  }

  function getBezierPoint(p0, p1, p2, t) {
    const inv = 1 - t;
    return {
      x: inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x,
      y: inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y
    };
  }

  function getBezierTangent(p0, p1, p2, t) {
    const inv = 1 - t;
    return {
      x: 2 * inv * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
      y: 2 * inv * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
    };
  }

  function renderChainsPositions() {
    const wrapRect = wrapper.getBoundingClientRect();

    chainsData.forEach((chain) => {
      const fromRect = chain.fromCard.getBoundingClientRect();
      const toRect = chain.toCard.getBoundingClientRect();

      const p0 = {
        x: (fromRect.left + fromRect.width / 2) - wrapRect.left,
        y: (fromRect.top + fromRect.height / 2) - wrapRect.top
      };
      const p2 = {
        x: (toRect.left + toRect.width / 2) - wrapRect.left,
        y: (toRect.top + toRect.height / 2) - wrapRect.top
      };

      const midX = (p0.x + p2.x) / 2;
      const midY = (p0.y + p2.y) / 2;

      const p1 = {
        x: midX + Math.sin(chain.swayAngle) * (chain.currentSag * 0.4),
        y: midY + chain.currentSag
      };

      const count = chain.numLinks;
      for (let j = 0; j < count; j++) {
        const t = count > 1 ? j / (count - 1) : 0.5;
        const pt = getBezierPoint(p0, p1, p2, t);
        const tangent = getBezierTangent(p0, p1, p2, t);
        const angleDeg = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI + 90;

        const useEl = chain.linkElements[j];
        useEl.setAttribute(
          "transform",
          `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) rotate(${angleDeg.toFixed(2)}) scale(${LINK_SCALE})`
        );
      }
    });
  }

  buildAllChains();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(buildAllChains, 150);
  });

  if (prefersReducedMotion || window.innerWidth < 768) {
    return;
  }

  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let isTicking = false;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    scrollVelocity += delta * 0.28;
    scrollVelocity = Math.max(-45, Math.min(45, scrollVelocity));

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(physicsLoop);
    }
  }, { passive: true });

  wrapper.addEventListener("mousemove", (e) => {
    const wrapRect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - wrapRect.left;
    const mouseY = e.clientY - wrapRect.top;

    chainsData.forEach((chain) => {
      const midX = (chain.startX + chain.endX) / 2;
      const midY = (chain.startY + chain.endY) / 2 + chain.currentSag;

      const dist = Math.hypot(mouseX - midX, mouseY - midY);
      if (dist < 140) {
        const force = (1 - dist / 140) * 0.12;
        const dir = mouseX > midX ? 1 : -1;
        chain.swayVelocity += dir * force;
      }
    });

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(physicsLoop);
    }
  });

  function physicsLoop() {
    let hasMotion = false;

    scrollVelocity *= 0.90;
    if (Math.abs(scrollVelocity) < 0.05) scrollVelocity = 0;

    chainsData.forEach((chain) => {
      const dynamicSagTarget = Math.max(12, chain.baseSag + scrollVelocity);

      chain.currentSag += (dynamicSagTarget - chain.currentSag) * 0.14;

      const springK = 0.045;
      const damping = 0.92;
      const accel = -springK * chain.swayAngle;
      chain.swayVelocity = (chain.swayVelocity + accel) * damping;
      chain.swayAngle += chain.swayVelocity;

      if (
        Math.abs(chain.currentSag - chain.baseSag) > 0.1 ||
        Math.abs(chain.swayVelocity) > 0.001 ||
        Math.abs(chain.swayAngle) > 0.001
      ) {
        hasMotion = true;
      }
    });

    renderChainsPositions();

    if (hasMotion || Math.abs(scrollVelocity) > 0.05) {
      requestAnimationFrame(physicsLoop);
    } else {
      isTicking = false;
    }
  }
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
  // TODO: Connect to your real backend API or form endpoint here (e.g. fetch('/api/contact', ...))
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
 * SECTION 6: Smooth Circle Expand Transition from Landing Page to Project Page
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
