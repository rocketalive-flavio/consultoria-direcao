// Scroll reveals: [data-fade] fade-up, [data-words] SplitText line-mask,
// [data-wipe] clip-path wipe and [data-plx] in-frame photo parallax.
// Generic on purpose — everything binds via data-attributes, never content classes.
import { gsap, ScrollTrigger, SplitText } from '../lib/gsap.js';
import { $$, reduced, fine } from '../utils/dom.js';

export async function reveals() {
  await document.fonts.ready;
  // Com reduced-motion a página é estática: nada pode ser escondido para depois
  // ser revelado — sem esta saída, todo [data-fade]/[data-words] fora do viewport
  // ficaria em opacity 0 permanentemente.
  if (reduced) return;
  const fades = $$('[data-fade]');
  gsap.set(fades, { opacity: 0, y: 22 });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    gsap.to(e.target, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }); io.unobserve(e.target);
  }), { threshold: 0.12 });
  fades.forEach((el) => io.observe(el));

  const splits = [];
  $$('[data-words]').forEach((el) => {
    const s = new SplitText(el, { type: 'lines', mask: 'lines' });
    // A máscara recorta exatamente a caixa da linha, então descendentes que
    // ultrapassam o line-height são decepados — o "ç" de Direção, o "g", o "p".
    // Folga extra na máscara, anulada por margem negativa para não mexer no ritmo.
    s.lines.forEach((linha) => {
      const mascara = linha.parentNode;
      if (!mascara || getComputedStyle(mascara).overflow === 'visible') return;
      mascara.style.paddingBottom = '0.18em';
      mascara.style.marginBottom = '-0.18em';
    });
    gsap.set(s.lines, { yPercent: 110 });
    const rec = { el, s, played: false };
    const play = () => { if (rec.played) return; rec.played = true; gsap.to(s.lines, { yPercent: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1 }); };
    splits.push(rec);
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: play });
  });
  // Failsafe: nothing may stay invisible forever (fonts/CDN hiccups included).
  setTimeout(() => {
    const inV = (el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
    splits.forEach((r) => { if (!r.played && inV(r.el)) { r.played = true; gsap.set(r.s.lines, { yPercent: 0 }); } });
    $$('[data-fade]').forEach((el) => { if (inV(el) && parseFloat(getComputedStyle(el).opacity) < 0.05) { el.style.opacity = '1'; el.style.transform = 'none'; } });
  }, 4500);
}

// Parallax inside framed photos: mark the <img> parent frame with [data-plx].
export function frameParallax() {
  if (reduced || !fine) return;
  $$('[data-plx] img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -7, scale: 1.16 }, { yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

// Signature wipe-reveal (clip-path) on [data-wipe] blocks.
export function sectionReveal() {
  if (reduced || !fine) return;
  $$('[data-wipe]').forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) return;  // visible at load → leave alone
    // `round` preserva o border-radius: um inset() sem ele recorta em canto reto
    // e achata molduras arredondadas durante toda a animação.
    const r = getComputedStyle(el).borderRadius;
    const round = r && parseFloat(r) ? ` round ${r}` : '';
    gsap.set(el, { clipPath: `inset(0 0 100% 0${round})` });
    gsap.to(el, { clipPath: `inset(0 0 0% 0${round})`, ease: 'power3.out', duration: 1.1,
      scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
  });
}
