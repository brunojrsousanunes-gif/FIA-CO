const FIA_PRODUCTS = Object.freeze([
  {id:'svc-web',sku:'FIA-SVC-001',name:'Servicio digital',description:'Operación de demostración para un servicio acordado entre particulares.',price:120,currency:'EUR',active:true},
  {id:'item-secondhand',sku:'FIA-ITEM-001',name:'Artículo de segunda mano',description:'Ejemplo de compraventa condicionada con comprobación antes de liberar.',price:250,currency:'EUR',active:true},
  {id:'custom-order',sku:'FIA-CUSTOM-001',name:'Encargo personalizado',description:'Ejemplo de encargo con condición de aceptación definida por las partes.',price:480,currency:'EUR',active:true}
]);

function fiaMoney(value,currency='EUR'){
  return new Intl.NumberFormat('es-ES',{style:'currency',currency}).format(value);
}

function fiaGetProduct(id){
  return FIA_PRODUCTS.find(p=>p.id===id&&p.active) || null;
}
