const CHECKS = ['keyboardNavigation','visibleFocus','associatedErrors','zoom200','screenReaderFlow','alternativeAuthentication','accessibilityStatement'];

export function evaluateAccessibilityRelease(input = {}) {
  const missing = CHECKS.filter(check => input[check] !== true);
  const evidenceMissing = !Array.isArray(input.evidenceReferences) || input.evidenceReferences.length === 0;
  return Object.freeze({
    schemaVersion: 'accessibility-release-gate.v1',
    decision: missing.length || evidenceMissing ? 'BLOCK' : 'PASS',
    missingChecks: missing,
    evidenceMissing,
    legalConformanceCertified: false,
    rule: 'El gate exige evidencias de prueba; no equivale a una certificación jurídica o técnica externa.'
  });
}
