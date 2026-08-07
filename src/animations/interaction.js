// Custom cursor + magnetic buttons (desktop pointer only).
import { gsap } from '../lib/gsap.js';
import { $, $$, fine } from '../utils/dom.js';

export function cursor() {
  if (!fine) return;
  const d = $('[data-cur]'), r = $('[data-cur-r]'); if (!d || !r) return;
  document.body.classList.add('cursoron');
  const dx = gsap.quickTo(d, 'x', { duration: 0.1 }), dy = gsap.quickTo(d, 'y', { duration: 0.1 });
  const rx = gsap.quickTo(r, 'x', { duration: 0.42, ease: 'power3' }), ry = gsap.quickTo(r, 'y', { duration: 0.42, ease: 'power3' });
  addEventListener('mousemove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  $$('a, button, [data-mag]').forEach((el) => {
    el.addEventListener('mouseenter', () => r.dataset.h = 'true');
    el.addEventListener('mouseleave', () => r.dataset.h = 'false');
  });
}

export function magnetic() {
  if (!fine) return;
  $$('[data-mag]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    el.addEventListener('mousemove', (e) => { const b = el.getBoundingClientRect();
      xTo((e.clientX - (b.left + b.width / 2)) * 0.3); yTo((e.clientY - (b.top + b.height / 2)) * 0.3); });
    el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });
}
