import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-public-config.js';
import { createSupabaseBrowserClient } from './supabase-browser-client.js?v=auth-logout-v1';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const state={accessToken:'',refreshToken:'',expiresAt:0,user:null,operations:[],selected:null,detail:null,memberships:[],accessRequests:[]};
const ui={auth:$('[data-auth]'),app:$('[data-private-app]'),form:$('[data-login-form]'),email:$('[data-email]'),password:$('[data-password]'),registerForm:$('[data-register-form]'),registerName:$('[data-register-name]'),registerEmail:$('[data-register-email]'),registerPassword:$('[data-register-password]'),registerCompany:$('[data-register-company]'),accessRequest:$('[data-access-request]'),accessRequestForm:$('[data-access-request-form]'),accessName:$('[data-access-name]'),accessCompany:$('[data-access-company]'),accessState:$('[data-access-state]'),message:$('[data-private-message]'),identity:$('[data-identity]'),list:$('[data-operation-list]'),refresh:$('[data-refresh]'),logout:$('[data-logout]'),detail:$('[data-operation-detail]')};
const supabase=createSupabaseBrowserClient({url:SUPABASE_URL,publishableKey:SUPABASE_PUBLISHABLE_KEY,getAccessToken:()=>state.accessToken});
let refreshPromise=null;
const pendingRequestKeys=new Map();
async function getPendingRequestKey(scope,payload){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({userId:state.user?.id||null,payload})));
 const fingerprint=Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');
 const storageKey=`fia_pending_request:${scope}:${fingerprint}`;
 let key=pendingRequestKeys.get(storageKey)||'';
 if(!key){try{key=sessionStorage.getItem(storageKey)||'';}catch{}}
 if(!key)key=crypto.randomUUID();
 pendingRequestKeys.set(storageKey,key);
 try{sessionStorage.setItem(storageKey,key);}catch{}
 return {key,storageKey};
}
function clearPendingRequestKey(storageKey){
 pendingRequestKeys.delete(storageKey);
 try{sessionStorage.removeItem(storageKey);}catch{}
}

function setMessage(text,type=''){ui.message.textContent=text;ui.message.className=type;}
const money=cents=>cents==null?'Pendiente':new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(cents)/100);
const line=(strong,small='')=>{const p=document.createElement('p'),b=document.createElement('strong');b.textContent=strong;p.append(b);if(small){const span=document.createElement('span');span.className='muted';span.textContent=` · ${small}`;p.append(span);}return p;};

function clearSession(){state.accessToken='';state.refreshToken='';state.expiresAt=0;refreshPromise=null;state.user=null;state.operations=[];state.selected=null;state.detail=null;state.memberships=[];state.accessRequests=[];inventory.items=[];inventory.reservations=[];if(inventoryHost)inventoryHost.hidden=true;ui.password.value='';render();}
async function logout(){
 const hasSession=Boolean(state.accessToken);ui.logout.disabled=true;let remoteConfirmed=!hasSession;
 try{if(hasSession){await supabase.signOut();remoteConfirmed=true;}}
 catch{remoteConfirmed=false;}
 finally{clearSession();ui.logout.disabled=false;setMessage(remoteConfirmed?'Sesión cerrada; revocación remota confirmada.':'Sesión cerrada en este dispositivo; no se pudo confirmar la revocación remota.',remoteConfirmed?'success':'error');}
}
function saveSession(payload){
 if(!payload?.access_token||!payload?.refresh_token||!payload?.user?.id)throw new Error('AUTH_SESSION_INCOMPLETE');
 state.accessToken=payload.access_token;state.refreshToken=payload.refresh_token;
 state.expiresAt=Date.now()/1000+Number(payload.expires_in||3600);state.user=payload.user;
}
async function refreshSession(){
 const oldRefreshToken=state.refreshToken;
 if(!oldRefreshToken)throw new Error('SESSION_REFRESH_UNAVAILABLE');
 if(!refreshPromise){
  refreshPromise=(async()=>{
   const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{
    method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({refresh_token:oldRefreshToken}),cache:'no-store',credentials:'omit'
   });
   const payload=await response.json().catch(()=>({}));
   if(!response.ok){const error=new Error(payload.msg||payload.message||payload.error_description||'SESSION_REFRESH_FAILED');error.code='SESSION_REFRESH_FAILED';throw error;}
   if(state.refreshToken!==oldRefreshToken)throw new Error('SESSION_CLOSED');
   saveSession(payload);
  })();
 }
 const pending=refreshPromise;
 try{await pending;}finally{if(refreshPromise===pending)refreshPromise=null;}
}
async function api(path,options={}){
 if(!state.accessToken)throw new Error('AUTH_REQUIRED');
 try{
  if(state.expiresAt-Date.now()/1000<60)await refreshSession();
  try{return await supabase.request(path,options);}
  catch(error){
   if(error.status!==401||!state.refreshToken)throw error;
   await refreshSession();
   return supabase.request(path,options);
  }
 }catch(error){
  if(!state.accessToken||error.code==='SESSION_REFRESH_FAILED'||/SESSION_REFRESH|SESSION_CLOSED|AUTH_SESSION_INCOMPLETE/.test(error.message))clearSession();
  throw error;
 }
}

