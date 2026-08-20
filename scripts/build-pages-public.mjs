import fs from 'node:fs';
import path from 'node:path';

const repoRoot=process.cwd();
const frontendRoot=path.join(repoRoot,'frontend');
const allowlistPath=path.join(repoRoot,'config','pages-public-allowlist.txt');
const outDir=path.resolve(repoRoot,process.argv[2]||'pages-public');

const lines=fs.readFileSync(allowlistPath,'utf8').split(/\r?\n/).map(v=>v.trim()).filter(v=>v&&!v.startsWith('#'));
const allowed=new Set(lines);
const forbiddenName=/(^|\/)(?:\.env(?:\.|$)|.*secret.*|.*credential.*|.*token.*|.*state.*\.json$|.*\.map$)/i;

function normalizeRelative(value){
  const clean=String(value||'').split('#')[0].split('?')[0].trim();
  if(!clean||clean.startsWith('#')||/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(clean))return null;
  const normalized=path.posix.normalize(clean.replace(/^\.\//,''));
  if(normalized.startsWith('../')||path.posix.isAbsolute(normalized))throw new Error(`UNSAFE_PUBLIC_REFERENCE:${value}`);
  return normalized;
}

function ensureAllowedEntry(rel){
  if(forbiddenName.test(rel))throw new Error(`FORBIDDEN_PUBLIC_PATH:${rel}`);
  const src=path.join(frontendRoot,...rel.split('/'));
  const resolved=path.resolve(src);
  if(!resolved.startsWith(path.resolve(frontendRoot)+path.sep))throw new Error(`OUTSIDE_FRONTEND:${rel}`);
  if(!fs.existsSync(resolved)||!fs.statSync(resolved).isFile())throw new Error(`MISSING_PUBLIC_FILE:${rel}`);
}

for(const rel of allowed)ensureAllowedEntry(rel);
fs.rmSync(outDir,{recursive:true,force:true});
fs.mkdirSync(outDir,{recursive:true});

for(const rel of allowed){
  const src=path.join(frontendRoot,...rel.split('/'));
  const dst=path.join(outDir,...rel.split('/'));
  fs.mkdirSync(path.dirname(dst),{recursive:true});
  fs.copyFileSync(src,dst);
}

const attrRe=/(?:href|src)\s*=\s*["']([^"']+)["']/gi;
for(const rel of allowed){
  if(!rel.endsWith('.html'))continue;
  const html=fs.readFileSync(path.join(frontendRoot,...rel.split('/')),'utf8');
  for(const match of html.matchAll(attrRe)){
    const ref=normalizeRelative(match[1]);
    if(!ref)continue;
    const target=path.posix.normalize(path.posix.join(path.posix.dirname(rel),ref));
    if(!allowed.has(target))throw new Error(`PUBLIC_REFERENCE_NOT_ALLOWLISTED:${rel}->${target}`);
  }
}

const actual=[];
function walk(dir,prefix=''){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const rel=prefix?`${prefix}/${entry.name}`:entry.name;
    const abs=path.join(dir,entry.name);
    if(entry.isDirectory())walk(abs,rel); else actual.push(rel);
  }
}
walk(outDir);
actual.sort();
const expected=[...allowed].sort();
if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('PUBLIC_ARTIFACT_ALLOWLIST_MISMATCH');

for(const rel of actual){
  if(forbiddenName.test(rel))throw new Error(`FORBIDDEN_PUBLIC_ARTIFACT:${rel}`);
}

console.log(`Pages public artifact OK: ${actual.length} allowlisted files`);
