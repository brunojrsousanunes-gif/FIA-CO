import crypto from 'node:crypto';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clean(value, max = 160) {
  return String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
}

function payload(entry) {
  return JSON.stringify({
    organizationId: entry.organizationId,
    seq: entry.seq,
    eventId: entry.eventId,
    operationId: entry.operationId,
    actorId: entry.actorId,
    action: entry.action,
    state: entry.state,
    version: entry.version,
    at: entry.at,
    prevHash: entry.prevHash
  });
}

function digest(entry) {
  return crypto.createHash('sha256').update(payload(entry)).digest('hex');
}

export class AuditIntegrityError extends Error {
  constructor(message = 'AUDIT_INTEGRITY_ERROR') {
    super(message);
    this.name = 'AuditIntegrityError';
  }
}

export function createMemoryAuditLog({ idFactory, clock } = {}) {
  const events = [];
  const makeId = idFactory || (() => `audit_${crypto.randomUUID()}`);
  const now = clock || (() => new Date().toISOString());

  async function append(input = {}) {
    const organizationId = clean(input.organizationId, 80);
    const actorId = clean(input.actorId, 80);
    const action = clean(input.action, 80);
    if (!organizationId || !actorId || !action) throw new Error('INVALID_AUDIT_EVENT');

    const previous = [...events].reverse().find(event => event.organizationId === organizationId);
    const entry = {
      organizationId,
      seq: (previous?.seq || 0) + 1,
      eventId: makeId('audit'),
      operationId: input.operationId ? clean(input.operationId, 120) : null,
      actorId,
      action,
      state: input.state ? clean(input.state, 40) : null,
      version: Number.isInteger(input.version) ? input.version : null,
      at: now(),
      prevHash: previous?.hash || 'GENESIS'
    };
    entry.hash = digest(entry);
    events.push(Object.freeze(entry));
    return clone(entry);
  }

  async function list({ organizationId, operationId, limit = 500 } = {}) {
    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 500, 2000));
    return events
      .filter(event => !organizationId || event.organizationId === organizationId)
      .filter(event => !operationId || event.operationId === operationId)
      .slice(-normalizedLimit)
      .map(clone);
  }

  async function verify(organizationId) {
    const chain = events.filter(event => event.organizationId === organizationId);
    let prevHash = 'GENESIS';
    for (let index = 0; index < chain.length; index += 1) {
      const event = chain[index];
      if (event.seq !== index + 1 || event.prevHash !== prevHash || event.hash !== digest(event)) {
        throw new AuditIntegrityError();
      }
      prevHash = event.hash;
    }
    return true;
  }

  return Object.freeze({ append, list, verify, kind: 'memory' });
}
