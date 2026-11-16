# Verificación de la interfaz · Spec 02

Esta guía verifica, criterio por criterio, [docs/specs/02-interfaz-flota.md](specs/02-interfaz-flota.md) en la app real, contra Supabase. Las reglas de negocio se verifican en [docs/VERIFICACION.md](VERIFICACION.md).

D-01 y D-02 ya tienen su resultado anotado. El resto de la columna "Resultado obtenido" está vacía a propósito: se rellena al comprobar cada fila. Anota lo que veas: si coincide, escribe "Coincide"; si no, escribe "Fallo" y qué viste.

## Antes de empezar
1. `.env.local` existe con la URL y la clave pública de Supabase, y la migración está aplicada.
2. La app está arrancada con `npm run dev` y abierta en Chrome o Edge, con las herramientas de desarrollo a mano (F12).
3. Salvo que la fila indique otra cosa, la ventana mide 1280 px de ancho. Para fijarlo, usa el modo responsive de las herramientas de desarrollo (Ctrl+Mayús+M).
4. Las naves de esta guía son Altair, Lira, Mira, Polar, Sirio y Vega, para no chocar con las de `docs/VERIFICACION.md`. Si ya existen, bórralas desde el panel de Supabase, junto con sus misiones.

Las filas van en orden: cada una parte del estado que dejó la anterior. "Mañana" se cuenta desde el día de la prueba. La app no puede editar ni borrar datos, así que los cambios marcados como "en el panel" se hacen en el panel de Supabase.

## Comandos

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| D-01 | Ejecutar `grep -rnE "#[0-9a-fA-F]{3,8}\b" src --include=*.css --include=*.tsx`. | Solo lista `src/styles/tokens.css`. | **Coincide** (2026-11-04, commit `cb324c3`): 15 líneas, todas en `src/styles/tokens.css`. |
| D-02 | Ejecutar `grep -rn "style={" src`. | Solo lista el relleno de `src/components/BarraCombustible.tsx`. | **Coincide** (2026-11-04, commit `cb324c3`): una línea, `src/components/BarraCombustible.tsx:21`, con el ancho del relleno. |
| ALC-01 | Ejecutar `git diff ad524a8 cb324c3 --name-only -- src/dominio src/services supabase`. | No lista nada. | |
| ALC-02 | Ejecutar `git diff ad524a8 cb324c3 --name-only -- package.json package-lock.json`. | No lista nada. | |

## Estados de la flota

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| HU-1.2-CA9 | **Solo si puedes vaciar las tablas:** en el panel, borrar todas las filas de `misiones` y de `naves`, y recargar. Si hay datos que quieras conservar, anota "No comprobado". | Aparece «Todavía no hay naves registradas.», centrado y dentro de un recuadro de borde punteado. | |
| HU-1.2-CA10 | En la pestaña Red, elegir la limitación "Slow 4G" o más lenta, y recargar. Al acabar, quitar la limitación. | Mientras carga aparece «Cargando la flota…» en texto suave. No aparece el mensaje de flota vacía. | |
| HU-1.2-CA11 | En la pestaña Red, bloquear el dominio de Supabase (clic derecho sobre una petición, "Block request domain") y recargar. Después, quitar el bloqueo y recargar. | En Flota aparece el aviso de error «No se pudo cargar la flota.», con fondo y borde rojos. No aparece el mensaje de flota vacía. El mismo aviso sale también debajo del botón «Asignar misión», porque ese formulario tampoco puede cargar el selector de naves. | |

