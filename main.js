/**
 * ==========================================================================
 * Kinetic Portfolio & Zigzag Showcase - Main Script
 * ==========================================================================
 */

/**
 * Global Site Content Configuration
 * Modify this object to change any textual content across the entire page.
 */
const SITE_CONTENT = {
  brand: {
    name: "ARTHUR CHEN",
    role: "Design Engineer & Kinetic Motion",
    tagline: "Exploring weight, tension, and kinetic nuance across physical and digital spaces."
  },
  navigation: [
    { label: "Selected Works", href: "#projects" },
    { label: "Perspective", href: "#statement" },
    { label: "Contact", href: "#contact" }
  ],
  hero: {
    headlineLeft: "PHYSICAL",
    headlineRight: "DIGITAL",
    subtextLeft: "Tactile web engineering rooted in mass, tension, and spatial balance.",
    subtextRight: "Designing deliberate kinetic interfaces that feel crafted, grounded, and alive."
  },
  projects: [
    {
      id: 1,
      title: "Solace Timepieces",
      description: "An architectural catalog for minimalist horology with physics-based bezel rotation and dampened inertia.",
      linkText: "View project",
      url: "#",
      image: "assets/project-1.jpg",
      alt: "Monochrome tactile horology exhibition layout"
    },
    {
      id: 2,
      title: "Catenary Studios",
      description: "A spatial archive documenting structural tensile architecture and wire-rope balance systems.",
      linkText: "View project",
      url: "#",
      image: "assets/project-2.jpg",
      alt: "Tensile structural design and architectural models"
    },
    {
      id: 3,
      title: "Kura Monolith",
      description: "Editorial identity and commerce platform for Japanese ceramics sculpted from stoneware clay.",
      linkText: "View project",
      url: "#",
      image: "assets/project-3.jpg",
      alt: "Minimal stoneware ceramics and editorial typography"
    },
    {
      id: 4,
      title: "Tension & Rest",
      description: "An interactive essay exploring mechanical linkage systems, pendulums, and kinetic equilibrium.",
      linkText: "View project",
      url: "#",
      image: "assets/project-4.jpg",
      alt: "Mechanical linkage and kinetic balance diagram"
    },
    {
      id: 5,
      title: "Atelier Forma",
      description: "Custom brand typography and spatial wayfinding for an artisan furniture workshop in Milan.",
      linkText: "View project",
      url: "#",
      image: "assets/project-5.jpg",
      alt: "Artisan woodwork joinery and spatial typography"
    }
  ],
  remainingBody: {
    statement: "Physical intention in a weightless medium.",
    paragraph: "Most digital interfaces treat movement as mere decoration. We believe motion is an expression of mass, friction, and kinetic balance. When elements respect physical constraints—gravity, chain tension, and dampened inertia—the screen ceases to be an abstraction and becomes an enduring space you can feel."
  },
  footer: {
    description: "Designing tactile digital systems with deliberate kinetic movement and sculptural typography.",
    pages: [
      { label: "Selected Works", href: "#projects" },
      { label: "Perspective", href: "#statement" },
      { label: "Colophon", href: "#" },
      { label: "Archive", href: "#" }
    ],
    social: [
      { label: "Read.cv", href: "https://read.cv" },
      { label: "GitHub", href: "https://github.com" },
      { label: "Cosmos", href: "https://cosmos.so" },
      { label: "Are.na", href: "https://are.na" }
    ],
    copyrightName: "Arthur Chen. All rights reserved."
  },
  contact: {
    options: [
      { value: "identity", label: "Full Identity & Web Direction" },
      { value: "kinetic", label: "Kinetic Motion & Interaction Design" },
      { value: "architecture", label: "Design System Architecture" },
      { value: "consultation", label: "Editorial & Spatial Consultation" }
    ],
    successTitle: "Message received.",
    successBody: "Thank you for reaching out. I typically respond within two business days."
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
  // Check user preference for motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Initialize all sections
  populateSiteContent();
  setupScrollProgress();
  setupHeroInteractions(prefersReducedMotion);
  setupProjectEntrance(prefersReducedMotion);
  setupChains(prefersReducedMotion);
  setupStatementEntrance(prefersReducedMotion);
  setupContactForm();
  setupSmoothScroll();
});

/**
 * Injects content from SITE_CONTENT into the DOM
 */
