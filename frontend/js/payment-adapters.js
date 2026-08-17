(function (global) {
  'use strict';

  const adapters = {
    GOOGLE_PAY: {
      mode: 'SANDBOX_ONLY',
      role: 'PAYMENT_METHOD',
      enabled: true,
      requiresGateway: true,
      custody: false,
      note: 'Tokeniza el método de pago y delega el procesamiento al PSP/gateway.'
    },
    TIKTOK_SHOP: {
      mode: 'READINESS_ONLY',
      role: 'COMMERCE_RECONCILIATION',
      enabled: false,
      requiresGateway: false,
      custody: false,
      note: 'Preparado como conector futuro de pedidos/settlement; no se usa como pasarela FIA&CO.'
    },
    META_COMMERCE: {
      mode: 'READINESS_ONLY',
      role: 'COMMERCE_CHANNEL',
      enabled: false,
      requiresGateway: false,
      custody: false,
      note: 'No activar hasta confirmar programa, permisos y economía aplicables.'
    }
  };

  function getAdapter(name) {
    if (!adapters[name]) throw new Error('Adaptador no soportado');
    return Object.assign({}, adapters[name]);
  }

  function canActivate(name, economics) {
    const adapter = getAdapter(name);
    if (!adapter.enabled) return { ok: false, reason: 'NOT_ENABLED' };
    if (adapter.custody) return { ok: false, reason: 'CUSTODY_FORBIDDEN' };
    if (economics && economics.profitable === false) return { ok: false, reason: 'NEGATIVE_CONTRIBUTION' };
    return { ok: true, reason: 'SANDBOX_ALLOWED' };
  }

  global.FIACOPaymentAdapters = { adapters, getAdapter, canActivate };
})(typeof window !== 'undefined' ? window : globalThis);