## Tarjetas de la flota

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| HU-1.2-CA1 | Registrar, en este orden: Vega (transporte, 60 %), Altair (carguera, 60 %), Lira (exploradora, 10 %) y Mira (transporte, 25 %). | Cada nave aparece sin recargar. Las cuatro salen ordenadas: Altair, Lira, Mira y Vega. Si hay otras naves, quedan intercaladas por nombre. | |
| HU-1.2-CA12 | Asignar a Altair una misión: destino Luna, despegue mañana, 3 días. No recargar. | El contador de Altair pasa de «0 de 3» a «1 de 3» sin recargar. | |
| HU-1.2-CA2 | Mirar la tarjeta de Altair. | Se ven, de arriba abajo: Altair, CARGUERA, la barra con «60 %», «Misiones desde la revisión» con «1 de 3», y «Operativa». | |
| HU-1.2-CA3 | Comparar las tarjetas de Altair (apta) y Lira (no apta). | «Apta» y «No apta» están en el mismo lugar de cada tarjeta y se leen sin mirar el resto. | |
| D-03 | Recorrer todas las tarjetas. | Cada una lleva su insignia con texto en la esquina superior derecha. | |
| HU-1.2-CA5 / D-05 | Comparar Lira (10 %) y Mira (25 %). Después, abrir `src/components/BarraCombustible.tsx`. | Las dos barras tienen la marca del umbral en el mismo sitio. Lira tiene el relleno rojo, sin llegar a la marca. Mira lo tiene verde, hasta la marca. En el código, el umbral se importa de `src/dominio/aptitud.ts`. | |
| HU-1.2-CA4 (un motivo) / D-04 | Mirar Lira y Altair. | Lira muestra «Combustible insuficiente: necesita al menos un 25 %.». Altair, que es apta, no muestra motivos. | |
| HU-1.2-CA6 / D-06 (2 misiones) | Asignar a Altair otra misión: destino Marte, despegue mañana, 3 días. | Muestra «2 de 3» con 2 marcas ocupadas y 1 libre, y sigue «Apta». | |
| HU-1.2-CA6 / D-06 (3 misiones) | Asignar a Altair otra misión: destino Fobos, despegue mañana, 2 días. Después, abrir `src/components/ContadorMisiones.tsx`. | Muestra «3 de 3» con las 3 marcas ocupadas, pasa a «No apta» y aparece «Necesita revisión: ya tiene 3 misiones desde la última.». En el código, el máximo se importa de `src/dominio/aptitud.ts`. | |
| HU-1.2-CA7 | En el panel, poner `en_reparacion = true` en Vega y recargar. Comparar Vega con Mira. | Vega muestra «No apta», la insignia «En reparación» y «La nave está en reparación.». Mira muestra «Operativa» en texto suave, sin insignia de estado. | |
| HU-1.2-CA4 (dos motivos) | En el panel, poner el combustible de Altair a 10 y recargar. | Altair muestra los dos motivos: el de combustible y el de revisión. | |
| HU-1.2-CA8 | En las herramientas de desarrollo, abrir Rendering y elegir "Emulate vision deficiencies: Achromatopsia". Comprobar en el inspector que los estados de una tarjeta son texto. Después, quitar la emulación. | En escala de grises, «Apta», «No apta», «En reparación» y «Operativa» se siguen leyendo como texto, y están en el HTML de la tarjeta. | |

## Formularios y avisos

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| D-08 (registrar) | Pulsar «Registrar nave» con el formulario vacío. Inspeccionar los campos. | Nombre, Clase y Combustible tienen borde rojo y su mensaje debajo. Cada uno tiene `aria-invalid="true"` y un `aria-describedby` que coincide con el `id` de su mensaje. No se registra nada. | |
| D-08 (asignar) | Pulsar «Asignar misión» con el formulario vacío. Inspeccionar los campos. | Nave, Destino, Fecha de despegue y Duración tienen borde rojo y su mensaje debajo, con los mismos atributos. No se asigna nada. | |
| T-10 · Aviso de éxito | Registrar una nave nueva con un nombre libre, por ejemplo Sirio (carguera, 60 %). | Los errores desaparecen. Debajo del botón aparece «Nave «Sirio» registrada.», con fondo y borde verdes. | |
| T-10 · Rechazo | Asignar a Lira una misión válida: destino Ceres, despegue mañana, 1 día. | Debajo del botón aparece un aviso de error con «No se puede asignar la misión a «Lira»:» y la lista de motivos. | |
| T-10 · Botón al enviar | En la pestaña Red, elegir una limitación lenta y registrar otra nave. Al acabar, quitar la limitación. | Mientras se envía, el botón baja de opacidad, no se puede pulsar y conserva su texto y su ancho. | |

