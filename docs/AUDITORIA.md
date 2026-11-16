# Auditoría · Spec 01 (flota y misiones)

- **Fecha:** 2026-10-28.
- **Alcance:** [docs/specs/01-flota-y-misiones.md](specs/01-flota-y-misiones.md), historias HU-1.1 y HU-1.3, tickets T-01 a T-07.
- **Commit auditado:** `39d0df9`.

## Resumen
- **`npm test`:** 3 archivos y 44 tests, todos en verde.
- **`npm run build`:** compila sin errores. El bundle (`dist/assets/index-*.js`, 444 kB) contiene la app completa.
- **Criterios:** 22 en total.
  - **Cumplen:** 16.
  - **No cumplen:** 0.
  - **Sin verificar:** 6.
- **Por qué quedan 6 sin verificar:** [docs/VERIFICACION.md](VERIFICACION.md) tiene vacía la columna "Resultado obtenido" en sus 21 filas, y git no registra cambios en ese archivo. Los criterios que la spec manda comprobar en el navegador no tienen evidencia, así que se marcan "sin verificar", no "cumple".
- **Actualización del 2026-11-04 (commit `cb324c3`):** se revisaron HU-1.3-CA2, CA3, CA4 y CA8 tras corregir el límite de misiones (commit `94e8532`). `npm test` pasa 45 de 45 tests y `npm run build` compila. Los totales siguen en 16, 0 y 6, porque `docs/VERIFICACION.md` sigue sin resultados.

## Criterios de aceptación

| Criterio | Cómo se verificó | Resultado | Evidencia |
|---|---|---|---|
| HU-1.1-CA1 | Navegador (V-03) | Sin verificar | V-03 sin resultado anotado. |
| HU-1.1-CA2 | Test + navegador (V-01) | Sin verificar | El test pasa: `nave.test.ts` › rechaza la clase "crucero" y "Carguera". Falta V-01, el selector en pantalla. |
| HU-1.1-CA3 | Test | Cumple | `aptitud.test.ts` › acepta una nave con exactamente un 25 % de combustible. |
| HU-1.1-CA4 | Test | Cumple | `aptitud.test.ts` › rechaza una nave con un 10 % de combustible. |
| HU-1.1-CA5 | Test | Cumple | `nave.test.ts` › rechaza el nombre "" y "   ". |
| HU-1.1-CA6 | Test | Cumple | `nave.test.ts` › rechaza la clase "". |
| HU-1.1-CA7 | Test | Cumple | `nave.test.ts` › rechaza una nave sin combustible. |
| HU-1.1-CA8 | Test | Cumple | `nave.test.ts` › rechaza el combustible -1, 101, 24.5 y NaN; acepta 0, 25 y 100. |
| HU-1.1-CA9 | Navegador (V-06) | Sin verificar | V-06 sin resultado anotado. En el código, `navesService.crear` traduce el error `23505` al aviso, y la migración declara `nombre ... unique`. |
| HU-1.3-CA1 | Navegador (V-10) | Sin verificar | V-10 sin resultado anotado. |
| HU-1.3-CA2 | Navegador (V-17) | Sin verificar | V-17 sin resultado anotado. Con la regla corregida, la nave pasa a 3 misiones y deja de estar apta. |
| HU-1.3-CA3 | Test | Cumple | `aptitud.test.ts` › acepta una nave con 2 misiones desde la última revisión. |
| HU-1.3-CA4 | Test | Cumple | `aptitud.test.ts` › rechaza una nave con exactamente 3 misiones desde la última revisión. El mensaje nuevo lo comprueba `aptitud.test.ts` › tiene un mensaje para cada motivo. |
| HU-1.3-CA5 | Test | Cumple | `aptitud.test.ts` › rechaza una nave con un 24 % de combustible. |
| HU-1.3-CA6 | Test | Cumple | `aptitud.test.ts` › acepta una nave con exactamente un 25 % de combustible. |
| HU-1.3-CA7 | Test + navegador (V-21) | Sin verificar | El test pasa: `aptitud.test.ts` › rechaza una nave en reparación aunque tenga combustible y pocas misiones. Falta V-21. |
| HU-1.3-CA8 | Test | Cumple | `aptitud.test.ts` › devuelve los dos motivos con poco combustible y 3 misiones. |
| HU-1.3-CA9 | Test | Cumple | `mision.test.ts` › rechaza una misión sin nave, sin destino, sin fecha o sin duración, y devuelve todos los errores a la vez. |
| HU-1.3-CA10 | Test | Cumple | `mision.test.ts` › acepta una fecha de despegue igual a hoy. |
| HU-1.3-CA11 | Test | Cumple | `mision.test.ts` › rechaza la fecha de despegue 2026-10-27 y 2025-12-31. |
| HU-1.3-CA12 | Test | Cumple | `mision.test.ts` › acepta una duración de 1 día. |
| HU-1.3-CA13 | Test | Cumple | `mision.test.ts` › rechaza una duración de 0, -1, 2.5 y NaN días. |

