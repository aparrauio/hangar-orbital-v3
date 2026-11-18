# Wireframes · HU-1.5 · Completar una misión

**Estado:** aprobados por el usuario el 2026-11-18, con las decisiones de abajo.

Wireframes de baja fidelidad, en escala de grises, hechos a partir de los criterios de HU-1.5 en [docs/backlog/E1-flota-y-misiones.md](../../../backlog/E1-flota-y-misiones.md). No usan los colores ni las fuentes de `DESIGN.md`: solo su estructura y sus textos.

**Datos de ejemplo:** hoy es el 18/11/2026. La nave es «Aurora»: carguera, 60 % de combustible, 2 de 3 misiones, operativa y apta. Tiene tres misiones:
- «Titán»: pendiente, despegó el 17/11/2026.
- «Europa»: pendiente, despega mañana.
- «Ceres»: completada.

## Estados

| Estado | Archivos | Criterios |
| --- | --- | --- |
| Lista | `lista-movil.svg`, `lista-escritorio.svg` | HU-1.5-CA1, HU-1.5-CA7 |
| Combustible abierto | `combustible-abierto-movil.svg`, `combustible-abierto-escritorio.svg` | HU-1.5-CA2, HU-1.5-CA7 |
| Error de validación | `error-validacion-movil.svg` | HU-1.5-CA3, HU-1.5-CA7 |
| Guardando | `guardando-movil.svg` | HU-1.5-CA4, HU-1.5-CA7 |
| Misión completada | `completada-movil.svg` | HU-1.5-CA5, HU-1.5-CA7 |
| Error de conexión | `error-conexion-movil.svg` | HU-1.5-CA6, HU-1.5-CA7 |

Cada criterio, de CA1 a CA7, aparece en al menos un wireframe. CA7 (390 px) lo cubren todos los archivos `-movil.svg`.

## Decisiones

Esto lo deciden los wireframes, no los criterios. Hay que confirmarlo antes de la spec.

1. **Dónde se completa:** el botón «Completar» va dentro de la propia misión, debajo de su fecha y su duración, en el bloque 9 «Misiones» de la Tarjeta de nave. Es un Botón secundario, como el resto de acciones de la tarjeta.
2. **Dónde se pide el combustible:** el campo «Combustible restante» se abre dentro de la misma misión y ocupa el lugar del botón «Completar». No se usa un diálogo ni un panel aparte.
3. **Botón primario:** «Confirmar» es primario y «Cancelar», secundario. Es la única excepción a la regla de DESIGN.md §6.3, según la cual en la Tarjeta de nave solo hay botones secundarios. Se hace así porque es la acción que cierra el formulario.
4. **Botones en escritorio:** en una tarjeta de escritorio (unos 260 px), «Confirmar» y «Cancelar» no caben en una fila y se apilan. En móvil, en cambio, van en una fila.
5. **Estado de cada misión:** se marca con una insignia escrita a la derecha del destino.
   - «PENDIENTE»: con borde, sin relleno.
   - «COMPLETADA»: con relleno gris.
   - No hay títulos de grupo: el orden (pendientes primero) basta.
6. **Guardando:** el campo y los dos botones se ven deshabilitados. Tampoco se puede cancelar mientras se guarda: el criterio solo habla de «Confirmar», pero cancelar a medias dejaría sin saber si la misión se completó.
7. **Error de validación:** el mensaje va debajo del campo y el campo lleva un borde más grueso, como en DESIGN.md §6.2. El wireframe muestra el caso «24,5», con el mensaje de rango.
8. **Error de conexión:** el aviso de error va dentro de la misión, debajo de los botones, como dice DESIGN.md §6.8 para los avisos (debajo del botón que los produjo).
9. **Misión completada:** no se muestra ningún aviso de éxito. El cambio de insignia, la barra al 10 % y «NO APTA» ya lo dicen, igual que en la corrección de combustible (spec 06). La misión pasa al grupo de completadas, que se ordena por fecha de despegue, así que «Titán» (17/11) queda después de «Ceres» (02/11).
10. **Otras pantallas en móvil:** los paneles «Registrar nave» y «Asignar misión» se dibujan plegados y con borde punteado, solo para indicar que van antes de la flota (DESIGN.md §5). Sus campos no cambian con esta historia.

## Lo que no se puede dibujar

- **HU-1.5-CA2, «no puedo abrir el campo de otra misión»:** con los datos del criterio solo hay una misión completable, así que no se ve. Propuesta para la spec: mientras un campo está abierto, el botón «Completar» de las demás misiones se muestra deshabilitado.
- **HU-1.5-CA5, «sin recargar la página»:** es un comportamiento, no un estado. Se comprueba en el navegador.
- **HU-1.5-CA7, teclado numérico:** no se ve en un wireframe. Se resuelve como en la spec 06, con `inputMode="numeric"`.
