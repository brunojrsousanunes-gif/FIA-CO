(()=>{'use strict';
const ids=['flujo','que-resuelve','recursos','seguridad','sectores','contacto'];
const panels=ids.map(id=>document.getElementById(id)).filter(Boolean);
let active=null,lastTrigger=null;
function prepare(panel){panel.classList.add('portal-detail-panel');panel.hidden=true;if(panel.querySelector('.portal-panel-close'))return;const close=document.createElement('button');close.type='button';close.className='portal-panel-close';close.setAttribute('aria-label','Cerrar pantalla');close.textContent='×';close.addEventListener('click',closePanel);const host=panel.querySelector('.wrap')||panel;host.prepend(close);}
function openPanel(id,trigger){const panel=document.getElementById(id);if(!panel)return;if(active)closePanel(false);active=panel;lastTrigger=trigger||null;panel.hidden=false;panel.classList.add('is-open');document.body.style.overflow='hidden';setTimeout(()=>panel.querySelector('.portal-panel-close')?.focus(),0);}
function closePanel(refocus=true){if(!active)return;active.classList.remove('is-open');active.hidden=true;active=null;document.body.style.overflow='';if(location.hash&&ids.includes(location.hash.slice(1)))history.replaceState(null,'',location.pathname+location.search);if(refocus)lastTrigger?.focus?.();}
function init(){panels.forEach(prepare);document.body.classList.add('portal-ready');document.querySelectorAll('[data-portal-panel]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openPanel(link.dataset.portalPanel,link);}));document.addEventListener('keydown',event=>{if(event.key==='Escape')closePanel();});const initial=location.hash.slice(1);if(ids.includes(initial))openPanel(initial,null);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();