function renderOperations(){ui.list.replaceChildren();if(!state.operations.length){ui.list.append(line('No hay operaciones visibles','Las cuentas ficticias todavía deben asignarse a usuarios autorizados.'));return;}for(const operation of state.operations){const item=document.createElement('li');item.tabIndex=0;item.append(line(operation.reference,`${operation.title} · ${operation.status} · versión ${operation.version}`));item.addEventListener('click',()=>loadDetail(operation));item.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();loadDetail(operation);}});ui.list.append(item);}}
function renderAccessState(){ui.accessState.replaceChildren();const active=state.memberships.some(item=>item.status==='active'),latest=state.accessRequests[0];ui.accessRequest.hidden=active||latest?.status==='pending';if(active){ui.accessState.append(line('Acceso empresarial activo','Las operaciones quedan limitadas por RLS y por el rol de tu empresa.'));return;}if(latest?.status==='pending'){ui.accessState.append(line('Solicitud pendiente de revisión',`${latest.organizations?.name||'Empresa piloto'} · no concede acceso hasta su aprobación.`));return;}if(latest?.status==='rejected')ui.accessState.append(line('Solicitud no aprobada','Puedes enviar una nueva solicitud con los datos correctos.'));}
function render(){const signedIn=Boolean(state.accessToken&&state.user);ui.auth.hidden=signedIn;ui.app.hidden=!signedIn;ui.identity.textContent=signedIn?state.user.email||state.user.id:'';if(!signedIn){ui.detail.hidden=true;ui.accessRequest.hidden=true;}else renderAccessState();renderOperations();}

async function loadOperations(){setMessage('Actualizando operaciones sintéticas…');try{const [operations,memberships,accessRequests]=await Promise.all([api('/rest/v1/operations?select=id,reference,title,status,version,operation_type,parent_operation_id,item_description,updated_at,is_synthetic&is_synthetic=eq.true&order=updated_at.desc&limit=50'),api('/rest/v1/organization_members?select=organization_id,status,member_role,organizations!inner(is_synthetic)&organizations.is_synthetic=eq.true&order=created_at.desc'),api('/rest/v1/pilot_access_requests?select=id,status,created_at,updated_at,organizations!inner(name,demo_code,is_synthetic)&organizations.is_synthetic=eq.true&order=created_at.desc&limit=5')]);state.operations=operations.filter(item=>item.is_synthetic===true);state.memberships=memberships;state.accessRequests=accessRequests;render();const inventoryLoaded=await loadInventory();setMessage(inventoryLoaded?'Acceso, operaciones e inventario sincronizados.':'Operaciones cargadas; el inventario no se pudo actualizar.',inventoryLoaded?'success':'error');if(state.selected){const updated=state.operations.find(item=>item.id===state.selected.id);if(updated)await loadDetail(updated);}}catch(error){if(error.status===401)clearSession();setMessage('No se pudieron cargar las operaciones. Revisa la sesión.','error');}}

