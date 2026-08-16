(()=>{
'use strict';
const INITIAL={eur:1250,btc:0.025};
const HISTORY_KEY='fia_wallet_demo_history_v1';
const state={...INITIAL,pending:null};
const $=id=>document.getElementById(id);
const eur=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v);
const btc=v=>`${Number(v).toFixed(8)} BTC`;
function num(id){return Number($(id).value)}
function validQuote(){
 const amount=num('btcAmount'),rate=num('btcRate'),feePct=num('feePct');
 if(!Number.isFinite(amount)||amount<=0||amount>state.btc) return null;
 if(!Number.isFinite(rate)||rate<=0||rate>10000000) return null;
 if(!Number.isFinite(feePct)||feePct<0||feePct>10) return null;
 const gross=amount*rate,fee=gross*(feePct/100),net=gross-fee;
 return {amount,rate,feePct,gross,fee,net};
}
function refreshQuote(){
 const q=validQuote();
 $('btcBalance').textContent=btc(state.btc);$('eurBalance').textContent=eur(state.eur);
 const rate=Number.isFinite(num('btcRate'))?num('btcRate'):0;
 $('btcValue').textContent=rate>0?eur(state.btc*rate):'—';
 $('grossEur').textContent=q?eur(q.gross):'—';$('feeEur').textContent=q?eur(q.fee):'—';$('netEur').textContent=q?eur(q.net):'—';
 $('prepareConversion').disabled=!q;
}
function ref(){
 const arr=new Uint32Array(2);crypto.getRandomValues(arr);return `FIA-BTC-${[...arr].map(x=>x.toString(16).padStart(8,'0')).join('').toUpperCase()}`;
}
function prepare(){
 const q=validQuote();if(!q)return;
 state.pending={...q,reference:ref(),createdAt:new Date().toISOString()};
 $('operationEmpty').hidden=true;$('operationContent').hidden=false;$('operationStatus').textContent='Preparada';
 $('opBtc').textContent=btc(q.amount);$('opEur').textContent=eur(q.net);$('opRef').textContent=state.pending.reference;
}
function history(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]').filter(x=>x&&typeof x==='object').slice(0,20)}catch{return []}}
function saveHistory(item){const items=[item,...history()].slice(0,20);localStorage.setItem(HISTORY_KEY,JSON.stringify(items));renderHistory()}
function renderHistory(){
 const items=history();$('historyList').innerHTML=items.length?items.map(x=>`<article class="history-item"><div><strong>${x.status==='COMPLETED_DEMO'?'Conversión BTC→EUR':'Operación cancelada'}</strong><small>${new Date(x.at).toLocaleString('es-ES')} · ${x.reference}</small></div><span><b>${btc(x.btc)}</b><small>${x.eur?eur(x.eur):'Sin abono'}</small></span></article>`).join(''):'<div class="empty-state">Todavía no hay movimientos simulados.</div>';
}
function resetOperation(){state.pending=null;$('operationEmpty').hidden=false;$('operationContent').hidden=true;$('operationStatus').textContent='Sin preparar'}
function confirm(){
 if(!state.pending)return;const p=state.pending;
 state.btc=Math.max(0,state.btc-p.amount);state.eur+=p.net;
 saveHistory({status:'COMPLETED_DEMO',at:new Date().toISOString(),reference:p.reference,btc:p.amount,eur:p.net});
 resetOperation();refreshQuote();
}
function cancel(){if(state.pending)saveHistory({status:'CANCELLED_DEMO',at:new Date().toISOString(),reference:state.pending.reference,btc:state.pending.amount,eur:0});resetOperation()}
['btcAmount','btcRate','feePct'].forEach(id=>$(id).addEventListener('input',refreshQuote));
$('prepareConversion').addEventListener('click',prepare);$('confirmDemo').addEventListener('click',confirm);$('cancelDemo').addEventListener('click',cancel);$('clearHistory').addEventListener('click',()=>{localStorage.removeItem(HISTORY_KEY);renderHistory()});
refreshQuote();renderHistory();
window.FIAWalletDemo={validQuote,formatEUR:eur};
})();