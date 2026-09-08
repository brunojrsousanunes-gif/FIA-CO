import fs from 'node:fs';
import { runSyntheticOperationLifecycle } from '../core/pilot/synthetic-operation-lifecycle.mjs';
import { buildSyntheticAssuranceReport } from '../core/pilot/synthetic-assurance-report.mjs';

const config=JSON.parse(fs.readFileSync('config/synthetic-operation-lifecycle.v1.json','utf8'));
if(config.syntheticOnly!==true) throw new Error('SYNTHETIC_CONFIG_REQUIRED');
const results=config.cases.map(runSyntheticOperationLifecycle);
const report=buildSyntheticAssuranceReport(results);
process.stdout.write(JSON.stringify({report,results},null,2)+'\n');
if(report.decision!=='PASS_SYNTHETIC_ASSURANCE') process.exitCode=1;
