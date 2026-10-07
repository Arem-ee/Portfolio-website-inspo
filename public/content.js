/**
 * ==========================================================================
 * Kinetic Portfolio & Zigzag Showcase - Central Content Store
 * Global: window.SITE
 * ==========================================================================
 */

window.SITE = {
  brand: {
    name: "Your Name",
    description: "A short sentence describing your creative perspective and practice."
  },
  navigation: [
    { label: "Work", href: "index.html#work" },
    { label: "Design", href: "design.html" },
    { label: "Writing", href: "writing.html" },
    { label: "About", href: "about.html" },
    { label: "Contact", href: "index.html#contact" }
  ],
  hero: {
    headlineLeft: "YOUR",
    headlineRight: "NAME",
    subtextLeft: "A concise introductory sentence describing your perspective.",
    subtextRight: "A second concise sentence highlighting your core practice."
  },
  remainingBody: {
    statement: "A clear two-line statement summarizing your perspective.",
    paragraph: "A single paragraph of placeholder text offering further detail about your methodology, principles, and collaborative approach without extraneous decorative elements."
  },
  footer: {
    description: "A brief concluding sentence about your work and availability.",
    pages: [
      { label: "Work", href: "index.html#work" },
      { label: "Design", href: "404.html" },
      { label: "Writing", href: "404.html" },
      { label: "About", href: "404.html" },
      { label: "Contact", href: "index.html#contact" }
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
  },
  projects: [
    {
      id: 1,
      slug: "project-one",
      title: "Project One",
      summary: "A focused interactive system built for seamless workspace coordination and kinetic clarity.",
      role: "Lead Designer & Creative Developer",
      year: "2025",
      tools: "Figma, TypeScript, WebGL, Motion Architecture",
      world: "sage",
      image: "assets/project-1.jpg",
      alt: "Project One overview",
      problem: [
        "Complex interface architectures frequently obscure fundamental tasks beneath unnecessary layers of visual noise and fragmented interaction patterns.",
        "The core challenge was distilling multifaceted user workflows into a serene, tactile experience without sacrificing power or expressive velocity."
      ],
      process: [
        "We began by mapping every primary user interaction to a direct physical metaphor, stripping away decorative styling to elevate structural clarity.",
        "Iterative prototyping in code allowed us to calibrate micro-motion curves, spatial hierarchy, and responsive performance across modern viewports."
      ],
      result: "The completed system reduced task completion friction while establishing a distinct, tactile design language that elevates brand presence and focus."
    },
    {
      id: 2,
      slug: "project-two",
      title: "Project Two",
      summary: "A warm editorial publication platform emphasizing typographic discipline and quiet utility.",
      role: "Design Systems & Frontend Architecture",
      year: "2024",
      tools: "Design Tokens, CSS Architecture, JavaScript, Typography",
      world: "cream",
      image: "assets/project-2.jpg",
      alt: "Project Two overview",
      problem: [
        "Modern digital publishing often compromises typographic cadence for algorithmic density, alienating thoughtful readers and creating cognitive fatigue.",
        "The objective was creating an immersive reading environment where content breathes and navigation recedes gracefully into the background."
      ],
      process: [
        "We developed a modular typographic scale rooted in classic book design, calibrated specifically for high-density digital displays and long sessions.",
        "Fluid layout mathematics and custom scroll ergonomics were refined through rigorous readability benchmarks across phones, tablets, and desktops."
      ],
      result: "A distinguished reading platform that increased engagement depth and established enduring visual dignity across extensive long-form archives."
    },
    {
      id: 3,
      slug: "project-three",
      title: "Project Three",
      summary: "An exploratory physical computing interface bridging industrial design and digital spatial motion.",
      role: "Interaction Design & Prototyping",
      year: "2024",
      tools: "Hardware Prototyping, GSAP, SVG, Creative Engineering",
      world: "sage",
      image: "assets/project-3.jpg",
      alt: "Project Three overview",
      problem: [
        "Disconnection between tactile physical controls and screen-based responses creates perceptual lag and diminishes the delight of direct manipulation.",
        "We investigated how mechanical gestures can seamlessly translate into digital kinetics with immediate material feedback."
      ],
      process: [
        "Custom sensors and mechanical rigs were constructed to capture physical momentum and translate subtle tactile pressure into motion vectors.",
        "Software animation engines were harmonized to mirror physical damping coefficients and organic inertia without computational overhead."
      ],
      result: "A breakthrough experimental interface demonstrating harmonious synthesis between physical materiality and digital motion design."
    },
    {
      id: 4,
      slug: "project-four",
      title: "Project Four",
      summary: "A quiet archival tool designed for preservationists and curators managing living collections.",
      role: "Information Architecture & Engineering",
      year: "2023",
      tools: "Design Systems, Schema Architecture, Performance Optimization",
      world: "cream",
      image: "assets/project-4.jpg",
      alt: "Project Four overview",
      problem: [
        "Archival management software typically presents overwhelming tabular sprawl that hinders exploratory cataloging and interdisciplinary research.",
        "The challenge required organizing dense chronological datasets into an intuitive spatial hierarchy that invites discovery."
      ],
      process: [
        "We conducted field interviews with archivists, mapping mental models directly onto spatial timeline canvases and associative relation graphs.",
        "Performance was engineered from the ground up to render thousands of historic artifacts without visual hitching or navigation stutter."
      ],
      result: "An elegant digital cataloging environment adopted by leading institutions to preserve and celebrate cultural heritage."
    },
    {
      id: 5,
      slug: "project-five",
      title: "Project Five",
      summary: "A spatial sound and generative visual instrument built for live performance and sensory study.",
      role: "Creative Director & Sound Design",
      year: "2023",
      tools: "Web Audio API, Canvas, Kinetic Algorithms, Synthesis",
      world: "sage",
      image: "assets/project-5.jpg",
      alt: "Project Five overview",
      problem: [
        "Audio visualization tools often rely on arbitrary particle storms that detach visual feedback from musical resonance and sonic physics.",
        "Our ambition was cultivating a direct mathematical and physical connection between frequency, amplitude, and tactile screen motion."
      ],
      process: [
        "Sound synthesis engines were integrated with physics-based spring models to govern harmonic oscillation and kinetic rendering.",
        "Performers tested the instrument in live auditory environments to validate tactile responsiveness and visual clarity under performance pressure."
      ],
      result: "A captivating audiovisual instrument showcased in international exhibitions and live performances across the world."
    }
  ]
};
