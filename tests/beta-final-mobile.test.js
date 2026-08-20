const fs=require('fs'),assert=require('assert');
const beta=fs.readFileSync('frontend/app-beta.html','utf8');
['tx-advanced.html','tx-operator.html','Transportista externo','FIA&CO coordina y supervisa'].forEach(x=>assert(beta.includes(x),x));
assert(beta.includes('viewport-fit=cover'));
assert(beta.includes('SIN DINERO REAL'));
console.log('Final mobile beta integration gate passed');
