// "Como funciona" — a foto respira no scroll em vez de reagir ao cursor.
// A referência não usa efeito de mouse aqui: a imagem entra por revelação e o
// movimento vem da rolagem. Um deslocamento contido dentro da moldura (que tem
// overflow clip) dá profundidade sem chamar atenção para si.
import { gsap } from '../lib/gsap.js';
import { $, reduced } from '../utils/dom.js';

export function comoFunciona() {
  const sec = $('#como-funciona');
  if (!sec || reduced) return;                 // reduced-motion: foto estática
  const img = $('.cf__bg img', sec);
  if (!img) return;

  // A escala extra é o que dá margem para o deslocamento: sem ela, a foto
  // descolaria das bordas da moldura nos extremos do percurso.
  gsap.fromTo(img,
    { yPercent: -6, scale: 1.14 },
    {
      yPercent: 6, ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
}
