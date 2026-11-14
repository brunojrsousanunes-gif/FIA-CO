import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolvePublicOutputPath } from '../scripts/public-output-path.mjs';

const root=process.cwd();
const allowlist=fs.readFileSync(path.join(root,'config/pages-public-allowlist.txt'),'utf8')
  .split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith('#'));

const privatePaths=[
  'operation-center-private.html',
  'js/operation-center-private.js',
  'css/operation-center-private.css',
  'css/pilot-access.css'
];

for(const rel of privatePaths){
  assert.ok(!allowlist.includes(rel),`Private surface must not be allowlisted: ${rel}`);
}

const tempRoot=fs.mkdtempSync(path.join(os.tmpdir(),'fia-pages-boundary-'));
const output=path.join(tempRoot,'artifact');
try{
  assert.equal(resolvePublicOutputPath(root,'pages-public'),path.join(root,'pages-public'));
  assert.equal(resolvePublicOutputPath(root,'.pages-public-test'),path.join(root,'.pages-public-test'));
  assert.equal(resolvePublicOutputPath(root,output),output);

  for(const unsafePath of ['.','frontend','docs',path.dirname(root),os.tmpdir()]){
    assert.throws(
      ()=>resolvePublicOutputPath(root,unsafePath),
      /UNSAFE_PUBLIC_OUTPUT_PATH/,
      `Unsafe output path should be rejected: ${unsafePath}`
    );
  }

  const build=spawnSync(process.execPath,[
    path.join(root,'scripts/build-pages-public.mjs'),output
  ],{cwd:root,encoding:'utf8'});
  assert.equal(build.status,0,`Pages build failed: ${build.stderr||build.stdout}`);

  for(const rel of privatePaths){
    assert.ok(!fs.existsSync(path.join(output,rel)),
      `Private surface leaked into Pages artifact: ${rel}`);
  }
  assert.ok(fs.existsSync(path.join(output,'index.html')),'Public homepage missing from artifact');
  assert.ok(fs.existsSync(path.join(output,'operation-center.html')),'Public demo missing from artifact');
}finally{
  fs.rmSync(tempRoot,{recursive:true,force:true});
}

console.log('public/private Pages boundary and safe output path: ok');
