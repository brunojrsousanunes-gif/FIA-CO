const MIME_ALLOWLIST = new Set(['application/pdf','image/jpeg','image/png','text/plain']);
const PRIVATE_REFERENCE = /^(private|vault|s3-private|blob-private):\/\//i;

function required(value, code) {
  const result = String(value || '').trim();
  if (!result) throw new Error(code);
  return result;
}

export function validateEvidenceManifest(input = {}, options = {}) {
  const maxBytes = Number(options.maxBytes || 10 * 1024 * 1024);
  const mimeType = required(input.mimeType, 'MISSING_MIME_TYPE').toLowerCase();
  if (!MIME_ALLOWLIST.has(mimeType)) throw new Error('EVIDENCE_MIME_NOT_ALLOWED');
  if (!Number.isInteger(input.sizeBytes) || input.sizeBytes < 1 || input.sizeBytes > maxBytes) {
    throw new Error('EVIDENCE_SIZE_NOT_ALLOWED');
  }
  const storageReference = required(input.storageReference, 'MISSING_STORAGE_REFERENCE');
  if (!PRIVATE_REFERENCE.test(storageReference)) throw new Error('PRIVATE_STORAGE_REQUIRED');
  if (input.antimalwareStatus !== 'CLEAN') throw new Error('ANTIMALWARE_CLEAN_REQUIRED');
  if (/biometric|iban|card|password|secret/i.test(String(input.dataCategories || ''))) {
    throw new Error('PROHIBITED_EVIDENCE_DATA_CATEGORY');
  }
  return Object.freeze({
    schemaVersion: 'private-evidence-manifest.v1',
    evidenceId: required(input.evidenceId, 'MISSING_EVIDENCE_ID'),
    operationId: required(input.operationId, 'MISSING_OPERATION_ID'),
    uploaderActorReference: required(input.uploaderActorReference, 'MISSING_UPLOADER_REFERENCE'),
    contentHash: required(input.contentHash, 'MISSING_CONTENT_HASH'),
    mimeType,
    sizeBytes: input.sizeBytes,
    storageReference,
    retentionClass: required(input.retentionClass, 'MISSING_RETENTION_CLASS'),
    accessScope: required(input.accessScope, 'MISSING_ACCESS_SCOPE'),
    antimalwareStatus: 'CLEAN',
    metadataStripped: input.metadataStripped === true,
    publicAccessAllowed: false
  });
}
