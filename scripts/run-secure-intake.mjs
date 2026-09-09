import fs from 'node:fs';
import {assessSecureIntake} from '../core/pilot/secure-intake.mjs';
const manifest=JSON.parse(fs.readFileSync('config/secure-intake-manifest.v1.json','utf8'));
process.stdout.write(JSON.stringify(assessSecureIntake(manifest),null,2)+'\n');
