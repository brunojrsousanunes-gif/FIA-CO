import fs from 'node:fs';
import assert from 'node:assert/strict';

const worker=fs.readFileSync('frontend/sw.js','utf8');
assert.match(worker,/CACHE_NAME='fia-co-public-v2'/);
assert.match(worker,/cache\.put\(request,response\.clone\(\)\)/);
assert.match(worker,/cache\.match\(request\)/);
assert.match(worker,/request\.mode==='navigate'/);
assert.match(worker,/request\.destination/);
assert.match(worker,/await fetch\(request\)/);
assert.match(worker,/key!==CACHE_NAME/);
assert.doesNotMatch(worker,/cache\.put\('\.\/',copy\)/,
  'navigation responses must not overwrite the root route cache');
console.log('service-worker route and update cache contract: ok');
