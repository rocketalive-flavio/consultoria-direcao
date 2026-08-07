// Hero — as linhas do statement sobem e a barra inferior aparece assim que o DOM
// está pronto. Também é a casa do efeito assinatura: a bússola 3D, montada em
// paralelo para não atrasar a entrada do texto.
import { gsap } from '../lib/gsap.js';
import { initCompass3D } from '../lib/compass3d.js';
import { $, $$, reduced } from '../utils/dom.js';

export function heroIntro() {
  const hero = $('[data-hero]');
  if (!hero) return;

  const stage = $('[data-c3d]', hero);
  if (stage) {
    const compass = initCompass3D(stage);
    // Sem WebGL a peça simplesmente não existe — o hero continua legível.
    // A entrada para em --stage-op (não em 1): o palco é translúcido por design.
    if (compass && !reduced) {
      const op = parseFloat(getComputedStyle(stage).opacity) || 1;
      gsap.fromTo(stage, { opacity: 0 }, { opacity: op, duration: 1.6, ease: 'power2.out' });
    }
  }

  if (reduced) return;
  const lines = $$('[data-hero-line]', hero);
  const bar = $('[data-hero-bar]', hero);
  const tl = gsap.timeline();
  if (lines.length) tl.fromTo(lines, { yPercent: 55, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.09, ease: 'power3.out' });
  if (bar) tl.fromTo(bar, { opacity: 0 }, { opacity: 1, duration: 0.7 }, '-=0.4');
}
