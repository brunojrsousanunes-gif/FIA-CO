import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'frontend/js/supabase-public-config.js');
const url=process.env.SUPABASE_URL?.trim();
const key=(process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY)?.trim();

if(!url||!key)throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required');
let parsed;
try{parsed=new URL(url);}catch{throw new Error('SUPABASE_URL is not a valid URL');}
if(parsed.protocol!=='https:'||!parsed.hostname.endsWith('.supabase.co'))throw new Error('SUPABASE_URL must be an HTTPS supabase.co project URL');
if(/^sb_secret_/i.test(key)||/service_role/i.test(key))throw new Error('A secret/service_role key must never be emitted into frontend code');
if(!key.startsWith('sb_publishable_')&&key.split('.').length!==3)throw new Error('Use a Supabase publishable key (legacy anon only when unavoidable)');

const source=`// Generated at build time. This file contains public browser configuration only.\nexport const SUPABASE_URL = ${JSON.stringify(parsed.origin)};\nexport const SUPABASE_PUBLISHABLE_KEY = ${JSON.stringify(key)};\n`;
fs.writeFileSync(target,source,{encoding:'utf8',mode:0o600});
console.log('Supabase public browser configuration generated.');
