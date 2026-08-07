// "Para quem é a Direção?" — hierarquia e ritmo desta seção.
//
// 1. O card 01 começa na linha de baixo do título: a lista recebe um recuo igual
//    à altura do H2, medido em runtime (o título é fluido, então esse valor não
//    pode ser fixado no CSS).
// 2. Os cards 02+ só se assentam DEPOIS que o título trava. O gatilho é a própria
//    seção, disparando no ponto exato em que o aside gruda — e não a posição de
//    cada card. Assim a animação acompanha a leitura da coluna fixa.
import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { $, $$, reduced } from '../utils/dom.js';

// Ângulo de entrada por card, alternando o lado (como cartas jogadas na mesa).
// Contidos de propósito: um card tem ~600px de largura, e cada grau de rotação
// faz seus cantos avançarem ~5px sobre o card vizinho. Acima de ~5° eles se
// cruzam durante o movimento, mesmo com o respiro atual entre cards.
const ANGULOS = [3.5, -5, 4, -3.5];
const DESKTOP = 961;

export function paraQuem() {
  const sec = $('#para-quem');
  if (!sec) return;
  const lista = $('[data-stack]', sec);
  const aside = $('.pq__aside', sec);
  const titulo = $('.sec__h', sec);
  if (!lista) return;
  const cards = $$('[data-stack-card]', lista);
  if (!cards.length) return;

  // ── 1. Card 01 na linha de baixo do título ──────────────────────────────
  if (titulo && aside) {
    const alinhar = () => {
      // Distância do topo do aside até a base do título — não a altura do H2:
      // assim o recuo continua certo mesmo que o título ganhe margem ou mude de
      // número de linhas.
      const recuo = titulo.getBoundingClientRect().bottom - aside.getBoundingClientRect().top;
      lista.style.paddingTop = window.innerWidth >= DESKTOP ? `${Math.max(0, Math.round(recuo))}px` : '';
      ScrollTrigger.refresh();
    };
    alinhar();
    if (window.ResizeObserver) new ResizeObserver(alinhar).observe(titulo);
  }

  // ── 2. Assentamento dos cards 02+, atrelado ao travamento do título ─────
  if (reduced || !aside) return;              // reduced-motion: já nascem no lugar
  const demais = cards.slice(1);              // o 01 é âncora: não se mexe
  if (!demais.length) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec,
      // O `top` do sticky é o instante exato em que o título para de rolar.
      start: () => `top ${parseFloat(getComputedStyle(aside).top) || 0}px`,
      end: 'bottom 80%',
      scrub: 0.7,
      invalidateOnRefresh: true,
    },
  });

  demais.forEach((card, i) => {
    tl.fromTo(card,
      // y menor que o respiro entre cards: senão, ao descer, um card invade o
      // anterior durante a animação.
      { rotate: ANGULOS[i % ANGULOS.length], y: 30, opacity: 0.55,
        xPercent: window.innerWidth >= DESKTOP ? 5 : 0 },
      { rotate: 0, xPercent: 0, y: 0, opacity: 1, ease: 'none', duration: 1 },
      i * 0.75);                              // escalonado: um card por vez
  });
}
