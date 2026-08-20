(()=>{
  const STORE='fia_tx_pilot_ops_v1';
  const list=document.querySelector('[data-ops-list]');
  const metrics=document.querySelector('[data-ops-metrics]');
  const tpl=document.getElementById('opCard');
  if(!list||!tpl)return;
  let filter='all';
  const load=()=>{try{const v=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(v)?v:[];}catch{return[];}};
  const save=ops=>localStorage.setItem(STORE,JSON.stringify(ops.slice(0,25)));
  const modeLabel=m=>({sale:'Compraventa',sale_transport:'Venta + transporte',transport:'Transporte',special:'Porte especial',animal:'Transporte animal'}[m]||m);
  const visible=op=>filter==='all'||(filter==='active'&&op.status!=='DELIVERED_DEMO')||(filter==='incident'&&(op.incidents||[]).length>0)||(filter==='done'&&op.status==='DELIVERED_DEMO')||(filter==='transport'&&['transport','sale_transport'].includes(op.mode))||(filter==='special'&&['special','animal'].includes(op.mode));
  const mutate=(id,fn)=>{const ops=load();const op=ops.find(x=>x.id===id);if(!op)return;fn(op);op.updatedAt=new Date().toISOString();save(ops);render();};
  const render=()=>{
    const ops=load();list.replaceChildren();
    const active=ops.filter(o=>o.status!=='DELIVERED_DEMO').length;
    const incidents=ops.filter(o=>(o.incidents||[]).length).length;
    const done=ops.filter(o=>o.status==='DELIVERED_DEMO').length;
    const pod=ops.filter(o=>(o.evidence||[]).some(e=>e.type==='POD_DEMO')).length;
    const transport=ops.filter(o=>['transport','sale_transport','special','animal'].includes(o.mode)).length;
    if(metrics)metrics.textContent=`${ops.length} operaciones demo · ${transport} con transporte · ${active} activas · ${incidents} con incidencia · ${pod} con POD · ${done} completadas`;
    const subset=ops.filter(visible);
    if(!subset.length){const p=document.createElement('p');p.className='muted';p.textContent='No hay operaciones para este filtro. Crea una operación demo primero.';list.append(p);return;}
    subset.forEach(op=>{
      const node=tpl.content.cloneNode(true);
      const evidence=op.evidence||[], incidentList=op.incidents||[];
      node.querySelector('[data-op-mode]').textContent=modeLabel(op.mode);
      node.querySelector('[data-op-title]').textContent=op.reference||'Operación demo';
      node.querySelector('[data-op-chip]').textContent=op.status||'DRAFT_DEMO';
      node.querySelector('[data-op-route]').textContent=`${op.origin||'Origen demo'} → ${op.destination||'Destino demo'}`;
      node.querySelector('[data-op-status]').textContent=`Checkpoints ${(op.checkpoints||[]).length} · evidencias ${evidence.length} · incidencias ${incidentList.length}`;
      node.querySelector('[data-op-cargo]').textContent=`Mercancía: ${op.cargo||'Descripción demo no indicada'}`;
      node.querySelector('[data-op-updated]').textContent=`Última actualización: ${op.updatedAt?new Date(op.updatedAt).toLocaleString():'sin actualizar'}`;
      node.querySelector('[data-op-pod]').textContent=`POD: ${evidence.some(e=>e.type==='POD_DEMO')?'registrado en demo':'pendiente'}`;
      node.querySelector('[data-op-incidents]').textContent=`Incidencias de servicio/ruta: ${incidentList.length}`;
      const note=node.querySelector('[data-op-note]');
      const incidentTypes=node.querySelector('[data-incident-types]');
      node.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{
        const action=btn.dataset.action;
        if(action==='incident'){incidentTypes.hidden=!incidentTypes.hidden;return;}
        mutate(op.id,current=>{
          current.checkpoints=current.checkpoints||[];current.evidence=current.evidence||[];current.incidents=current.incidents||[];
          if(action==='pickup'){current.status='PICKED_UP_DEMO';current.checkpoints.push({type:'pickup',at:new Date().toISOString(),demo:true,actorRole:'EXTERNAL_CARRIER_DEMO'});}
          if(action==='transit'){current.status='IN_TRANSIT_DEMO';current.checkpoints.push({type:'transit',at:new Date().toISOString(),demo:true,actorRole:'EXTERNAL_CARRIER_DEMO'});}
          if(action==='pod'){current.status='DELIVERED_DEMO';current.evidence.push({type:'POD_DEMO',at:new Date().toISOString(),source:'external-carrier-local-demo',recipientConfirmation:'DEMO_ONLY'});}
        });
      }));
      node.querySelectorAll('[data-incident-type]').forEach(btn=>btn.addEventListener('click',()=>{
        mutate(op.id,current=>{current.incidents=current.incidents||[];current.status='REVIEW_REQUIRED';current.incidents.push({type:String(btn.dataset.incidentType||'generic').toUpperCase()+'_DEMO',scope:'SERVICE_OR_ROUTE',at:new Date().toISOString(),humanReviewRequired:true,carrierExecution:false});});
        if(note)note.textContent='Incidencia demo registrada para revisión humana.';
      }));
      list.append(node);
    });
  };
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;render();}));
  render();
})();
