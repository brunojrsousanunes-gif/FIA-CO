import fs from 'node:fs';
import {attemptPrepilotBlockerResolution} from '../core/pilot/prepilot-blocker-resolution.mjs';
const config=JSON.parse(fs.readFileSync('config/prepilot-blocker-resolution.v1.json','utf8'));
const report=attemptPrepilotBlockerResolution(config);
process.stdout.write(JSON.stringify(report,null,2)+'\n');
if(report.decision!=='PASS_SYNTHETIC_PREPARATION')process.exitCode=1;
