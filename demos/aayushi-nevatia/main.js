/* ═══════════════════════════════════════════════════════════
   AAYUSHI NEVATIA — The Portfolio Issue
   scroll engine · particles · 3D drum · counters · cursor
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* native scroll + GSAP scrub smoothing — no scroll hijacking,
     so hash links, keyboard paging and find-in-page all stay intact */
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ── masthead: shrink + hide-on-down ───────────────────── */
  const masthead = document.getElementById("masthead");
  let lastY = 0;
  const onScrollHead = () => {
    const y = window.scrollY;
    masthead.classList.toggle("is-scrolled", y > 40);
    masthead.classList.toggle("is-hidden", y > 500 && y > lastY && !menuOpen);
    lastY = y;
  };
  window.addEventListener("scroll", onScrollHead, { passive: true });

  /* ── mobile menu ────────────────────────────────────────── */
  const burger = document.getElementById("burger");
  const mobmenu = document.getElementById("mobmenu");
  let menuOpen = false;
  function closeMenu() {
    menuOpen = false;
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    mobmenu.classList.remove("is-open");
    mobmenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  burger.addEventListener("click", () => {
    menuOpen = !menuOpen;
    burger.classList.toggle("is-open", menuOpen);
    burger.setAttribute("aria-expanded", String(menuOpen));
    mobmenu.classList.toggle("is-open", menuOpen);
    mobmenu.setAttribute("aria-hidden", String(!menuOpen));
    document.body.style.overflow = menuOpen ? "hidden" : "";
  });

  /* ── reading progress bar ──────────────────────────────── */
  const progressBar = document.getElementById("progressBar");
  const onScrollProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener("scroll", onScrollProgress, { passive: true });
  onScrollProgress();

  /* ── custom cursor ─────────────────────────────────────── */
  if (!isTouch && !prefersReduced) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let rx = -100, ry = -100, tx = -100, ty = -100;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      dot.style.opacity = ring.style.opacity = "1";
      dot.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
    }, { passive: true });
    (function ringLoop() {
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
      requestAnimationFrame(ringLoop);
    })();
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  }

  /* ── magnetic buttons ──────────────────────────────────── */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 14;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
        const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ── gold dust particles (hero + contact) ──────────────── */
  function dust(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    let w, h, parts = [];
    const N = isTouch ? 26 : 60;
    function size() {
      const r = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = r.width * devicePixelRatio;
      h = canvas.height = r.height * devicePixelRatio;
    }
    size();
    window.addEventListener("resize", size);
    for (let i = 0; i < N; i++) {
      parts.push({
        x: Math.random() * 1, y: Math.random() * 1,
        r: (Math.random() * 1.4 + 0.4) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.00012,
        vy: -(Math.random() * 0.00018 + 0.00005),
        tw: Math.random() * Math.PI * 2,
        ts: Math.random() * 0.02 + 0.005,
      });
    }
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.tw += p.ts;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        const a = 0.25 + Math.abs(Math.sin(p.tw)) * 0.55;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 201, 138, ${a})`;
        ctx.fill();
      }
    })();
  }
  dust("dust");
  dust("dust2");

  /* ── hero photo card: 3D mouse tilt + float ────────────── */
  const card = document.getElementById("coverCard");
  if (card && !isTouch && !prefersReduced) {
    const zone = document.getElementById("cover");
    zone.addEventListener("mousemove", (e) => {
      const r = zone.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(12px)`;
    });
    zone.addEventListener("mouseleave", () => { card.style.transform = ""; });
    card.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
  }

  /* ── story photo tilt ──────────────────────────────────── */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ── 3D partner drum ───────────────────────────────────── */
  (function drum() {
    const ring = document.getElementById("drumRing");
    if (!ring) return;
    const partners = [
      "Blinkit", "Zepto", "Instamart", "Amazon", "BigBasket", "Cars24",
      "Magnolia Bakery", "Bakingo", "FlowerAura", "Bioderma", "Aurelia",
      "Nykaa Wanderlust", "Chumbak",
    ];
    const n = partners.length;
    const panelW = window.innerWidth < 600 ? 230 : 300;
    const radius = Math.round((panelW / 2) / Math.tan(Math.PI / n)) + 20;
    /* pull the ring back by the radius so the front panel sits at the
       natural plane instead of scaling up into the viewer */
    const base = `translateZ(${-radius}px) rotateX(-6deg)`;
    ring.style.transform = `${base} rotateY(0deg)`;
    partners.forEach((name, i) => {
      const el = document.createElement("div");
      el.className = "drum__panel";
      el.textContent = name;
      el.style.transform = `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)`;
      ring.appendChild(el);
    });
    if (prefersReduced) return;

    let angle = 0, vel = 0.12, dragging = false, lastX = 0;
    let visible = true;
    /* observe the stage — the ring itself is a 0x0 anchor point and
       never "intersects" */
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(ring.parentElement);
    (function spin() {
      requestAnimationFrame(spin);
      if (!visible) return;
      if (!dragging) {
        angle += vel;
        vel += (0.12 - vel) * 0.02; /* ease back to cruise speed */
      }
      ring.style.transform = `${base} rotateY(${angle}deg)`;
    })();
    const stage = ring.parentElement;
    const start = (x) => { dragging = true; lastX = x; };
    const move = (x) => {
      if (!dragging) return;
      const dx = x - lastX; lastX = x;
      angle += dx * 0.25; vel = dx * 0.05;
    };
    const end = () => { dragging = false; };
    stage.addEventListener("pointerdown", (e) => start(e.clientX));
    window.addEventListener("pointermove", (e) => move(e.clientX), { passive: true });
    window.addEventListener("pointerup", end);
  })();

  /* ── count-up stats ────────────────────────────────────── */
  (function counters() {
    const els = document.querySelectorAll("[data-count]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        if (prefersReduced) {
          el.textContent = prefix + target.toFixed(decimals) + suffix;
          return;
        }
        const dur = 1600;
        const t0 = performance.now();
        (function tick(t) {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  })();

  /* ── GSAP scroll choreography ──────────────────────────── */
  if (!hasGsap || prefersReduced) return;

  /* hero entrance */
  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro
    .from(".cover__line > span", { yPercent: 115, duration: 1.3, stagger: 0.12 }, 0.15)
    .from(".reveal-line > span", { yPercent: 110, duration: 1, stagger: 0.1 }, 0.4)
    .from(".cover__meta, .cover__actions", { y: 30, autoAlpha: 0, duration: 1, stagger: 0.15 }, 0.75)
    .from("#coverPhoto", { y: 60, autoAlpha: 0, rotate: 8, duration: 1.4, ease: "power3.out" }, 0.55)
    .from(".cover__scroll", { autoAlpha: 0, duration: 0.8 }, 1.2)
    .from(".masthead", { yPercent: -120, duration: 0.9 }, 0.9);

  /* failsafe: if rAF is suppressed (background-tab load, throttled webview),
     force-complete the entrance so the hero is never left blank */
  setTimeout(() => { if (intro.progress() < 1) intro.progress(1); }, 2600);

  /* hero parallax out */
  gsap.to(".cover__inner", {
    yPercent: -12, autoAlpha: 0.25, ease: "none",
    scrollTrigger: { trigger: "#cover", start: "top top", end: "bottom top", scrub: 0.7 },
  });
  gsap.to("#coverPhoto", {
    yPercent: 18, ease: "none",
    scrollTrigger: { trigger: "#cover", start: "top top", end: "bottom top", scrub: 0.7 },
  });

  /* chapter number drift */
  document.querySelectorAll("[data-parallax]").forEach((el) => {
    gsap.to(el, {
      yPercent: parseFloat(el.dataset.parallax) * 4, ease: "none",
      scrollTrigger: { trigger: el.closest(".chapter"), start: "top bottom", end: "bottom top", scrub: 0.7 },
    });
  });

  /* generic reveals */
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 44, autoAlpha: 0, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* chapter titles: clip reveal */
  document.querySelectorAll(".chapter__title").forEach((el) => {
    gsap.from(el, {
      y: 60, autoAlpha: 0, duration: 1.2, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* method: pinned horizontal scroll */
  (function methodPin() {
    const track = document.getElementById("methodTrack");
    const pin = document.getElementById("methodPin");
    if (!track || !pin) return;
    const getDist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -getDist(),
      ease: "none",
      scrollTrigger: {
        trigger: "#method",
        start: "top top",
        end: () => "+=" + (getDist() + window.innerHeight * 0.35),
        pin: pin,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          document.getElementById("methodBar").style.transform = `scaleX(${self.progress})`;
        },
      },
    });
    /* step cards breathe as they pass */
    document.querySelectorAll(".method__step").forEach((step) => {
      gsap.from(step, {
        autoAlpha: 0.35, scale: 0.94, ease: "none",
        scrollTrigger: {
          trigger: step, containerAnimation: tween,
          start: "left 95%", end: "left 55%", scrub: true,
        },
      });
    });
  })();

  /* deck: cards scale down as next covers them */
  (function deckStack() {
    const cards = gsap.utils.toArray(".deck__card");
    cards.forEach((cardEl, i) => {
      if (i === cards.length - 1) return;
      gsap.to(cardEl, {
        scale: 0.94, autoAlpha: 0.65, transformOrigin: "center top", ease: "none",
        scrollTrigger: {
          trigger: cards[i + 1],
          start: "top bottom",
          end: "top top+=120",
          scrub: 0.5,
        },
      });
    });
  })();

  /* contact title reveal */
  gsap.from(".contact__title .cover__line > span", {
    yPercent: 115, duration: 1.2, stagger: 0.12, ease: "power4.out",
    scrollTrigger: { trigger: "#contact", start: "top 70%" },
  });

  /* ticker slows slightly while hero visible? keep simple. */

  /* refresh after images/fonts settle */
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
