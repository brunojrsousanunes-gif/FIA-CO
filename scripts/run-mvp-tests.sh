#!/usr/bin/env bash
set -euo pipefail

# Current public surface
node tests/homepage-v2.test.mjs
node tests/unified-app.test.js
node tests/action-index-legal.test.js
node tests/v1-consolidation-scan.test.js

# Legal and transport requirements that remain source-of-truth inputs
node tests/legal-2a.test.js
node tests/legal-2bc.test.js
node tests/legal-2d.test.js
node tests/special-transport.test.js
node tests/animal-transport.test.js
node tests/transport-service-role.test.js

# Current core / preproduction contracts
node tests/core-operation-contract.test.mjs
node tests/preprod-repository-contract.test.mjs
node tests/preprod-org-access-boundary.test.mjs
node tests/preprod-audit-evidence-contract.test.mjs
node tests/preprod-technical-gate.test.mjs
node tests/preprod-observability-recovery.test.mjs

# FIA Recover / Founding Demonstrator contracts
node tests/recover-engine.test.mjs
node tests/recover-outcomes.test.mjs
node tests/recover-action-gate.test.mjs
node tests/recover-pilot-readiness.test.mjs
node tests/recover-demo.test.mjs
node tests/proof-pack-access.test.mjs
node tests/proof-pack-viewer-context.test.mjs

# FIA Trust Transaction / permanent financial boundary
node tests/financial-boundary.test.mjs
node tests/financial-copy-boundary.test.mjs
node tests/trust-security-levels.test.mjs
node tests/trust-transaction.test.mjs
node tests/trust-client-view.test.mjs
node tests/trust-transaction-private-demo.test.mjs

# FIA Trust Entry / first-manager hook
node tests/trust-entry.test.mjs
node tests/trust-entry-private-demo.test.mjs
