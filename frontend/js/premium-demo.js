const out=document.getElementById('agentOutput');
const contextBanner=document.getElementById('contextBanner');
const scenarios={
  ready:{amount:500,criticalEvidenceComplete:true,identityConsistent:true,hasDispute:false,confidence:.95,label:'Todo correcto'},
  missing:{amount:500,criticalEvidenceComplete:false,identityConsistent:true,hasDispute:false,confidence:.95,label:'Falta evidencia'},
  high:{amount:4500,criticalEvidenceComplete:true,identityConsistent:true,hasDispute:false,confidence:.95,label:'Importe alto'},
  dispute:{amount:500,criticalEvidenceComplete:true,identityConsistent:true,hasDispute:true,confidence:.95,label:'Disputa'}
};
const reasonText={NO_REVIEW_SIGNAL:'No se detectan señales de revisión.',MISSING_CRITICAL_EVIDENCE:'Falta una evidencia crítica.',IDENTITY_INCONSISTENT:'La identidad presenta una inconsistencia.',HIGH_VALUE:'El importe supera el umbral configurado.',DISPUTE_PRESENT:'Existe una disputa declarada.',LOW_CONFIDENCE:'La confianza del evaluador está por debajo del umbral.'};
function clear(node){node.replaceChildren()}
function renderResult(snapshot,recommendation,mock){
  clear(out);
  const strong=document.createElement('strong');
  strong.append(document.createTextNode('Shadow result: '));
  const code=document.createElement('span');code.className='shadow-code';code.textContent=recommendation.result;strong.append(code);
  const summary=document.createElement('p');summary.textContent=`${snapshot.label} · ${snapshot.amount.toLocaleString('es-ES')} €`;
  const list=document.createElement('ol');recommendation.reasons.forEach(reason=>{const li=document.createElement('li');li.textContent=reasonText[reason]||reason;list.append(li)});
  const policy=document.createElement('p');policy.className='muted small';policy.textContent=`Policy: ${recommendation.policyVersion} · enforcement=${recommendation.enforcement} · writeCapabilities=${recommendation.writeCapabilities.length}`;
  const msg=document.createElement('p');msg.className='muted small';msg.textContent=mock.message;
  out.append(strong,summary,list,policy,msg);
}
document.querySelectorAll('[data-scenario]').forEach(button=>button.addEventListener('click',async()=>{
  const snapshot=scenarios[button.dataset.scenario];
  const recommendation=FIACOShadowRiskEngine.evaluate(snapshot);
  const mock=await FIAProviderAdapters.get('fraud').execute('explain',{scenario:button.dataset.scenario});
  renderResult(snapshot,recommendation,mock);
}));
const params=new URLSearchParams(location.search);
if(params.get('context')==='operation'&&contextBanner){contextBanner.hidden=false;}
