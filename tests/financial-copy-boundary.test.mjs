import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const forbidden = [
  'fia custodia tu dinero',
  'fia guarda los fondos',
  'fia garantiza los fondos',
  'los fondos están en el banco de españa',
  'el dinero está depositado en el banco de españa'
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(?:html|js)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

for (const file of walk('frontend')) {
  const text = fs.readFileSync(file, 'utf8').toLowerCase();
  for (const phrase of forbidden) {
    assert.equal(text.includes(phrase), false, `MISLEADING_FINANCIAL_CLAIM:${file}:${phrase}`);
  }
}

console.log('FIA financial promotional copy boundary OK');
