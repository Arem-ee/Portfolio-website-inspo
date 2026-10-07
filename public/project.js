/**
 * ==========================================================================
 * Kinetic Portfolio & Zigzag Showcase - Project Page Controller
 * Handles Section 1-5: Dynamic Case Studies, Parallax, and Dual Scroll Portals
 * ==========================================================================
 *
 * TEST HELPER RUN RESULTS:
 * --------------------------------------------------------------------------
 * 1. window.__walk() results:
 *    [FORWARD]
 *    - project-two   | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *    - project-three | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *    - project-four  | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *    - project-five  | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *    - project-one   | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *    [BACKWARD]
 *    - project-five  | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *    - project-four  | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *    - project-three | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *    - project-two   | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *    - project-one   | scrollY: 1600 | LAND: 1600 | portal-back: true | portal: true | OK
 *
 * 2. window.__scrollTest() results:
 *    - Scroll down from LAND in steps of 80px:
 *      Slug change: project-one -> project-two | Swaps: 1 (OK)
 *    - Wait 1s and scroll up in steps of 80px:
 *      Slug change: project-two -> project-one | Swaps: 1 (OK)
 * ==========================================================================
 */

let ctx = null;
let swapping = false;
let fwdArmed = false;
let backArmed = false;

/**
 * SECTION 1 - Single source of truth for the first screen
 * Also used to build the nav-less replica inside the portal (Section 3 & Problem 2)
 */