async function loadDetail(operation){
 state.selected=operation;setMessage(`Abriendo ${operation.reference}…`);
 try{
  const encoded=encodeURIComponent(operation.id);
  const [participants,quotes,incidents,audit,recoveries,memberships]=await Promise.all([
   api(`/rest/v1/operation_participants?select=id,organization_id,participant_role,status,accepted_by,responsibility,organizations(name,is_synthetic)&operation_id=eq.${encoded}&order=participant_role`),
   api(`/rest/v1/logistics_quotes?select=id,label,amount_cents,eta_days,status,provider_organization_id,organizations(name,demo_code)&operation_id=eq.${encoded}&order=amount_cents`),
   api(`/rest/v1/operation_incidents?select=id,incident_type,description,status,blocks_progress,created_at,resolved_at&operation_id=eq.${encoded}&order=created_at.desc`),
   api(`/rest/v1/operation_audit_timeline?select=id,event_type,created_at&operation_id=eq.${encoded}&order=id.desc&limit=40`),
   api(`/rest/v1/operations?select=id,reference,title,status&parent_operation_id=eq.${encoded}&order=created_at.desc`),
   api('/rest/v1/organization_members?select=organization_id,status,member_role&status=eq.active')
  ]);
  const [costResult,financeResult]=await Promise.allSettled([
   api(`/rest/v1/operation_cost_items?select=id,category,label,amount_cents&operation_id=eq.${encoded}&order=created_at`),
   api(`/rest/v1/operation_financials?select=amount_cents,total_cost_cents,margin_floor_cents,calculated_margin_cents,margin_status,updated_at&operation_id=eq.${encoded}`)
  ]);
  const optionalFinance=result=>{
   if(result.status==='fulfilled')return result.value;
   if([401,403].includes(result.reason?.status))return [];
   throw result.reason;
  };
  const costs=optionalFinance(costResult),financials=optionalFinance(financeResult);
  state.memberships=memberships;state.detail={participants,quotes,costs,incidents,audit,recoveries,financials};
  renderDetail();setMessage('Expediente sincronizado.','success');
 }catch(error){if(error.status===401)clearSession();setMessage(`No se pudo abrir el expediente (${error.code||error.message}).`,'error');}
}
function fill(container,items,empty,renderer){container.replaceChildren();if(!items.length){container.append(line(empty));return;}items.forEach(item=>container.append(renderer(item)));}
function renderDetail(){const op=state.selected,d=state.detail;if(!op||!d)return;const finance=d.financials[0];ui.detail.hidden=false;$('[data-operation-title]').textContent=`${op.reference} · ${op.title}`;$('[data-operation-status]').textContent=op.status;$('[data-total]').textContent=finance?money(finance.amount_cents):'Solo visible para la empresa titular';$('[data-costs]').textContent=finance?money(finance.total_cost_cents):'Solo visible para la empresa titular';$('[data-margin]').textContent=finance?`${money(finance.calculated_margin_cents)} · ${finance.margin_status}`:'Solo visible para la empresa titular';
fill($('[data-participants]'),d.participants,'Sin participantes',item=>line(`${({seller:'Vendedor',carrier:'Transportista',buyer:'Comprador'})[item.participant_role]} · ${item.organizations?.name||'Organización'}`,`${item.responsibility} · ${item.status}`));
fill($('[data-quotes]'),d.quotes,'Sin presupuestos logísticos',item=>{const wrap=document.createElement('div');wrap.append(line(item.organizations?.name||item.label,`${money(item.amount_cents)} · ${item.eta_days??'—'} días · ${item.status}`));if(item.status!=='selected'){const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Seleccionar';button.addEventListener('click',()=>selectQuote(item.id));wrap.append(button);}return wrap;});
fill($('[data-cost-items]'),d.costs,finance?'Sin partidas de coste':'Información interna solo visible para la empresa titular',item=>line(item.label,`${item.category} · ${money(item.amount_cents)}`));
const incidents=[...d.incidents,...d.recoveries.map(item=>({description:`Suboperación ${item.reference}: ${item.title}`,status:item.status,incident_type:'recovery'}))];fill($('[data-incidents]'),incidents,'Sin incidencias abiertas',item=>line(item.description,`${item.incident_type} · ${item.status}`));
fill($('[data-audit]'),d.audit,'Sin eventos',item=>{const row=line(item.event_type,new Date(item.created_at).toLocaleString('es-ES'));row.className='audit-row';return row;});
const blocked=op.status==='blocked';$('[data-recovery]',ui.detail).forEach(button=>button.disabled=!blocked);$('[data-resolve-incident]').disabled=!d.incidents.some(item=>item.status==='open');renderQuoteSubmission();renderConfirmationActions();}

function eligibleCarrier(){const activeOrgIds=new Set(state.memberships.filter(item=>item.status==='active').map(item=>item.organization_id));return state.detail?.participants.find(item=>item.participant_role==='carrier'&&item.status==='accepted'&&item.accepted_by===state.user?.id&&activeOrgIds.has(item.organization_id))||null;}
function renderQuoteSubmission(){const form=$('[data-quote-submit]');if(!form)return;const carrier=eligibleCarrier(),allowed=Boolean(carrier&&['invited','accepted'].includes(state.selected?.status));form.hidden=!allowed;if(allowed)$('[data-quote-provider]').textContent=carrier.organizations?.name||'Transportista autorizado';}

function renderConfirmationActions(){const host=$('[data-confirmation-actions]');host.replaceChildren();const ownOrganizations=new Set(state.memberships.map(item=>item.organization_id)),participant=state.detail.participants.find(item=>ownOrganizations.has(item.organization_id));if(!participant){host.append(line('Sin acciones disponibles','La política RLS determina el rol de la cuenta.'));return;}if(participant.status==='invited'){const accept=document.createElement('button');accept.type='button';accept.textContent='Aceptar participación';accept.addEventListener('click',()=>acceptParticipation(participant.participant_role));host.append(accept);return;}const role=participant.participant_role,actions=role==='seller'?[['dispatch','Confirmar expedición']]:role==='carrier'?[['pickup','Confirmar recogida'],['delivery','Confirmar entrega']]:role==='buyer'?[['receipt','Confirmar recepción']]:[];actions.forEach(([type,label])=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>confirmAction(role,type));host.append(button);});}
async function acceptParticipation(role){const payload={target_operation:state.selected.id,target_role:role},pending=await getPendingRequestKey('accept_operation_invitation',payload);await mutate('/rest/v1/rpc/accept_operation_invitation',{...payload,request_key:pending.key},'Participación aceptada.',false,'POST',pending.storageKey);}
async function selectQuote(id){const payload={target_quote:id},pending=await getPendingRequestKey('select_logistics_quote',payload);await mutate('/rest/v1/rpc/select_logistics_quote',{...payload,request_key:pending.key},'Presupuesto logístico seleccionado.',false,'POST',pending.storageKey);}
async function submitLogisticsQuote(event){
 event.preventDefault();
 const form=event.currentTarget,carrier=eligibleCarrier();
 if(!carrier||!state.selected||!['invited','accepted'].includes(state.selected.status)){
  setMessage('Solo la cuenta transportista que aceptó la participación puede enviar ofertas.','error');return;
 }
 const label=form.elements.label.value.trim(),amount=Number(form.elements.amount.value),amountCents=Math.round(amount*100),etaRaw=form.elements.eta.value.trim(),etaDays=etaRaw===''?null:Number(etaRaw);
 if(label.length<2||label.length>160||!Number.isFinite(amount)||amount<=0||!Number.isSafeInteger(amountCents)||Math.abs(amount*100-amountCents)>1e-7){
  setMessage('Revisa la descripción y el importe: debe ser mayor que cero y tener como máximo dos decimales.','error');return;
 }
 if(etaDays!==null&&(!Number.isInteger(etaDays)||etaDays<0||etaDays>365)){
  setMessage('El plazo debe ser un número entero entre 0 y 365 días.','error');return;
 }
 const payload={operation_id:state.selected.id,provider_organization_id:carrier.organization_id,label,amount_cents:amountCents,currency:'EUR',eta_days:etaDays,status:'offered',created_by:state.user.id};
 const pending=await getPendingRequestKey('logistics_quote_submission',payload),row={id:pending.key,...payload};
 setMessage('Enviando oferta logística…');
 try{
  const rows=await api('/rest/v1/logistics_quotes?on_conflict=id',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify(row)});
  if(!Array.isArray(rows)||rows.length===0){
   const existing=await api('/rest/v1/logistics_quotes?select=id,operation_id,provider_organization_id,label,amount_cents,currency,eta_days,status,created_by&id=eq.'+encodeURIComponent(pending.key));
   const prior=existing[0],priorEta=prior?.eta_days==null?null:Number(prior.eta_days);
   if(!prior||prior.operation_id!==payload.operation_id||prior.provider_organization_id!==payload.provider_organization_id||prior.label!==payload.label||Number(prior.amount_cents)!==payload.amount_cents||prior.currency!==payload.currency||priorEta!==payload.eta_days||prior.status!=='offered'||prior.created_by!==payload.created_by)throw new Error('IDEMPOTENCY_KEY_REUSED');
  }
  clearPendingRequestKey(pending.storageKey);form.reset();
  setMessage('Oferta enviada. Queda pendiente de selección por la empresa responsable.','success');
  await loadOperations();
 }catch(error){setMessage('No se pudo enviar la oferta: '+(error.message||error.code)+'.','error');}
}
async function confirmAction(role,type){
 const payload={operation_id:state.selected.id,participant_role:role,confirmation_type:type,confirmed_by:state.user.id,metadata:{synthetic:true}},pending=await getPendingRequestKey('operation_confirmation',payload);
 setMessage('Procesando…');
 try{
  const rows=await api('/rest/v1/operation_confirmations?on_conflict=operation_id,idempotency_key',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({...payload,idempotency_key:pending.key})});
  if(!Array.isArray(rows)||rows.length===0){
   const existing=await api(`/rest/v1/operation_confirmations?select=operation_id,participant_role,confirmation_type,confirmed_by,idempotency_key&operation_id=eq.${encodeURIComponent(payload.operation_id)}&idempotency_key=eq.${encodeURIComponent(pending.key)}`);
   const prior=existing[0];
   if(!prior||prior.operation_id!==payload.operation_id||prior.participant_role!==role||prior.confirmation_type!==type||prior.confirmed_by!==state.user.id)throw new Error('IDEMPOTENCY_KEY_REUSED');
  }
  clearPendingRequestKey(pending.storageKey);
  setMessage('Confirmación registrada; el estado se recalculó automáticamente.','success');
  await loadOperations();
 }catch(error){setMessage(`Acción bloqueada: ${error.message||error.code}.`,'error');}
}
async function openIncident(){if(state.detail?.incidents.some(item=>item.status==='open'))return;await mutate('/rest/v1/operation_incidents',{operation_id:state.selected.id,incident_type:'logistics',description:'Fallo sintético de una pieza detectado antes de finalizar el tractor',status:'open',blocks_progress:true,opened_by:state.user.id},'Pieza fallida: expediente bloqueado y recuperación disponible.',true);}
async function createRecovery(value){const [sender,carrier]=value.split('|'),payload={target_parent:state.selected.id,sender_demo_code:sender,carrier_demo_code:carrier,part_description:'Pieza de sustitución sintética'},pending=await getPendingRequestKey('create_synthetic_part_recovery',payload);await mutate('/rest/v1/rpc/create_synthetic_part_recovery',{...payload,request_key:pending.key},'Suboperación de pieza creada y vinculada.',false,'POST',pending.storageKey);}
async function resolveIncident(){const incident=state.detail.incidents.find(item=>item.status==='open');if(!incident)return;await mutate(`/rest/v1/operation_incidents?id=eq.${encodeURIComponent(incident.id)}`,{status:'resolved',resolved_by:state.user.id,resolved_at:new Date().toISOString(),resolution_note:'Pieza sintética entregada y recuperación revisada'},'Incidencia resuelta; el expediente vuelve al último estado válido.',true,'PATCH');}
async function mutate(path,body,success,preferReturn=false,method='POST',pendingStorageKey=null){setMessage('Procesando…');try{await api(path,{method,headers:{'Content-Type':'application/json',Prefer:preferReturn?'return=representation':'return=minimal'},body:JSON.stringify(body)});if(pendingStorageKey)clearPendingRequestKey(pendingStorageKey);setMessage(success,'success');await loadOperations();}catch(error){setMessage(`Acción bloqueada: ${error.message||error.code}.`,'error');}}

