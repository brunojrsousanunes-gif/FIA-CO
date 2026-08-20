(()=>{
  const root=document.getElementById('txAdvanced');
  if(!root)return;
  const form=root.querySelector('form');
  const mode=root.querySelector('[name="txMode"]');
  const status=root.querySelector('[data-tx-advanced-status]');
  const steps=[...root.querySelectorAll('[data-step]')];
  const update=()=>{
    const current=Number(root.dataset.currentStep||'1');
    steps.forEach(s=>s.hidden=Number(s.dataset.step)!==current);
    root.querySelector('[data-step-label]').textContent=`Paso ${current} de ${steps.length}`;
  };
  root.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{
    const current=Number(root.dataset.currentStep||'1');
    root.dataset.currentStep=String(Math.min(steps.length,current+1));
    update();
  }));
  root.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',()=>{
    const current=Number(root.dataset.currentStep||'1');
    root.dataset.currentStep=String(Math.max(1,current-1));
    update();
  }));
  mode?.addEventListener('change',()=>{
    const transportFields=root.querySelector('[data-transport-fields]');
    if(transportFields)transportFields.hidden=!['transport','sale_transport','special','animal'].includes(mode.value);
  });
  form?.addEventListener('submit',e=>{
    e.preventDefault();
    const data=new FormData(form);
    const summary={
      mode:data.get('txMode'),
      reference:data.get('reference'),
      origin:data.get('origin'),
      destination:data.get('destination'),
      milestone:'DRAFT_DEMO',
      realMoney:false,
      realPii:false,
      providerExecution:false
    };
    sessionStorage.setItem('fia_tx_advanced_demo',JSON.stringify(summary));
    if(status){status.textContent='Borrador demo guardado en este dispositivo. Siguiente: revisar condiciones y evidencias.';}
  });
  update();
})();
