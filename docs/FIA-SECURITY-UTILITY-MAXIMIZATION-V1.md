# FIA&CO — Security · Utility · Maximization v1

Estado: `INTERNAL_FRAMEWORK / NOT_PUBLIC_CLAIM`.

## Objetivo

Este marco evita presentar la seguridad como una carga separada de la utilidad. En FIA, un nivel superior de capacidad solo se habilita cuando existen controles superiores verificables.

Principio operativo:

> **Más seguridad verificada permite más acceso autorizado; más acceso autorizado permite más utilidad; más utilidad demostrada permite maximizar progresivamente el proceso.**

La dirección es:

`SEGURIDAD -> ACCESO AUTORIZADO -> UTILIDAD -> MEDICIÓN -> MAXIMIZACIÓN`

No es:

`MÁS ACCESO -> MÁS RIESGO -> ESPERAR QUE TODO SALGA BIEN`.

## 1. Qué significa Seguridad

Seguridad no es solo cifrado o cumplimiento documental. En FIA incluye:

- identidad y autenticación;
- aislamiento de organizaciones;
- permisos y finalidad;
- minimización de datos;
- caducidad y revocación;
- trazabilidad y auditoría;
- revisión humana en acciones críticas;
- controles de integraciones y proveedores;
- frontera financiera `NON_CUSTODIAL`;
- posibilidad de detener capacidades si dejan de cumplirse los requisitos.

## 2. Qué significa Utilidad

Utilidad es una capacidad concreta que el nivel de seguridad permite usar sin ampliar innecesariamente la superficie de riesgo.

Ejemplos:

- visualizar una operación;
- medir tiempos e incidencias;
- automatizar una tarea interna;
- recuperar un presupuesto olvidado;
- comprobar documentación;
- coordinar una empresa con un partner;
- mostrar al cliente qué falta y quién debe actuar.

Una capacidad no se habilita solo porque técnicamente sea posible. Debe existir necesidad, permiso y nivel de seguridad suficiente.

## 3. Qué significa Maximización

Maximización no significa automatizar todo. Significa obtener más rendimiento del proceso después de demostrar que la capacidad anterior funciona de forma segura.

Puede significar:

- reducir pasos manuales;
- recuperar más oportunidades;
- reducir tiempos de ciclo;
- disminuir llamadas, emails y esperas;
- reutilizar un flujo con más operaciones;
- incorporar partners recurrentes;
- aumentar automatización donde el baseline confirme valor.

Nunca se deben publicar porcentajes, ahorro, ventas o ROI que no estén medidos y atribuibles según el Outcome Engine.

## 4. Relación con los niveles FIA

### L0_DEMO — Comprender sin exponer

**Seguridad**
- datos sintéticos;
- sin credenciales;
- sin conexiones externas;
- sin acciones reales.

**Utilidad**
- entender el proceso;
- visualizar permisos y trazabilidad;
- detectar una fricción concreta.

**Maximización**
- escoger dónde merece la pena invertir tiempo antes de conectar nada.

### L1_ISOLATED — Demostrar con una operación

**Seguridad**
- una organización;
- una operación;
- datos minimizados;
- auditoría;
- sin intercambio interempresa.

**Utilidad**
- medir una operación real;
- generar baseline;
- demostrar trazabilidad y valor con alcance limitado.

**Maximización**
- descubrir qué tarea repetitiva merece convertirse en producto o automatización.

### L2_VERIFIED — Optimizar internamente

**Seguridad**
- identidad y autenticación reforzadas;
- secretos gestionados;
- retención/minimización;
- OAuth e integraciones aprobadas;
- pruebas de seguridad.

**Utilidad**
- automatización interna;
- seguimiento y clasificación;
- integraciones oficiales limitadas.

**Maximización**
- aumentar la capacidad operativa sobre los puntos donde el baseline ya demostró valor.

### L3_SHARED — Coordinar empresas

**Seguridad**
- aislamiento interempresa probado;
- DENY por defecto;
- finalidad y campos exactos;
- caducidad y revocación;
- partner verificado.

**Utilidad**
- coordinar dos organizaciones;
- compartir solo el evento necesario;
- mantener visibles estados y responsabilidades.

**Maximización**
- reutilizar la coordinación con partners recurrentes y reducir fricción de red.

### L4_ADVANCED — Orquestar procesos avanzados

**Seguridad**
- revisión jurídica/técnica reforzada;
- flujos personales documentados;
- subencargados controlados;
- datos críticos fuera del intercambio interempresa.

**Utilidad**
- procesos que necesitan datos personales bajo controles específicos;
- más etapas de la operación conectadas;
- metadatos de proveedores regulados cuando proceda.

**Maximización**
- aumentar automatización y coordinación solo donde existe suficiente evidencia, control y economía positiva.

## 5. Regla comercial

No vender un nivel por ser “más premium”.

Cada salto debe responder tres preguntas:

1. **¿Qué riesgo adicional estamos controlando?**
2. **¿Qué utilidad concreta desbloquea ese control?**
3. **¿Qué métrica demostraría que merece la pena ampliarlo?**

Si no existe una respuesta clara a las tres, no se debe subir de nivel.

## 6. Regla de interfaz

La web/app privada debería mostrar para el nivel actual:

- controles activos;
- capacidades disponibles;
- utilidad que puede obtenerse ahora;
- requisitos que faltan para el siguiente nivel;
- capacidad adicional que ese siguiente nivel podría habilitar;
- métricas que se usarán para comprobar el resultado.

Evitar presentar el nivel como un score arbitrario o una gamificación de seguridad.

## 7. Regla de evidencia

Toda afirmación de maximización debe clasificarse mediante evidencia FIA:

- `CONFIRMED`;
- `ASSISTED`;
- `ESTIMATED`.

No convertir potencial en resultado real.

No usar porcentajes sintéticos como “capacidad 82%”, “optimización +25%” o similares salvo que exista una metodología validada y datos reales suficientes.

## 8. Frontera financiera

Este marco nunca modifica la política financiera permanente:

> **FIA no recibe, custodia ni mueve fondos.**

Más nivel de seguridad puede habilitar coordinación y metadatos con proveedores financieros legalmente habilitados, pero no convierte FIA en banco, entidad de pago o custodio.

## 9. Uso comercial inicial

En la primera reunión no vender “seguridad” por separado. Mostrar una secuencia concreta:

1. protegemos el alcance;
2. demostramos una utilidad;
3. medimos el resultado;
4. solo entonces proponemos aumentar capacidad.

La formulación comercial final se validará con conversaciones reales. Este documento define la lógica y los límites, no un eslogan definitivo.

## 10. Fuente técnica

- `core/trust/trust-security-levels.mjs`
- `core/trust/trust-value-framework.mjs`
- `core/trust/trust-client-snapshot.mjs`
- `core/trust/trust-transaction.mjs`
- `core/trust/trust-security-receipt.mjs`
