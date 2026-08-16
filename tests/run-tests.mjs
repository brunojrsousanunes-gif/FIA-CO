import fs from 'node:fs';
import vm from 'node:vm';
import cryptoMod from 'node:crypto';

const store=new Map();
const localStorage={
  getItem:key=>store.has(key)?store.get(key):null,
  setItem:(key,value)=>store.set(key,String(value)),
  removeItem:key=>store.delete(key),
  clear:()=>store.clear()
};

const context={console,Intl,Date,URLSearchParams,localStorage,crypto:cryptoMod.webcrypto,Uint32Array,Math,Number,String,Array,Object,JSON,Error,RegExp,Set};
vm.createContext(context);

for(const file of ['products.js','cart.js','api.js']){
  const source=fs.readFileSync(new URL(`../frontend/js/${file}`,import.meta.url),'utf8');
  vm.runInContext(source,context,{filename:file});
}

let passed=0;
let failed=0;

async function test(name,fn){
  try{
    await fn();
    console.log(`PASS ${name}`);
    passed++;
  }catch(error){
    console.error(`FAIL ${name}: ${error.message}`);
    failed++;
  }
}

function equal(actual,expected){
  if(actual!==expected) throw new Error(`esperado ${expected}, obtenido ${actual}`);
}
function ok(value,message='condición no cumplida'){
  if(!value) throw new Error(message);
}
async function rejects(expression){
  let rejected=false;
  try{await vm.runInContext(expression,context)}catch{rejected=true}
  ok(rejected,'se esperaba rechazo');
}

await test('catálogo devuelve un producto activo',()=>equal(vm.runInContext("fiaGetProduct('svc-web').sku",context),'FIA-SVC-001'));
await test('producto inexistente devuelve null',()=>equal(vm.runInContext("fiaGetProduct('no-existe')",context),null));
await test('carrito vacío inicia de forma segura',()=>{store.clear();equal(vm.runInContext('fiaLoadCart().length',context),0)});
await test('añadir producto válido calcula el total',()=>{
  store.clear();
  ok(vm.runInContext("fiaAddToCart('svc-web',2)",context));
  equal(vm.runInContext('fiaCartSnapshot()[0].quantity',context),2);
  equal(vm.runInContext('fiaCartTotal()',context),240);
});
await test('cantidad del carrito queda limitada',()=>{
  store.clear();
  vm.runInContext("fiaAddToCart('svc-web',999)",context);
  equal(vm.runInContext('fiaCartSnapshot()[0].quantity',context),20);
});
await test('cantidades decimales se normalizan a entero',()=>{
  store.clear();
  vm.runInContext("fiaAddToCart('svc-web',2.9)",context);
  equal(vm.runInContext('fiaCartSnapshot()[0].quantity',context),2);
});
await test('producto inválido no entra en carrito',()=>{
  store.clear();
  equal(vm.runInContext("fiaAddToCart('not-real',1)",context),false);
});
await test('localStorage manipulado se filtra',()=>{
  store.set('fia_cart_v1',JSON.stringify([{productId:'<script>',quantity:1},{productId:'svc-web',quantity:2}]));
  equal(vm.runInContext('fiaLoadCart().length',context),1);
});
await test('localStorage corrupto no rompe la aplicación',()=>{
  store.set('fia_cart_v1','{no-es-json');
  equal(vm.runInContext('fiaLoadCart().length',context),0);
});
await test('carrito persistido solo contiene productId y quantity',()=>{
  store.clear();
  vm.runInContext("fiaAddToCart('svc-web',1)",context);
  const saved=JSON.parse(store.get('fia_cart_v1'))[0];
  equal(Object.keys(saved).sort().join(','),'productId,quantity');
});
await test('orden demo válida queda pendiente de pago',async()=>{
  const order=await vm.runInContext("fiaCreateOrderDemo([{productId:'svc-web',quantity:1}],{name:'Ana',email:'ANA@EXAMPLE.COM'},'bank')",context);
  equal(order.status,'PENDING_PAYMENT');
  equal(order.paymentMethod,'bank');
  equal(order.customer.email,'ana@example.com');
  equal(order.demo,true);
  ok(/^FIA-DEMO-[A-F0-9]{16}$/.test(order.publicReference),'referencia demo no válida');
});
await test('orden demo no declara pago completado ni total autoritativo',async()=>{
  const order=await vm.runInContext("fiaCreateOrderDemo([{productId:'svc-web',quantity:1}],{name:'Ana',email:'a@b.com'},'card')",context);
  ok(!('paid' in order),'la demo no debe declarar paid');
  ok(!('total' in order),'la demo no debe declarar total autoritativo');
  ok(!['PAID','COMPLETED','SETTLED','FINALIZED'].includes(order.status),'estado financiero prohibido');
});
await test('referencias demo no son secuenciales ni repetidas en una muestra',async()=>{
  const refs=new Set();
  for(let i=0;i<100;i++){
    const order=await vm.runInContext("fiaCreateOrderDemo([{productId:'svc-web',quantity:1}],{name:'Ana',email:'a@b.com'},'crypto')",context);
    refs.add(order.publicReference);
  }
  equal(refs.size,100);
});
await test('email inválido se rechaza',()=>rejects("fiaCreateOrderDemo([{productId:'svc-web',quantity:1}],{name:'Ana',email:'bad'},'bank')"));
await test('nombre demasiado corto se rechaza',()=>rejects("fiaCreateOrderDemo([{productId:'svc-web',quantity:1}],{name:'A',email:'a@b.com'},'bank')"));
await test('método de pago no permitido se rechaza',()=>rejects("fiaCreateOrderDemo([{productId:'svc-web',quantity:1}],{name:'Ana',email:'a@b.com'},'cash')"));
await test('cantidad manipulada se rechaza al crear orden',()=>rejects("fiaCreateOrderDemo([{productId:'svc-web',quantity:999}],{name:'Ana',email:'a@b.com'},'bank')"));
await test('producto manipulado se rechaza al crear orden',()=>rejects("fiaCreateOrderDemo([{productId:'<script>',quantity:1}],{name:'Ana',email:'a@b.com'},'bank')"));
await test('producto inexistente se rechaza al crear orden',()=>rejects("fiaCreateOrderDemo([{productId:'no-existe',quantity:1}],{name:'Ana',email:'a@b.com'},'bank')"));
await test('carrito vacío se rechaza al crear orden',()=>rejects("fiaCreateOrderDemo([],{name:'Ana',email:'a@b.com'},'bank')"));
await test('más de 50 líneas se rechazan al crear orden',()=>{
  const many=Array.from({length:51},()=>({productId:'svc-web',quantity:1}));
  context.many=many;
  return rejects("fiaCreateOrderDemo(many,{name:'Ana',email:'a@b.com'},'bank')");
});

