const FIA_CART_KEY='fia_cart_v1';
const FIA_CART_MAX_ITEMS=50;
const FIA_CART_MAX_QUANTITY=20;

function fiaNormalizeQuantity(value){
  const n=Number(value);
  if(!Number.isFinite(n)) return 1;
  return Math.min(FIA_CART_MAX_QUANTITY,Math.max(1,Math.floor(n)));
}

function fiaLoadCart(){
  try{
    const raw=localStorage.getItem(FIA_CART_KEY);
    const parsed=raw?JSON.parse(raw):[];
    if(!Array.isArray(parsed)) return [];
    return parsed
      .filter(item=>item&&typeof item.productId==='string'&&/^[a-z0-9-]{1,40}$/.test(item.productId)&&Number.isInteger(item.quantity)&&item.quantity>0&&item.quantity<=FIA_CART_MAX_QUANTITY)
      .slice(0,FIA_CART_MAX_ITEMS);
  }catch(_){return []}
}

function fiaSaveCart(items){
  const safe=(Array.isArray(items)?items:[])
    .filter(item=>item&&typeof item.productId==='string'&&/^[a-z0-9-]{1,40}$/.test(item.productId))
    .slice(0,FIA_CART_MAX_ITEMS)
    .map(item=>({productId:item.productId,quantity:fiaNormalizeQuantity(item.quantity)}));
  localStorage.setItem(FIA_CART_KEY,JSON.stringify(safe));
}

function fiaAddToCart(productId,quantity=1){
  const product=fiaGetProduct(productId);
  if(!product) return false;
  const cart=fiaLoadCart();
  const existing=cart.find(item=>item.productId===productId);
  const safeQuantity=fiaNormalizeQuantity(quantity);
  if(existing) existing.quantity=Math.min(FIA_CART_MAX_QUANTITY,existing.quantity+safeQuantity);
  else {
    if(cart.length>=FIA_CART_MAX_ITEMS) return false;
    cart.push({productId,quantity:safeQuantity});
  }
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
