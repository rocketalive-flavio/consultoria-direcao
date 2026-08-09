// Formulário de aplicação — envia um POST JSON para o webhook do CRM.
// Endpoint do CRM. O `slug` identifica de qual landing page veio o lead.
// Se ficar vazio, o formulário avisa em vez de falhar em silêncio.
const WEBHOOK_URL = 'https://rxwskzlwdsrdlcxocyai.supabase.co/functions/v1/form-webhook?slug=consultoria-direcao';

import { $ } from '../utils/dom.js';

export function applicationForm() {
  const form = $('[data-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);
  const btn = form.querySelector('[type="submit"]');

  const say = (msg, state) => { if (!status) return; status.textContent = msg; status.dataset.state = state || ''; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    if (!WEBHOOK_URL) {
      say('Webhook do CRM ainda não configurado — defina WEBHOOK_URL em src/sections/form.js.', 'err');
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.origem = 'lp-consultoria-direcao';
    payload.enviado_em = new Date().toISOString();
    payload.pagina = location.href;

    btn.disabled = true;
    say('Enviando…');
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      say('Aplicação enviada. Em breve entramos em contato para agendar sua conversa.');
    } catch (err) {
      console.error('[form] falha no envio:', err);
      say('Não foi possível enviar agora. Tente novamente em instantes.', 'err');
    } finally {
      btn.disabled = false;
    }
  });
}