function populateSiteContent() {
  // Navigation Logo
  const logoEl = document.querySelector(".nav__logo");
  if (logoEl) logoEl.textContent = SITE_CONTENT.brand.name;

  // Hero Headlines and Subtexts
  const titleLeft = document.getElementById("hero-title-left");
  if (titleLeft) titleLeft.textContent = SITE_CONTENT.hero.headlineLeft;

  const titleRight = document.getElementById("hero-title-right");
  if (titleRight) titleRight.textContent = SITE_CONTENT.hero.headlineRight;

  const subtextLeft = document.getElementById("hero-subtext-left");
  if (subtextLeft) subtextLeft.textContent = SITE_CONTENT.hero.subtextLeft;

  const subtextRight = document.getElementById("hero-subtext-right");
  if (subtextRight) subtextRight.textContent = SITE_CONTENT.hero.subtextRight;

  // Remaining Body
  const statementTitle = document.getElementById("statement-title");
  if (statementTitle) statementTitle.textContent = SITE_CONTENT.remainingBody.statement;

  const statementText = document.getElementById("statement-text");
  if (statementText) statementText.textContent = SITE_CONTENT.remainingBody.paragraph;

  // Footer Content
  const footerLogo = document.querySelector(".footer-logo");
  if (footerLogo) footerLogo.textContent = SITE_CONTENT.brand.name;

  const footerSentence = document.querySelector(".footer-sentence");
  if (footerSentence) footerSentence.textContent = SITE_CONTENT.footer.description;

  const copyrightYear = document.getElementById("copyright-year");
  if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

  const copyrightText = document.getElementById("copyright-text");
  if (copyrightText) copyrightText.textContent = ` © ${new Date().getFullYear()} ${SITE_CONTENT.footer.copyrightName}`;
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
    // Initial entrance timeline (approx 1.2s total sequence)
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.fromTo(nav, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo([headlineLeft, headlineRight], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.3")
      .fromTo(characterWrapper, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
      .fromTo(shadow, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.8 }, "-=0.7")
      .fromTo(scrollHint, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.3");

    // Continuous floating character depth simulation (5 to 6s cycle, 14px, 1deg rotation)
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
      scaleX: 0.86,
      scaleY: 0.86,
      opacity: 0.22,
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
          start: "top 82%",
          toggleActions: "play none none none"
        }
      }
    );
  });
}

/**
 * Section 3: The Animated Chains
 * Builds exactly 4 inline SVG chains connecting neighboring cards with alternating 90-deg links
 */
let chainInstances = [];

function setupChains(prefersReducedMotion) {
  const container = document.getElementById("projects-section");
  const svgLayer = document.getElementById("chains-layer");
  if (!container || !svgLayer) return;

  function constructAllChains() {
    // Clear existing triggers and SVG content
    chainInstances.forEach((inst) => {
      if (inst.trigger) inst.trigger.kill();
      if (inst.swayTween) inst.swayTween.kill();
    });
    chainInstances = [];
    svgLayer.innerHTML = "";

    const rows = Array.from(document.querySelectorAll(".project-row"));
    if (rows.length < 2) return;

    const containerRect = container.getBoundingClientRect();
    const isMobile = window.innerWidth <= 900;

    // Ensure SVG viewBox matches container bounds exactly
    svgLayer.setAttribute("width", `${containerRect.width}`);
    svgLayer.setAttribute("height", `${containerRect.height}`);
    svgLayer.setAttribute("viewBox", `0 0 ${containerRect.width} ${containerRect.height}`);

    // Connect Card i to Card i+1 (exactly 4 chains for 5 cards)
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
        // Under 900px: short straight vertical chains between cards
        x1 = upperRect.left + upperRect.width / 2 - containerRect.left;
        y1 = upperRect.bottom - containerRect.top;
        x2 = lowerRect.left + lowerRect.width / 2 - containerRect.left;
        y2 = lowerRect.top - containerRect.top;
      } else {
        // Desktop: upper card bottom corner facing page center to lower card top edge
        const upperIsLeft = upperRow.classList.contains("project-row--left");
        if (upperIsLeft) {
          x1 = upperRect.right - containerRect.left;
          y1 = upperRect.bottom - containerRect.top;
          x2 = lowerRect.left + 24 - containerRect.left;
          y2 = lowerRect.top - containerRect.top;
        } else {
          x1 = upperRect.left - containerRect.left;
          y1 = upperRect.bottom - containerRect.top;
          x2 = lowerRect.right - 24 - containerRect.left;
          y2 = lowerRect.top - containerRect.top;
        }
      }

      // Generate chain links along catenary curve
      const chainData = createChainSVG(svgLayer, x1, y1, x2, y2, i, isMobile);

      if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        chainData.links.forEach((link) => (link.style.opacity = "1"));
        continue;
      }

      // 1. Tied to ScrollTrigger with scrub: links appear one by one
      let hasTugged = false;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: lowerRow,
          start: "top 92%",
          end: "top 52%",
          scrub: 0.4,
          onUpdate: (self) => {
            // Step 2: Trigger tug when last link reaches the lower card
            if (self.progress >= 0.96 && !hasTugged) {
              hasTugged = true;
              triggerTugEffect(chainData.group, upperCard, lowerCard);
            } else if (self.progress < 0.7) {
              hasTugged = false;
            }
          }
        }
      });

      tl.fromTo(
        chainData.links,
        { opacity: 0, scale: 0.7 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.05,
          duration: 1,
          ease: "none"
        }
      );

      // 3. Continuous gentle swaying by ~1.5 degrees over 4 seconds, pivoting from top end
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

  // Initial build
  constructAllChains();

  // Rebuild on window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      constructAllChains();
    }, 150);
  });
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
 * Renders alternating oval chain links along a catenary curve
 */
