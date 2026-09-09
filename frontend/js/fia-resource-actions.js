(()=>{'use strict';
function openFIA(event){event?.preventDefault?.();window.FIAGuide?.open?.();setTimeout(()=>document.querySelector('[data-fia-search] input')?.focus(),0);}
document.querySelectorAll('[data-open-fia]').forEach(button=>button.addEventListener('click',openFIA));
document.querySelectorAll('[data-fia-query]').forEach(button=>button.addEventListener('click',()=>{openFIA();const input=document.querySelector('[data-fia-search] input');if(!input)return;input.value=button.dataset.fiaQuery||'';input.focus();}));
})();