// Consultoria Direção — entry point. Liga o sistema de scroll (Lenis) + motion
// (GSAP) e boota cada módulo de seção. A ordem é intencional: scroll → chrome →
// conteúdo/motion. Cada responsabilidade vive no seu próprio módulo.
// Sem preloader: o conteúdo entra assim que o DOM está pronto.
import { initLenis } from './lib/lenis.js';
import { ScrollTrigger } from './lib/gsap.js';
import { cursor, magnetic } from './animations/interaction.js';
import { reveals, frameParallax, sectionReveal } from './animations/reveals.js';
import { scrollFill } from './animations/scroll-fx.js';
import { heroIntro } from './sections/hero.js';
import { paraQuem } from './sections/para-quem.js';
import { comoFunciona } from './sections/como-funciona.js';
import { navScroll } from './sections/nav.js';
import { applicationForm } from './sections/form.js';
import { footerYear } from './sections/footer.js';

async function boot() {
  initLenis();
  cursor();
  magnetic();
  navScroll();
  applicationForm();
  footerYear();

  heroIntro();
  await reveals();
  scrollFill();
  frameParallax();
  sectionReveal();
  paraQuem();
  comoFunciona();
  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

addEventListener('load', () => ScrollTrigger.refresh());
