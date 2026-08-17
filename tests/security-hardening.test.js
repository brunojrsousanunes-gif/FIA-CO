const fs=require('fs');
const assert=require('assert');
const workflows=['.github/workflows/mvp-tests.yml','.github/workflows/pages.yml'];
for(const file of workflows){const text=fs.readFileSync(file,'utf8');const uses=[...text.matchAll(/uses:\s+([^\s#]+)/g)].map(m=>m[1]);assert(uses.length>0,`${file} has no actions`);uses.forEach(u=>assert(/@[0-9a-f]{40}$/.test(u),`${file} action is not pinned to immutable SHA: ${u}`));assert(!/uses:\s+[^\s]+@v\d/.test(text),`${file} contains mutable version action`);}
const tests=fs.readFileSync('.github/workflows/mvp-tests.yml','utf8');assert(tests.includes('permissions:\n  contents: read'));assert(tests.includes('persist-credentials: false'));
const pages=fs.readFileSync('.github/workflows/pages.yml','utf8');assert(pages.includes('pages: write'));assert(pages.includes('id-token: write'));assert(pages.includes('persist-credentials: false'));
const baseline=fs.readFileSync('docs/SECURITY-OPERATING-BASELINE.md','utf8');assert(baseline.includes('Secretos fuera del repositorio'));assert(baseline.includes('mínimo privilegio'));
console.log('security hardening tests passed');