Los tests verifican las funciones del dominio (`validarNave`, `validarMision` y `puedeRecibirMision`), no la pantalla, tal como fija la tabla de verificación de la spec. Que el formulario muestre cada mensaje solo lo confirma el recorrido en el navegador.

## Otras comprobaciones de la spec

| Punto de la spec | Resultado | Evidencia |
|---|---|---|
| §1 Migración en `supabase/migraciones/001_hangar.sql` | Cumple | El SQL coincide con la spec: dos tablas, índice, RLS y cuatro políticas para `anon`. |
| §2 Tipos `Nave` y `Mision` en camelCase | Cumple | `src/types/nave.ts` y `src/types/mision.ts`. |
| §3 Funciones puras sin reloj ni Supabase | Cumple | `validarMision` recibe `hoy` como parámetro, y `src/dominio/` no importa servicios. |
| §4 Solo los servicios llaman a Supabase | Cumple | Solo `navesService.ts` y `misionesService.ts` importan `lib/supabase`. |
| §4 `misionesService.crear` vuelve a leer la nave antes de decidir | Cumple | Revisión de código: lee la nave y cuenta sus misiones antes de llamar a `puedeRecibirMision`, e inserta solo si puede. |
| AGENTS.md: nunca `any` | Cumple | 0 apariciones en `src/`. |
| AGENTS.md: sin claves en el código | Cumple | 0 coincidencias de JWT, `sk-`, `service_role` o URL de proyecto en `src/`. |
| Formato con Prettier | Cumple | `prettier --check src` no encuentra nada que formatear. |

## Observaciones
1. **Verificación en el navegador sin anotar.** Para cerrar los 6 criterios pendientes, hay que anotar los resultados en `docs/VERIFICACION.md` y repetir esta auditoría.
2. **La cuarta misión se acepta. Resuelta (2026-11-04, commit `94e8532`).** Con la regla R1 anterior ("3 misiones asignadas o menos"), una nave con 3 misiones recibía una cuarta, y era la quinta la que se rechazaba. El cliente decidió que una nave admite como máximo 3 misiones entre revisiones: con 3 ya no es apta y no recibe otra hasta su próxima revisión.
3. **El bundle contiene la URL y la clave pública.** Es lo esperado en una app de frontend: esa clave es pública por diseño. La protección real depende de las políticas RLS (ver Riesgos).

## Riesgos conocidos

| # | Riesgo | Impacto | Estado |
|---|---|---|---|
| R-01 | Las políticas RLS permiten leer e insertar a cualquiera que tenga la clave pública, porque el MVP no tiene usuarios. | Cualquiera con la clave puede ver la flota y crear naves o misiones sin pasar por la app. En particular, puede asignar una misión a una nave no apta, porque el bloqueo de la regla R2 solo se aplica en el frontend. Eso pone en riesgo la métrica de éxito ("cero misiones asignadas a naves no aptas"). | **Abierto.** Aceptado de forma temporal. Se resuelve cuando haya inicio de sesión (políticas para `authenticated`) y validando la aptitud en la base de datos. |

# Auditoría · Spec 02 (interfaz de la flota y de los formularios)

- **Fecha:** 2026-11-04.
- **Alcance:** [docs/specs/02-interfaz-flota.md](specs/02-interfaz-flota.md), historia HU-1.2 e interfaz de los formularios, tickets T-08 a T-11.
- **Commit auditado:** `cb324c3`.

## Resumen
- **`npm test`:** 3 archivos y 45 tests, todos en verde.
- **`npm run build`:** compila sin errores.
- **Criterios:** 24 en total.
  - **Cumplen:** 5.
  - **No cumplen:** 0.
  - **Sin verificar:** 19.
- **Por qué quedan 19 sin verificar:** [docs/VERIFICACION-UI.md](VERIFICACION-UI.md) tiene vacía la columna "Resultado obtenido" en 37 de sus 39 filas; solo D-01 y D-02 tienen resultado. La spec 02 anota una confirmación general del usuario, sin detalle por criterio. No basta como evidencia de cada criterio, así que se marcan "sin verificar", no "cumple".

## Criterios de aceptación

