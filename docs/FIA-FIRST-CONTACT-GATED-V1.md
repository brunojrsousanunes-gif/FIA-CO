# FIA First Contact Gated v1

## Objetivo

El primer contacto público de FIA debe ser útil para entender el proyecto y reconocer intereses, pero deliberadamente limitado para proteger producto, seguridad y proceso comercial.

## Estado inicial obligatorio

- Seguridad: `L0_DEMO`
- Información: `I0_PUBLIC`
- Datos reales: no
- Soluciones concretas: no
- Simulaciones: no
- Rankings/comparaciones: no
- Búsquedas live de compra: no
- Acceso a áreas operativas: no
- Acciones externas: no

Todo lo anterior requiere una autorización posterior de FIA&Co y, en producción, deberá estar respaldado por un control server-side. El cliente público no puede concederse esa autorización a sí mismo.

## Presentación rápida

La mascota se presenta de forma breve y explica que FIA ayuda a empresas a controlar oportunidades, operaciones, documentación y compras con seguridad progresiva y trazabilidad.

La conversación no funciona como interrogatorio. El visitante puede explorar temas aprobados:

- qué es FIA;
- seguridad y control;
- visión general de niveles;
- seguimiento de presupuestos;
- documentación;
- operaciones trazables;
- coordinación entre empresas;
- concepto de compra asistida;
- siguiente paso/contacto.

## Memoria mínima de atención

Para mejorar una visita posterior, el navegador puede conservar un perfil mínimo:

- contador por tema de interés;
- pistas de sector limitadas;
- número de visitas;
- última visita;
- señal de presencia humana disponible.

No se guarda:

- texto literal de la consulta;
- nombre;
- email;
- teléfono;
- identificadores;
- datos bancarios;
- credenciales;
- notas libres.

La memoria mejora la atención, no el acceso. Los temas recordados nunca elevan Trust Level ni desbloquean funciones.

## Gate de autorización

Si el visitante pide una solución, simulación, ranking, mejores opciones, búsqueda de ofertas, automatización o apertura de áreas operativas, FIA responde con orientación general y marca `OWNER_APPROVAL_REQUIRED`.

No debe existir un botón público que convierta ese estado en aprobado.

## Human Presence

La comprobación ligera de presencia humana sigue siendo una señal de primer contacto. `HUMAN_LIKELY` no verifica identidad y no cambia el nivel L0/I0.

## Siguiente evolución

Cuando exista backend autenticado se podrá sustituir el flag estático por una autorización firmada/server-side con alcance, caducidad y capacidades exactas. Hasta entonces la experiencia pública permanece cerrada en L0/I0.
