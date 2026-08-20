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
  const visible=(op)=>filter==='all'||(filter==='active'&&!['DELIVERED_DEMO'].includes(op.status))||(filter==='incident'&&(op.incidents||[]).length>0)||(filter==='done'&&op.status==='DELIVERED_DEMO');
  const mutate=(id,fn)=>{const ops=load();const op=ops.find(x=>x.id===id);if(!op)return;fn(op);op.updatedAt=new Date().toISOString();save(ops);render();};
  const render=()=>{
    const ops=load();
    list.replaceChildren();
    const active=ops.filter(o=>o.status!=='DELIVERED_DEMO').length;
    const incidents=ops.filter(o=>(o.incidents||[]).length).length;
    const done=ops.filter(o=>o.status==='DELIVERED_DEMO').length;
    if(metrics)metrics.textContent=`${ops.length} operaciones demo · ${active} activas · ${incidents} con incidencia · ${done} completadas`;
    const subset=ops.filter(visible);
    if(!subset.length){const p=document.createElement('p');p.className='muted';p.textContent='No hay operaciones para este filtro. Crea una operación demo primero.';list.append(p);return;}
    subset.forEach(op=>{
      const node=tpl.content.cloneNode(true);
      node.querySelector('[data-op-mode]').textContent=modeLabel(op.mode);
      node.querySelector('[data-op-title]').textContent=op.reference||'Operación demo';
      node.querySelector('[data-op-route]').textContent=`${op.origin||'Origen demo'} → ${op.destination||'Destino demo'}${op.cargo?` · ${op.cargo}`:''}`;
      node.querySelector('[data-op-status]').textContent=`Estado: ${op.status} · checkpoints ${(op.checkpoints||[]).length} · evidencias ${(op.evidence||[]).length} · incidencias ${(op.incidents||[]).length}`;
      const note=node.querySelector('[data-op-note]');
      node.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{
        const action=btn.dataset.action;
        mutate(op.id,current=>{
          current.checkpoints=current.checkpoints||[];current.evidence=current.evidence||[];current.incidents=current.incidents||[];
          if(action==='pickup'){current.status='PICKED_UP_DEMO';current.checkpoints.push({type:'pickup',at:new Date().toISOString(),demo:true});}
          if(action==='transit'){current.status='IN_TRANSIT_DEMO';current.checkpoints.push({type:'transit',at:new Date().toISOString(),demo:true});}
          if(action==='pod'){current.status='DELIVERED_DEMO';current.evidence.push({type:'POD_DEMO',at:new Date().toISOString(),source:'local-demo'});}
          if(action==='incident'){current.status='REVIEW_REQUIRED';current.incidents.push({type:'GENERIC_DEMO',at:new Date().toISOString(),humanReviewRequired:true});}
        });
        if(note)note.textContent='Actualización demo guardada localmente.';
      }));
      list.append(node);
    });
  };
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;render();}));
  render();
})();