| Criterio | Cómo se verificó | Resultado | Evidencia |
|---|---|---|---|
| HU-1.2-CA1 | Navegador | Sin verificar | Fila HU-1.2-CA1 sin resultado anotado. |
| HU-1.2-CA2 | Navegador | Sin verificar | Fila HU-1.2-CA2 sin resultado anotado. |
| HU-1.2-CA3 | Navegador | Sin verificar | Fila HU-1.2-CA3 sin resultado anotado. |
| HU-1.2-CA4 | Navegador | Sin verificar | Las dos filas de HU-1.2-CA4 sin resultado anotado. |
| HU-1.2-CA5 | Navegador | Sin verificar | Fila HU-1.2-CA5 / D-05 sin resultado anotado. |
| HU-1.2-CA6 | Navegador | Sin verificar | Las dos filas de HU-1.2-CA6 / D-06 sin resultado anotado. |
| HU-1.2-CA7 | Navegador | Sin verificar | Fila HU-1.2-CA7 sin resultado anotado. |
| HU-1.2-CA8 | Navegador + código | Sin verificar | Fila HU-1.2-CA8 sin resultado anotado. En el código, `InsigniaEstado` y `TarjetaNave` escriben los estados como texto. |
| HU-1.2-CA9 | Navegador | Sin verificar | Fila HU-1.2-CA9 sin resultado anotado. |
| HU-1.2-CA10 | Navegador | Sin verificar | Fila HU-1.2-CA10 sin resultado anotado. |
| HU-1.2-CA11 | Navegador | Sin verificar | Fila HU-1.2-CA11 sin resultado anotado. |
| HU-1.2-CA12 | Navegador | Sin verificar | Fila HU-1.2-CA12 sin resultado anotado. |
| D-01 | Comando | Cumple | El `grep` de D-01 lista 15 líneas, todas en `src/styles/tokens.css`. |
| D-02 | Comando | Cumple | El `grep` de D-02 lista una línea: el ancho del relleno en `src/components/BarraCombustible.tsx:21`. |
| D-03 | Navegador | Sin verificar | Fila D-03 sin resultado anotado. |
| D-04 | Navegador | Sin verificar | Fila HU-1.2-CA4 (un motivo) / D-04 sin resultado anotado. |
| D-05 | Navegador + código | Sin verificar | Fila HU-1.2-CA5 / D-05 sin resultado anotado. En el código, el umbral se importa de `aptitud.ts`. |
| D-06 | Navegador + código | Sin verificar | Filas HU-1.2-CA6 / D-06 sin resultado anotado. En el código, el máximo se importa de `aptitud.ts`. |
| D-07 | Navegador | Sin verificar | Las cuatro filas de D-07 sin resultado anotado. |
| D-08 | Navegador + inspector | Sin verificar | Las dos filas de D-08 sin resultado anotado. En el código, los 7 campos tienen `aria-invalid` y `aria-describedby`. |
| D-09 | Medición en Chrome | Cumple | Con el ancho emulado y datos reales (T-11, mismo código que `cb324c3`): dos columnas a 1280 px y una a 390 px, sin scroll horizontal ni elementos fuera de la ventana. Las filas de D-09 de la guía, que comprueban además tarjetas, formularios y nombres largos, siguen sin resultado. |
| D-10 | Navegador | Sin verificar | Las filas de D-10 sin resultado anotado, y `docs/VERIFICACION.md` sin resultados en sus 21 filas. |
| ALC-01 | Comando | Cumple | `git diff ad524a8 cb324c3 --name-only -- src/dominio src/services supabase` no lista nada. Ejecutado en esta auditoría; la fila de la guía sigue vacía. |
| ALC-02 | Comando | Cumple | `git diff ad524a8 cb324c3 --name-only -- package.json package-lock.json` no lista nada. Ejecutado en esta auditoría; la fila de la guía sigue vacía. |

## Observaciones
1. **Resultados de la guía sin anotar.** Para cerrar los 19 criterios, hay que anotar los resultados en `docs/VERIFICACION-UI.md` y repetir esta auditoría. Además, D-10 necesita los resultados de `docs/VERIFICACION.md`.
2. **Confirmación general en la spec 02.** Su sección "Resultados" y su Definition of Done dan por confirmados los criterios de pantalla, sin detalle por criterio. Esta auditoría no los cuenta como evidencia.
3. **Contador por encima del máximo sin confirmar.** «4 de 3» es un supuesto de la spec 02, y con ese valor el motivo sigue diciendo «ya tiene 3 misiones». Falta la decisión del cliente.
4. **Error de carga duplicado.** Si falla la carga, «No se pudo cargar la flota.» aparece en la flota y debajo de «Asignar misión». La spec 02 no define este segundo aviso.

## Riesgos conocidos
R-01 (ver la auditoría de la spec 01) sigue **abierto**. La spec 02 no toca `src/services/` ni `supabase/`, así que no lo cambia.
