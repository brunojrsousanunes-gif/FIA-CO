# FIA&CO — prueba controlada de tres roles

Estado: **plan de prueba; no ejecutado**.

Este documento valida el Centro de Operaciones privado con identidades y datos completamente ficticios. No demuestra tracción comercial ni autoriza pagos, documentos reales o tratamiento de datos sensibles.

## Participantes

Use tres cuentas de prueba distintas:

| Cuenta | Organización ficticia | Rol |
|---|---|---|
| A | Vendedor Demo SL | seller |
| B | Comprador Demo SL | buyer |
| C | Transporte Demo SL | carrier |

Una persona puede manejar dos cuentas, pero deben utilizarse sesiones aisladas: otro dispositivo, otro navegador o una ventana privada. No comparta contraseñas en chat, capturas, incidencias ni repositorios.

## Datos sintéticos

- Referencia: `FIA-PILOT-001`
- Título: `Pieza industrial de demostración`
- Importe: `125000` céntimos, marcado como ficticio
- Moneda: `EUR`
- No usar DNI/NIE, IBAN, direcciones reales, matrículas, contratos, fotografías personales ni documentos de empresas reales.

## Preparación previa

- [ ] Las tres cuentas pueden iniciar sesión por separado.
- [ ] Cada cuenta tiene un perfil ficticio.
- [ ] Cada cuenta pertenece únicamente a su organización ficticia.
- [ ] La operación incluye exactamente seller, buyer y carrier.
- [ ] La auditoría no admite inserciones directas desde el cliente.
- [ ] Las funciones de invitación y transición solo están disponibles para `authenticated`.
- [ ] El sitio público no muestra el Centro de Operaciones privado.
- [ ] Cada participante conoce únicamente su contraseña de prueba.

## Caso principal

1. El creador prepara la operación en estado `draft`.
   - Esperado: solo el creador puede modificarla.
2. Se asignan las tres organizaciones participantes.
   - Esperado: no se permiten roles duplicados ni una organización repetida.
3. El creador pasa la operación a `invited`.
   - Esperado: falla si falta cualquiera de los tres roles.
4. Cada participante acepta su invitación.
   - Esperado: cada cuenta solo puede aceptar la invitación de su organización y rol.
5. Se solicita la transición a `accepted`.
   - Esperado: falla hasta que las tres invitaciones estén aceptadas.
6. El transportista pasa a `in_transit` y después a `delivered`.
   - Esperado: vendedor y comprador reciben denegación si intentan esas transiciones.
7. El comprador pasa a `completed`.
   - Esperado: vendedor y transportista reciben denegación.
8. Cada cuenta cierra sesión.
   - Esperado: la sesión y la lista privada dejan de estar disponibles.

## Pruebas negativas obligatorias

- [ ] Una cuarta cuenta sin organización no ve la operación.
- [ ] El vendedor no puede leer operaciones ajenas.
- [ ] El comprador no puede actuar como transportista.
- [ ] Una transición con versión antigua devuelve conflicto.
- [ ] Repetir una solicitud con la misma clave no duplica el evento.
- [ ] No se puede modificar ni borrar una confirmación, evidencia o evento de auditoría.
- [ ] Una sesión caducada vuelve a la pantalla de acceso.
- [ ] Un error de red no muestra credenciales ni detalles internos.

## Evidencias que se registrarán

Guardar solo resultados no sensibles:

- fecha y hora;
- dispositivo/navegador;
- paso probado;
- resultado esperado;
- resultado observado;
- código de error no sensible;
- corrección necesaria;
- repetición satisfactoria tras la corrección.

No capturar contraseñas, tokens, correos personales ni contenido del almacenamiento del navegador.

## Criterio de salida

La prueba se considera técnicamente satisfactoria cuando el caso principal funciona, todas las denegaciones obligatorias se producen y no quedan fallos de severidad alta o crítica. Los defectos menores deben quedar documentados antes de proponer la fusión a `main`.
