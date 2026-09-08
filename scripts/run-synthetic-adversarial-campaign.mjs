import fs from 'node:fs';
import { runSyntheticAdversarialCampaign, summarizeAdversarialCampaign } from '../core/pilot/synthetic-adversarial-campaign.mjs';

const config=JSON.parse(fs.readFileSync('config/synthetic-adversarial-campaign.v1.json','utf8'));
if(config.syntheticOnly!==true) throw new Error('SYNTHETIC_CONFIG_REQUIRED');
const results=[];
for(const campaign of config.campaigns) results.push(await runSyntheticAdversarialCampaign({...campaign,syntheticOnly:true}));
const summary=summarizeAdversarialCampaign(results);
process.stdout.write(JSON.stringify({summary,results},null,2)+'\n');
if(summary.decision!=='PASS_SYNTHETIC_ONLY') process.exitCode=1;
