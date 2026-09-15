"use strict";

const root = document.documentElement;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

// Add your full international number here, for example: https://wa.me/441234567890
const WHATSAPP_URL = "";

function initWhatsAppLink() {
  const link = document.querySelector("#whatsapp-link");
  if (!link || !WHATSAPP_URL) return;

  link.href = WHATSAPP_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.removeAttribute("aria-disabled");
  link.setAttribute("aria-label", "Contact Adam on WhatsApp");
}

function addFallbackPreview(preview, project) {
  const browserBar = document.createElement("div");
  browserBar.className = "browser-bar";
  browserBar.setAttribute("aria-hidden", "true");
  browserBar.append(document.createElement("span"), document.createElement("span"), document.createElement("span"));

  const content = document.createElement("div");
  content.className = "preview-content";

  const label = document.createElement("span");
  label.className = "preview-label";
  label.textContent = project.preview?.label || project.type;

  const heading = document.createElement("strong");
  heading.textContent = project.preview?.heading || project.name;

  const action = document.createElement("span");
  action.className = "preview-button";
  action.textContent = project.preview?.action || project.status || "Project preview";

  content.append(label, heading, action);
  preview.replaceChildren(browserBar, content);
  preview.setAttribute("role", "img");
  preview.setAttribute("aria-label", `Preview for ${project.name}`);
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const preview = document.createElement("div");
  preview.className = "project-preview";

  if (project.image) {
    const image = document.createElement("img");
    image.className = "project-image";
    image.src = project.image;
    image.alt = `${project.name} website preview`;
    image.width = 800;
    image.height = 600;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => addFallbackPreview(preview, project), { once: true });
    preview.append(image);
  } else {
    addFallbackPreview(preview, project);
  }

  const info = document.createElement("div");
  info.className = "project-info";

  const details = document.createElement("div");
  const name = document.createElement("h3");
  name.textContent = project.name;
  const type = document.createElement("p");
  type.textContent = project.type;
  details.append(name, type);
  info.append(details);

  if (project.url && !project.status) {
    const link = document.createElement("a");
    link.className = "project-link";
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Visit the ${project.name} live website`);
    link.append("Live website ");

    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    link.append(arrow);
    info.append(link);
  } else if (project.status) {
    const status = document.createElement("span");
    status.className = "project-status";
    status.textContent = project.status;
    status.setAttribute("aria-label", `${project.name} status: ${project.status}`);
    info.append(status);
  }

  card.append(preview, info);
  return card;
}

function renderProjects() {
  const grid = document.querySelector("#project-grid");
  const projects = window.PORTFOLIO_PROJECTS;
  if (!grid || !Array.isArray(projects)) return;

  grid.replaceChildren(...projects.map(createProjectCard));
}

function initMobileNavigation() {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-nav");

  if (!menuButton || !mobileMenu) return;

  const closeMenu = (restoreFocus = false) => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    mobileMenu.classList.remove("is-open");
    if (restoreFocus) menuButton.focus();
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    mobileMenu.classList.toggle("is-open", !isOpen);
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });
}

function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id) return;
      if (id === "#") {
        event.preventDefault();
        return;
      }

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotionQuery.matches ? "auto" : "smooth",
        block: "start"
      });

      if (history.replaceState) history.replaceState(null, "", id);
    });
  });
}

function initActiveNavigation() {
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-link")];
  if (!sections.length || !navLinks.length) return;

  const setActiveLink = (sectionId) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible[0]) setActiveLink(visible[0].target.id);
    },
    { rootMargin: "-22% 0px -55% 0px", threshold: [0, 0.1, 0.25] }
  );

  sections.forEach((section) => observer.observe(section));
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;

  // A future location/sunset preference can be returned here without changing the toggle system.
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  document.querySelectorAll(".theme-toggle").forEach((button) => {
    const switchingTo = theme === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Switch to ${switchingTo} theme`);
    button.setAttribute("aria-pressed", String(theme === "light"));

    const label = button.querySelector(".theme-label");
    if (label) label.textContent = `${switchingTo[0].toUpperCase()}${switchingTo.slice(1)} mode`;
  });

  window.dispatchEvent(new CustomEvent("portfolio-theme-change"));
}

