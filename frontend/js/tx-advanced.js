(()=>{
  const root=document.getElementById('txAdvanced');
  if(!root)return;
  const form=root.querySelector('form');
  const status=root.querySelector('[data-tx-advanced-status]');
  const steps=[...root.querySelectorAll('[data-step]')];
  const STORE='fia_tx_pilot_ops_v1';
  const update=()=>{
    const current=Number(root.dataset.currentStep||'1');
    steps.forEach(s=>s.hidden=Number(s.dataset.step)!==current);
    root.querySelector('[data-step-label]').textContent=`Paso ${current} de ${steps.length}`;
  };
  const currentMode=()=>root.querySelector('[name="txMode"]:checked')?.value||'sale';
  const syncMode=()=>{
    const transportFields=root.querySelector('[data-transport-fields]');
    if(transportFields)transportFields.hidden=!['transport','sale_transport','special','animal'].includes(currentMode());
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
  root.querySelectorAll('[name="txMode"]').forEach(r=>r.addEventListener('change',syncMode));
  form?.addEventListener('submit',e=>{
    e.preventDefault();
    const data=new FormData(form);
    const now=new Date().toISOString();
    const ref=String(data.get('reference')||'').trim()||`DEMO-${Date.now().toString(36).toUpperCase()}`;
    const operation={
      id:`op_${Date.now().toString(36)}`,
      mode:currentMode(),
      reference:ref.slice(0,80),
      cargo:String(data.get('cargo')||'').trim().slice(0,120),
      origin:String(data.get('origin')||'').trim().slice(0,80),
      destination:String(data.get('destination')||'').trim().slice(0,80),
      status:'DRAFT_DEMO',
      createdAt:now,
      updatedAt:now,
      checkpoints:[],
      evidence:[],
      incidents:[],
      realMoney:false,
      realPii:false,
      providerExecution:false,
      realTransportAuthorized:false
    };
    let ops=[];
    try{ops=JSON.parse(localStorage.getItem(STORE)||'[]');if(!Array.isArray(ops))ops=[];}catch{ops=[];}
    ops.unshift(operation);
    localStorage.setItem(STORE,JSON.stringify(ops.slice(0,25)));
    sessionStorage.setItem('fia_tx_advanced_demo',JSON.stringify(operation));
    if(status){status.innerHTML='Operación demo guardada localmente. <a href="tx-operator.html">Abrir vista operador</a>.';}
  });
  syncMode();
  update();
})();