function createChainSVG(svgLayer, x1, y1, x2, y2, chainIndex, isMobile) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);

  // Link density: ~13px step distance between successive chain links
  const step = 13;
  const numLinks = Math.max(5, Math.round(dist / step));
  const sagAmount = isMobile ? 6 : Math.min(50, Math.max(22, dist * 0.14));

  const chainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  chainGroup.setAttribute("class", "chain-svg-group");
  chainGroup.setAttribute("id", `chain-group-${chainIndex}`);

  const linkElements = [];

  for (let k = 0; k <= numLinks; k++) {
    const t = k / numLinks;

    // Catenary drape calculation
    const px = x1 + t * dx;
    const py = y1 + t * dy + sagAmount * 4 * t * (1 - t);

    // Tangent angle
    const tangentX = dx;
    const tangentY = dy + sagAmount * 4 * (1 - 2 * t);
    const angleRad = Math.atan2(tangentY, tangentX);
    const angleDeg = (angleRad * 180) / Math.PI;

    const linkG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    linkG.setAttribute("class", "chain-link");

    const isRotated90 = k % 2 === 1;

    if (!isRotated90) {
      // Face-on oval link
      linkG.setAttribute("transform", `translate(${px}, ${py}) rotate(${angleDeg})`);

      // Outer link border (dark grey)
      const outer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      outer.setAttribute("x", "-11");
      outer.setAttribute("y", "-5.5");
      outer.setAttribute("width", "22");
      outer.setAttribute("height", "11");
      outer.setAttribute("rx", "5.5");
      outer.setAttribute("fill", "#2D2B28");
      outer.setAttribute("stroke", "#4A4742");
      outer.setAttribute("stroke-width", "1");

      // Highlight inner ridge (lighter grey highlight)
      const highlight = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      highlight.setAttribute("x", "-9");
      highlight.setAttribute("y", "-4");
      highlight.setAttribute("width", "18");
      highlight.setAttribute("height", "8");
      highlight.setAttribute("rx", "4");
      highlight.setAttribute("fill", "#8E887E");

      // Inner hollow cutout
      const inner = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      inner.setAttribute("x", "-6");
      inner.setAttribute("y", "-2");
      inner.setAttribute("width", "12");
      inner.setAttribute("height", "4");
      inner.setAttribute("rx", "2");
      inner.setAttribute("fill", "#242220");

      linkG.appendChild(outer);
      linkG.appendChild(highlight);
      linkG.appendChild(inner);
    } else {
      // 90-degree rotated link (seen edge-on / through-the-ring)
      linkG.setAttribute("transform", `translate(${px}, ${py}) rotate(${angleDeg + 90})`);

      const edgeOuter = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      edgeOuter.setAttribute("x", "-4");
      edgeOuter.setAttribute("y", "-7");
      edgeOuter.setAttribute("width", "8");
      edgeOuter.setAttribute("height", "14");
      edgeOuter.setAttribute("rx", "4");
      edgeOuter.setAttribute("fill", "#383632");
      edgeOuter.setAttribute("stroke", "#5A5650");
      edgeOuter.setAttribute("stroke-width", "1");

      const edgeHighlight = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      edgeHighlight.setAttribute("x", "-2");
      edgeHighlight.setAttribute("y", "-5");
      edgeHighlight.setAttribute("width", "4");
      edgeHighlight.setAttribute("height", "10");
      edgeHighlight.setAttribute("rx", "2");
      edgeHighlight.setAttribute("fill", "#A6A094");

      linkG.appendChild(edgeOuter);
      linkG.appendChild(edgeHighlight);
    }

    chainGroup.appendChild(linkG);
    linkElements.push(linkG);
  }

  svgLayer.appendChild(chainGroup);
  return { group: chainGroup, links: linkElements };
}

/**
 * Section 4: Remaining body entrance animation
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
    .fromTo(text, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.7");
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

  // Floating label active state management
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

  // Client-side validation helper
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

    // Anti-bot honeypot check
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

    // Submit state: disable button and show loading text
    submitBtn.disabled = true;
    const btnOriginalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending... <span aria-hidden="true">&rarr;</span>';

    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      need: needSelect.value,
      message: messageInput.value.trim()
    };

    // Call submitForm function where backend endpoint can be plugged in
    submitForm(formData);

    // Simulate clean network dispatch and reveal success state
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
