import assert from 'node:assert/strict';
import { prepareZeroCostPrepilot } from '../core/compliance/zero-cost-prepilot.mjs';

const termsHash='sha256:synthetic-v1';
const scenario={
  scenarioId:'SYNTHETIC-001',
  demoMode:true,
  realMoney:false,
  realPeople:false,
  realCustomerData:false,
  externalServiceRequired:false,
  contract:{
    contractId:'DEMO-CONTRACT-001',
    contractVersion:'1',
    templateId:'SALE_P2P_DEMO',
    termsHash,
    parties:{
      seller:{id:'DEMO-SELLER',type:'CONSUMER'},
      buyer:{id:'DEMO-BUYER',type:'CONSUMER'}
    },
    terms:{
      subject:'Producto ficticio',
      price:'IMPORTE_SIMULADO',
      currency:'EUR_SIMULADO',
      performance:'Entrega simulada',
      cancellation:'Cancelación simulada'
    },
    acceptances:[
      {partyId:'DEMO-SELLER',acceptedAt:'2026-09-08T00:00:00Z',termsHash},
      {partyId:'DEMO-BUYER',acceptedAt:'2026-09-08T00:01:00Z',termsHash}
    ],
    durableCopyReference:'private://synthetic/contract-001'
  }
};

const result=prepareZeroCostPrepilot(scenario);
assert.equal(result.status,'SIMULATION_READY');
assert.equal(result.protections.realMoneyAllowed,false);
assert.equal(result.protections.localEphemeralExecutionOnly,true);
assert.throws(()=>prepareZeroCostPrepilot({...scenario,realMoney:true}),/REAL_MONEY_FORBIDDEN/);
assert.throws(()=>prepareZeroCostPrepilot({...scenario,realPeople:true}),/REAL_PERSONAL_DATA_FORBIDDEN/);
assert.throws(()=>prepareZeroCostPrepilot({...scenario,notes:'IBAN ES91 2100 0418 4502 0005 1332'}),/SENSITIVE_DATA_DETECTED/);
console.log('zero-cost-prepilot: ok');
