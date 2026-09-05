import crypto from 'node:crypto';

export const TRUST_EVIDENCE_MANIFEST_VERSION = 'trust-evidence-manifest.v1';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

function clean(value, max = 160) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

export function createTrustEvidenceManifest(input = {}, options = {}) {
  const artifacts = Array.isArray(input.artifacts) ? input.artifacts : [];
  const normalizedArtifacts = artifacts.map((artifact, index) => {
    const digest = clean(artifact?.digest || artifact?.evidenceDigest || artifact?.receiptDigest, 128);
    if (!digest) throw new Error(`ARTIFACT_DIGEST_REQUIRED:${index}`);
    return Object.freeze({
      id: clean(artifact.id || artifact.evidenceId || artifact.receiptId || `artifact-${index + 1}`, 100),
      kind: clean(artifact.kind || artifact.schemaVersion || 'UNKNOWN', 80),
      digest,
      policyVersion: clean(artifact.policyVersion, 100) || null
    });
  });

  const body = Object.freeze({
    schemaVersion: TRUST_EVIDENCE_MANIFEST_VERSION,
    manifestId: clean(input.manifestId || `manifest_${sha256(normalizedArtifacts).slice(0, 20)}`, 100),
    generatedAt: new Date(options.now || input.generatedAt || new Date().toISOString()).toISOString(),
    operationId: clean(input.operationId, 120) || null,
    organizationId: clean(input.organizationId, 120) || null,
    previousManifestDigest: clean(input.previousManifestDigest, 128) || null,
    artifacts: Object.freeze(normalizedArtifacts),
    assurance: Object.freeze({
      tamperEvidentDigest: true,
      cryptographicSignature: false,
      qualifiedElectronicSignature: false,
      externalTimestampAuthority: false,
      note: 'SHA-256 detecta alteraciones del manifiesto; no sustituye firma cualificada ni certificación externa.'
    })
  });

  return Object.freeze({ ...body, manifestDigest: sha256(body) });
}

export function verifyTrustEvidenceManifest(manifest = {}) {
  if (!manifest || typeof manifest !== 'object' || !manifest.manifestDigest) return false;
  const { manifestDigest, ...body } = manifest;
  return sha256(body) === manifestDigest;
}

export function verifyTrustEvidenceChain(manifests = []) {
  if (!Array.isArray(manifests)) return false;
  for (let index = 0; index < manifests.length; index += 1) {
    const manifest = manifests[index];
    if (!verifyTrustEvidenceManifest(manifest)) return false;
    if (index === 0) continue;
    if (manifest.previousManifestDigest !== manifests[index - 1].manifestDigest) return false;
  }
  return true;
}
