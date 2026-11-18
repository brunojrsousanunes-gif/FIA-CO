# FIA&CO — Modelo financiero 36 meses (hipótesis internas)

> Documento de planificación. No representa resultados reales, ingresos garantizados ni valoración de mercado. Las cifras deberán sustituirse por presupuestos y métricas reales antes de presentarlas como resultados.

## Objetivo
Estimar runway, punto de equilibrio y capital necesario antes de una salida formal a financiación. El modelo debe actualizarse cuando existan datos reales de pilotos.

## Principio financiero de arranque

FIA&CO adopta un lanzamiento **lean, founder-led y condicionado por volumen**:

- el fundador realiza inicialmente prospección, demos, onboarding, seguimiento y soporte de los primeros pilotos;
- `FOUNDER_SALARY = 0 €` durante la fase inicial de validación;
- no se contrata equipo mientras la carga operativa pueda ser asumida razonablemente por el fundador;
- no se compra capacidad cloud, seguridad, marketing o proveedores para un volumen que todavía no existe;
- los costes aumentan mediante gates de usuarios, datos, operaciones y riesgo;
- la inversión se busca prioritariamente para escalar una validación demostrada, no para descubrir si existe demanda.

El trabajo no remunerado del fundador se registra como **coste sombra/contribución founder**, para no ocultar el coste económico real aunque no consuma caja.

## Variables maestras
- ingreso medio por operación = mix Base/Plus;
- operaciones/mes;
- CAC por operación adquirida;
- coste variable operativo por operación;
- coste variable de seguridad/verificación por operación;
- costes fijos de infraestructura, ciberseguridad, legal/compliance y equipo;
- porcentaje de operaciones Plus;
- horas del fundador y coste sombra;
- trigger futuro de remuneración del fundador.

## Escenarios de trabajo

### Conservador / piloto founder-led
- M1: preparación y cero volumen productivo significativo;
- M2–M3: 3–5 pilotos controlados;
- M4–M6: primeras conversiones pagadas;
- captación inicial directa por el fundador;
- marketing pagado mínimo;
- infraestructura dimensionada por uso;
- salario del fundador: 0 € en caja durante validación;
- contratación prudente solo tras superar umbrales de carga/ingresos.

### Base
- M1: 30 operaciones/mes una vez iniciado el piloto operativo;
- M12: 300 operaciones/mes;
- M24: 650 operaciones/mes;
- M36: 1.000 operaciones/mes;
- ingreso medio por operación: 24 €;
- margen de contribución objetivo antes de CAC: >= 50%;
- aumento progresivo del mix Plus/B2B;
- incorporación de soporte/operaciones cuando las horas del fundador superen el umbral sostenible.

### Agresivo
- M1: 40 operaciones/mes una vez abierto el canal;
- M12: 450 operaciones/mes;
- M24: 1.000 operaciones/mes;
- M36: 1.800 operaciones/mes;
- ingreso medio por operación: 28 €;
- margen de contribución objetivo antes de CAC: >= 50%;
- mayor inversión comercial, seguridad y equipo;
- no escalar si CAC + coste variable produce contribución negativa.

## Rampa lean de caja — referencia de presentación

Estas cifras son hipótesis de planificación y no presupuestos aprobados.

| Fase | Cloud/SaaS | Seguridad | PSP/KYC/proveedores | Gestoría/legal/compliance | Marketing | Seguros/otros | Salario fundador | Total orientativo |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Mes 1 · preparación | 100 € | 50 € | 0 € | 250 € | 50 € | 50 € | 0 € | **500 €** |
| Meses 2–3 · piloto | 175 € | 150 € | 100 € | 350 € | 100 € | 100 € | 0 € | **975 €** |
| Meses 4–6 · validación | 300 € | 300 € | 250 € | 500 € | 250 € | 150 € | 0 € | **1.750 €** |
| Meses 7–12 · crecimiento inicial | 475 € | 500 € | 450 € | 650 € | 500 € | 225 € | 0 € | **2.800 €** |

El primer mes es deliberadamente más barato por falta de volumen y porque se mantienen mocks/sandbox y capacidad mínima siempre que los gates técnicos, legales y de seguridad lo permitan.

**Regla:** no reducir controles críticos de seguridad o cumplimiento para maquillar margen. La reducción proviene de evitar sobredimensionamiento y contratación prematura.

## Tesis para inversores: eficiencia de capital

La reducción de burn inicial es una decisión de diseño operativo:

1. **Founder-led sales:** la captación y aprendizaje inicial no requieren equipo comercial completo.
2. **Piloto antes de escala:** 3–5 clientes permiten validar onboarding, uso, soporte, disposición de pago y coste por cliente.
3. **Infraestructura elástica:** los adapters permiten mantener mock/sandbox y activar proveedores reales progresivamente.
4. **Seguridad proporcional al riesgo:** controles críticos desde el inicio; capacidad empresarial adicional solo cuando la exposición lo justifique.
5. **Sin salario founder inicial:** conserva caja durante la validación, registrando el trabajo como coste sombra.
6. **Contratación por trigger:** el equipo aumenta cuando ingresos/carga operativa lo requieren.

La consecuencia buscada es llegar a evidencia de mercado con un consumo de caja bajo y reservar capital externo para acelerar una máquina ya validada.

## Ejemplo de primer año lean

Escenario ilustrativo, sin IVA y antes de impuestos/ajustes contables:

| Mes | Ingresos | Gastos | Resultado mensual |
|---|---:|---:|---:|
| 1 | 0 € | 500 € | -500 € |
| 2 | 0 € | 900 € | -900 € |
| 3 | 300 € | 1.050 € | -750 € |
| 4 | 650 € | 1.500 € | -850 € |
| 5 | 1.300 € | 1.700 € | -400 € |
| 6 | 2.000 € | 2.050 € | -50 € |
| 7 | 3.100 € | 2.400 € | +700 € |
| 8 | 4.200 € | 2.550 € | +1.650 € |
| 9 | 5.700 € | 2.700 € | +3.000 € |
| 10 | 7.300 € | 2.900 € | +4.400 € |
| 11 | 9.300 € | 3.150 € | +6.150 € |
| 12 | 11.500 € | 3.500 € | +8.000 € |

Total ilustrativo: **45.350 € de ingresos**, **24.850 € de gastos** y **20.500 € de resultado operativo simplificado** antes de impuestos y otros ajustes. No es una previsión ni una promesa; sirve para mostrar cómo se comporta la estructura si la validación comercial progresa.

## Punto de equilibrio

No se fija por calendario. Se calcula con datos reales:

`break_even_ops = fixed_costs / contribution_per_operation`

La estrategia lean reduce el numerador durante el piloto, pero la decisión de escalar exige margen de contribución positivo después de costes variables y CAC.

## Trigger de remuneración del fundador

`FOUNDER_SALARY = 0 €` es una condición inicial, no permanente. La remuneración futura se activará únicamente mediante decisión societaria y validación laboral/fiscal, cuando la caja lo soporte.

Triggers a estudiar:
- MRR estable durante varios meses;
- cierre de financiación;
- runway suficiente después de incorporar la remuneración;
- carga de trabajo y sostenibilidad personal.

## Necesidad de capital — marco revisado

No fijar una ronda hasta cerrar presupuestos externos y medir pilotos. La fase inicial buscará demostrar producto/mercado con caja limitada. Como hipótesis de trabajo, el piloto puede diseñarse para necesitar **miles y no decenas de miles de euros** antes de infraestructura/contratos productivos de mayor coste.

La ronda se dimensionará después según:
- costes regulatorios y jurídicos reales;
- presupuestos PSP/KYC;
- ciberseguridad/pentest;
- seguros;
- cloud/observabilidad;
- contratación necesaria;
- CAC y conversión observados.

Regla: **el capital debe comprar hitos y aceleración, no simplemente tiempo.**

## Hitos que debe comprar una financiación inicial
1. validación jurídica/regulatoria;
2. pentest y baseline de producción aprobada;
3. arquitectura de pagos/proveedores definida;
4. 3–5 pilotos reales completados;
5. primeras cuentas B2B cualificadas;
6. primeras operaciones pagadas con margen de contribución positivo;
7. medición real de CAC, conversión y carga operativa;
8. transición desde founder-led hacia procesos repetibles;
9. roadmap para siguiente ronda o autosuficiencia.

## Sensibilidades obligatorias antes de presentar cifras como previsión
Recalcular con:
- ingresos -20%, base, +20%;
- CAC bajo/base/alto;
- costes de ciberseguridad según presupuesto real;
- conversión B2B baja/base/alta;
- contratación adelantada/retrasada;
- salario founder 0 € y escenarios de activación;
- piloto gratuito, simbólico y pagado;
- proveedores con mínimos mensuales versus pago por uso.

## Mensaje de presentación

> FIA&CO parte de una V1 técnica estabilizada y adopta una estrategia de validación founder-led. La compañía evita contratar equipo y capacidad antes de demostrar volumen, mantiene el salario del fundador en cero durante la fase inicial y escala proveedores e infraestructura por gates. El objetivo es obtener evidencia real de clientes con bajo burn y utilizar financiación externa principalmente para acelerar una operación validada.

## Estado actual
Este modelo es apto para planificación y discusión con potenciales inversores **siempre etiquetando las cifras como hipótesis**. Pasará a modelo financiero de inversión validado únicamente después de incorporar evidencia B2B, presupuestos externos y datos de pilotos.