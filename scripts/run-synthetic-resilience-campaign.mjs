import fs from 'node:fs';
import { runSyntheticOperationalResilience } from '../core/pilot/synthetic-operational-resilience.mjs';
const config=JSON.parse(fs.readFileSync('config/synthetic-resilience-campaign.v1.json','utf8'));
const result=await runSyntheticOperationalResilience(config);
process.stdout.write(JSON.stringify(result,null,2)+'\n');
if(result.decision!=='PASS_RESILIENCE')process.exitCode=1;
