// Efeito reativo ao scroll: word-paint do statement
// [data-fill-sec]/[data-fill] (+ contador opcional [data-fill-prog]).
import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { $, reduced } from '../utils/dom.js';

// Pin-free word paint as the statement travels through the viewport.
export function scrollFill() {
  const sec = $('[data-fill-sec]'); if (!sec) return;
  const el = $('[data-fill]', sec); if (!el) return;
  const words = [];
  const frag = document.createDocumentFragment();
  [...el.childNodes].forEach((node) => {
    const accent = node.nodeType === 1 && node.tagName === 'EM';
    node.textContent.split(/(\s+)/).forEach((tok) => {
      if (tok === '') return;
      if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
      const s = document.createElement('span'); s.className = 'w' + (accent ? ' accent' : ''); s.textContent = tok;
      frag.appendChild(s); words.push(s);
    });
  });
  el.textContent = ''; el.appendChild(frag);
  const prog = $('[data-fill-prog]', sec);
  if (reduced) { words.forEach((w) => w.classList.add('on')); return; }
  ScrollTrigger.create({
    trigger: sec, scrub: 0.6, start: 'top 78%', end: 'bottom 38%', invalidateOnRefresh: true,
    onUpdate: (self) => {
      const n = Math.round(self.progress * words.length * 1.08);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
      if (prog) prog.textContent = String(Math.min(100, Math.round(self.progress * 100))).padStart(2, '0') + ' / 100';
    },
  });
}
