import fs from 'node:fs';
import {
  runSyntheticPilotRehearsal,
  summarizeSyntheticRehearsalSet
} from '../core/pilot/synthetic-pilot-rehearsal.mjs';

const config = JSON.parse(fs.readFileSync('config/synthetic-pilot-rehearsals.v1.json', 'utf8'));
if (config.syntheticOnly !== true) throw new Error('REHEARSAL_CONFIG_MUST_BE_SYNTHETIC_ONLY');

const results = config.cases.map(item => runSyntheticPilotRehearsal(item));
const summary = summarizeSyntheticRehearsalSet(results);

for (const result of results) {
  const marker = result.status === 'REHEARSAL_PASS'
    ? 'PASS'
    : result.status === 'REHEARSAL_BLOCKED_EXPECTED'
      ? 'SAFE_BLOCK'
      : 'FAIL';
  console.log(`${marker} ${result.rehearsalId}: ${result.selectedEntry || 'NO_ENTRY'} (${result.status})`);
}

console.log(JSON.stringify(summary, null, 2));
if (!summary.safeToUseForInternalRehearsal) process.exitCode = 1;