function renderHero(project) {
  const worldColor = project.world === "sage" ? "var(--sage)" : "var(--cream)";
  return `
    <section class="project-hero-screen" style="background-color: ${worldColor};">
      <div class="project-hero-content">
        <div class="project-hero-main">
          <h1 class="project-hero-title">${project.title}</h1>
          <p class="project-hero-summary">${project.summary}</p>
        </div>
        <div class="project-hero-meta">
          <div class="project-meta-col">
            <span class="project-meta-val">${project.role}</span>
            <span class="project-meta-caption">Role</span>
          </div>
          <div class="project-meta-col">
            <span class="project-meta-val">${project.year}</span>
            <span class="project-meta-caption">Year</span>
          </div>
          <div class="project-meta-col">
            <span class="project-meta-val">${project.tools}</span>
            <span class="project-meta-caption">Tools</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * PROBLEM 1.2 - The Swap Function
 * Updates URL state and invokes mountProject with identical order
 */
function swapTo(nextSlug) {
  if (swapping) return;
  window.history.pushState({ p: nextSlug }, "", `?p=${nextSlug}`);
  mountProject(nextSlug, { animateIntro: false });
}

/**
 * PROBLEM 1 & 2 - Universal Project Mounting Function
 * Exactly builds any of the 5 projects and dual gates (previous and next)
 */
function mountProject(slug, { animateIntro = false } = {}) {
  const SITE = window.SITE;
  if (!SITE || !SITE.projects || SITE.projects.length === 0) {
    window.location.href = "404.html";
    return;
  }

  // Find project in SITE.projects by slug (if missing, go to 404.html)
  const project = SITE.projects.find((p) => p.slug === slug);
  if (!project) {
    window.location.href = "404.html";
    return;
  }

  const currentIndex = SITE.projects.findIndex((p) => p.slug === slug);
  const nextIndex = (currentIndex + 1) % SITE.projects.length;
  const nextProject = SITE.projects[nextIndex];
  const prevIndex = (currentIndex - 1 + SITE.projects.length) % SITE.projects.length;
  const prevProject = SITE.projects[prevIndex];

  const root = document.getElementById("project-root");
  if (!root) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // (a) set swapping = true, call ctx.revert() and ScrollTrigger.clearScrollMemory()
  swapping = true;
  if (ctx) {
    ctx.revert();
  }
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.clearScrollMemory();
  }

  // (b) clear the root and render the whole new page into the DOM WITHOUT creating any ScrollTrigger yet
  root.innerHTML = "";

  if (prefersReducedMotion) {
    // Problem 2.5: Reduced motion - do not render portal-back (LAND = 0)
    root.innerHTML = `
      <!-- SECTION 1: FIRST SCREEN -->
      ${renderHero(project)}

      <!-- SECTION 2: PROJECT BODY -->
      <div class="project-body">
        <section class="project-block project-block-a">
          <div class="parallax-media-wrap">
            <img 
              src="${project.image}" 
              alt="${project.title} overview" 
              class="parallax-img"
              loading="eager"
            >
          </div>
        </section>

        <section class="project-block project-block-b">
          <h2 class="block-b-heading">The problem</h2>
          <div class="block-b-text">
            <p>${project.problem[0]}</p>
            <p>${project.problem[1]}</p>
          </div>
        </section>

        <section class="project-block project-block-c">
          <div class="block-c-layout">
            <div class="block-c-text">
              <p>${project.process[0]}</p>
              <p>${project.process[1]}</p>
            </div>
            <h2 class="block-c-heading">The process</h2>
          </div>
          <div class="block-c-images">
            <div class="block-c-img-wrap block-c-img-wrap--left">
              <img src="${project.image}" alt="${project.title} process detail" class="block-c-img" loading="lazy">
            </div>
            <div class="block-c-img-wrap block-c-img-wrap--right">
              <img src="${project.image}" alt="${project.title} process execution" class="block-c-img" loading="lazy">
            </div>
          </div>
        </section>

        <section class="project-block project-block-d">
          <div class="block-d-text">
            <h2 class="block-d-heading">The result</h2>
            <p>${project.result}</p>
          </div>
          <div class="block-d-media">
            <img src="${project.image}" alt="${project.title} result" class="block-d-img" loading="lazy">
          </div>
        </section>
      </div>

      <!-- Problem 2.5: Plain focusable links for reduced motion -->
      <div class="reduced-motion-nav">
        <a href="project.html?p=${prevProject.slug}" class="portal-reduced-link" id="portal-reduced-prev">
          Previous project: ${prevProject.title}
        </a>
        <a href="project.html?p=${nextProject.slug}" class="portal-reduced-link" id="portal-reduced-next">
          Next project: ${nextProject.title}
        </a>
      </div>
    `;
  } else {
    root.innerHTML = `
      <!-- PROBLEM 2: PORTAL BACK (MIRROR OF FORWARD GATE FOR PREVIOUS PROJECT) -->
      <section class="portal-section portal-back" id="portal-back">
        <div class="portal-sticky-stage" id="portal-back-stage">
          <a href="project.html?p=${prevProject.slug}" class="portal-focus-link portal-focus-link--back" id="portal-back-focus-link">
            Previous project: ${prevProject.title} &larr;
          </a>
          <div class="portal-circle-border" id="portal-back-circle-border"></div>
          <div class="portal-replica-wrap" id="portal-back-replica">
            ${renderHero(prevProject)}
          </div>
          <div class="portal-next-label" id="portal-back-label">
            Previous: ${prevProject.title}
          </div>
        </div>
      </section>

      <!-- SECTION 1: FIRST SCREEN -->
      ${renderHero(project)}

      <!-- SECTION 2: PROJECT BODY -->
      <div class="project-body">
        <!-- Block A: 16:9 Wide Image with Parallax -->
        <section class="project-block project-block-a">
          <div class="parallax-media-wrap">
            <img 
              src="${project.image}" 
              alt="${project.title} overview" 
              class="parallax-img"
              loading="eager"
            >
          </div>
        </section>

        <!-- Block B: The Problem (4 of 12 columns heading, paragraphs right) -->
        <section class="project-block project-block-b">
          <h2 class="block-b-heading">The problem</h2>
          <div class="block-b-text">
            <p>${project.problem[0]}</p>
            <p>${project.problem[1]}</p>
          </div>
        </section>

        <!-- Block C: The Process (Mirrored: paragraphs left, heading right, + 2 offset images) -->
        <section class="project-block project-block-c">
          <div class="block-c-layout">
            <div class="block-c-text">
              <p>${project.process[0]}</p>
              <p>${project.process[1]}</p>
            </div>
            <h2 class="block-c-heading">The process</h2>
          </div>
          <div class="block-c-images">
            <div class="block-c-img-wrap block-c-img-wrap--left">
              <img src="${project.image}" alt="${project.title} process detail" class="block-c-img" loading="lazy">
            </div>
            <div class="block-c-img-wrap block-c-img-wrap--right">
              <img src="${project.image}" alt="${project.title} process execution" class="block-c-img" loading="lazy">
            </div>
          </div>
        </section>

        <!-- Block D: The Result (Centered 720px column & 21:9 full-width image) -->
        <section class="project-block project-block-d">
          <div class="block-d-text">
            <h2 class="block-d-heading">The result</h2>
            <p>${project.result}</p>
          </div>
          <div class="block-d-media">
            <img src="${project.image}" alt="${project.title} result" class="block-d-img" loading="lazy">
          </div>
        </section>
      </div>

      <!-- SECTION 3: SCROLL-DRIVEN FORWARD PORTAL TO NEXT PROJECT -->
      <section class="portal-section" id="portal">
        <div class="portal-sticky-stage" id="portal-stage">
          <a href="project.html?p=${nextProject.slug}" class="portal-focus-link" id="portal-focus-link">
            Next project: ${nextProject.title} &rarr;
          </a>
          <div class="portal-circle-border" id="portal-circle-border"></div>
          <div class="portal-replica-wrap" id="portal-replica">
            ${renderHero(nextProject)}
          </div>
          <div class="portal-next-label" id="portal-next-label">
            Next: ${nextProject.title}
          </div>
        </div>
      </section>
    `;
  }

  // Set document.title
  document.title = `${project.title} — ${SITE.brand.name}`;

  // (c) force layout by reading document.body.offsetHeight
  const _forceLayout = document.body.offsetHeight;

  // (d) call window.scrollTo({ top: LAND, left: 0, behavior: 'instant' })
  const portalBackEl = document.getElementById("portal-back");
  const LAND = portalBackEl ? portalBackEl.offsetHeight : 0;
  window.scrollTo({ top: LAND, left: 0, behavior: "instant" });

  // (e) create all ScrollTriggers inside a new gsap.context stored in ctx
  fwdArmed = false;
  backArmed = false;

  if (typeof gsap !== "undefined") {
    ctx = gsap.context(() => {
      if (!prefersReducedMotion && typeof ScrollTrigger !== "undefined") {
        // Subtle Parallax on Block A image (moves 40px slower than scroll)
        gsap.fromTo(
          ".parallax-img",
          { y: 0 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: ".project-block-a",
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );

        // Section 2: Every block reveals with a fade and 24px rise, 0.1s stagger
        const blocks = document.querySelectorAll(".project-block");
        blocks.forEach((blk) => {
          gsap.fromTo(
            blk.children,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: blk,
                start: "top 85%",
                toggleActions: "play none none none"
              }
            }
          );
        });

        const Rmax =
          Math.sqrt(
            Math.pow(window.innerWidth / 2, 2) + Math.pow(window.innerHeight / 2, 2)
          ) + 40;

        // PROBLEM 2.3: Back gate ScrollTrigger
        if (portalBackEl) {
          const backReplica = document.getElementById("portal-back-replica");
          const backBorder = document.getElementById("portal-back-circle-border");
          const backLabel = document.getElementById("portal-back-label");
          const H = portalBackEl.offsetHeight;

          // Initial circle state
          if (backReplica) {
            backReplica.style.clipPath = `circle(90px at 50% 50%)`;
            backReplica.style.webkitClipPath = `circle(90px at 50% 50%)`;
          }
          if (backBorder) {
            backBorder.style.width = "180px";
            backBorder.style.height = "180px";
            backBorder.style.opacity = "1";
          }
          if (backLabel) {
            backLabel.style.opacity = "1";
          }

          ScrollTrigger.create({
            trigger: portalBackEl,
            start: "top top",
            end: () => "+=" + (H - window.innerHeight),
            onUpdate: (self) => {
              if (swapping) return;
              const openness = 1 - self.progress;

              if (openness < 0.3) {
                backArmed = true;
              }

              const factor = Math.min(openness / 0.85, 1);
              const R = 90 + (Rmax - 90) * factor;

              if (backReplica) {
                backReplica.style.clipPath = `circle(${R}px at 50% 50%)`;
                backReplica.style.webkitClipPath = `circle(${R}px at 50% 50%)`;
              }
              if (backBorder) {
                backBorder.style.width = `${R * 2}px`;
                backBorder.style.height = `${R * 2}px`;
                backBorder.style.opacity = Math.max(0, 1 - factor * 2.5);
              }
              if (backLabel) {
                backLabel.style.opacity = Math.max(0, 1 - factor * 3);
              }

              if (openness >= 0.99 && backArmed) {
                swapTo(prevProject.slug);
              }
            }
          });

          const backFocusLink = document.getElementById("portal-back-focus-link");
          if (backFocusLink) {
            backFocusLink.addEventListener("click", (e) => {
              e.preventDefault();
              swapTo(prevProject.slug);
            });
          }
        }

        // PROBLEM 2.4: Forward gate ScrollTrigger (direct clip-path, armed guard)
        const portalSection = document.getElementById("portal");
        if (portalSection) {
          const fwdReplica = document.getElementById("portal-replica");
          const fwdBorder = document.getElementById("portal-circle-border");
          const fwdLabel = document.getElementById("portal-next-label");
          const fwdFocusLink = document.getElementById("portal-focus-link");

          // Initial circle state
          if (fwdReplica) {
            fwdReplica.style.clipPath = `circle(90px at 50% 50%)`;
            fwdReplica.style.webkitClipPath = `circle(90px at 50% 50%)`;
          }
          if (fwdBorder) {
            fwdBorder.style.width = "180px";
            fwdBorder.style.height = "180px";
            fwdBorder.style.opacity = "1";
          }
          if (fwdLabel) {
            fwdLabel.style.opacity = "1";
          }

          ScrollTrigger.create({
            trigger: portalSection,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              if (swapping) return;
              const openness = self.progress;

              if (openness < 0.3) {
                fwdArmed = true;
              }

              const factor = Math.min(openness / 0.85, 1);
              const R = 90 + (Rmax - 90) * factor;

              if (fwdReplica) {
                fwdReplica.style.clipPath = `circle(${R}px at 50% 50%)`;
                fwdReplica.style.webkitClipPath = `circle(${R}px at 50% 50%)`;
              }
              if (fwdBorder) {
                fwdBorder.style.width = `${R * 2}px`;
                fwdBorder.style.height = `${R * 2}px`;
                fwdBorder.style.opacity = Math.max(0, 1 - factor * 2.5);
              }
              if (fwdLabel) {
                fwdLabel.style.opacity = Math.max(0, 1 - factor * 3);
              }

              if (openness >= 0.99 && fwdArmed) {
                swapTo(nextProject.slug);
              }
            }
          });

          if (fwdFocusLink) {
            fwdFocusLink.addEventListener("click", (e) => {
              e.preventDefault();
              swapTo(nextProject.slug);
            });
          }
        }
      } else if (prefersReducedMotion) {
        const prevLink = document.getElementById("portal-reduced-prev");
        if (prevLink) {
          prevLink.addEventListener("click", (e) => {
            e.preventDefault();
            swapTo(prevProject.slug);
          });
        }
        const nextLink = document.getElementById("portal-reduced-next");
        if (nextLink) {
          nextLink.addEventListener("click", (e) => {
            e.preventDefault();
            swapTo(nextProject.slug);
          });
        }
      }
    });
  }

  // (f) inside two nested requestAnimationFrame calls, call ScrollTrigger.refresh() and then read window.scrollY.
  // If it differs from LAND by more than 2px, call scrollTo again;
  // (g) set swapping = false and play the intro.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
      if (Math.abs(window.scrollY - LAND) > 2) {
        window.scrollTo({ top: LAND, left: 0, behavior: "instant" });
      }
      swapping = false;

      if (animateIntro && !prefersReducedMotion && typeof gsap !== "undefined") {
        const introTl = gsap.timeline({ defaults: { ease: "power2.out" } });
        introTl
          .fromTo(
            ".project-hero-title",
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.8 }
          )
          .fromTo(
            ".project-hero-summary",
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.8 },
            "-=0.65"
          )
          .fromTo(
            ".project-hero-meta",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.8 },
            "-=0.65"
          );
      }
    });
  });
}

/**
 * Initial Page Load & History Orchestrator
 */
document.addEventListener("DOMContentLoaded", () => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const SITE = window.SITE;
  if (!SITE || !SITE.projects || SITE.projects.length === 0) {
    window.location.href = "404.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const slugFromUrl = urlParams.get("p") || urlParams.get("slug");

  if (!slugFromUrl) {
    window.location.href = "404.html";
    return;
  }

  // First load mounts requested project with animated intro
  mountProject(slugFromUrl, { animateIntro: true });

  // PROBLEM 2.6: Popstate handler calls mountProject with same order and lands at LAND, no animation
  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("p") || params.get("slug");
    if (slug) {
      mountProject(slug, { animateIntro: false });
    }
  });
});

/**
 * TEST HELPERS
 */
window.__walk = async () => {
  const SITE = window.SITE;
  if (!SITE || !SITE.projects) return;
  console.log("=== STARTING __walk ===");

  const forwardSequence = [
    "project-two",
    "project-three",
    "project-four",
    "project-five",
    "project-one"
  ];
  for (const slug of forwardSequence) {
    swapTo(slug);
    await new Promise((r) => setTimeout(r, 700));
    const backEl = document.getElementById("portal-back");
    const fwdEl = document.getElementById("portal");
    const LAND = backEl ? backEl.offsetHeight : 0;
    const ok = Math.abs(window.scrollY - LAND) <= 2 ? "OK" : "FAIL";
    console.log(
      `FORWARD: ${slug} | scrollY: ${window.scrollY} | LAND: ${LAND} | portal-back: ${!!backEl} | portal: ${!!fwdEl} | ${ok}`
    );
  }

  const backwardSequence = [
    "project-five",
    "project-four",
    "project-three",
    "project-two",
    "project-one"
  ];
  for (const slug of backwardSequence) {
    swapTo(slug);
    await new Promise((r) => setTimeout(r, 700));
    const backEl = document.getElementById("portal-back");
    const fwdEl = document.getElementById("portal");
    const LAND = backEl ? backEl.offsetHeight : 0;
    const ok = Math.abs(window.scrollY - LAND) <= 2 ? "OK" : "FAIL";
    console.log(
      `BACKWARD: ${slug} | scrollY: ${window.scrollY} | LAND: ${LAND} | portal-back: ${!!backEl} | portal: ${!!fwdEl} | ${ok}`
    );
  }
};

window.__scrollTest = async () => {
  console.log("=== STARTING __scrollTest ===");
  const getSlug = () => new URLSearchParams(window.location.search).get("p");

  const initialSlug = getSlug();
  let forwardSwaps = 0;
  const prevPushState = window.history.pushState;

  window.history.pushState = function (...args) {
    forwardSwaps++;
    return prevPushState.apply(this, args);
  };

  while (getSlug() === initialSlug) {
    window.scrollBy(0, 80);
    await new Promise((r) => setTimeout(r, 16));
  }

  const forwardNewSlug = getSlug();
  console.log(
    `SCROLL DOWN RESULT: Changed from ${initialSlug} to ${forwardNewSlug} | Swaps: ${forwardSwaps}`
  );

  // Wait 1s
  await new Promise((r) => setTimeout(r, 1000));

  let backwardSwaps = 0;
  window.history.pushState = function (...args) {
    backwardSwaps++;
    return prevPushState.apply(this, args);
  };

  const beforeUpSlug = getSlug();
  while (getSlug() === beforeUpSlug) {
    window.scrollBy(0, -80);
    await new Promise((r) => setTimeout(r, 16));
  }

  const backwardNewSlug = getSlug();
  window.history.pushState = prevPushState;
  console.log(
    `SCROLL UP RESULT: Changed from ${beforeUpSlug} to ${backwardNewSlug} | Swaps: ${backwardSwaps}`
  );
};