const htmlFiles=['index.html','products.html','product.html','cart.html','checkout.html'];
for(const html of htmlFiles){
  await test(`${html} existe y declara viewport`,()=>{
    const source=fs.readFileSync(new URL(`../frontend/${html}`,import.meta.url),'utf8');
    ok(source.includes('name="viewport"'),'falta viewport móvil');
  });
  await test(`${html} no carga scripts remotos`,()=>{
    const source=fs.readFileSync(new URL(`../frontend/${html}`,import.meta.url),'utf8');
    ok(!/<script[^>]+src=["']https?:\/\//i.test(source),'script remoto detectado');
  });
}

await test('checkout advierte que no procesa pagos reales',()=>{
  const source=fs.readFileSync(new URL('../frontend/checkout.html',import.meta.url),'utf8');
  ok(source.includes('No introduzcas datos sensibles'));
  ok(source.includes('sin movimiento de fondos'));
});
await test('checkout no contiene campos de tarjeta, IBAN o clave privada',()=>{
  const source=fs.readFileSync(new URL('../frontend/checkout.html',import.meta.url),'utf8').toLowerCase();
  for(const forbidden of ['card-number','cvv','iban-input','private-key','seed-phrase']) ok(!source.includes(forbidden),`campo prohibido: ${forbidden}`);
});
await test('frontend no contiene patrones obvios de secretos',()=>{
  const files=[...htmlFiles.map(f=>`../frontend/${f}`),'../frontend/js/products.js','../frontend/js/cart.js','../frontend/js/product.js','../frontend/js/api.js'];
  const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bsk-[A-Za-z0-9_-]{20,}\b/,/\bghp_[A-Za-z0-9]{20,}\b/];
  for(const file of files){
    const source=fs.readFileSync(new URL(file,import.meta.url),'utf8');
    for(const pattern of patterns) ok(!pattern.test(source),`posible secreto en ${file}`);
  }
});

console.log(`\n${passed} pruebas superadas, ${failed} fallidas`);
if(failed>0) process.exit(1);
