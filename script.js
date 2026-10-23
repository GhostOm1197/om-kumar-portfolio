/* OM KUMAR JHA — PORTFOLIO INTERACTIONS */

const menuToggle = document.querySelector("#menu-toggle");
const desktopNav = document.querySelector("#desktop-nav");
const navLinks = document.querySelectorAll(".nav-link");
const header = document.querySelector("#site-header");
const backToTop = document.querySelector("#back-to-top");
const yearElement = document.querySelector("#current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

function closeMenu() {
  if (!menuToggle || !desktopNav) return;
  menuToggle.classList.remove("is-open");
  desktopNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

if (menuToggle && desktopNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    menuToggle.classList.toggle("is-open", !isOpen);
    desktopNav.classList.toggle("is-open", !isOpen);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    const menuIsOpen = desktopNav.classList.contains("is-open");
    if (menuIsOpen && !desktopNav.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) closeMenu();
  });
}

// Reveal sections as they enter the viewport.
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -35px 0px"
  });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

// Add a compact sticky header and back-to-top button after scrolling.
function updateScrollUI() {
  const scrolled = window.scrollY > 70;
  header?.classList.toggle("is-scrolled", scrolled);
  backToTop?.classList.toggle("is-visible", window.scrollY > 550);
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});

// Highlight the current section in the navigation.
const sections = document.querySelectorAll("main section[id]");
if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, {
    rootMargin: "-25% 0px -65% 0px",
    threshold: 0
  });
  sections.forEach((section) => navObserver.observe(section));
}


/* ==========================================================
   MOTION LAYER
   ========================================================== */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- Hero headline: split into letters that rise one by one ---- */
  function splitHeroTitle() {
    const title = document.querySelector(".hero-title");
    if (!title || reduceMotion) return;
    title.setAttribute("aria-label", title.textContent.trim());
    let index = 0;
    title.querySelectorAll(":scope > span").forEach((line) => {
      Array.from(line.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          for (const ch of node.textContent.trim()) {
            const span = document.createElement("span");
            span.className = "char";
            span.textContent = ch;
            span.setAttribute("aria-hidden", "true");
            span.style.setProperty("--i", index++);
            frag.appendChild(span);
          }
          line.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.classList.add("char");
          node.setAttribute("aria-hidden", "true");
          node.style.setProperty("--i", index++);
        }
      });
    });
    title.classList.add("is-split");
  }

  /* ---- Hero code card: lines type in, then a caret blinks ---- */
  function typeHeroCode() {
    const code = document.querySelector(".code-top pre code");
    if (!code || reduceMotion) return;
    const lines = code.innerHTML.split("\n");
    code.innerHTML = lines
      .map((line, i) => `<span class="code-line" style="--l:${i}">${line || "&nbsp;"}</span>`)
      .join("");
    code.lastElementChild.insertAdjacentHTML("beforeend", '<i class="caret"></i>');
    code.parentElement.classList.add("is-typed");
  }

  /* ---- Statement headline: lines slide up from a mask ---- */
  function splitStatement() {
    const h2 = document.querySelector(".statement-inner h2");
    if (!h2 || reduceMotion) return;
    const lines = h2.innerHTML.split(/<br\s*\/?>/i);
    h2.innerHTML = lines
      .map((line, i) => `<i class="line"><i class="line-inner" style="--l:${i}">${line}</i></i>`)
      .join("");
    h2.classList.add("is-split");
  }

  /* ---- Hero layers drift slightly with the pointer ---- */
  function heroParallax() {
    const hero = document.querySelector(".hero");
    const visual = document.querySelector(".hero-visual");
    if (!hero || !visual || reduceMotion || !finePointer) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      visual.style.setProperty("--px", cx.toFixed(3));
      visual.style.setProperty("--py", cy.toFixed(3));
      raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : null;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ty = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      start();
    });
    hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; start(); });
  }

  /* ---- Buttons lean toward the pointer ---- */
  function magneticButtons() {
    if (reduceMotion || !finePointer) return;
    document.querySelectorAll(".button, .header-cta").forEach((el) => {
      el.classList.add("magnetic");
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        el.style.translate = `${(x * 0.22).toFixed(1)}px ${(y * 0.32).toFixed(1)}px`;
      });
      el.addEventListener("pointerleave", () => { el.style.translate = ""; });
    });
  }

  /* ---- Scroll progress bar ---- */
  function scrollProgress() {
    if (reduceMotion) return;
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty("--progress", max > 0 ? Math.min(window.scrollY / max, 1).toFixed(4) : 0);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---- Stat counter ---- */
  function countUp() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const pad = (n) => String(n).padStart(2, "0");
      el.textContent = pad(0);
      const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const startTime = performance.now();
        const duration = 900;
        const step = (now) => {
          const t = Math.min((now - startTime) / duration, 1);
          el.textContent = pad(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.6 });
      observer.observe(el);
    });
  }

  /* ---- Seamless tickers: duplicate content, measure one loop ---- */
  function setupMarquee(track, pxPerSecond) {
    if (!track || reduceMotion) return;
    const originals = Array.from(track.children);
    if (!originals.length) return;
    const container = track.parentElement;

    const addSet = () => originals.forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    addSet();
    track.classList.add("is-marquee");

    const measure = () => {
      const clones = Array.from(track.children).slice(originals.length, originals.length * 2);
      const shift = clones[0].offsetLeft - originals[0].offsetLeft;
      if (shift <= 0) return;
      let guard = 0;
      while (track.scrollWidth < shift + container.clientWidth + 2 && guard++ < 10) addSet();
      track.style.setProperty("--marquee-shift", `${shift}px`);
      track.style.setProperty("--marquee-duration", `${(shift / pxPerSecond).toFixed(2)}s`);
    };

    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    });
  }

  /* ---- FAQ: smooth open and close ---- */
  function smoothFaq() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const summary = item.querySelector("summary");
      if (!summary || reduceMotion || !item.animate) return;
      let animation = null;
      let pendingOpen = item.open;

      summary.addEventListener("click", (event) => {
        event.preventDefault();
        if (animation) {
          animation.onfinish = null;
          animation.cancel();
          item.open = pendingOpen;
        }
        item.style.overflow = "hidden";
        const startHeight = item.offsetHeight;
        const opening = !item.open;
        let endHeight;

        if (opening) {
          item.open = true;
          endHeight = item.offsetHeight;
        } else {
          item.open = false;
          endHeight = item.offsetHeight;
          item.open = true;
        }

        pendingOpen = opening;
        animation = item.animate(
          { height: [`${startHeight}px`, `${endHeight}px`] },
          { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
        animation.onfinish = () => {
          item.open = opening;
          item.style.overflow = "";
          animation = null;
        };
      });
    });
  }

  splitHeroTitle();
  typeHeroCode();
  splitStatement();
  heroParallax();
  magneticButtons();
  scrollProgress();
  countUp();
  smoothFaq();
  setupMarquee(document.querySelector(".tech-track"), 60);
  setupMarquee(document.querySelector(".contact-marquee"), 90);
})();