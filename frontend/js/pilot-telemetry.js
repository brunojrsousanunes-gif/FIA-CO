const KEY='fiaco.pilot.telemetry.v1';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{"sessions":0,"operations":0,"incidents":0}')}catch{return {sessions:0,operations:0,incidents:0}}}
function write(value){localStorage.setItem(KEY,JSON.stringify(value))}
const metrics=read();metrics.sessions=(metrics.sessions||0)+1;write(metrics);
document.addEventListener('click',event=>{const el=event.target.closest('[data-intent],[data-direct]');if(!el)return;const next=read();if(el.dataset.intent==='new'||el.dataset.direct)next.operations=(next.operations||0)+1;if(el.dataset.direct==='conciliation')next.incidents=(next.incidents||0)+1;write(next)});
