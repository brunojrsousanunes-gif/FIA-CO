import assert from 'node:assert/strict';
import {classifySensitiveText,buildSafeSearchRecord} from '../core/privacy/sensitive-data-policy.mjs';

for(const query of ['12345678Z','X1234567L','ES91 2100 0418 4502 0005 1332','4111 1111 1111 1111','mi token es secreto']){
 const result=buildSafeSearchRecord({query,historyEnabled:true});
 assert.equal(result.stored,false,query);
 assert.equal(result.query,null,query);
 assert.equal(result.deletionRequired,true,query);
}
const normal=buildSafeSearchRecord({query:'buscar furgoneta en Lugo',historyEnabled:true});
assert.equal(normal.stored,true);
assert.equal(normal.query,'buscar furgoneta en Lugo');
assert.equal(classifySensitiveText('buscar maquinaria').aiContextAllowed,true);
console.log('Sensitive data policy passed');
