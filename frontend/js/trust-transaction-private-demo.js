(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  const result = document.querySelector('[data-result]');

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-tab');
      for (const candidate of buttons) candidate.classList.toggle('active', candidate === button);
      for (const panel of panels) {
        const active = panel.getAttribute('data-panel') === target;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      }
    });
  }

  document.querySelector('[data-revoke]')?.addEventListener('click', () => {
    if (result) result.textContent = 'Demo: permiso de la empresa colaboradora revocado. En producción, el acceso quedaría denegado desde la política del servidor y se registraría el evento de auditoría.';
  });
})();
