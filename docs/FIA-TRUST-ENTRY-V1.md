# FIA&CO — Trust Entry v1

Estado: `PRIVATE_DEMO_IMPLEMENTED / REAL_DATA_DISABLED`.

## Objetivo

FIA Trust Entry es el mecanismo de primera reunión con un gerente. Su función no es vender una integración completa ni pedir acceso a correo, ERP, CRM o cuentas bancarias. Su función es demostrar valor, trazabilidad y límites de seguridad con datos sintéticos y, solo si existe interés, proponer una única operación aislada en `L1_ISOLATED`.

La lógica de entrada se rige por:

> **Seguridad verificada -> acceso autorizado -> utilidad -> medición -> maximización.**

El marco completo vive en `docs/FIA-SECURITY-UTILITY-MAXIMIZATION-V1.md`.

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

La demo debe enseñar cuatro relaciones, no cuatro funciones aisladas:

1. **Seguridad:** qué limita FIA, quién puede ver cada dato y qué queda fuera.
2. **Utilidad:** qué capacidad concreta pueden obtener esos controles.
3. **Maximización:** qué proceso adicional podría optimizarse si la utilidad anterior demuestra valor.
4. **Evidencia:** qué baseline y métricas usaríamos para decidir si merece la pena ampliar.

La IA no es el gancho principal. El gancho es demostrar que FIA puede **aumentar capacidad sin aumentar acceso de forma descontrolada**.

No usar porcentajes sintéticos o promesas de ROI. El potencial no se presenta como resultado.

## 3. Orden de la conversación

1. Contexto breve de FIA y del sector.
2. Preguntar cómo gestionan una operación/presupuesto real.
3. Identificar un punto de fricción o pérdida de tiempo/dinero.
4. Enseñar `frontend/trust-entry-private-demo.html` con datos sintéticos.
5. Mostrar `Seguridad -> Utilidad -> Maximización` y explicar cómo se mediría.
6. Enseñar niveles L0–L4: cada nivel exige más controles antes de desbloquear más capacidad.
7. Mostrar una operación sintética y la frontera `NON_CUSTODIAL`.
8. Preguntar si tendría sentido medir una única operación real.
9. Si no: cerrar sin pedir datos.
10. Si sí: iniciar gate L1, nunca saltar directamente a integración.

## 4. Regla de salto de nivel

Antes de proponer cualquier nivel superior deben poder responderse tres preguntas:

1. **¿Qué riesgo adicional estamos controlando?**
2. **¿Qué utilidad concreta desbloquea ese control?**
3. **¿Qué métrica demostrará que merece la pena ampliarlo?**

Si una de las tres no tiene una respuesta clara, FIA no propone el salto.

Subir de nivel no se presenta como obligación comercial ni como paquete premium. Es una ampliación de capacidad justificada por necesidad, seguridad y evidencia.

## 5. Gate L0 -> L1

Antes de crear la primera operación real deben cumplirse:

- patrocinador/gerente confirmado;
- una única operación seleccionada;
- alcance del piloto definido;
- baseline y plan de medición definidos;
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

## 6. Alcance de la primera operación real

La primera operación sirve para ganar confianza y demostrar utilidad, no para maximizar automatización.

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

El resultado debe permitir decidir con evidencia si avanzar, iterar o detener.

## 7. Después de L1

Solo si la empresa percibe valor medible:

`L1_ISOLATED -> L2_VERIFIED`

**Seguridad añadida:** identidad, autenticación, secretos, minimización, retención, tests.

**Utilidad desbloqueada:** integraciones oficiales/OAuth y automatización interna segura.

**Maximización potencial:** ampliar únicamente tareas donde el baseline demuestre valor.

Solo si existe necesidad real de coordinación con un partner:

`L2_VERIFIED -> L3_SHARED`

**Seguridad añadida:** aislamiento interempresa, partner verificado, finalidad, campos, caducidad y revocación.

**Utilidad desbloqueada:** coordinación entre dos organizaciones con información mínima.

**Maximización potencial:** reutilizar ese flujo con partners recurrentes y reducir fricción operativa.

`L4_ADVANCED` queda para flujos que necesiten datos personales y controles jurídicos/técnicos específicos. Los datos `CRITICAL` siguen fuera del intercambio interempresa.

## 8. Evidencia y maximización

Toda afirmación de resultado debe mantener la clasificación FIA:

- `CONFIRMED`;
- `ASSISTED`;
- `ESTIMATED`.

No usar frases como “maximizamos tu empresa” sin concretar qué métrica mejora.

Ejemplos de métricas válidas según caso:

- oportunidades recuperadas;
- tiempo de seguimiento;
- horas administrativas;
- incidencias;
- tiempo de ciclo;
- llamadas/emails evitados;
- documentos pendientes;
- coste variable FIA;
- carga humana FIA.

## 9. Frontera financiera

Permanece en todos los niveles:

> **FIA no recibe, custodia ni mueve fondos. Los pagos reales se ejecutan mediante un proveedor de servicios de pago o entidad financiera legalmente habilitada.**

Subir de nivel nunca convierte FIA en custodio, banco o entidad de pago.

## 10. Enfoque para el Founding Anchor

La primera conversación no debe intentar vender la plataforma completa. Debe demostrar esta secuencia:

**proteger -> demostrar utilidad -> medir -> ampliar solo si funciona.**

La formulación comercial final se validará con conversaciones reales. No fijar todavía un eslogan definitivo alrededor de “seguridad”, “utilidad” o “maximización”.

El objetivo de la primera reunión es obtener permiso para estudiar/medir una operación, no una integración completa.

## 11. Resultado que buscamos

Un buen Trust Entry produce:

- decisión informada del gerente;
- objeciones de seguridad registradas;
- una operación candidata claramente delimitada;
- baseline/medición posible;
- una hipótesis de utilidad concreta;
- claridad sobre qué siguiente nivel tendría sentido y por qué;
- aceptación o rechazo sin presión;
- si hay aceptación, transición controlada a L1.

Después, FIA Recover, Documents, Partner Coordination u otro módulo solo se introduce si resuelve un problema real observado.

## 12. Artefactos

- `core/trust/trust-entry.mjs`
- `core/trust/trust-security-levels.mjs`
- `core/trust/trust-value-framework.mjs`
- `core/trust/trust-transaction.mjs`
- `core/trust/trust-client-snapshot.mjs`
- `core/trust/trust-security-receipt.mjs`
- `frontend/trust-entry-private-demo.html`
- `frontend/trust-transaction-private-demo.html`
- `config/financial-boundary.v1.json`
- `docs/FIA-SECURITY-UTILITY-MAXIMIZATION-V1.md`

## 13. No confundir demo con producción

La superficie Trust Entry es sintética, privada y sin conexiones externas. No almacena ni procesa datos reales. La autorización del gerente para continuar no sustituye la revisión técnica, contractual, de privacidad o jurídica aplicable antes de activar datos reales.