## Recorrido solo con teclado
No uses el ratón en estas filas. Haz clic una vez fuera de la app, en la barra de direcciones, antes de empezar.

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| D-07 · Orden y foco | Recargar la página y pulsar Tab hasta recorrer toda la app. Después, volver hacia atrás con Mayús+Tab. | El foco pasa, en este orden, por Nombre, Clase, Combustible, «Registrar nave», Nave, Destino, Fecha de despegue, Duración y «Asignar misión». La fecha tiene varias paradas internas. Todo control muestra un contorno cian separado de su borde, y el foco nunca desaparece. | |
| D-07 · Registrar | Con Tab, escribir el nombre Polar. Elegir la clase con las flechas. Escribir 60 en combustible. Con el foco en el botón, pulsar Enter. | La nave se registra y aparece en la flota sin usar el ratón. | |
| D-07 · Asignar | Elegir Polar con las flechas. Escribir un destino, la fecha de mañana y la duración 2. Con el foco en el botón, pulsar Enter. | La misión se asigna, y el contador de Polar pasa a «1 de 3». | |
| D-07 · Foco en un error | Pulsar Enter en «Registrar nave» con el formulario vacío. Pasar con Tab por un campo con error y seguir. | Con el foco, el borde y el contorno son cian. Al salir, el borde vuelve a rojo y el mensaje sigue debajo. | |

## Comprobaciones a 1280 px

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| D-09 · Tablero | Fijar el ancho en 1280 px y recargar. | Arriba, «Hangar Orbital» y «Control de despegues». Debajo, dos columnas: a la izquierda, los paneles «Registrar nave» y «Asignar misión»; a la derecha, «Flota» con las tarjetas en grilla. El contenido está centrado. | |
| D-09 · Sin scroll | En la consola, ejecutar `document.documentElement.scrollWidth <= document.documentElement.clientWidth`. | Devuelve `true` y no hay barra de desplazamiento horizontal. | |

## Comprobaciones a 390 px

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| D-09 · Una columna | Fijar el ancho en 390 px y recargar. | Una sola columna, en este orden: encabezado, «Registrar nave», «Asignar misión» y «Flota». Con margen a los dos lados. | |
| D-09 · Sin scroll | En la consola, ejecutar `document.documentElement.scrollWidth <= document.documentElement.clientWidth`. | Devuelve `true` y no hay barra de desplazamiento horizontal. | |
| D-09 · Tarjetas | Bajar hasta la flota. | Las tarjetas ocupan el ancho disponible. Nombre, insignia, barra, porcentaje, contador y motivos se ven enteros, sin cortes. | |
| D-09 · Formularios | Pulsar «Registrar nave» y «Asignar misión» con los formularios vacíos. | Los campos no se salen del panel, y los mensajes de error pasan de línea sin provocar scroll horizontal. | |
| D-09 · Nombre largo | Registrar una nave con un nombre de unos 60 caracteres sin espacios. | El nombre pasa de línea dentro de la tarjeta, la insignia sigue a la derecha y no aparece scroll horizontal. | |

## Textos y fuentes

| Criterio | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| D-10 · Textos nuevos | Comparar la pantalla con la [sección 1.3 de la spec 02](specs/02-interfaz-flota.md#13-textos-que-añade-esta-spec). | «Control de despegues», «Cargando la flota…», «Misiones desde la revisión» y «n de 3» coinciden carácter por carácter. | |
| D-10 · Textos de la spec 01 | Recorrer [docs/VERIFICACION.md](VERIFICACION.md) y anotar allí sus resultados. Donde esa guía dice «N misiones», en pantalla se lee «N de 3». | Todos los mensajes coinciden con los de esa guía. | |
| T-08 · Fuentes | En la pestaña Red, filtrar por "Font" y recargar. | Las fuentes de IBM Plex se cargan sin error. Títulos en la variante condensada, cifras en monoespaciada y el resto en la normal. | |
| T-08 · Movimiento reducido | En Rendering, elegir "Emulate CSS media feature prefers-reduced-motion: reduce". Pasar con Tab por varios campos. Después, quitar la emulación. | El borde cambia de color al instante, sin transición. | |

## Cierre
- [ ] Todas las filas tienen anotado su resultado obtenido.
- [ ] Las filas que no coincidan con el resultado esperado están anotadas como fallo, con lo que se vio.
- [ ] Copiar el resultado a la sección "Resultados" de la spec 02.
- [ ] Borrar del panel las naves de prueba y sus misiones, si no se van a conservar.
