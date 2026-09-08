import assert from 'node:assert/strict';
import { createMemoryAuditLog, verifyAuditSnapshot, AuditIntegrityError } from '../core/audit/audit-log.mjs';

let id=0;
const audit=createMemoryAuditLog({idFactory:()=>`a-${++id}`,clock:()=>`2026-09-09T00:0${id}:00.000Z`});
await audit.append({organizationId:'org-a',actorId:'actor-a',action:'CREATE',version:1});
await audit.append({organizationId:'org-a',actorId:'actor-a',action:'UPDATE',version:2});
const events=await audit.list({organizationId:'org-a'});
assert.equal(verifyAuditSnapshot(events,'org-a'),true);
const altered=structuredClone(events);altered[1].version=99;
assert.throws(()=>verifyAuditSnapshot(altered,'org-a'),AuditIntegrityError);
assert.throws(()=>verifyAuditSnapshot(events.slice(1),'org-a'),AuditIntegrityError);
assert.throws(()=>verifyAuditSnapshot([...events].reverse(),'org-a'),AuditIntegrityError);
console.log('audit-snapshot-adversarial: ok');
