# FIA&CO — Synthetic Pilot Rehearsal v1

Estado: `INTERNAL / SYNTHETIC_ONLY / NO_PRODUCTION_ACTIVATION`.

## Objetivo

Ensayar de extremo a extremo la entrada comercial/técnica de FIA antes de utilizar datos reales o pedir verificaciones humanas/externas.

Secuencia ensayada:

`DISCOVERY -> ENTRY SELECTOR -> L0 -> L1 PREPARATION -> LOCAL SHADOW -> SYNTHETIC OPERATION -> TRUST SNAPSHOT -> ECONOMICS -> EVIDENCE MANIFEST`

El ensayo no sustituye un piloto real. Sirve para detectar huecos de integración y confirmar que los límites de seguridad se mantienen cuando las piezas se usan juntas.

## Casos

1. `MACHINERY_TRUST_TRANSACTION`
   - puerta esperada: `TRUST_TRANSACTION`;
   - operación de maquinaria de alto valor;
   - prueba trazabilidad, operación aislada y snapshot.

2. `WORKSHOP_DOCUMENT_FLOW`
   - puerta esperada: `DOCUMENT_FLOW`;
   - trabajo de taller bloqueado por información/documentación;
   - prueba agregación de bloqueos y preparación L1.

3. `B2B_QUOTE_RECOVERY`
   - puerta esperada: `QUOTE_RECOVERY`;
   - presupuestos B2B sin seguimiento;
   - prueba selector, métricas de seguimiento y economía instrumental.

4. `PARTNER_COORDINATION_FUTURE`
   - puerta esperada: `PARTNER_COORDINATION`;
   - debe ser detectada pero **no ejecutada** desde L0/L1;
   - resultado correcto: `REHEARSAL_BLOCKED_EXPECTED` porque requiere `L3_SHARED`.

## Contratos de seguridad

Todos los ensayos deben mantener:

- `syntheticOnly=true`;
- `realDataUsed=false`;
- `productionActivation=false`;
- `externalActionsExecuted=false`;
- `paymentExecution=false`;
- frontera `NON_CUSTODIAL`;
- L1 como `PREPARATION_ONLY`;
- sin intercambio interempresa en L1;
- snapshot filtrado antes del cliente;
- manifiesto SHA-256 verificable;
- ningún resultado sintético puede presentarse como ROI, demanda, prueba de mercado o caso real.

## Interpretación de resultados

### REHEARSAL_PASS

El caso sintético atraviesa correctamente todas las piezas permitidas hasta preparación L1.

No significa:

- producción lista;
- cumplimiento jurídico validado;
- cliente validado;
- ROI validado;
- identidad verificada.

### REHEARSAL_BLOCKED_EXPECTED

FIA identifica correctamente que la oportunidad requiere un nivel de seguridad superior y se niega a ejecutar el flujo actual.

Esto es un resultado positivo cuando el bloqueo corresponde a policy.

### REHEARSAL_FAIL

Existe una discrepancia entre discovery, puerta esperada o contrato técnico. Debe resolverse antes de usar ese escenario como demo interna.

## Ejecución

```bash
node scripts/run-synthetic-pilot-rehearsals.mjs
```

La batería normal incluye también `tests/synthetic-pilot-rehearsal.test.mjs`.

## Regla de uso comercial

Estos escenarios sirven para preparar una reunión y comprobar el recorrido del producto. No deben presentarse como resultados de clientes reales.

La única evidencia comercial válida seguirá procediendo de Founding Demonstrators reales y se clasificará como `CONFIRMED / ASSISTED / ESTIMATED` según corresponda.
