(function(global){'use strict';
const ALLOWED=new Set(['success','timeout','latency','transient_error','permanent_error','invalid_response','circuit_open']);
function simulate(provider,scenario='success',payload={}){
 if(!ALLOWED.has(scenario))throw new Error('Unknown sandbox scenario');
 const base={provider,scenario,demo:true,network:false,receivedFields:Object.keys(payload||{})};
 if(scenario==='success')return Object.freeze({...base,status:'OK'});
 if(scenario==='latency')return Object.freeze({...base,status:'DELAYED',simulatedLatencyMs:750});
 if(scenario==='timeout')return Object.freeze({...base,status:'TIMEOUT',retryable:true});
 if(scenario==='transient_error')return Object.freeze({...base,status:'ERROR',retryable:true});
 if(scenario==='permanent_error')return Object.freeze({...base,status:'ERROR',retryable:false});
 if(scenario==='invalid_response')return Object.freeze({...base,status:'INVALID_RESPONSE',retryable:false});
 return Object.freeze({...base,status:'CIRCUIT_OPEN',retryable:false});
}
global.FIAProviderSandbox=Object.freeze({DEMO_ONLY:true,networkCallsEnabled:false,scenarios:Object.freeze([...ALLOWED]),simulate});
})(window);