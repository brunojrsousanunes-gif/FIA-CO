(()=>{
  'use strict';
  let verified=false;
  const factorResult=document.getElementById('factor-result');
  const identityState=document.getElementById('identity-state');
  const paymentState=document.getElementById('payment-state');
  const authorize=document.getElementById('authorize-demo');
  const paymentResult=document.getElementById('payment-result');

  function setNotice(node,label,message){
    node.replaceChildren();
    const strong=document.createElement('strong');
    strong.textContent=label;
    node.append(strong,document.createTextNode(' '+message));
  }

  document.querySelectorAll('.demo-factor').forEach(btn=>btn.addEventListener('click',()=>{
    verified=true;
    identityState.textContent='Verificada (simulación)';
    setNotice(factorResult,'Estado:',`${btn.dataset.factor} verificada en modo demostración. No se ha accedido a ningún sensor ni se ha capturado biometría.`);
    authorize.disabled=false;
  }));

  authorize.addEventListener('click',()=>{
    if(!verified)return;
    paymentState.textContent='Autorizada · DEMO';
    setNotice(paymentResult,'Operación autorizada en simulación.','Se ha demostrado el flujo de consentimiento, pero no se ha enviado dinero ni datos biométricos.');
    authorize.disabled=true;
  });

  document.getElementById('reset-demo').addEventListener('click',()=>{
    verified=false;
    identityState.textContent='Pendiente';
    paymentState.textContent='No autorizada';
    setNotice(factorResult,'Estado:','aún no se ha simulado ningún factor.');
    setNotice(paymentResult,'Importante:','no hay movimiento de fondos, captura biométrica real ni conexión con un proveedor financiero.');
    authorize.disabled=true;
  });
})();
