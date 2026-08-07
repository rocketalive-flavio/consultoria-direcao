// Rodapé — mantém o ano do copyright sempre correto sem edição manual.
import { $ } from '../utils/dom.js';

export function footerYear() {
  const el = $('[data-year]');
  if (el) el.textContent = String(new Date().getFullYear());
}
