const FIA_CART_KEY='fia_cart_v1';

function fiaLoadCart(){
  try{
    const raw=localStorage.getItem(FIA_CART_KEY);
    const parsed=raw?JSON.parse(raw):[];
    if(!Array.isArray(parsed)) return [];
    return parsed.filter(item=>item&&typeof item.productId==='string'&&Number.isInteger(item.quantity)&&item.quantity>0&&item.quantity<=20);
  }catch(_){return []}
}

function fiaSaveCart(items){
  const safe=items.map(item=>({productId:String(item.productId),quantity:Math.min(20,Math.max(1,Number(item.quantity)||1))}));
  localStorage.setItem(FIA_CART_KEY,JSON.stringify(safe));
}

function fiaAddToCart(productId,quantity=1){
  const product=fiaGetProduct(productId);
  if(!product) return false;
  const cart=fiaLoadCart();
  const existing=cart.find(item=>item.productId===productId);
  if(existing) existing.quantity=Math.min(20,existing.quantity+quantity);
  else cart.push({productId,quantity:Math.min(20,Math.max(1,quantity))});
  fiaSaveCart(cart);
  return true;
}

function fiaRemoveFromCart(productId){
  fiaSaveCart(fiaLoadCart().filter(item=>item.productId!==productId));
}

function fiaCartSnapshot(){
  return fiaLoadCart().map(item=>{
    const product=fiaGetProduct(item.productId);
    return product?{productId:product.id,name:product.name,quantity:item.quantity,unitPrice:product.price,currency:product.currency,lineTotal:product.price*item.quantity}:null;
  }).filter(Boolean);
}

function fiaCartTotal(){
  return fiaCartSnapshot().reduce((sum,item)=>sum+item.lineTotal,0);
}
