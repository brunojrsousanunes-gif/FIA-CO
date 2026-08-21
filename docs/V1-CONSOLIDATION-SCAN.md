# V1 Consolidation Scan — FIA&CO

## Objetivo
Validar FIA&CO como un producto coherente de extremo a extremo, no solo como una colección de módulos con tests aislados.

## Alcance
- Rutas públicas incluidas en Pages.
- Navegación y enlaces internos.
- Dependencias JS/CSS/assets de rutas públicas.
- Estados arquitectónicos DEMO_ONLY / SHADOW_ONLY / MOCK.
- Coherencia entre Production Gate, adapters, integraciones y seguridad.
- Detección de módulos huérfanos, rutas rotas, duplicidades y contradicciones.

## Estado base
- V1 técnica autorizada.
- Producción real bloqueada.
- Proveedores externos sustituibles y no requeridos para demo.
- PII y fondos reales bloqueados.
- Decisiones sensibles bajo control humano.

## Criterios de salida
El scan será APTO solo si:
1. Cada ruta pública allowlisted existe.
2. Los href/src locales de páginas públicas resuelven a archivos existentes o anchors válidos.
3. No se publica por accidente contenido interno no allowlisted.
4. Los estados sensibles no contradicen DEMO_ONLY.
5. La batería funcional completa sigue en verde.

## Clasificación
- P0: exposición sensible/seguridad.
- P1: ruta principal o función V1 rota.
- P2: inconsistencia, accesibilidad o navegación secundaria.
- P3: limpieza/deuda técnica.

## Regla
Corregir solo defectos demostrados. No ampliar alcance ni activar infraestructura externa durante consolidación.
