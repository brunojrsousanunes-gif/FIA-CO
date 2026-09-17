import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql=fs.readFileSync('supabase/migrations/20260917110000_synthetic_prepilot_operations.sql','utf8');
const html=fs.readFileSync('frontend/operation-center-private.html','utf8');
const js=fs.readFileSync('frontend/js/operation-center-private.js','utf8');

for(const name of ['Fran','GSM','Nariño','Recalvo','Infa','Agrícola Moreno']) assert.ok(sql.includes(name),name);
for(const table of ['operation_cost_items','logistics_quotes','operation_incidents','operation_notifications']) assert.ok(sql.includes(`public.${table}`),table);
assert.match(sql,/enable row level security/g);
assert.match(sql,/operation_confirmation_advance/);
assert.match(sql,/operation_incident_blocking/);
assert.match(sql,/margin_status/);
assert.match(sql,/revoke insert,update,delete on public\.operation_audit_events from authenticated/);
assert.match(html,/Entidades ficticias/);
assert.match(html,/Nariño/);
assert.match(html,/Recalvo/);
assert.match(html,/Agrícola Moreno/);
assert.doesNotMatch(html,/Frain|Magrino|Recalvi|Transportes SM|Infra\b|Rubio/);
assert.match(js,/logistics_quotes/);
assert.match(js,/operation_incidents/);
assert.match(js,/operation_confirmations/);
console.log('synthetic prepilot backend contract: ok');
