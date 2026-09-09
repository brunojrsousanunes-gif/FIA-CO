import fs from 'node:fs';
import {runControlledPrepilot} from '../core/pilot/controlled-prepilot.mjs';
const config=JSON.parse(fs.readFileSync('config/controlled-prepilot.v1.json','utf8'));
const report=runControlledPrepilot(config);
process.stdout.write(JSON.stringify(report,null,2)+'\n');
if(report.syntheticGateDecision!=='PASS_SYNTHETIC_PREPILOT_GATE')process.exitCode=1;
