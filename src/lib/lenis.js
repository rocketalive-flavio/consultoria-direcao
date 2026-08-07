// src/lib/lenis.js — Scroll system (single source of truth for scroll).
// Golden rule: Lenis rides the GSAP ticker — never two RAF loops.
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.mjs';
import { gsap, ScrollTrigger } from './gsap.js';

let lenis = null;

export function initLenis() {
  if (lenis) return lenis;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const mobile = window.innerWidth <= 1000;

  lenis = new Lenis({
    duration: mobile ? 0.7 : 0.85,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),   // expo-out
    smoothWheel: true,
    smoothTouch: mobile,
    touchMultiplier: mobile ? 1.5 : 2,
    autoRaf: false,                              // ride the GSAP ticker instead
  });
  window.lenis = lenis;

  // ── Golden rule (these three lines never change) ──
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links → Lenis smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -10, duration: 1.2 });
    });
  });

  return lenis;
}

export function getLenis() { return lenis; }
export function lenisStop() { if (lenis) lenis.stop(); }
export function lenisStart() { if (lenis) lenis.start(); }
