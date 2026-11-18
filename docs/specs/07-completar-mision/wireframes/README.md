# Wireframes · Spec 07 · Completar una misión (HU-1.5)

Wireframes de baja fidelidad, en grises, generados con `/wireframes HU-1.5` a partir de los criterios de `docs/backlog/E1-flota-y-misiones.md`. Deciden la **estructura**: qué hay en la pantalla, dónde, en qué orden y con qué textos. El estilo lo decide `DESIGN.md` y el comportamiento, la spec 07.

Solo se dibuja la Tarjeta de nave con sus misiones abiertas. Los paneles «Registrar nave» y «Asignar misión», y los bloques 7 y 8 de la tarjeta (Revisión y Combustible), no cambian y aparecen como cajas punteadas.

## Estados

| Estado | Archivos | Criterios |
| --- | --- | --- |
| Lista de misiones | `lista-movil.svg`, `lista-escritorio.svg` | HU-1.5-CA1, HU-1.5-CA7 |
| Formulario abierto | `formulario-movil.svg`, `formulario-escritorio.svg` | HU-1.5-CA2, HU-1.5-CA7 |
| Error de validación | `error-validacion-movil.svg` | HU-1.5-CA3 |
| Guardando | `guardando-movil.svg` | HU-1.5-CA4 |
| Misión completada | `exito-movil.svg` | HU-1.5-CA5 |
| Error de conexión | `error-conexion-movil.svg` | HU-1.5-CA6 |

Todos los criterios aparecen en al menos un wireframe. HU-1.5-CA7 (sin desplazamiento horizontal a 390 px) se cubre con que todos los estados móviles caben en 390 de ancho.

## Decisiones

Lo que el wireframe decide y los criterios no:

1. **El formulario se abre dentro de la misma misión**, debajo del destino y la fecha, no en un panel aparte ni en un diálogo. Así el jefe no pierde de vista qué misión está completando.
2. **«Completar» es un botón secundario en cada misión pendiente.** «Confirmar» es el **único botón primario** visible y solo aparece con el formulario abierto. «Cancelar» es secundario. DESIGN.md §6.3 reserva hoy el primario para los paneles: la spec 07 debe actualizar esa tabla.
3. **Una misión a la vez (HU-1.5-CA2):** mientras hay un formulario abierto, el «Completar» de las demás misiones aparece deshabilitado.
4. **La misión completada** muestra la insignia «Completada» a la derecha del destino, sin botón. En las tarjetas angostas de la grilla de escritorio, el botón y la insignia van debajo de la fecha.
5. **El error de validación** aparece justo debajo del campo, y el campo lleva el borde más grueso.
6. **Guardando:** «Confirmar» cambia a «Guardando…» y se deshabilita junto con «Cancelar», sin cambiar de ancho.
7. **El aviso «Misión completada.»** aparece justo debajo de la misión que se completó, porque el formulario que lo produjo se cierra (DESIGN.md §6.8: los avisos van debajo de lo que los produjo).
8. **El aviso «No se pudo completar la misión.»** aparece debajo de «Confirmar» y «Cancelar», con el formulario todavía abierto y el valor escrito conservado.
9. **La etiqueta del campo es «Combustible restante»**, distinta de «Corregir combustible» del bloque 8, para que no se confundan los dos campos de la tarjeta.