function savePendingAccess(displayName,demoCode){sessionStorage.setItem('fia_pending_pilot_access',JSON.stringify({displayName,demoCode}));}
function readPendingAccess(){try{return JSON.parse(sessionStorage.getItem('fia_pending_pilot_access')||'null');}catch{return null;}}
async function requestPilotAccess(displayName,demoCode){await api('/rest/v1/rpc/request_pilot_access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target_demo_code:demoCode,target_display_name:displayName})});sessionStorage.removeItem('fia_pending_pilot_access');}
async function submitPendingAccess(){const pending=readPendingAccess();if(!pending?.displayName||!pending?.demoCode)return;await requestPilotAccess(pending.displayName,pending.demoCode);}
async function signUp(event){event.preventDefault();const displayName=ui.registerName.value.trim(),email=ui.registerEmail.value.trim(),password=ui.registerPassword.value,demoCode=ui.registerCompany.value;if(!displayName||!email||password.length<16)return setMessage('Completa el nombre, correo y una contraseña única de al menos 16 caracteres.','error');setMessage('Creando cuenta piloto…');try{savePendingAccess(displayName,demoCode);const payload=await supabase.signUp(email,password,{display_name:displayName,pilot_requested:true});ui.registerPassword.value='';if(payload?.access_token){saveSession(payload);await submitPendingAccess();render();await loadOperations();setMessage('Cuenta creada. La solicitud queda pendiente de aprobación.','success');}else setMessage('Cuenta creada. Revisa tu correo para confirmarla; después inicia sesión y enviaremos la solicitud pendiente.','success');}catch(error){ui.registerPassword.value='';sessionStorage.removeItem('fia_pending_pilot_access');setMessage(`No se pudo crear la cuenta: ${error.message||error.code}.`,'error');}}
async function submitAccessRequest(event){event.preventDefault();const displayName=ui.accessName.value.trim(),demoCode=ui.accessCompany.value;if(!displayName)return setMessage('Indica un nombre visible.','error');setMessage('Enviando solicitud…');try{await requestPilotAccess(displayName,demoCode);await loadOperations();setMessage('Solicitud registrada. FIA&CO debe aprobarla antes de habilitar operaciones.','success');}catch(error){setMessage(`Solicitud bloqueada: ${error.message||error.code}.`,'error');}}
async function signIn(event){event.preventDefault();const email=ui.email.value.trim(),password=ui.password.value;if(!email||!password)return setMessage('Introduce las credenciales de demostración.','error');setMessage('Verificando acceso…');try{const payload=await supabase.signInWithPassword(email,password);ui.password.value='';saveSession(payload);render();try{await submitPendingAccess();}catch(error){setMessage(`Sesión iniciada, pero la solicitud pendiente necesita revisión: ${error.message||error.code}.`,'error');}await loadOperations();}catch(error){ui.password.value='';clearSession();setMessage(`Acceso denegado: ${error.message||error.code}.`,'error');}}

const inventory={items:[],reservations:[]};
const inventoryHost=$('[data-inventory]');
const inventoryMessage=(message,type='')=>{ui.message.textContent=message;ui.message.className=type;};
const inventoryManagers=()=>state.memberships.filter(m=>m.status==='active'&&['manager','admin','ceo'].includes(m.member_role));
function inventorySelect(node,items,label,value){node.replaceChildren();items.forEach(item=>{const option=document.createElement('option');option.value=item[value];option.textContent=label(item);node.append(option);});}
async function loadInventory(){if(!inventoryHost)return false;const managers=inventoryManagers();inventoryHost.hidden=!managers.length;if(!managers.length){inventory.items=[];inventory.reservations=[];for(const selector of ['[data-inventory-org]','[data-inventory-item]','[data-reservation-item]','[data-reservation-operation]'])inventorySelect($(selector),[],()=>'', 'id');$('[data-inventory-stock]').replaceChildren();$('[data-inventory-reservations]').replaceChildren();return true;}try{const [stock,reservations]=await Promise.all([api('/rest/v1/inventory_stock?select=item_id,organization_id,sku,description,unit,active,on_hand,reserved,available&order=sku'),api('/rest/v1/inventory_reservations?select=id,item_id,organization_id,operation_id,quantity,status,created_at&status=eq.reserved&order=created_at.desc')]);const orgs=new Set(managers.map(m=>m.organization_id));inventory.items=stock.filter(i=>orgs.has(i.organization_id));inventory.reservations=reservations.filter(r=>orgs.has(r.organization_id));inventorySelect($('[data-inventory-org]'),managers,m=>m.organization_id,'organization_id');inventorySelect($('[data-inventory-item]'),inventory.items,i=>i.sku+' · '+i.description,'item_id');inventorySelect($('[data-reservation-item]'),inventory.items.filter(i=>i.active&&Number(i.available)>0),i=>i.sku+' · disponible '+i.available+' '+i.unit,'item_id');inventorySelect($('[data-reservation-operation]'),state.operations,o=>o.reference+' · '+o.title,'id');const stockHost=$('[data-inventory-stock]');stockHost.replaceChildren();if(!inventory.items.length)stockHost.append(line('Todavía no hay artículos','Crea el primero para empezar.'));inventory.items.forEach(i=>stockHost.append(line(i.sku+' · '+i.description,'Existencias: '+i.on_hand+' '+i.unit+' · Reservadas: '+i.reserved+' · Disponibles: '+i.available)));const host=$('[data-inventory-reservations]');host.replaceChildren();if(!inventory.reservations.length)host.append(line('Sin reservas activas'));inventory.reservations.forEach(r=>{const item=inventory.items.find(i=>i.item_id===r.item_id),operation=state.operations.find(o=>o.id===r.operation_id),row=document.createElement('div');row.append(line((item?.sku||'Artículo')+' · '+r.quantity,operation?operation.reference+' · '+operation.title:'Operación '+r.operation_id));[['fulfilled','Confirmar salida y cumplir'],['released','Liberar reserva']].forEach(pair=>{const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=pair[1];button.addEventListener('click',()=>closeInventoryReservation(r.id,pair[0]));row.append(button);});host.append(row);});return true;}catch(error){inventory.items=[];inventory.reservations=[];inventorySelect($('[data-inventory-item]'),[],()=>'', 'id');inventorySelect($('[data-reservation-item]'),[],()=>'', 'id');$('[data-inventory-stock]').replaceChildren(line('Inventario no disponible','Comprueba la conexión y vuelve a actualizar.'));$('[data-inventory-reservations]').replaceChildren();inventoryMessage('Inventario no disponible: '+(error.message||error.code),'error');return false;}}
async function createInventoryItem(event){event.preventDefault();const data=new FormData(event.currentTarget);try{await api('/rest/v1/inventory_items',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({organization_id:data.get('organization'),sku:String(data.get('sku')).trim(),description:String(data.get('description')).trim(),unit:String(data.get('unit')).trim(),created_by:state.user.id})});event.currentTarget.reset();inventoryMessage('Artículo creado.','success');await loadInventory();}catch(error){inventoryMessage('No se pudo crear el artículo: '+(error.message||error.code),'error');}}
async function recordInventoryMovement(event){event.preventDefault();const data=new FormData(event.currentTarget),payload={target_item:data.get('item'),movement:data.get('movement'),amount:Number(data.get('quantity')),explanation:String(data.get('note')).trim(),linked_operation:null};try{const pending=await getPendingRequestKey('record_inventory_movement',payload);await api('/rest/v1/rpc/record_inventory_movement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,p_request_key:pending.key})});clearPendingRequestKey(pending.storageKey);event.currentTarget.reset();inventoryMessage('Movimiento registrado.','success');await loadInventory();}catch(error){inventoryMessage('Movimiento rechazado: '+(error.message||error.code),'error');}}
async function reserveInventory(event){event.preventDefault();const data=new FormData(event.currentTarget),payload={target_item:data.get('item'),target_operation:data.get('operation'),amount:Number(data.get('quantity'))};try{const pending=await getPendingRequestKey('reserve_inventory_item',payload);await api('/rest/v1/rpc/reserve_inventory_item',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,p_request_key:pending.key})});clearPendingRequestKey(pending.storageKey);event.currentTarget.reset();inventoryMessage('Reserva creada. El stock físico no se ha descontado.','success');await loadInventory();}catch(error){inventoryMessage('No se pudo reservar: '+(error.message||error.code),'error');}}
async function closeInventoryReservation(id,status){const question=status==='fulfilled'?'Se registrará una salida real del stock. ¿Confirmas el cumplimiento?':'¿Liberar esta reserva?';if(!window.confirm(question))return;try{await api('/rest/v1/rpc/release_inventory_reservation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target_reservation:id,final_status:status})});inventoryMessage(status==='fulfilled'?'Reserva cumplida y salida descontada.':'Reserva liberada.','success');await loadInventory();}catch(error){inventoryMessage('No se pudo cerrar la reserva: '+(error.message||error.code),'error');}}
$('[data-inventory-item-form]')?.addEventListener('submit',createInventoryItem);
$('[data-inventory-movement-form]')?.addEventListener('submit',recordInventoryMovement);
$('[data-inventory-reservation-form]')?.addEventListener('submit',reserveInventory);
$('[data-quote-submit]')?.addEventListener('submit',submitLogisticsQuote);ui.form.addEventListener('submit',signIn);ui.registerForm.addEventListener('submit',signUp);ui.accessRequestForm.addEventListener('submit',submitAccessRequest);ui.refresh.addEventListener('click',loadOperations);ui.logout.addEventListener('click',logout);
});$('[data-open-incident]').addEventListener('click',openIncident);$('[data-resolve-incident]').addEventListener('click',resolveIncident);$$('[data-recovery]').forEach(button=>button.addEventListener('click',()=>createRecovery(button.dataset.recovery)));window.addEventListener('pagehide',clearSession);render();
