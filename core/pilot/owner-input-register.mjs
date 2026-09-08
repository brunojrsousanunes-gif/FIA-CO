const ALLOWED_STATUS=new Set(['PENDING','PROVIDED','NOT_APPLICABLE','VALIDATION_REQUIRED']);

function clean(value,max=160){return String(value||'').replace(/[<>\r\n\t]/g,' ').trim().slice(0,max);}

export function createOwnerInputRegister(requirements = []) {
  if (!Array.isArray(requirements)) throw new Error('INVALID_OWNER_REQUIREMENTS');
  return {
    schemaVersion:'owner-input-register.v1',
    syntheticOnly:true,
    requirements:requirements.map((item,index)=>({
      id:clean(item.id,80) || `OWNER-INPUT-${index+1}`,
      label:clean(item.label,120),
      activationGate:clean(item.activationGate,80),
      status:'PENDING',
      placeholder:clean(item.placeholder || 'SYNTHETIC_PENDING',120),
      safeToContinueSynthetic:item.safeToContinueSynthetic !== false,
      ownerActionRequiredNow:false,
      realValue:null
    }))
  };
}

export function evaluateOwnerInputs(register, stage = 'SYNTHETIC_DEVELOPMENT') {
  const pending=register.requirements.filter(item=>item.status==='PENDING');
  const blocking=stage==='PRODUCTION_ACTIVATION'
    ? pending
    : pending.filter(item=>item.safeToContinueSynthetic===false);
  return Object.freeze({
    schemaVersion:'owner-input-evaluation.v1',
    stage,
    decision:blocking.length ? 'BLOCK' : 'CONTINUE',
    pendingCount:pending.length,
    blockingIds:Object.freeze(blocking.map(item=>item.id)),
    ownerActionRequiredNow:blocking.length>0,
    inventedValuesAllowed:false,
    requestRule:'Consolidar y pedir únicamente los datos mínimos cuando bloqueen la siguiente fase real.'
  });
}

export function updateOwnerInput(register, id, input = {}) {
  const item=register.requirements.find(entry=>entry.id===id);
  if (!item) throw new Error('OWNER_INPUT_NOT_FOUND');
  const status=clean(input.status,30).toUpperCase();
  if (!ALLOWED_STATUS.has(status)) throw new Error('INVALID_OWNER_INPUT_STATUS');
  if (status==='PROVIDED' && register.syntheticOnly===true) {
    throw new Error('REAL_OWNER_INPUT_FORBIDDEN_IN_SYNTHETIC_REGISTER');
  }
  item.status=status;
  return Object.freeze({...item});
}
