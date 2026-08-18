(function(global){'use strict';
const DEMO_ONLY=true;
function frozenResult(provider,action,payload){return Object.freeze({provider,action,status:'MOCK_ONLY',demo:true,receivedFields:Object.keys(payload||{}),message:'Adaptador demostrativo: no se ha contactado ningún proveedor externo.'});}
function makeAdapter(name,allowed){return Object.freeze({name,mode:'MOCK_ONLY',capabilities:Object.freeze([...allowed]),async execute(action,payload={}){if(!DEMO_ONLY)throw new Error('Provider adapters are locked to demo mode');if(!allowed.includes(action))throw new Error('Action not allowed by demo adapter');return frozenResult(name,action,payload);}});}
const adapters=Object.freeze({payments:makeAdapter('LOCAL_PAYMENT_MOCK',['quote','validate']),identity:makeAdapter('LOCAL_IDENTITY_MOCK',['check_requirements','validate_shape']),fraud:makeAdapter('LOCAL_FRAUD_MOCK',['observe','explain']),humanReview:makeAdapter('LOCAL_HUMAN_REVIEW_MOCK',['create_demo_request','status'])});
global.FIAProviderAdapters=Object.freeze({DEMO_ONLY,adapters,get(type){return adapters[type]||null;}});
})(window);