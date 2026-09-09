(()=>{
'use strict';
const form=document.querySelector('[data-provider-form]');
const result=document.querySelector('[data-provider-result]');
if(!form||!result)return;
const forbidden=/\b(?:sk_(?:live|test)|pk_(?:live|test)|api[_ -]?key|secret|token|password|contrasena|iban)\b|\bES\d{22}\b/i;
form.addEventListener('submit',event=>{
 event.preventDefault();
 const data=new FormData(form),merchant=String(data.get('merchantId')||'').trim(),publicId=String(data.get('publicId')||'').trim();
 result.className='provider-result';
 if(forbidden.test(merchant)||forbidden.test(publicId)){result.classList.add('error');result.textContent='Bloqueado: parece una credencial o dato financiero real. Sustitúyelo por un identificador DEMO_.';return;}
 if(!data.get('provider')||!merchant.startsWith('DEMO_')||!publicId.startsWith('DEMO_')||!data.get('ack')){result.classList.add('warning');result.textContent='Faltan campos o los identificadores no comienzan por DEMO_.';return;}
 result.classList.add('success');result.textContent='Modelo válido para sandbox. No se ha guardado ni enviado ningún dato y producción continúa bloqueada.';
 form.reset();
});
window.addEventListener('pagehide',()=>form.reset());
})();