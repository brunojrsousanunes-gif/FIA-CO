(() => {
  'use strict';

  const STORAGE_KEY = 'fia-recover-demonstrator-v1';
  const RESPONSE_SEQUENCE = ['INTERESTED', 'QUESTION', 'DECLINED'];

  const defaultState = () => ({
    baseline: {
      quotesSent: 40,
      quotesFollowed: 12,
      quoteValue: 80000,
      hours: 10,
      delay: 72,
      hourly: 18
    },
    economics: {
      monthly: 129,
      implementation: 199,
      tech: 8,
      humanMinutes: 45,
      humanHourly: 20
    },
    cases: [
      { id: 'P-2026-041', amount: 3200, state: 'WAITING', attempts: 0, response: null, attribution: null, outcomeValue: 0 },
      { id: 'P-2026-042', amount: 7800, state: 'WAITING', attempts: 1, response: null, attribution: null, outcomeValue: 0 },
      { id: 'P-2026-043', amount: 1450, state: 'HUMAN_REVIEW', attempts: 1, response: 'QUESTION', attribution: null, outcomeValue: 0 },
      { id: 'P-2026-044', amount: 9600, state: 'WAITING', attempts: 0, response: null, attribution: null, outcomeValue: 0 },
      { id: 'P-2026-045', amount: 5100, state: 'WAITING', attempts: 2, response: null, attribution: null, outcomeValue: 0 }
    ],
    events: []
  });

  function round2(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
  }

  function money(value) {
    return `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(round2(value))} €`;
  }

  function percent(value) {
    return `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(Number(value || 0) * 100)}%`;
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (parsed && Array.isArray(parsed.cases) && parsed.baseline && parsed.economics) return parsed;
    } catch (_) {
      // Fail closed to a synthetic clean state.
    }
    return defaultState();
  }

  let state = loadState();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function log(type, meta = {}) {
    state.events.push({
      type,
      at: new Date().toISOString(),
      actor: 'HUMAN_DEMO',
      meta: { ...meta, externalAction: false }
    });
    state.events = state.events.slice(-100);
  }

  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function button(label, action, caseId, className = '') {
    const node = el('button', label, className);
    node.type = 'button';
    node.dataset.action = action;
    node.dataset.caseId = caseId;
    return node;
  }

  function compute() {
    const attempts = state.cases.reduce((sum, item) => sum + Number(item.attempts || 0), 0);
    const responses = state.cases.filter(item => item.response).length;
    const confirmed = state.cases
      .filter(item => item.state === 'WON' && item.attribution === 'CONFIRMED')
      .reduce((sum, item) => sum + Number(item.outcomeValue || 0), 0);
    const assisted = state.cases
      .filter(item => item.state === 'WON' && item.attribution === 'ASSISTED')
      .reduce((sum, item) => sum + Number(item.outcomeValue || 0), 0);
    const followedCases = state.cases.filter(item => item.attempts > 0).length;
    const clientHoursSavedEstimate = round2(Math.max(0, Number(state.baseline.hours || 0) * 0.7));
    const estimatedTimeValue = round2(clientHoursSavedEstimate * Number(state.baseline.hourly || 0));
    const humanCost = (Number(state.economics.humanMinutes || 0) / 60) * Number(state.economics.humanHourly || 0);
    const variableCost = Number(state.economics.tech || 0) + humanCost;
    const monthly = Number(state.economics.monthly || 0);
    const margin = monthly > 0 ? (monthly - variableCost) / monthly : null;

    return {
      attempts,
      responses,
      confirmed,
      assisted,
      followedCases,
      pilotCoverage: state.cases.length ? followedCases / state.cases.length : 0,
      baselineCoverage: Number(state.baseline.quotesSent || 0) > 0
        ? Number(state.baseline.quotesFollowed || 0) / Number(state.baseline.quotesSent || 0)
        : 0,
      clientHoursSavedEstimate,
      estimatedTimeValue,
      variableCost,
      margin
    };
  }

  function renderMetrics(stats) {
    document.querySelector('[data-metric="tracked"]').textContent = String(state.cases.length);
    document.querySelector('[data-metric="attempts"]').textContent = String(stats.attempts);
    document.querySelector('[data-metric="responses"]').textContent = String(stats.responses);
    document.querySelector('[data-metric="confirmed"]').textContent = money(stats.confirmed);
    document.querySelector('[data-metric="cost"]').textContent = money(stats.variableCost);
    document.querySelector('[data-metric="margin"]').textContent = stats.margin == null ? '—' : percent(stats.margin);
  }

  function renderBaseline(stats) {
    const target = document.querySelector('[data-baseline-summary]');
    target.textContent = `Seguimiento antes de FIA: ${percent(stats.baselineCoverage)} · demora media declarada: ${state.baseline.delay} h · ${money(state.baseline.quoteValue)} presupuestados en el periodo.`;
  }

  function renderEconomics(stats) {
    const target = document.querySelector('[data-economics-summary]');
    const techRatio = Number(state.economics.monthly || 0) > 0 ? Number(state.economics.tech || 0) / Number(state.economics.monthly || 0) : 0;
    target.textContent = `Coste variable demo: ${money(stats.variableCost)} · ratio tecnología/cuota: ${percent(techRatio)} · margen de contribución mensual estimado: ${stats.margin == null ? '—' : percent(stats.margin)}.`;
  }

  function renderCases() {
    const tbody = document.querySelector('[data-case-table]');
    tbody.replaceChildren();

    state.cases.forEach(item => {
      const row = document.createElement('tr');
      row.append(el('td', item.id));
      row.append(el('td', money(item.amount)));

      const statusCell = document.createElement('td');
      statusCell.append(el('span', item.state, `status ${item.state}`));
      row.append(statusCell);
      row.append(el('td', `${item.attempts}/3`));
      row.append(el('td', item.response || '—'));

      const actions = el('td', null, 'case-actions');
      const follow = button('Registrar seguimiento', 'follow', item.id);
      follow.disabled = item.state !== 'WAITING' || item.attempts >= 3;
      const respond = button('Simular respuesta', 'response', item.id);
      respond.disabled = item.state !== 'WAITING';
      const won = button('Confirmar ganada', 'won', item.id, 'primary');
      won.disabled = item.state !== 'HUMAN_REVIEW';
      const assisted = button('Ganada asistida', 'assisted', item.id);
      assisted.disabled = item.state !== 'HUMAN_REVIEW';
      const lost = button('Marcar perdida', 'lost', item.id);
      lost.disabled = item.state !== 'HUMAN_REVIEW';
      actions.append(follow, respond, won, assisted, lost);
      row.append(actions);
      tbody.append(row);
    });
  }

  function renderProof(stats) {
    const root = document.querySelector('[data-proof-preview]');
    root.replaceChildren();
    const rows = [
      ['Seguimiento baseline', percent(stats.baselineCoverage)],
      ['Cobertura en la demo', percent(stats.pilotCoverage)],
      ['CONFIRMED', money(stats.confirmed)],
      ['ASSISTED', money(stats.assisted)],
      ['ESTIMATED ahorro de tiempo', `${money(stats.estimatedTimeValue)} (${stats.clientHoursSavedEstimate} h; hipótesis sintética 70%)`],
      ['Coste variable FIA', money(stats.variableCost)],
      ['Cuota mensual hipótesis', money(state.economics.monthly)]
    ];
    rows.forEach(([label, value]) => {
      const row = el('div', null, 'proof-row');
      row.append(el('span', label), el('strong', value));
      root.append(row);
    });
  }

  function render() {
    const stats = compute();
    renderMetrics(stats);
    renderBaseline(stats);
    renderEconomics(stats);
    renderCases();
    renderProof(stats);
    save();
  }

  function readNumericForm(form) {
    const data = new FormData(form);
    const result = {};
    for (const [key, value] of data.entries()) result[key] = Math.max(0, Number(value || 0));
    return result;
  }

  document.querySelector('[data-baseline-form]').addEventListener('submit', event => {
    event.preventDefault();
    const next = readNumericForm(event.currentTarget);
    if (next.quotesFollowed > next.quotesSent) return;
    state.baseline = next;
    log('BASELINE_UPDATED');
    render();
  });

  document.querySelector('[data-economics-form]').addEventListener('submit', event => {
    event.preventDefault();
    state.economics = readNumericForm(event.currentTarget);
    log('ECONOMICS_UPDATED');
    render();
  });

  document.querySelector('[data-case-table]').addEventListener('click', event => {
    const control = event.target.closest('button[data-action]');
    if (!control) return;
    const item = state.cases.find(candidate => candidate.id === control.dataset.caseId);
    if (!item) return;

    const action = control.dataset.action;
    if (action === 'follow' && item.state === 'WAITING' && item.attempts < 3) {
      item.attempts += 1;
      log('CONTACT_ATTEMPT_RECORDED', { caseId: item.id, approvedByHuman: true });
    }

    if (action === 'response' && item.state === 'WAITING') {
      item.response = RESPONSE_SEQUENCE[item.attempts % RESPONSE_SEQUENCE.length];
      item.state = 'HUMAN_REVIEW';
      log('RESPONSE_CLASSIFIED', { caseId: item.id, responseClass: item.response, requiresHumanReview: true });
    }

    if (action === 'won' && item.state === 'HUMAN_REVIEW') {
      item.state = 'WON';
      item.attribution = 'CONFIRMED';
      item.outcomeValue = item.amount;
      log('OUTCOME_CONFIRMED', { caseId: item.id, attribution: 'CONFIRMED', approvedByHuman: true });
    }

    if (action === 'assisted' && item.state === 'HUMAN_REVIEW') {
      item.state = 'WON';
      item.attribution = 'ASSISTED';
      item.outcomeValue = item.amount;
      log('OUTCOME_CONFIRMED', { caseId: item.id, attribution: 'ASSISTED', approvedByHuman: true });
    }

    if (action === 'lost' && item.state === 'HUMAN_REVIEW') {
      item.state = 'LOST';
      item.attribution = null;
      item.outcomeValue = 0;
      log('OUTCOME_CONFIRMED', { caseId: item.id, outcome: 'LOST', approvedByHuman: true });
    }

    render();
  });

  document.querySelector('[data-reset]').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    render();
  });

  render();
})();
