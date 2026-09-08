import assert from 'node:assert/strict';
import { createOwnerInputRegister, evaluateOwnerInputs, updateOwnerInput } from '../core/pilot/owner-input-register.mjs';

const register=createOwnerInputRegister([
 {id:'LEGAL_ADDRESS',label:'Domicilio válido',activationGate:'PRODUCTION_ACTIVATION',placeholder:'PENDING_LEGAL_ADDRESS'},
 {id:'LEGAL_EMAIL',label:'Correo legal',activationGate:'CONTROLLED_PREPILOT',placeholder:'PENDING_LEGAL_EMAIL'}
]);
const development=evaluateOwnerInputs(register,'SYNTHETIC_DEVELOPMENT');
assert.equal(development.decision,'CONTINUE');
assert.equal(development.pendingCount,2);
assert.equal(development.ownerActionRequiredNow,false);
assert.equal(development.inventedValuesAllowed,false);
const production=evaluateOwnerInputs(register,'PRODUCTION_ACTIVATION');
assert.equal(production.decision,'BLOCK');
assert.deepEqual(new Set(production.blockingIds),new Set(['LEGAL_ADDRESS','LEGAL_EMAIL']));
assert.throws(()=>updateOwnerInput(register,'LEGAL_ADDRESS',{status:'PROVIDED'}),/REAL_OWNER_INPUT_FORBIDDEN/);
updateOwnerInput(register,'LEGAL_ADDRESS',{status:'VALIDATION_REQUIRED'});
assert.equal(register.requirements[0].realValue,null);
console.log('owner-input-register: ok');
