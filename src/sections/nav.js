// Header — transparent at the very top, scrim once scrolled.
import { ScrollTrigger } from '../lib/gsap.js';
import { $ } from '../utils/dom.js';

export function navScroll() {
  const nav = $('[data-nav]'); if (!nav) return;
  ScrollTrigger.create({ start: 60, end: 'max', onToggle: (s) => nav.classList.toggle('is-stuck', s.isActive) });
}
