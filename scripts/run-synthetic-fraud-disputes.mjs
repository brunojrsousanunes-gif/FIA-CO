import fs from 'node:fs';
import { evaluateSyntheticFraudDispute,summarizeSyntheticFraudDisputes } from '../core/pilot/synthetic-fraud-dispute.mjs';
const config=JSON.parse(fs.readFileSync('config/synthetic-fraud-dispute-cases.v1.json','utf8'));
const results=config.cases.map(item=>evaluateSyntheticFraudDispute({...item,synthetic:true}));
const summary=summarizeSyntheticFraudDisputes(results);
process.stdout.write(JSON.stringify({summary,results},null,2)+'\n');
if(summary.decision!=='PASS_SYNTHETIC_DISPUTES')process.exitCode=1;
