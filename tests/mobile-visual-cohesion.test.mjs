import assert from 'node:assert/strict';
import fs from 'node:fs';

const home=fs.readFileSync('frontend/index.html','utf8');
const homeCss=fs.readFileSync('frontend/css/home-production.css','utf8');
const app=fs.readFileSync('frontend/beta-mobile.html','utf8');
const appCss=fs.readFileSync('frontend/css/unified-app.css','utf8');

assert.match(home,/home-production\.css\?v=mobile-clarity-v2/);
assert.match(app,/unified-app\.css\?v=mobile-clarity-v2/);
assert.match(homeCss,/Visual cohesion/);
assert.match(homeCss,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
assert.match(homeCss,/\.portal-hero \.control-board\{border:1px solid/);
assert.match(homeCss,/\.assistant-showcase\{border:1px solid/);
assert.match(homeCss,/\.assistant-orbit\{width:176px;margin:0 auto 7px/);
assert.match(appCss,/Shared visual clarity/);
assert.match(appCss,/--ua-line:#d4ced9/);
assert.match(appCss,/box-shadow:0 -9px 24px/);
console.log('mobile visual cohesion: ok');
