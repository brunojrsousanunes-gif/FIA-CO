import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-public-config.js';

const $ = (selector, root = document) => root.querySelector(selector);
const state = { accessToken: '', user: null, operations: [] };
const ui = {
  auth: $('[data-auth]'), app: $('[data-private-app]'), form: $('[data-login-form]'),
  email: $('[data-email]'), password: $('[data-password]'), message: $('[data-private-message]'),
  identity: $('[data-identity]'), list: $('[data-operation-list]'), refresh: $('[data-refresh]'),
  logout: $('[data-logout]')
};

function setMessage(text, type = '') {
  ui.message.textContent = text;
  ui.message.className = type;
}

function headers(extra = {}) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${state.accessToken || SUPABASE_PUBLISHABLE_KEY}`,
    ...extra
  };
}

async function api(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: headers(options.headers)
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error('REQUEST_FAILED');
    error.status = response.status;
    error.code = body?.code || body?.error_code || 'REQUEST_FAILED';
    throw error;
  }
  return body;
}

function clearSession() {
  state.accessToken = '';
  state.user = null;
  state.operations = [];
  sessionStorage.removeItem('fia_demo_session');
  ui.password.value = '';
  render();
}

function saveSession(payload) {
  state.accessToken = payload.access_token;
  state.user = payload.user;
  sessionStorage.setItem('fia_demo_session', JSON.stringify({
    access_token: payload.access_token,
    user: payload.user,
    expires_at: Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600)
  }));
}

function restoreSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('fia_demo_session') || 'null');
    if (!saved?.access_token || !saved?.user || saved.expires_at <= Math.floor(Date.now() / 1000)) return;
    state.accessToken = saved.access_token;
    state.user = saved.user;
  } catch {
    sessionStorage.removeItem('fia_demo_session');
  }
}

function renderOperations() {
  ui.list.replaceChildren();
  if (!state.operations.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No hay operaciones visibles para este usuario.';
    ui.list.append(empty);
    return;
  }
  for (const operation of state.operations) {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    const meta = document.createElement('span');
    title.textContent = operation.reference;
    meta.textContent = `${operation.title} · ${operation.status} · versión ${operation.version}`;
    item.append(title, meta);
    ui.list.append(item);
  }
}

function render() {
  const signedIn = Boolean(state.accessToken && state.user);
  ui.auth.hidden = signedIn;
  ui.app.hidden = !signedIn;
  ui.identity.textContent = signedIn ? state.user.email || state.user.id : '';
  renderOperations();
}

async function loadOperations() {
  setMessage('Actualizando operaciones…');
  try {
    state.operations = await api('/rest/v1/operations?select=id,reference,title,status,version,updated_at&order=updated_at.desc&limit=50');
    renderOperations();
    setMessage('Operaciones sincronizadas.', 'success');
  } catch (error) {
    if (error.status === 401) clearSession();
    setMessage('No se pudieron cargar las operaciones. Revisa la sesión.', 'error');
  }
}

async function signIn(event) {
  event.preventDefault();
  const email = ui.email.value.trim();
  const password = ui.password.value;
  if (!email || !password) return setMessage('Introduce las credenciales de demostración.', 'error');
  setMessage('Verificando acceso…');
  try {
    const payload = await api('/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    saveSession(payload);
    render();
    await loadOperations();
  } catch {
    clearSession();
    setMessage('Acceso denegado. Comprueba las credenciales de demostración.', 'error');
  }
}

ui.form.addEventListener('submit', signIn);
ui.refresh.addEventListener('click', loadOperations);
ui.logout.addEventListener('click', clearSession);
window.addEventListener('pagehide', () => { state.accessToken = ''; state.user = null; });
restoreSession();
render();
if (state.accessToken) loadOperations();
