import assert from 'node:assert/strict';
import { evaluateAccessibilityRelease } from '../core/accessibility/accessibility-release-gate.mjs';

const blocked=evaluateAccessibilityRelease({keyboardNavigation:true});
assert.equal(blocked.decision,'BLOCK');
const passed=evaluateAccessibilityRelease({keyboardNavigation:true,visibleFocus:true,associatedErrors:true,zoom200:true,screenReaderFlow:true,alternativeAuthentication:true,accessibilityStatement:true,evidenceReferences:['audit:a11y-1']});
assert.equal(passed.decision,'PASS');
assert.equal(passed.legalConformanceCertified,false);
console.log('accessibility-release-gate: ok');
