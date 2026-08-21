const fs=require('fs');
const assert=require('assert');

const page=fs.readFileSync('frontend/integrations.html','utf8');
const home=fs.readFileSync('frontend/index.html','utf8');
const allowlist=fs.readFileSync('config/pages-public-allowlist.txt','utf8');
const sitemap=fs.readFileSync('frontend/sitemap.xml','utf8');

assert(page.includes('PaymentProviderAdapter'));
assert(page.includes('IdentityVerificationAdapter'));
assert(page.includes('Candidatos de compatibilidad, no socios anunciados.'));
assert(page.includes('Bizum'));
assert(page.includes('Cecabank'));
assert(page.includes('Sipay/Uinku'));
assert(page.includes('DEMO_ONLY'));
assert(page.includes('Sin dinero real en V1'));
assert(page.includes('Sin PII real en V1'));
assert(!/<a\b[^>]*href=["']https?:\/\//i.test(page),'La página no debe publicar enlaces externos clicables de proveedores antes de validarlos');
assert(home.includes('href="integrations.html"'));
assert(allowlist.includes('\nintegrations.html\n'));
assert(allowlist.includes('\ncss/integrations.css\n'));
assert(sitemap.includes('/FIA-CO/integrations.html'));

console.log('integration ecosystem tests passed');
