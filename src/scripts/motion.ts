/**
 * motion.ts — sistema de motion para niche landings.
 *
 * Funcionalidades:
 * 1. Lenis smooth scroll
 * 2. Reveal observer (.fade-up, .fade-scale, .fade-in)
 * 3. Parallax helper (data-parallax="0.4" → mueve a 40% de la velocidad scroll)
 * 4. Counter animation (data-counter="100")
 * 5. 3D tilt en hover (data-tilt)
 * 6. Magnetic button (data-magnetic)
 *
 * Usage en cualquier .astro:
 *   <script>import '../scripts/motion';</script>
 *
 * Respeta prefers-reduced-motion: si el usuario lo tiene activo, todo se
 * desactiva y los elementos se muestran con opacidad 1 al toque.
 */
import Lenis from 'lenis';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

// ────────────────────────────────────────────────────────
// 1. Smooth scroll (Lenis)
// ────────────────────────────────────────────────────────
let lenis: Lenis | null = null;

if (!prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    lerp: 0.1,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    infinite: false,
  });

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ────────────────────────────────────────────────────────
// 2. Reveal observer — para .fade-up, .fade-scale, .fade-in, .clip-reveal
// ────────────────────────────────────────────────────────
const REVEAL_SELECTOR = '.fade-up, .fade-scale, .fade-in, .clip-reveal, .scroll-reveal';

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('motion-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  }
);

document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
  if (prefersReducedMotion) {
    el.classList.add('motion-visible');
  } else {
    revealObserver.observe(el);
  }
});

// ────────────────────────────────────────────────────────
// 3. Parallax — para elementos con data-parallax="0.4"
//    El valor es la velocidad relativa al scroll (1 = igual, 0 = quieto, 0.5 = mitad).
//    Negativo = se mueve al revés.
// ────────────────────────────────────────────────────────
interface ParallaxItem {
  el: HTMLElement;
  speed: number;
  initialOffset: number;
}

const parallaxItems: ParallaxItem[] = [];

if (!prefersReducedMotion && !isMobile) {
  // Solo desktop — en mobile parallax suele dar problemas de jank
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.3');
    const rect = el.getBoundingClientRect();
    parallaxItems.push({
      el,
      speed,
      initialOffset: window.scrollY + rect.top,
    });
  });

  function updateParallax() {
    const scrollY = window.scrollY;
    parallaxItems.forEach((item) => {
      const offset = (scrollY - item.initialOffset) * item.speed;
      item.el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  if (parallaxItems.length > 0) {
    if (lenis) {
      lenis.on('scroll', updateParallax);
    } else {
      window.addEventListener('scroll', updateParallax, { passive: true });
    }
    updateParallax();
  }
}

// ────────────────────────────────────────────────────────
// 4. Counter animation — para elementos con data-counter="100"
// ────────────────────────────────────────────────────────
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      const target = parseInt(el.dataset.counter || '0', 10);
      const duration = parseInt(el.dataset.counterDuration || '1500', 10);
      const startTime = performance.now();

      function tick(now: number) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        el.textContent = String(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
  if (prefersReducedMotion) {
    el.textContent = el.dataset.counter || '0';
  } else {
    counterObserver.observe(el);
  }
});

// ────────────────────────────────────────────────────────
// 5. 3D tilt — para cards con data-tilt
//    Solo desktop con pointer fine (sin touch).
// ────────────────────────────────────────────────────────
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const maxTilt = parseFloat(el.dataset.tilt || '6');
    el.style.transformStyle = 'preserve-3d';
    el.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = x * maxTilt;
      const rotateX = -y * maxTilt;
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// ────────────────────────────────────────────────────────
// 6. Magnetic button — el botón sigue levemente al cursor
//    Solo desktop fine pointer.
// ────────────────────────────────────────────────────────
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '0.3');
    el.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

// ────────────────────────────────────────────────────────
// 7. Touch feedback en mobile (cards con .touch-feedback)
// ────────────────────────────────────────────────────────
if (isMobile && !prefersReducedMotion) {
  document.querySelectorAll<HTMLElement>('.touch-feedback').forEach((el) => {
    el.style.transition = 'transform 0.15s ease-out';
    el.addEventListener('touchstart', () => {
      el.style.transform = 'scale(0.98)';
    }, { passive: true });
    el.addEventListener('touchend', () => {
      el.style.transform = 'scale(1)';
    }, { passive: true });
    el.addEventListener('touchcancel', () => {
      el.style.transform = 'scale(1)';
    }, { passive: true });
  });
}

export {};
