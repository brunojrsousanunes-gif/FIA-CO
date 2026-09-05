import crypto from 'node:crypto';
import { normalizeAccessContext } from './access-control.mjs';

const MAX_TTL_SECONDS = 3600;

function b64url(value) {
  return Buffer.from(value).toString('base64url');
}

function parseB64url(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function requireSecret(secret) {
  const normalized = String(secret || '');
  if (normalized.length < 32) throw new Error('PREPROD_SESSION_SECRET_TOO_SHORT');
  return normalized;
}

function sign(data, secret) {
  return crypto.createHmac('sha256', requireSecret(secret)).update(data).digest('base64url');
}

export function issuePreprodSession(context = {}, options = {}) {
  const access = normalizeAccessContext(context);
  const ttlSeconds = Math.max(60, Math.min(Number(options.ttlSeconds) || 900, MAX_TTL_SECONDS));
  const now = Math.floor(new Date(options.now || new Date().toISOString()).getTime() / 1000);
  if (!Number.isFinite(now)) throw new Error('INVALID_SESSION_NOW');

  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'FIA-PREPROD' }));
  const payload = b64url(JSON.stringify({
    schemaVersion: 'fia-preprod-session.v1',
    actorId: access.actorId,
    organizationId: access.organizationId,
    role: access.role,
    iat: now,
    exp: now + ttlSeconds,
    productionIdentityVerified: false
  }));
  const data = `${header}.${payload}`;
  return `${data}.${sign(data, options.secret)}`;
}

export function verifyPreprodSession(token, options = {}) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('INVALID_PREPROD_SESSION_TOKEN');
  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;
  const expected = sign(data, options.secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('INVALID_PREPROD_SESSION_SIGNATURE');

  let decoded;
  try {
    decoded = JSON.parse(parseB64url(payload));
  } catch {
    throw new Error('INVALID_PREPROD_SESSION_PAYLOAD');
  }
  const now = Math.floor(new Date(options.now || new Date().toISOString()).getTime() / 1000);
  if (!Number.isFinite(now)) throw new Error('INVALID_SESSION_NOW');
  if (!Number.isFinite(decoded.exp) || decoded.exp <= now) throw new Error('PREPROD_SESSION_EXPIRED');
  if (decoded.schemaVersion !== 'fia-preprod-session.v1') throw new Error('INVALID_PREPROD_SESSION_VERSION');

  const access = normalizeAccessContext(decoded);
  return Object.freeze({
    ...access,
    issuedAt: decoded.iat,
    expiresAt: decoded.exp,
    productionIdentityVerified: false,
    preproductionOnly: true
  });
}
