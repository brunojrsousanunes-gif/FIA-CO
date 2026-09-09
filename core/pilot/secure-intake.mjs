const ALLOWED_STATUSES=new Set(['PENDING','CONFIRMED','DOCUMENT_RECEIVED','NOT_APPLICABLE_VERIFIED']);
const SECRET_KEYS=new Set(['PASSWORD','API_KEY','PRIVATE_KEY','RECOVERY_CODE','FULL_PAYMENT_CARD','BANK_LOGIN']);

export function assessSecureIntake(manifest={},responses={}){
  if(manifest.repositoryMayStoreValues!==false||manifest.secureSubmissionRequired!==true)throw new Error('UNSAFE_INTAKE_MANIFEST');
  for(const key of Object.keys(responses)){
    if(SECRET_KEYS.has(key))throw new Error('SECRET_MUST_NOT_BE_SUBMITTED');
    const response=responses[key];
    if(response&&typeof response==='object'&&Object.hasOwn(response,'value'))throw new Error('RAW_VALUES_NOT_ACCEPTED_BY_STATUS_GATE');
  }
  const rows=(manifest.items||[]).map(item=>{
    const status=responses[item.id]?.status||'PENDING';
    if(!ALLOWED_STATUSES.has(status))throw new Error('INVALID_INTAKE_STATUS');
    const complete=status!=='PENDING';
    return Object.freeze({...item,status,complete});
  });
  const stages=['PUBLIC_SERVICE','REAL_PREPILOT','PAYMENT_PILOT'];
  const gates=Object.fromEntries(stages.map(stage=>{
    const relevant=rows.filter(x=>x.requiredBefore===stage||(
      stage==='REAL_PREPILOT'&&x.requiredBefore==='PUBLIC_SERVICE'
    )||(
      stage==='PAYMENT_PILOT'&&['PUBLIC_SERVICE','REAL_PREPILOT'].includes(x.requiredBefore)
    ));
    return [stage,Object.freeze({ready:relevant.every(x=>x.complete),pending:Object.freeze(relevant.filter(x=>!x.complete).map(x=>x.n))})];
  }));
  return Object.freeze({
    schemaVersion:'secure-intake-status.v1',
    total:rows.length,completed:rows.filter(x=>x.complete).length,pending:rows.filter(x=>!x.complete).length,
    groups:Object.freeze(Object.fromEntries([...new Set(rows.map(x=>x.group))].map(g=>[g,rows.filter(x=>x.group===g).length]))),
    rows:Object.freeze(rows),gates:Object.freeze(gates),
    repositoryStoresValues:false,secretsAccepted:false,realUserAccessEnabled:false,
    decision:gates.REAL_PREPILOT.ready?'READY_FOR_PROFESSIONAL_AND_TECHNICAL_REVIEW':'KEEP_REAL_USERS_BLOCKED'
  });
}
