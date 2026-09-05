#!/usr/bin/env bash
set -euo pipefail

# Current public surface
node tests/homepage-v2.test.mjs
node tests/unified-app.test.js
node tests/action-index-legal.test.js
node tests/v1-consolidation-scan.test.js
node tests/fia-guide.test.mjs
node tests/first-contact-ui.test.mjs

# Legal and transport requirements that remain source-of-truth inputs
node tests/legal-2a.test.js
node tests/legal-2bc.test.js
node tests/legal-2d.test.js
node tests/special-transport.test.js
node tests/animal-transport.test.js
node tests/transport-service-role.test.js
node tests/prepilot-legal-readiness.test.mjs

# Current core / preproduction contracts
node tests/core-operation-contract.test.mjs
node tests/preprod-repository-contract.test.mjs
node tests/preprod-org-access-boundary.test.mjs
node tests/preprod-audit-evidence-contract.test.mjs
node tests/preprod-technical-gate.test.mjs
node tests/preprod-observability-recovery.test.mjs
node tests/preprod-session-token.test.mjs
node tests/preprod-client-service.test.mjs
node tests/kill-switch.test.mjs
node tests/retention-policy.test.mjs
node tests/incident-response.test.mjs
node tests/authorized-ai-context.test.mjs
node tests/interaction-risk-engine.test.mjs
node tests/human-presence-check.test.mjs
node tests/first-contact-gate.test.mjs
node tests/hierarchy-security-access.test.mjs

# FIA Recover / Founding Demonstrator contracts
node tests/recover-engine.test.mjs
node tests/recover-outcomes.test.mjs
node tests/recover-action-gate.test.mjs
node tests/recover-pilot-readiness.test.mjs
node tests/recover-demo.test.mjs
node tests/proof-pack-access.test.mjs
node tests/proof-pack-viewer-context.test.mjs
node tests/operation-economics.test.mjs
node tests/cost-circuit-breaker.test.mjs

# FIA Trust Transaction / permanent financial boundary
node tests/financial-boundary.test.mjs
node tests/financial-copy-boundary.test.mjs
node tests/trust-security-levels.test.mjs
node tests/information-access-levels.test.mjs
node tests/trust-value-framework.test.mjs
node tests/trust-control-evidence.test.mjs
node tests/trust-control-evidence-policy.test.mjs
node tests/trust-evidence-manifest.test.mjs
node tests/trust-capability-search.test.mjs
node tests/purchase-search-transparency.test.mjs
node tests/trust-transaction.test.mjs
node tests/trust-client-view.test.mjs
node tests/trust-client-control-evidence.test.mjs
node tests/trust-transaction-private-demo.test.mjs

# FIA Trust Entry / discovery / low-data entry
node tests/trust-entry.test.mjs
node tests/trust-entry-l1-package.test.mjs
node tests/entry-scenario-selector.test.mjs
node tests/trust-entry-scenarios.test.mjs
node tests/local-shadow.test.mjs
node tests/data-steward-delegation.test.mjs
node tests/trust-entry-private-demo.test.mjs
node tests/commercial-readiness-trust.test.mjs

# End-to-end internal rehearsal across diversified entry scenarios
node tests/synthetic-pilot-rehearsal.test.mjs
