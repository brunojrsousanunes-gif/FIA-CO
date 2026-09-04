(() => {
  'use strict';

  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  const checks = [...document.querySelectorAll('[data-check]')];
  const evaluate = document.querySelector('[data-evaluate]');
  const result = document.querySelector('[data-result]');

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      for (const candidate of tabs) candidate.classList.toggle('active', candidate === tab);
      for (const panel of panels) {
        const active = panel.getAttribute('data-panel') === target;
        panel.hidden = !active;
        panel.classList.toggle('active', active);
      }
    });
  }

  evaluate?.addEventListener('click', () => {
    const completed = checks.filter(check => check.checked).length;
    if (!result) return;
    if (completed !== checks.length) {
      result.textContent = `Demo: ${completed}/${checks.length} controles preparados. FIA no solicitaría todavía datos reales ni crearía la operación L1.`;
      return;
    }
    result.textContent = 'Demo: entrada L1 preparada para revisión. La activación real seguiría requiriendo los controles técnicos, jurídicos y contractuales aplicables; esta pantalla no concede permisos.';
  });
})();
