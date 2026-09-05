const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('frontend/beta-mobile.html','utf8');
const shell=fs.readFileSync('frontend/js/fia-capability-shell.js','utf8');
const legacy=fs.readFileSync('frontend/js/unified-app.js','utf8');
const css=fs.readFileSync('frontend/css/unified-app.css','utf8');
const allowlist=fs.readFileSync('config/pages-public-allowlist.txt','utf8');

for(const area of ['HOME','OPPORTUNITIES','OPERATIONS','DOCUMENTS','SECURITY']){
  assert.ok(html.includes(`data-view="${area}"`),`missing need-to-know view: ${area}`);
}
assert.ok(html.includes('ACCESO SEGÚN FUNCIÓN Y SEGURIDAD'),'access principle missing');
assert.ok(html.includes('js/fia-capability-shell.js'),'capability shell not referenced');
assert.equal(html.includes('js/unified-app.js'),false,'all-modules legacy runtime must not load in simplified app');
assert.equal(html.includes('data-view="wallet"'),false,'wallet view must not be exposed');
assert.equal(html.includes('data-view="premium"'),false,'premium view must not be exposed');
assert.equal(html.includes('data-view="logistics"'),false,'deep logistics view must not be exposed');
assert.ok(shell.includes("visibleAreas:Object.freeze(['HOME','SECURITY'])"),'safe fallback must expose only HOME and SECURITY');
assert.ok(shell.includes('productionAuthorization:false'),'client rendering must not claim production authorization');
assert.ok(shell.includes('renderingIsAuthorization:false'),'capability shell must state rendering is not authorization');
assert.equal(/localStorage\.(?:getItem|setItem)/.test(shell),false,'capability shell must not derive access from localStorage');
assert.equal(/sessionStorage\.(?:getItem|setItem)/.test(shell),false,'capability shell must not derive access from sessionStorage');
assert.equal(allowlist.includes('beta-mobile.html'),false,'deep app must not be published on Pages');
assert.equal(allowlist.includes('js/unified-app.js'),false,'legacy app runtime must not be published on Pages');
assert.equal(allowlist.includes('css/unified-app.css'),false,'deep app stylesheet must not be published on Pages');
assert.ok(legacy.includes("fia_unified_beta_v2"),'legacy internal demo state remains available for internal development');
assert.equal(legacy.includes('purgeLegacyStorage'),false,'automatic legacy storage purge must stay disabled');
assert.equal(/\bfetch\s*\(/.test(legacy),false,'legacy local demo must not call network APIs');
assert.ok(css.includes('@media(max-width:760px)'),'mobile navigation breakpoint missing');
console.log('need-to-know app shell contract OK');