function initThemeSwitching() {
  applyTheme(getPreferredTheme());

  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("portfolio-theme", nextTheme);
      applyTheme(nextTheme);
    });
  });
}

function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const status = form.querySelector(".form-status");
  const fields = [...form.querySelectorAll("input:not([type='hidden']):not([name='bot-field']), select, textarea")];

  const getError = (field) => {
    if (!field.validity.valid) {
      if (field.validity.valueMissing) return "This field is required.";
      if (field.validity.typeMismatch) return "Enter a valid email address.";
      if (field.validity.tooShort) return `Please use at least ${field.minLength} characters.`;
      return "Please check this field.";
    }
    return "";
  };

  const showFieldState = (field) => {
    const error = getError(field);
    const errorElement = document.querySelector(`#${field.id}-error`);
    field.setAttribute("aria-invalid", String(Boolean(error)));

    if (errorElement) {
      errorElement.textContent = error;
      if (error) field.setAttribute("aria-describedby", errorElement.id);
      else field.removeAttribute("aria-describedby");
    }

    return !error;
  };

  fields.forEach((field) => {
    field.addEventListener("blur", () => showFieldState(field));
    field.addEventListener("invalid", () => {
      showFieldState(field);
      status.textContent = "Please correct the highlighted fields.";
    });
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") showFieldState(field);
    });
  });

  form.addEventListener("submit", () => {
    status.textContent = "";
  });
}

function initParticleCanvas() {
  const canvas = document.querySelector("#particle-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let particles = [];
  let animationFrame = 0;
  let resizeFrame = 0;
  let isAnimating = false;
  let width = 0;
  let height = 0;
  let particleColor = "225, 225, 220";

  const makeParticle = () => {
    const opacity = Math.random() * 0.24 + 0.04;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.9 + 0.35,
      opacity,
      color: `rgba(${particleColor}, ${opacity})`,
      speedX: (Math.random() - 0.5) * 0.075,
      speedY: -(Math.random() * 0.095 + 0.025),
      blur: Math.random() > 0.72 ? Math.random() * 3 + 1 : 0
    };
  };

  const setCanvasSize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const particleCount = Math.min(115, Math.max(40, Math.floor((width * height) / 14500)));
    particles = Array.from({ length: particleCount }, makeParticle);
  };

  const updateParticleColor = () => {
    particleColor = getComputedStyle(root).getPropertyValue("--particle").trim();
    particles.forEach((particle) => {
      particle.color = `rgba(${particleColor}, ${particle.opacity})`;
    });
  };

  const draw = (animate = true) => {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      if (animate) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.y < -10) particle.y = height + 10;
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
      }

      context.beginPath();
      context.fillStyle = particle.color;
      context.shadowColor = particle.color;
      context.shadowBlur = particle.blur;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    });
  };

  const animate = () => {
    if (!isAnimating) return;
    draw(true);
    animationFrame = window.requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    isAnimating = false;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const updateAnimationState = () => {
    stopAnimation();
    if (reducedMotionQuery.matches || document.hidden) {
      draw(false);
      return;
    }

    isAnimating = true;
    animationFrame = window.requestAnimationFrame(animate);
  };

  const resize = () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      stopAnimation();
      setCanvasSize();
      updateAnimationState();
    });
  };

  updateParticleColor();
  setCanvasSize();
  updateAnimationState();

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", updateAnimationState);
  window.addEventListener("portfolio-theme-change", () => {
    updateParticleColor();
    if (reducedMotionQuery.matches && !document.hidden) draw(false);
  });
  reducedMotionQuery.addEventListener("change", updateAnimationState);
}

function initPortfolio() {
  renderProjects();
  initWhatsAppLink();
  initMobileNavigation();
  initSmoothScrolling();
  initActiveNavigation();
  initThemeSwitching();
  initContactForm();
  initParticleCanvas();

  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", initPortfolio);
