import assert from 'node:assert/strict';
import { validateEvidenceManifest } from '../core/evidence/evidence-metadata.mjs';

const manifest=validateEvidenceManifest({evidenceId:'e-1',operationId:'o-1',uploaderActorReference:'u-1',contentHash:'sha256:a',mimeType:'application/pdf',sizeBytes:1024,storageReference:'private://evidence/e-1',retentionClass:'DISPUTE',accessScope:'OPERATION_PARTIES',antimalwareStatus:'CLEAN',metadataStripped:true,dataCategories:['contract']});
assert.equal(manifest.publicAccessAllowed,false);
assert.throws(()=>validateEvidenceManifest({...manifest,storageReference:'https://public.example/e-1'}),/PRIVATE_STORAGE/);
assert.throws(()=>validateEvidenceManifest({...manifest,dataCategories:['IBAN']}),/PROHIBITED/);
console.log('evidence-metadata: ok');
