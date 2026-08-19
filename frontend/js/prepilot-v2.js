const onboarding=document.querySelector('.beta-onboarding');
const dismissOnboarding=document.getElementById('dismissOnboarding');
const operationStatus=document.getElementById('operationStatus');
const feedbackStatus=document.getElementById('feedbackStatus');

if(localStorage.getItem('fiaco.beta.onboarding.dismissed')==='1'&&onboarding) onboarding.hidden=true;
if(dismissOnboarding) dismissOnboarding.addEventListener('click',()=>{
  localStorage.setItem('fiaco.beta.onboarding.dismissed','1');
  onboarding.hidden=true;
});

document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(button&&button.classList.contains('hub-primary')&&button.textContent.trim()==='Crear borrador demo'&&operationStatus){
    operationStatus.hidden=false;
    operationStatus.scrollIntoView({behavior:'smooth',block:'start'});
    localStorage.setItem('fiaco.beta.lastDraft','synthetic-demo-only');
  }
});

document.querySelectorAll('[data-feedback]').forEach(button=>button.addEventListener('click',()=>{
  const value=button.dataset.feedback;
  localStorage.setItem('fiaco.beta.feedback',value);
  if(feedbackStatus) feedbackStatus.textContent=value==='clear'?'Gracias. Feedback guardado solo en este dispositivo.':'Gracias. Anotado localmente para revisar claridad del recorrido.';
}));

if(location.hash==='#operationStatus'&&operationStatus){
  operationStatus.hidden=false;
  setTimeout(()=>operationStatus.scrollIntoView({block:'start'}),50);
}
