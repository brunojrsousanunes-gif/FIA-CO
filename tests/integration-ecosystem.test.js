const fs=require('fs');
const assert=require('assert');

const page=fs.readFileSync('frontend/integrations.html','utf8');
const app=fs.readFileSync('frontend/beta-mobile.html','utf8');
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
assert(app.includes('href="integrations.html"'),'La app unificada debe mantener acceso al ecosistema de integraciones');
assert(allowlist.includes('\nintegrations.html\n'));
assert(allowlist.includes('\ncss/integrations.css\n'));
assert(sitemap.includes('/FIA-CO/integrations.html'));

console.log('integration ecosystem tests passed');
