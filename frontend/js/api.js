/*
 * Capa de acceso preparada para sustituir la demo local por un backend.
 * Seguridad: el frontend nunca debe decidir el precio final ni marcar pagos como completados.
 */

const FIA_ALLOWED_PAYMENT_METHODS=new Set(['bank','card','crypto']);

function fiaValidateDemoCart(cartItems){
  if(!Array.isArray(cartItems)||cartItems.length===0) throw new Error('Carrito vacío');
  if(cartItems.length>50) throw new Error('Carrito no válido');
  return cartItems.map(item=>{
    const productId=String(item?.productId||'');
    const quantity=Number(item?.quantity);
    if(!/^[a-z0-9-]{1,40}$/.test(productId)) throw new Error('Producto no válido');
    if(!Number.isInteger(quantity)||quantity<1||quantity>20) throw new Error('Cantidad no válida');
    if(!fiaGetProduct(productId)) throw new Error('Producto no disponible');
    return {productId,quantity};
  });
}

async function fiaCreateOrderDemo(cartItems,customer,paymentMethod){
  const safeItems=fiaValidateDemoCart(cartItems);
  const normalizedCustomer={
    name:String(customer?.name||'').trim().slice(0,80),
    email:String(customer?.email||'').trim().toLowerCase().slice(0,160)
  };
  const safeMethod=String(paymentMethod||'');
  if(normalizedCustomer.name.length<2) throw new Error('Nombre no válido');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedCustomer.email)) throw new Error('Correo no válido');
  if(!FIA_ALLOWED_PAYMENT_METHODS.has(safeMethod)) throw new Error('Método de pago no válido');

  // DEMO: esta validación solo reduce errores en la interfaz. Un backend real deberá
  // volver a consultar catálogo, stock, impuestos y reglas de negocio y no confiar
  // en ningún valor calculado o validado por este archivo.
  const orderId='FIA-DEMO-'+crypto.getRandomValues(new Uint32Array(2)).reduce((s,n)=>s+n.toString(16).padStart(8,'0'),'').toUpperCase();
  return {
    publicReference:orderId,
    status:'PENDING_PAYMENT',
    paymentMethod:safeMethod,
    customer:normalizedCustomer,
    items:safeItems,
    createdAt:new Date().toISOString(),
    demo:true
  };
}
