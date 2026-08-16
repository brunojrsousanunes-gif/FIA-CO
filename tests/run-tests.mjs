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

await test('catálogo devuelve un producto activo',()=>equal(vm.runInContext("fiaGetProduct('svc-web').sku",context),'FIA-SVC-001'));
await test('producto inexistente devuelve null',()=>equal(vm.runInContext("fiaGetProduct('no-existe')",context),null));
await test('carrito vacío inicia de forma segura',()=>equal(vm.runInContext('fiaLoadCart().length',context),0));
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
await test('producto inválido no entra en carrito',()=>{
  store.clear();
  equal(vm.runInContext("fiaAddToCart('not-real',1)",context),false);
});
await test('localStorage manipulado se filtra',()=>{
  store.set('fia_cart_v1',JSON.stringify([{productId:'<script>',quantity:1},{productId:'svc-web',quantity:2}]));
  equal(vm.runInContext('fiaLoadCart().length',context),1);
});
await test('orden demo válida queda pendiente de pago',async()=>{
  const order=await vm.runInContext("fiaCreateOrderDemo([{productId:'svc-web',quantity:1}],{name:'Ana',email:'ANA@EXAMPLE.COM'},'bank')",context);
  equal(order.status,'PENDING_PAYMENT');
  equal(order.paymentMethod,'bank');
  equal(order.customer.email,'ana@example.com');
  ok(/^FIA-DEMO-[A-F0-9]{16}$/.test(order.publicReference),'referencia demo no válida');
});
await test('email inválido se rechaza',async()=>{
  let rejected=false;
  try{await vm.runInContext("fiaCreateOrderDemo([{productId:'svc-web',quantity:1}],{name:'Ana',email:'bad'},'bank')",context)}catch{rejected=true}
  ok(rejected);
});
await test('método de pago no permitido se rechaza',async()=>{
  let rejected=false;
  try{await vm.runInContext("fiaCreateOrderDemo([{productId:'svc-web',quantity:1}],{name:'Ana',email:'a@b.com'},'cash')",context)}catch{rejected=true}
  ok(rejected);
});
await test('cantidad manipulada se rechaza al crear orden',async()=>{
  let rejected=false;
  try{await vm.runInContext("fiaCreateOrderDemo([{productId:'svc-web',quantity:999}],{name:'Ana',email:'a@b.com'},'bank')",context)}catch{rejected=true}
  ok(rejected);
});

for(const html of ['index.html','products.html','product.html','cart.html','checkout.html']){
  await test(`${html} existe y declara viewport`,()=>{
    const source=fs.readFileSync(new URL(`../frontend/${html}`,import.meta.url),'utf8');
    ok(source.includes('name="viewport"'),'falta viewport móvil');
  });
}

await test('checkout advierte que no procesa pagos reales',()=>{
  const source=fs.readFileSync(new URL('../frontend/checkout.html',import.meta.url),'utf8');
  ok(source.includes('No introduzcas datos sensibles'));
  ok(source.includes('sin movimiento de fondos'));
});

console.log(`\n${passed} pruebas superadas, ${failed} fallidas`);
if(failed>0) process.exit(1);
