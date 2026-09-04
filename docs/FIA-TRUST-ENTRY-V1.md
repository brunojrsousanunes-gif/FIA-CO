# FIA&CO — Trust Entry v1

Estado: `PRIVATE_DEMO_IMPLEMENTED / REAL_DATA_DISABLED`.

## Objetivo

FIA Trust Entry es el mecanismo de primera reunión con un gerente. Su función no es vender una integración completa ni pedir acceso a correo, ERP, CRM o cuentas bancarias. Su función es demostrar valor, trazabilidad y límites de seguridad con datos sintéticos y, solo si existe interés, proponer una única operación aislada en `L1_ISOLATED`.

Mensaje principal:

> **No nos des las llaves de tu empresa. Danos una sola operación y te demostramos qué aporta FIA, qué información utiliza y quién puede verla.**

## 1. Regla de primera reunión

La primera demostración opera en `L0_DEMO`:

- 0 datos reales necesarios;
- 0 credenciales solicitadas;
- 0 integraciones productivas;
- 0 acciones externas;
- 0 intercambio entre empresas;
- 0 ejecución/custodia/movimiento de fondos por FIA.

No pedir durante la demo:

- contraseña de Gmail/Outlook;
- acceso completo al CRM/ERP;
- bases de clientes;
- documentación de identidad;
- credenciales API;
- cuentas bancarias;
- autorización para automatizar comunicaciones reales.

## 2. Qué debe demostrar FIA

La demo debe enseñar cuatro cosas:

1. **Trazabilidad:** qué ocurrió, quién actuó y cuándo.
2. **Control de acceso:** quién puede ver cada campo y qué queda fuera.
3. **Seguridad visible:** niveles, límites, revocación, auditabilidad y frontera financiera.
4. **Utilidad medible:** qué resultado operacional/económico se mediría en un piloto.

La IA no es el gancho principal. El gancho es **control + utilidad + trazabilidad**.

## 3. Orden de la conversación

1. Contexto breve de FIA y del sector.
2. Preguntar cómo gestionan una operación/presupuesto real.
3. Identificar un punto de fricción o pérdida de tiempo/dinero.
4. Enseñar `frontend/trust-entry-private-demo.html` con datos sintéticos.
5. Enseñar niveles L0–L4 y explicar que más acceso exige más controles.
6. Mostrar una operación sintética y la frontera `NON_CUSTODIAL`.
7. Preguntar si tendría sentido medir una única operación real.
8. Si no: cerrar sin pedir datos.
9. Si sí: iniciar gate L1, nunca saltar directamente a integración.

## 4. Gate L0 -> L1

Antes de crear la primera operación real deben cumplirse:

- patrocinador/gerente confirmado;
- una única operación seleccionada;
- alcance del piloto definido;
- plan de medición definido;
- inventario de datos revisado;
- Data Permit preparado;
- retención definida;
- contacto de incidentes definido;
- frontera no custodial entendida/aceptada;
- sin intercambio interempresa;
- sin acciones externas;
- sin ejecución de pagos;
- sin datos `CRITICAL`.

Además, la organización debe haber alcanzado técnicamente `L1_ISOLATED` según `trust-security-levels.v1`.

Si falta un requisito: `TRUST_ENTRY_NOT_READY`.

## 5. Alcance de la primera operación real

La primera operación sirve para ganar confianza, no para maximizar automatización.

Debe mantener:

- una sola organización;
- una sola operación;
- entrada manual/controlada cuando sea viable;
- minimización o seudonimización de datos personales cuando sea posible;
- audit log;
- estados/evidencias visibles;
- ninguna acción automática hacia terceros;
- ninguna conexión bancaria;
- ninguna custodia o movimiento de fondos FIA.

## 6. Después de L1

Solo si la empresa percibe valor:

`L1_ISOLATED -> L2_VERIFIED`

Puede habilitar integraciones oficiales/OAuth y automatización interna segura.

Solo si existe necesidad real de coordinación con un partner:

`L2_VERIFIED -> L3_SHARED`

Puede habilitar intercambio mínimo entre dos organizaciones con finalidad, campos exactos, caducidad y revocación.

`L4_ADVANCED` queda para flujos que necesiten datos personales y controles jurídicos/técnicos específicos.

Nunca vender el salto de nivel como obligación comercial. Cada capacidad debe justificarse por valor y necesidad.

## 7. Frontera financiera

Permanece en todos los niveles:

> **FIA no recibe, custodia ni mueve fondos. Los pagos reales se ejecutan mediante un proveedor de servicios de pago o entidad financiera legalmente habilitada.**

Subir de nivel nunca convierte FIA en custodio, banco o entidad de pago.

## 8. Gancho para el Founding Anchor

La propuesta inicial no es:

> “Conecta tu empresa a nuestra IA.”

Es:

> **“Te enseño FIA sin pedirte datos. Si te aporta sentido, escogemos una sola operación y medimos qué mejora. Si no aporta valor, se termina ahí.”**

El objetivo de la primera reunión es obtener permiso para estudiar/medir una operación, no una integración completa.

## 9. Resultado que buscamos

Un buen Trust Entry produce:

- decisión informada del gerente;
- objeciones de seguridad registradas;
- una operación candidata claramente delimitada;
- baseline/medición posible;
- aceptación o rechazo sin presión;
- si hay aceptación, transición controlada a L1.

Después, FIA Recover u otro módulo solo se introduce si resuelve un problema real observado en esa operación/proceso.

## 10. Artefactos

- `core/trust/trust-entry.mjs`
- `core/trust/trust-security-levels.mjs`
- `core/trust/trust-transaction.mjs`
- `core/trust/trust-client-snapshot.mjs`
- `core/trust/trust-security-receipt.mjs`
- `frontend/trust-entry-private-demo.html`
- `frontend/trust-transaction-private-demo.html`
- `config/financial-boundary.v1.json`

## 11. No confundir demo con producción

La superficie Trust Entry es sintética, privada y sin conexiones externas. No almacena ni procesa datos reales. La autorización del gerente para continuar no sustituye la revisión técnica, contractual, de privacidad o jurídica aplicable antes de activar datos reales.
