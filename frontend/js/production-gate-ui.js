(()=>{
  'use strict';
  const labels={
    legalReady:'Revisión legal lista',
    licensedPaymentPartnerReady:'Partner de pagos autorizado listo',
    privacyReviewReady:'Privacidad/RGPD revisada',
    threatModelReady:'Threat model listo',
    externalSecurityReviewReady:'Revisión externa/pentest lista',
    secretsBackendReady:'Backend y secretos productivos listos',
    incidentResponseReady:'Respuesta a incidentes lista',
    backupRestoreReady:'Backup/restauración ensayados',
    monitoringReady:'Monitorización lista',
    dataRetentionReady:'Retención/borrado definidos',
    termsAndContractsReady:'Términos/contratos listos'
  };
  const host=document.getElementById('checks');
  FIACOProductionGate.checks.forEach(key=>{
    const label=document.createElement('label');
    const input=document.createElement('input');
    input.type='checkbox';
    input.id=key;
    label.append(input,document.createTextNode(' '+labels[key]));
    host.append(label);
  });
  function metric(labelText,value){
    const box=document.createElement('div');
    box.className='metric';
    const small=document.createElement('small');
    small.textContent=labelText;
    const strong=document.createElement('strong');
    strong.textContent=value;
    box.append(small,strong);
    return box;
  }
  document.getElementById('evaluate').addEventListener('click',()=>{
    const input={};
    FIACOProductionGate.checks.forEach(key=>{input[key]=document.getElementById(key).checked});
    const result=FIACOProductionGate.evaluate(input);
    document.getElementById('out').replaceChildren(
      metric('Estado',result.status),
      metric('Producción activa',result.productionExecutionEnabled?'SÍ':'NO'),
      metric('Fondos reales',result.realFundsEnabled?'SÍ':'NO'),
      metric('Nueva autorización',result.newAuthorizationRequired?'SÍ':'AÚN NO')
    );
    document.getElementById('why').textContent=result.missing.length
      ?'Faltan: '+result.missing.join(' · ')
      :'Prerequisitos cubiertos. El siguiente paso sería pedir autorización explícita antes de cualquier producción real.';
  });
})();
