# FIA&CO — Modelo financiero 36 meses (hipótesis internas)

> Documento de planificación. No representa resultados reales, ingresos garantizados ni valoración de mercado.

## Objetivo
Estimar runway, punto de equilibrio y capital necesario antes de una salida formal a financiación. El modelo debe actualizarse cuando existan datos reales de pilotos.

## Variables maestras
- ingreso medio por operación = mix Base/Plus;
- operaciones/mes;
- CAC por operación adquirida;
- coste variable operativo por operación;
- coste variable de seguridad/verificación por operación;
- costes fijos de infraestructura, ciberseguridad, legal/compliance y equipo;
- porcentaje de operaciones Plus;
- horas del fundador y coste sombra.

## Escenarios de trabajo

### Conservador
- M1: 20 operaciones/mes;
- M12: 180 operaciones/mes;
- M24: 400 operaciones/mes;
- M36: 650 operaciones/mes;
- ingreso medio por operación: 18 €;
- margen de contribución objetivo antes de CAC: >= 45%;
- CAC máximo para escalar: 40% del margen de contribución por operación;
- contratación prudente y mayor dependencia del fundador durante año 1.

### Base
- M1: 30 operaciones/mes;
- M12: 300 operaciones/mes;
- M24: 650 operaciones/mes;
- M36: 1.000 operaciones/mes;
- ingreso medio por operación: 24 €;
- margen de contribución objetivo antes de CAC: >= 50%;
- aumento progresivo del mix Plus/B2B;
- incorporación de soporte/operaciones cuando las horas del fundador superen el umbral sostenible.

### Agresivo
- M1: 40 operaciones/mes;
- M12: 450 operaciones/mes;
- M24: 1.000 operaciones/mes;
- M36: 1.800 operaciones/mes;
- ingreso medio por operación: 28 €;
- margen de contribución objetivo antes de CAC: >= 50%;
- mayor inversión comercial, seguridad y equipo;
- no escalar si CAC + coste variable produce contribución negativa.

## Costes fijos mensuales de referencia para planificación
Estas cifras son reservas internas y deben sustituirse por presupuestos reales antes de financiación formal.

| Partida | Lean inicial | Base de crecimiento |
|---|---:|---:|
| Infraestructura/cloud/SaaS | 350 € | 900 € |
| Ciberseguridad/SOC-MDR/herramientas | 1.500 € | 3.000 € |
| Legal/fiscal/compliance prorrateado | 500 € | 1.500 € |
| Marketing/ventas | 500 € | 3.000 € |
| Equipo adicional | 0 € | 6.000–12.000 € |
| Seguros/proveedores/reserva | 300 € | 1.000 € |

No reducir la baseline de seguridad para maquillar margen.

## Punto de equilibrio simplificado

`break_even_ops = fixed_costs / contribution_per_operation`

Ejemplo interno: ingreso medio 24 €, coste variable 10 €, contribución 14 €. Con 5.000 € de costes fijos, break-even ≈ 358 operaciones/mes. Con 8.000 € de costes fijos, ≈ 572 operaciones/mes.

El cálculo definitivo debe usar CAC, impuestos y proveedores reales.

## Necesidad de capital — marco

No fijar una ronda hasta cerrar presupuestos externos. Como marco de decisión:

- **Lean 12 meses:** capital para legal/regulatorio, seguridad, proveedores, pilotos y una contratación puntual.
- **Base 18 meses:** capital para llevar producto a producción segura, ejecutar pilotos, conseguir primeras cuentas B2B y alcanzar una zona de break-even operativa.
- **Aceleración:** capital adicional solo después de demostrar unit economics y una fuente repetible de adquisición.

Regla: el capital debe comprar hitos, no simplemente tiempo.

## Hitos que debe comprar una financiación inicial
1. validación jurídica/regulatoria;
2. pentest y baseline de producción aprobada;
3. arquitectura de pagos/proveedores definida;
4. 3–5 pilotos reales completados;
5. 10+ cuentas B2B cualificadas o evidencia equivalente;
6. primeras operaciones pagadas con margen de contribución positivo;
7. medición real de CAC, conversión y carga operativa;
8. roadmap para siguiente ronda o autosuficiencia.

## Sensibilidades obligatorias antes de presentar a inversores
Recalcular con:
- ingreso/operación -20%, base, +20%;
- CAC 5 €, 15 €, 30 €, 50 €;
- mix Plus 10%, 25%, 40%;
- costes ciberseguridad 1.500 €, 3.000 €, 5.000 €/mes;
- conversión B2B baja/base/alta;
- contratación 3, 6 y 12 meses antes/después del caso base.

## Estado actual
Este modelo es apto para planificación y discusión interna. Pasará a versión `investor` únicamente después de incorporar evidencia B2B, presupuestos externos y datos de pilotos.