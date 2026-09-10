// GSAP-powered motion layer. Respects prefers-reduced-motion; falls back to
// static (fully visible, no animation) if GSAP fails to load from the CDN.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Media query used to trim the priciest scroll/hover effects on phones —
  // continuous scrub-linked animation is the single heaviest cost on a
  // mobile GPU, and magnetic hover is meaningless on a touch screen anyway.
  var isMobile = window.matchMedia('(max-width: 768px)').matches || /Mobi|Android/i.test(navigator.userAgent);
  var revealTargets = document.querySelectorAll('[data-reveal]');

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduceMotion) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---- Hero entrance ----------------------------------------------------
  var heroTargets = document.querySelectorAll('.hero [data-reveal]');
  heroTargets.forEach(function (el) { el.classList.add('is-visible'); });

  gsap.from(heroTargets, {
    opacity: 0,
    y: 24,
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.12,
    delay: 0.1,
  });

  // ---- Scroll progress bar ------------------------------------------------
  gsap.to('#scroll-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    },
  });

  // ---- Sticky nav gains background/blur after leaving the very top -------
  ScrollTrigger.create({
    start: 'top -60',
    end: 99999,
    toggleClass: { targets: '.nav', className: 'is-scrolled' },
  });

  // ---- Section heads (simple fade + slight rise, once) --------------------
  document.querySelectorAll('.section-head, .about-grid, .contact-links, .contact-lead, .gallery3d-intro, .viewer-card, .model-carousel').forEach(function (el) {
    el.classList.add('is-visible');
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // ---- Project cards: staggered children, alternating slide direction ----
  document.querySelectorAll('.project').forEach(function (project, i) {
    var reverse = project.classList.contains('reverse');
    var media = project.querySelector('.project-media');
    var infoChildren = project.querySelectorAll('.project-info > *');

    project.classList.add('is-visible');

    var tl = gsap.timeline({
      scrollTrigger: { trigger: project, start: 'top 80%', once: true },
    });

    if (media) {
      tl.from(media, {
        opacity: 0,
        x: reverse ? 60 : -60,
        duration: 0.9,
        ease: 'power3.out',
      }, 0);
    }

    tl.from(infoChildren, {
      opacity: 0,
      x: reverse ? -40 : 40,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.08,
    }, media ? 0.1 : 0);

    // Subtle parallax on the media block while it scrolls through view.
    // Skipped on mobile: scrub-linked animation recalculates on every
    // scroll frame, which is the single heaviest cost a phone GPU pays here.
    if (media && !isMobile) {
      gsap.fromTo(
        media,
        { y: -24 },
        {
          y: 24,
          ease: 'none',
          scrollTrigger: {
            trigger: project,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      );
    }
  });

  // ---- Magnetic hover on buttons & contact cards --------------------------
  // Skipped on mobile: there's no hover on a touch screen, so this would
  // just be dead event listeners.
  var magnetic = isMobile ? [] : document.querySelectorAll('.btn, .contact-card');

  magnetic.forEach(function (el) {
    var xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    var yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var relX = e.clientX - rect.left - rect.width / 2;
      var relY = e.clientY - rect.top - rect.height / 2;
      xTo(relX * 0.25);
      yTo(relY * 0.25);
    });

    el.addEventListener('mouseleave', function () {
      xTo(0);
      yTo(0);
    });
  });
})();

// Golfin Swans' live embed is a heavy standalone WebGL/Three.js scene,
// so it stays gated behind a tap on mobile instead of auto-loading (never
// run it unasked alongside the 3D Gallery's own WebGL viewer). The scene
// itself now ships mobile-sized textures, no shadows/postprocessing and a
// WebGL context-loss recovery screen on the phone side — see Avant-Archviz.
// It loads in-page, same as desktop, just deferred until the visitor taps.
(function () {
  var embed = document.getElementById('golfin-embed');
  if (!embed) return;
  var iframe = embed.querySelector('iframe');
  var launchBtn = embed.querySelector('.embed-launch');
  var isMobile = window.matchMedia('(max-width: 768px)').matches || /Mobi|Android/i.test(navigator.userAgent);

  function load() {
    if (iframe.src) return;
    iframe.src = iframe.dataset.src;
    embed.classList.remove('needs-tap');
  }

  if (isMobile) {
    embed.classList.add('needs-tap');
    launchBtn.addEventListener('click', load);
  } else {
    load();
  }
})();
