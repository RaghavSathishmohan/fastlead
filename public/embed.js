/**
 * LeadFast Embed Script
 * Drop this before </body> on any website to capture leads automatically.
 *
 * Usage:
 *   <script src="https://leadfast.raghavsathishmohan.com/embed.js"
 *           data-token="YOUR_TOKEN"></script>
 */
(function () {
  const TOKEN = document.currentScript?.getAttribute('data-token');
  const WEBHOOK_URL = 'https://leadfast.raghavsathishmohan.com/api/lead-capture';

  if (!TOKEN) {
    console.error('[LeadFast] Missing data-token attribute on embed script.');
    return;
  }

  // Track whether we have already intercepted a form
  let intercepted = false;

  function extractFormData(form) {
    const data = new FormData(form);
    const entries = {};
    data.forEach((value, key) => {
      if (!entries[key]) {
        entries[key] = value;
      } else if (Array.isArray(entries[key])) {
        entries[key].push(value);
      } else {
        entries[key] = [entries[key], value];
      }
    });
    return entries;
  }

  function buildLeadBody(entries) {
    const lines = [];
    for (const [key, value] of Object.entries(entries)) {
      lines.push(`${key}: ${value}`);
    }
    return lines.join('\n');
  }

  async function submitToLeadFast(body) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: TOKEN, body }),
      });
      return res.ok;
    } catch (err) {
      console.error('[LeadFast] Submit failed:', err);
      return false;
    }
  }

  function showSuccessMessage(form) {
    const msg = document.createElement('div');
    msg.className = 'leadfast-success';
    msg.textContent = 'Thank you! We will be in touch shortly.';
    msg.style.cssText = `
      background: #22c55e;
      color: white;
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      text-align: center;
    `;
    form.appendChild(msg);
    setTimeout(() => msg.remove(), 5000);
  }

  function interceptForm(form) {
    if (form.dataset.leadfast) return;
    form.dataset.leadfast = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const entries = extractFormData(form);
      const body = buildLeadBody(entries);
      const ok = await submitToLeadFast(body);

      if (ok) {
        showSuccessMessage(form);
        form.reset();
      } else {
        // Fallback: let the form submit normally if webhook fails
        form.submit();
      }
    });
  }

  function scanForms() {
    const forms = document.querySelectorAll('form');
    for (const form of forms) {
      // Skip search bars, login forms, etc.
      const action = (form.getAttribute('action') || '').toLowerCase();
      const method = (form.getAttribute('method') || 'get').toLowerCase();
      const hasEmail = form.querySelector('input[type="email"]') !== null;
      const hasPhone = form.querySelector('input[type="tel"]') !== null;
      const hasName = form.querySelector('input[name*="name" i]') !== null;

      if (hasEmail || hasPhone || hasName) {
        interceptForm(form);
        intercepted = true;
      }
    }
  }

  // Scan on load and after DOM mutations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanForms);
  } else {
    scanForms();
  }

  // Re-scan periodically for lazy-loaded forms
  const observer = new MutationObserver(() => {
    if (!intercepted) scanForms();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  console.log('[LeadFast] Embed active for token:', TOKEN);
})();
