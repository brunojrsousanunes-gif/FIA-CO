/*
 * Capa de acceso preparada para sustituir la demo local por un backend.
 * Seguridad: el frontend nunca debe decidir el precio final ni marcar pagos como completados.
 */

async function fiaCreateOrderDemo(cartItems,customer){
  if(!Array.isArray(cartItems)||cartItems.length===0) throw new Error('Carrito vacío');
  const normalizedCustomer={
    name:String(customer?.name||'').trim().slice(0,80),
    email:String(customer?.email||'').trim().toLowerCase().slice(0,160)
  };
  if(normalizedCustomer.name.length<2) throw new Error('Nombre no válido');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedCustomer.email)) throw new Error('Correo no válido');

  // DEMO: el cálculo local es solo representativo. Un backend real deberá
  // volver a consultar catálogo, stock, impuestos y reglas de negocio.
  const orderId='FIA-DEMO-'+crypto.getRandomValues(new Uint32Array(1))[0].toString(16).toUpperCase();
  return {
    publicReference:orderId,
    status:'PENDING_PAYMENT',
    customer:normalizedCustomer,
    items:cartItems.map(({productId,quantity})=>({productId,quantity})),
    createdAt:new Date().toISOString(),
    demo:true
  };
}
