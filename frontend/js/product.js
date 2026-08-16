function fiaProductIdFromUrl(){
  const value=new URLSearchParams(location.search).get('id');
  return typeof value==='string'&&/^[a-z0-9-]{1,40}$/.test(value)?value:null;
}

function fiaRenderProductDetail(container){
  const id=fiaProductIdFromUrl();
  const product=id?fiaGetProduct(id):null;
  container.textContent='';
  if(!product){
    const h=document.createElement('h2');h.textContent='Producto no disponible';
    const p=document.createElement('p');p.className='muted';p.textContent='La referencia solicitada no es válida o ya no está activa.';
    const a=document.createElement('a');a.className='btn';a.href='products.html';a.textContent='Volver al catálogo';
    container.append(h,p,a);return;
  }
  const h=document.createElement('h1');h.style.fontSize='44px';h.textContent=product.name;
  const d=document.createElement('p');d.className='lead';d.textContent=product.description;
  const price=document.createElement('p');price.className='price';price.textContent=fiaMoney(product.price,product.currency);
  const note=document.createElement('p');note.className='notice';note.textContent='Importe de demostración. El backend real será la autoridad sobre precio y disponibilidad.';
  const b=document.createElement('button');b.className='btn';b.type='button';b.textContent='Añadir al carrito';
  b.addEventListener('click',()=>{if(fiaAddToCart(product.id,1)){location.href='cart.html'}});
  container.append(h,d,price,note,b);
}
