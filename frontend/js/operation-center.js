(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const stages=['create','agreement','documents','tracking','delivery','close'];
const labels={create:'CREADA',agreement:'ACUERDO CONFIRMADO',documents:'DOCUMENTACIÓN VALIDADA',tracking:'EN SEGUIMIENTO',delivery:'ENTREGADA',close:'CERRADA'};
const next={create:'Confirma el acuerdo',agreement:'Comprueba la documentación',documents:'Inicia el seguimiento',tracking:'Confirma la entrega',delivery:'Revisa y cierra la operación',close:'Operación finalizada'};
const required={agreement:['conditions','version','human'],documents:['model','authority','minimum'],tracking:['prepared'],delivery:['before','after','accepted'],close:['reviewed']};
let state={created:false,index:0,reference:'',incident:false,closed:false,events:[]};
const status=$('[data-status]'),reference=$('[data-reference]'),percent=$('[data-percent]'),message=$('[data-message]'),nextAction=$('[data-next]'),incidentBox=$('[data-incident]'),download=$('[data-download]');
function sensitive(value){const t=String(value||'');return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(t)||/\bES\d{22}\b/i.test(t.replace(/\s+/g,''))||/\b(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z])\b/i.test(t)||/\b(?:api[_ -]?key|token|secret|password|contrasena)\s*[:=]\s*\S{6,}/i.test(t);}
function log(text){state.events.unshift({at:new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),text});renderLog();}
function renderLog(){const host=$('[data-log]');host.replaceChildren();for(const event of state.events){const li=document.createElement('li'),time=document.createElement('time'),span=document.createElement('span');time.textContent=event.at;span.textContent=event.text;li.append(time,span);host.append(li);}}
function setMessage(text,type=''){message.textContent=text;message.className=type;}
function show(index){state.index=index;$$('[data-stage]').forEach((el,i)=>el.hidden=i!==index);$$('[data-step-indicator]').forEach((el,i)=>{el.classList.toggle('done',i<index||state.closed);el.classList.toggle('active',i===index&&!state.closed);});percent.textContent=`${state.closed?100:Math.round(index/(stages.length-1)*100)} %`;status.textContent=state.closed?'CERRADA':state.created?labels[stages[Math.max(0,index-1)]]||'CREADA':'PREPARACIÓN';nextAction.textContent=state.closed?next.close:state.created?next[stages[Math.max(0,index-1)]]:'Crea la operación ficticia';download.disabled=!state.closed;}
function checked(names){return names.every(name=>$(`[data-check="${name}"]`)?.checked);}
function advance(stage){if(state.incident){setMessage('La operación está congelada hasta resolver la incidencia.','error');return;}const index=stages.indexOf(stage);if(required[stage]&&!checked(required[stage])){setMessage('Completa todos los controles de esta fase antes de avanzar.','error');return;}if(stage==='tracking'){const value=$('[data-field="tracking"]').value.trim();if(!value){setMessage('Añade una referencia ficticia de entrega.','error');return;}if(sensitive(value)){setMessage('Referencia rechazada: parece contener información sensible.','error');return;}}if(stage==='close'&&!$('[data-field="payment"]').value){setMessage('Selecciona el estado comunicado por el proveedor.','error');return;}log(`${labels[stage]} · control humano registrado`);if(stage==='close'){state.closed=true;show(5);setMessage('Operación ficticia cerrada. Ya puedes descargar el resumen.','success');return;}show(index+1);setMessage('Fase completada. Puedes continuar con el siguiente control.','success');}
function create(){const values=$$('[data-stage="create"] input').map(x=>x.value.trim());if(values.some(x=>!x)){setMessage('Completa los campos de la operación ficticia.','error');return;}if(values.some(sensitive)){setMessage('Creación bloqueada: elimina datos personales, bancarios o credenciales.','error');return;}state.created=true;state.reference=`FIA-DEMO-${String(Date.now()).slice(-6)}`;reference.textContent=state.reference;log('Operación ficticia creada');show(1);setMessage('Operación creada sin enviar información fuera del dispositivo.','success');}
function incident(){if(!state.created||state.closed)return;state.incident=true;incidentBox.hidden=false;status.textContent='CONGELADA';nextAction.textContent='Resolver incidencia mediante revisión humana';log('Incidencia simulada: avance bloqueado');setMessage('Incidencia contenida. No se puede avanzar.','error');}
function resolve(){state.incident=false;incidentBox.hidden=true;log('Incidencia revisada y resuelta por una persona');show(state.index);setMessage('Incidencia recuperada. La operación puede continuar.','success');}
function reset(){state={created:false,index:0,reference:'',incident:false,closed:false,events:[]};$$('input[type="checkbox"]').forEach(x=>x.checked=false);$$('input:not([type="checkbox"])').forEach(x=>{if(x.dataset.field==='partyA')x.value='Empresa Demo A';else if(x.dataset.field==='partyB')x.value='Empresa Demo B';else if(x.dataset.field==='subject')x.value='Vehículo de demostración';else x.value='';});$$('select').forEach(x=>x.selectedIndex=0);reference.textContent='Sin crear';incidentBox.hidden=true;renderLog();log('Centro reiniciado; toda la operación anterior se ha eliminado');show(0);setMessage('Los campos contienen ejemplos y pueden modificarse sin usar datos reales.');}
function summary(){const lines=['FIA&CO · RESUMEN DE OPERACIÓN SINTÉTICA',`Referencia: ${state.reference}`,'Estado: CERRADA','Datos reales: NO','Fondos movidos por FIA&CO: NO','',...state.events.slice().reverse().map(x=>`${x.at} · ${x.text}`),'','Documento de demostración sin efectos jurídicos.'];const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`${state.reference}-resumen.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$$('[data-action]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.action;if(action==='create')create();else if(action==='incident')incident();else if(action==='resolve')resolve();else advance(action);}));
$('[data-reset]').addEventListener('click',reset);download.addEventListener('click',summary);$('[data-field="type"]').addEventListener('change',event=>{const type=event.target.value;$('[data-model-link]').href=`form-models.html?model=${encodeURIComponent(type)}`;});

 // Authenticated backend connection. Only a publishable key is present in the
 // browser; all data access is governed by Supabase RLS and column privileges.
 const SB_URL='https://etttredbkbcgqwciipls.supabase.co';
 const SB_PUBLIC_KEY='sb_publishable_xds7pTBOHvywaLIpg4W3eA_d_guZbA9';
 const loginForm=$('[data-backend-login]');
 const backendState=$('[data-backend-state]');
 const backendMessage=$('[data-backend-message]');
 const backendActions=$('[data-backend-actions]');
 const backendResults=$('[data-backend-results]');
 const backendList=$('[data-backend-list]');
 const backendCreateForm=$('[data-backend-create]');
 const backendOwnerSelect=$('[data-backend-owner]');
 let backendSession=null,backendRefreshPromise=null;
 let backendBusy=false;
 let activeMemberships=[];
 const pendingBackendRequestKeys=new Map();
 async function pendingBackendRequestKey(scope,payload){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({userId:backendSession?.user?.id||null,payload})));
  const fingerprint=Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');
  const storageKey=`fia_pending_request:${scope}:${fingerprint}`;
  let key=pendingBackendRequestKeys.get(storageKey)||'';
  if(!key){try{key=sessionStorage.getItem(storageKey)||'';}catch{}}
  if(!key)key=crypto.randomUUID();
  pendingBackendRequestKeys.set(storageKey,key);
  try{sessionStorage.setItem(storageKey,key);}catch{}
  return {key,storageKey};
 }
 function clearBackendRequestKey(storageKey){
  pendingBackendRequestKeys.delete(storageKey);
  try{sessionStorage.removeItem(storageKey);}catch{}
 }
 function backendStatus(text,kind=''){backendMessage.textContent=text;backendMessage.className=`backend-message ${kind}`;}
 function backendStateText(text){backendState.textContent=text;}
 async function authCall(path,body){
  const response=await fetch(`${SB_URL}/auth/v1/${path}`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_PUBLIC_KEY},body:JSON.stringify(body),cache:'no-store',credentials:'omit'});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.msg||data.message||data.error_description||'No se pudo completar la autenticación.');
  return data;
 }
 async function ensureBackendSession(){
  const session=backendSession;
  if(!session)throw new Error('Inicia sesión para consultar tus operaciones.');
  if(session.expiresAt-Date.now()/1000<60){
   if(!backendRefreshPromise){
    backendRefreshPromise=(async()=>{
     const refreshed=await authCall('token?grant_type=refresh_token',{refresh_token:session.refreshToken});
     if(backendSession!==session)throw new Error('La sesión se ha cerrado.');
     backendSession={accessToken:refreshed.access_token,refreshToken:refreshed.refresh_token,expiresAt:Date.now()/1000+Number(refreshed.expires_in||3600),user:refreshed.user};
    })();
   }
   const pending=backendRefreshPromise;
   try{await pending;}finally{if(backendRefreshPromise===pending)backendRefreshPromise=null;}
  }
  if(!backendSession)throw new Error('La sesión se ha cerrado.');
  return backendSession;
 }
 async function backendGet(path){
  const current=await ensureBackendSession();
  const response=await fetch(`${SB_URL}/rest/v1/${path}`,{method:'GET',headers:{'apikey':SB_PUBLIC_KEY,'Authorization':`Bearer ${current.accessToken}`,'Accept':'application/json'},cache:'no-store',credentials:'omit'});
  const data=await response.json().catch(()=>[]);
  if(!response.ok)throw new Error(data.message||data.details||'No se pudieron consultar los datos autorizados.');
  return data;
 }
 async function backendPost(path,body){
  const current=await ensureBackendSession();
  const response=await fetch(`${SB_URL}/rest/v1/${path}`,{method:'POST',headers:{'apikey':SB_PUBLIC_KEY,'Authorization':`Bearer ${current.accessToken}`,'Content-Type':'application/json','Accept':'application/json','Prefer':'return=representation'},body:JSON.stringify(body),cache:'no-store',credentials:'omit'});
  const data=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(data?.message||data?.details||'No se pudo crear el borrador.');
  return data;
 }
 function renderBackendRows(rows){
  backendList.replaceChildren();
  if(!rows.length){const li=document.createElement('li');li.className='backend-empty';li.textContent='No hay operaciones visibles para esta cuenta.';backendList.append(li);return;}
  for(const op of rows){
   const li=document.createElement('li'),title=document.createElement('strong'),meta=document.createElement('span'),ref=document.createElement('small');
   title.textContent=op.title||'Operación sin título';ref.textContent=op.reference||'Sin referencia';
   meta.textContent=`${String(op.status||'').toUpperCase()} · ${op.operation_type||'operación'} · v${op.version||1}`;
   li.append(ref,title,meta);backendList.append(li);
  }
 }
 async function loadBackend(){
  if(backendBusy||!backendSession)return;
  backendBusy=true;backendStateText('CONSULTANDO');backendStatus('Comprobando permisos de tu cuenta…');
  try{
   await ensureBackendSession();
   const members=await backendGet(`organization_members?select=organization_id,member_role&user_id=eq.${encodeURIComponent(backendSession.user.id)}&status=eq.active`);
   const memberOrgIds=members.map(member=>member.organization_id);
   const [organizations,operations]=await Promise.all([
    memberOrgIds.length
     ? backendGet(`organizations?select=id,status,is_synthetic&id=in.(${memberOrgIds.join(',')})&status=eq.active&is_synthetic=eq.false`)
     : Promise.resolve([]),
    backendGet('operations?select=id,reference,title,status,operation_type,version,created_at&is_synthetic=eq.false&order=created_at.desc&limit=50')
   ]);
   const realActiveOrganizationIds=new Set(organizations.map(org=>org.id));
   activeMemberships=members.filter(member=>realActiveOrganizationIds.has(member.organization_id));
   backendOwnerSelect.replaceChildren();
   const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Selecciona una empresa real tuya';backendOwnerSelect.append(placeholder);
   for(const member of activeMemberships){const option=document.createElement('option');option.value=member.organization_id;option.textContent=`${member.member_role} · ${member.organization_id}`;backendOwnerSelect.append(option);}
   backendCreateForm.hidden=activeMemberships.length===0;
   $('[data-backend-memberships]').textContent=`Empresas reales activas: ${activeMemberships.length} · Pertenencias activas: ${members.length}`;
   $('[data-backend-count]').textContent=`Operaciones reales visibles: ${operations.length}`;
   renderBackendRows(operations);backendResults.hidden=false;backendStateText('CONECTADO');
   backendStatus(activeMemberships.length
    ? 'Conexión autenticada. Se muestran solo empresas y operaciones reales autorizadas.'
    : 'Conexión autenticada, pero esta cuenta solo tiene pertenencias sintéticas o ninguna empresa real activa. El alta de borradores reales permanece bloqueada.','success');
  }catch(error){
   backendStateText('ERROR DE ACCESO');backendStatus(error.message||'No se pudo consultar el backend.','error');
   if(/JWT|refresh token|session/i.test(error.message||''))logoutBackend(false);
  }finally{backendBusy=false;}
 }
 function logoutBackend(notify=true){
  backendSession=null;backendRefreshPromise=null;activeMemberships=[];backendResults.hidden=true;backendActions.hidden=true;backendCreateForm.hidden=true;loginForm.hidden=false;
  loginForm.reset();backendCreateForm.reset();backendOwnerSelect.replaceChildren();backendList.replaceChildren();backendStateText('DESCONECTADO');
  if(notify)backendStatus('Sesión cerrada. No se ha guardado la contraseña ni la sesión.');
 }
 loginForm.addEventListener('submit',async event=>{
  event.preventDefault();if(backendBusy)return;
  const email=loginForm.elements.email.value.trim(),password=loginForm.elements.password.value;
  if(!email||!password){backendStatus('Introduce el correo y la contraseña de una cuenta habilitada.','error');return;}
  backendBusy=true;backendStateText('AUTENTICANDO');backendStatus('Verificando la cuenta…');
  try{
   const result=await authCall('token?grant_type=password',{email,password});
   if(!result.access_token||!result.refresh_token||!result.user?.id)throw new Error('La respuesta de autenticación está incompleta.');
   backendSession={accessToken:result.access_token,refreshToken:result.refresh_token,expiresAt:Date.now()/1000+Number(result.expires_in||3600),user:result.user};
   loginForm.reset();loginForm.hidden=true;backendActions.hidden=false;
   $('[data-backend-user]').textContent='Cuenta autenticada · sesión solo en memoria';
   backendBusy=false;await loadBackend();
  }catch(error){loginForm.elements.password.value='';backendStateText('DESCONECTADO');backendStatus(error.message||'No se pudo iniciar sesión.','error');}
  finally{backendBusy=false;}
 });

 backendCreateForm.addEventListener('submit',async event=>{
  event.preventDefault();if(backendBusy||!backendSession)return;
  const form=backendCreateForm;
  const title=form.elements.title.value.trim(),operationType=form.elements.operationType.value;
  const ownerOrg=form.elements.ownerOrg.value,sellerOrg=form.elements.sellerOrg.value.trim(),carrierOrg=form.elements.carrierOrg.value.trim(),buyerOrg=form.elements.buyerOrg.value.trim();
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if(title.length<3||title.length>180||![sellerOrg,carrierOrg,buyerOrg,ownerOrg].every(value=>uuid.test(value))){backendStatus('Revisa el título y los cuatro identificadores UUID.','error');return;}
  if(new Set([sellerOrg,carrierOrg,buyerOrg]).size!==3){backendStatus('Vendedor, transportista y comprador deben ser tres empresas distintas.','error');return;}
  if(!activeMemberships.some(member=>member.organization_id===ownerOrg)||![sellerOrg,carrierOrg,buyerOrg].includes(ownerOrg)){backendStatus('La empresa propietaria debe ser una de tus empresas activas y participar en la operación.','error');return;}
  backendBusy=true;backendStateText('CREANDO');backendStatus('Validando las tres empresas y creando el borrador…');
  try{
   const payload={
    target_title:title,target_operation_type:operationType,target_owner_organization:ownerOrg,
    target_seller_organization:sellerOrg,target_carrier_organization:carrierOrg,target_buyer_organization:buyerOrg
   };
   const pending=await pendingBackendRequestKey('create_operation_draft',payload);
   const result=await backendPost('rpc/create_operation_draft',{...payload,request_key:pending.key});
   clearBackendRequestKey(pending.storageKey);
   const operationId=Array.isArray(result)?result[0]:result;
   backendStatus(`Borrador creado correctamente · identificador ${String(operationId||'registrado')}. No se han enviado invitaciones por correo.`,'success');
   form.elements.title.value='';form.elements.sellerOrg.value='';form.elements.carrierOrg.value='';form.elements.buyerOrg.value='';
   backendBusy=false;await loadBackend();
  }catch(error){backendStateText('ERROR DE CREACIÓN');backendStatus(error.message||'No se pudo crear el borrador.','error');}
  finally{backendBusy=false;}
 });

 $('[data-backend-refresh]').addEventListener('click',loadBackend);
 $('[data-backend-logout]').addEventListener('click',()=>{
  const current=backendSession;
  logoutBackend();
  if(current)fetch(`${SB_URL}/auth/v1/logout`,{method:'POST',headers:{'apikey':SB_PUBLIC_KEY,'Authorization':`Bearer ${current.accessToken}`},cache:'no-store',credentials:'omit'}).catch(()=>{});
 });
 window.addEventListener('pagehide',()=>{backendSession=null;backendRefreshPromise=null;});

window.addEventListener('pagehide',()=>{state.events=[];});show(0);
})();
