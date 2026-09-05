(()=>{
'use strict';
const SESSION_KEY='fia_human_presence_v1';
const startedAt=Date.now();
let mascotInteraction=false;
let pointerOrTouch=false;
let keyboardOrForm=false;
let suspiciousBurst=false;
let eventCount=0;
let burstStartedAt=Date.now();
let challengeReady=false;
let challengeDone=false;
let challengeTimer=null;

function ensureStyles(){if(document.querySelector('link[data-fia-human-presence-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='css/fia-human-presence.css';l.dataset.fiaHumanPresenceStyle='true';document.head.append(l);}
function visibleAndFocused(){return document.visibilityState==='visible'&&document.hasFocus();}
function honeypotEmpty(){const h=document.querySelector('[data-fia-human-honeypot]');return !h||!String(h.value||'').trim();}
function trackBurst(){const now=Date.now();if(now-burstStartedAt>500){burstStartedAt=now;eventCount=0;}eventCount+=1;if(eventCount>80)suspiciousBurst=true;}
function evaluate(){const duration=Date.now()-startedAt;if(!honeypotEmpty()||suspiciousBurst)return{verdict:'AUTOMATION_SUSPECTED',score:0};let score=0;if(mascotInteraction)score+=35;if(pointerOrTouch)score+=20;if(keyboardOrForm)score+=15;if(visibleAndFocused())score+=10;if(duration>=1200)score+=20;return{verdict:score>=70?'HUMAN_LIKELY':score>=35?'INCONCLUSIVE':'PENDING',score};}
function save(result){try{sessionStorage.setItem(SESSION_KEY,JSON.stringify({verdict:result.verdict,score:result.score,checkedAt:new Date().toISOString(),identityVerified:false,trustLevelElevated:false,rawInteractionEventsStored:false}));}catch(_e){}}
function labelFor(v){return v==='HUMAN_LIKELY'?'Humano probable':v==='AUTOMATION_SUSPECTED'?'Revisar':'Pendiente';}
function render(){const root=document.querySelector('.fia-guide-root'),status=root?.querySelector('[data-fia-human-status]');if(!root||!status)return;const result=evaluate();status.dataset.state=result.verdict.toLowerCase();status.textContent=`Presencia: ${labelFor(result.verdict)}`;save(result);if(result.verdict==='AUTOMATION_SUSPECTED'&&window.FIAGuide?.alert){window.FIAGuide.alert({code:'HUMAN_PRESENCE_REVIEW',severity:'warning',title:'Presencia no confirmada',message:'La sesión presenta señales automáticas. Esta comprobación no verifica identidad; conviene revisar antes de tratarla como primer contacto humano.'});}}
function armChallenge(){if(challengeDone||challengeReady||challengeTimer)return;const hint=document.querySelector('[data-fia-human-hint]'),avatar=document.querySelector('.fia-guide-head .fia-guide-avatar');if(!hint||!avatar)return;hint.textContent='FIA comprobará presencia con un gesto breve…';challengeTimer=setTimeout(()=>{challengeTimer=null;challengeReady=true;avatar.classList.add('fia-human-challenge-ready');hint.textContent='Toca a FIA una vez para confirmar presencia en esta sesión.';},700+Math.floor(Math.random()*700));}
function completeChallenge(){if(!challengeReady||challengeDone)return;challengeDone=true;challengeReady=false;mascotInteraction=true;const avatar=document.querySelector('.fia-guide-head .fia-guide-avatar'),hint=document.querySelector('[data-fia-human-hint]');avatar?.classList.remove('fia-human-challenge-ready');if(hint)hint.textContent='Gesto recibido. Esta es una señal de presencia, no una verificación de identidad.';render();}
function enhance(){ensureStyles();const root=document.querySelector('.fia-guide-root');if(!root||root.dataset.humanPresenceReady==='true')return;root.dataset.humanPresenceReady='true';const head=root.querySelector('.fia-guide-head'),panel=root.querySelector('.fia-guide-panel'),launcher=root.querySelector('.fia-guide-launcher'),avatar=head?.querySelector('.fia-guide-avatar');if(!head||!panel||!launcher||!avatar)return;
 const strip=document.createElement('div');strip.className='fia-human-strip';strip.innerHTML='<span data-fia-human-status data-state="pending">Presencia: Pendiente</span><small data-fia-human-hint>Se comprueba solo durante esta sesión.</small><input data-fia-human-honeypot tabindex="-1" autocomplete="off" aria-hidden="true" name="contact_fax_confirm" class="fia-human-honeypot">';head.after(strip);
 avatar.setAttribute('role','button');avatar.setAttribute('tabindex','0');avatar.setAttribute('aria-label','Mascota FIA · confirmar presencia cuando se indique');avatar.addEventListener('click',completeChallenge);avatar.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();completeChallenge();}});
 launcher.addEventListener('click',()=>setTimeout(()=>{if(!panel.hidden)armChallenge();},30));
 document.addEventListener('pointerdown',()=>{pointerOrTouch=true;trackBurst();render();},{passive:true});
 document.addEventListener('touchstart',()=>{pointerOrTouch=true;trackBurst();render();},{passive:true});
 document.addEventListener('keydown',()=>{keyboardOrForm=true;trackBurst();render();},{passive:true});
 document.addEventListener('input',e=>{if(e.target?.matches?.('input,textarea,select'))keyboardOrForm=true;trackBurst();render();},{passive:true});
 document.addEventListener('visibilitychange',render);window.addEventListener('focus',render);window.addEventListener('blur',render);setTimeout(render,1300);
}
window.FIAHumanPresence=Object.freeze({evaluate(){const result=evaluate();return Object.freeze({...result,identityVerified:false,trustLevelElevated:false,productionSecurityBoundary:false,rawInteractionEventsStored:false});},getReceipt(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');}catch(_e){return null;}}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(enhance,0),{once:true});else setTimeout(enhance,0);
})();
