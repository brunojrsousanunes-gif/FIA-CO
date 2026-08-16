# FIA&CO — Cartera, conversión cripto y entidad depositaria

## Objetivo

La experiencia de FIA&CO podrá presentar una cartera unificada y un flujo BTC→EUR→entidad bancaria sin convertir a FIA&CO, por defecto, en banco, custodio de criptoactivos ni proveedor que ejecute directamente pagos reales.

## Separación de funciones

1. **FIA&CO**: interfaz, reglas, estados, evidencias, contratos, conciliación y trazabilidad.
2. **Proveedor cripto autorizado**: custodia cuando corresponda, recepción/entrega de criptoactivos, intercambio BTC/EUR y ejecución de las operaciones reguladas que le correspondan.
3. **Proveedor de pagos / entidad bancaria**: ejecución y recepción de fondos fiduciarios cuando proceda.
4. **Entidad bancaria depositaria**: mantiene el dinero fiduciario del usuario conforme al producto y marco contractual aplicables.

La aplicación no mostrará un saldo como depósito bancario real salvo que exista una integración contractual y técnica que lo respalde.

## Flujo BTC → EUR → banco

- usuario solicita una cotización;
- se muestran activo, cantidad, cotización, costes, importe neto y destino;
- identidad, riesgo y reglas regulatorias se validan antes de ejecución real;
- un proveedor cripto autorizado ejecutaría la conversión;
- el resultado en euros se enviaría al proveedor o entidad bancaria correspondiente;
- FIA&CO registra referencias, estados, incidencias y evidencias, sin declarar liquidación antes de confirmación del proveedor competente.

## Cartera

La cartera de interfaz puede agregar visualmente saldos y posiciones procedentes de distintas entidades. Esa agregación no implica custodia propia. Las claves privadas nunca se almacenarán en el frontend y no se solicitarán frases semilla en formularios FIA&CO.

## Cotizaciones

La demo usa una cotización manual para evitar presentar un precio desactualizado como precio real. En producción, la cotización deberá proceder de una fuente/proveedor aprobado y mostrar como mínimo hora, vigencia, comisión, diferencial cuando exista e importe neto.

## Controles antes de producción

- proveedores autorizados y contratos verificados;
- KYC/identidad y controles AML/sanciones aplicables;
- autenticación reforzada cuando corresponda;
- límites por usuario, operación, jurisdicción y riesgo;
- prevención de duplicados e idempotencia;
- conciliación entre registros FIA&CO, proveedor cripto y banco;
- gestión segura de webhooks y credenciales en backend;
- trazabilidad de cotización, consentimiento, destinatario y confirmaciones;
- gestión de reversos/incidencias solo cuando técnica y jurídicamente proceda;
- política fiscal e informativa revisada antes de uso real.

## Estado actual

Todo el módulo implementado en el MVP es simulado. No se transmiten transacciones a Bitcoin, exchanges, proveedores de servicios de pago ni entidades bancarias y no se custodian fondos reales.