# Tarjetas del tablero de Hangar Orbital

Este archivo es la fuente que lee la skill `/tablero` para crear o actualizar el tablero **Hangar Orbital** en Trello.

**Formato:** cada tarjeta empieza con una línea que comienza con `## ` (dos almohadillas y un espacio), que es su título. La línea siguiente dice `Lista: <nombre>`. Todo lo que sigue, hasta el próximo `## `, es la descripción de la tarjeta. Dentro de una descripción, los encabezados usan `###` o más, nunca `##`.

En «Por hacer», el orden del archivo es la prioridad: la primera tarjeta se implementa primero.

## Spec 04 · Ver las misiones de una nave
Lista: Por hacer

**Historia:** HU-1.4 · Como jefe de hangar, quiero ver las misiones de cada nave, para saber qué tiene asignado antes de darle otra misión.
**Épica:** E1 · Flota y misiones. **Tickets:** T-15 a T-17.

### 0. Decisiones de esta spec
1. **Se muestran todas las misiones de la nave.** No existe estado de misión (Spec 01, decisión 2), así que «pendiente» equivale a «asignada» hasta que exista HU-1.5. `[SUPUESTO]`
2. **Orden:** por fecha de despegue, de la más próxima a la más lejana. Si dos misiones despegan el mismo día, va primero la que se asignó antes (`createdAt`).
3. **Carga bajo demanda:** las misiones de una nave se cargan al pulsar «Ver misiones», no al abrir la flota.
4. **Solo lectura:** esta spec no cambia el contador, la aptitud ni la base de datos. No necesita migración: la política de lectura de `misiones` ya existe.

### 1. Funciones puras (`src/dominio/mision.ts`)
- `ordenarMisiones(misiones: Mision[]): Mision[]`: devuelve un arreglo nuevo ordenado según la decisión 2. NO DEBE modificar el arreglo recibido.
- `describirFechaDespegue(fecha: string, hoy: string): string`: ambas en `YYYY-MM-DD`. Devuelve «Hoy» si coinciden, «Mañana» si `fecha` es el día siguiente a `hoy`, «Despegó el DD/MM/AAAA» si `fecha` es anterior a `hoy`, y «DD/MM/AAAA» en cualquier otro caso.
- `describirDuracion(dias: number): string`: «1 día» para 1 y «N días» para cualquier otro entero.

### 2. Servicio (`src/services/misionesService.ts`)
- `listarPorNave(naveId: string): Promise<Mision[]>`: lee las misiones de la nave con las columnas de `COLUMNAS_MISION` y las devuelve con `aMision`, sin ordenar. Si Supabase devuelve un error, lanza un `Error` con su mensaje.

### 3. Componente (`src/components/MisionesNave.tsx`)
- Se muestra como **último bloque** de la Tarjeta de nave, después de los motivos. Antes de escribir código, se añade este bloque 7 a la sección 6.7 de `DESIGN.md`.
- Un Botón secundario (DESIGN.md §6.3) con el texto «Ver misiones», que cambia a «Ocultar misiones» cuando la lista está abierta.
- Al abrir: «Cargando misiones…» mientras carga; «No se pudieron cargar las misiones.» como aviso de error (DESIGN.md §6.8) si falla; «Esta nave no tiene misiones.» si no hay ninguna.
- Cada misión es un `li` con el destino, la fecha de `describirFechaDespegue` en `--fuente-cifras` y la duración de `describirDuracion`.
- Solo usa tokens de `DESIGN.md`. La fecha de hoy se obtiene con `fechaLocalHoy()` de `src/lib/fecha.ts`.

### 4. Criterios de aceptación
- **HU-1.4-CA1:** con una nave que tiene dos misiones con despegue el 20/12/2026 y el 10/12/2026, al pulsar «Ver misiones» la app DEBE listar las dos, primero la del 10/12/2026.
- **HU-1.4-CA2:** con dos misiones que despegan el mismo día, la app DEBE mostrar primero la que se asignó antes.
- **HU-1.4-CA3:** con una nave sin misiones, la app DEBE mostrar «Esta nave no tiene misiones.».
- **HU-1.4-CA4:** una misión que despega hoy DEBE mostrar «Hoy», y una que despega mañana, «Mañana».
- **HU-1.4-CA5:** una misión con fecha de despegue anterior a hoy DEBE mostrar «Despegó el DD/MM/AAAA».
- **HU-1.4-CA6:** una misión de 1 día DEBE mostrar «1 día», y una de 5 días, «5 días».
- **HU-1.4-CA7:** si falla la carga, la app DEBE mostrar «No se pudieron cargar las misiones.», y el resto de la tarjeta DEBE seguir visible.
- **HU-1.4-CA8:** ver las misiones NO DEBE cambiar el contador ni la aptitud de la nave.

### 5. Verificación
| Criterio | Cómo |
| --- | --- |
| CA1, CA2 | Vitest: `ordenarMisiones` (incluye que no modifica el arreglo original) |
| CA4, CA5 | Vitest: `describirFechaDespegue` (hoy, mañana, ayer, fecha futura, cambio de mes y de año) |
| CA6 | Vitest: `describirDuracion` |
| CA3, CA7, CA8 | Manual en el navegador |

### 6. Tickets y archivos
| Ticket | Crea | Modifica |
| --- | --- | --- |
| T-15 · Reglas de presentación de misiones | — | `src/dominio/mision.ts`, `src/dominio/mision.test.ts` |
| T-16 · Listar y mostrar las misiones | `src/components/MisionesNave.tsx`, `src/styles/misiones.css` | `src/services/misionesService.ts`, `src/components/TarjetaNave.tsx`, `DESIGN.md` (§6.7, bloque 7) |
| T-17 · Verificar HU-1.4 | — | Esta spec (resultados de la prueba manual) |

### Pendientes
(La implementación anota aquí lo que encuentre fuera de alcance.)

## Spec 05 · Registrar una revisión
Lista: Por hacer

**Historia:** HU-2.1 · Como jefe de hangar, quiero registrar que una nave pasó revisión, para que pueda volver a recibir misiones.
**Épica:** E2 · Mantenimiento. **Regla:** R5 (una revisión pone el contador de misiones a cero). **Tickets:** T-18 y T-19.

### 0. Decisiones de esta spec
1. **Registrar una revisión actualiza `ultima_revision` a la fecha y hora actuales.** El contador cuenta las misiones creadas después de esa fecha (Spec 01, decisión 1), así que vuelve a 0 sin guardar ningún contador.
2. **Una nave en reparación no puede registrar revisión:** salir del dique seco ya cuenta como revisión (R7), que se implementará en otra spec.
3. **La fecha la pone la base de datos** con `now()`, no el navegador, para que no dependa del reloj del jefe.

### 1. Base de datos
Archivo nuevo: `supabase/migraciones/002_registrar_revision.sql`.
- Una función `registrar_revision(p_nave_id uuid)` con `security invoker` que actualiza `ultima_revision = now()` solo si la nave existe y `en_reparacion` es falso, y devuelve la fila actualizada.
- Permiso para `anon`: `update` únicamente sobre la columna `ultima_revision` de `naves`, con su política RLS de actualización. Ninguna otra columna se puede actualizar.

### 2. Funciones puras (`src/dominio/revision.ts`)
- `puedeRegistrarRevision(nave: Pick<Nave, 'enReparacion'>): { puede: true } | { puede: false; motivo: string }`. Si la nave está en reparación, el motivo es «La nave está en reparación: la revisión se registra al salir del dique seco.».

### 3. Servicio (`src/services/navesService.ts`)
- `registrarRevision(naveId: string): Promise<Nave>`: llama a la función `registrar_revision` con `rpc` y devuelve la nave con `aNave`. Lanza un `Error` si Supabase falla o si no devuelve ninguna fila.

### 4. Componente
- En la Tarjeta de nave, un Botón secundario «Registrar revisión». Si `puedeRegistrarRevision` dice que no, el botón aparece deshabilitado y el motivo se muestra debajo.
- Al terminar: aviso de éxito «Revisión registrada.» y la tarjeta se actualiza (contador y aptitud). Si falla: aviso de error «No se pudo registrar la revisión.».

### 5. Criterios de aceptación
- **HU-2.1-CA1:** con una nave al 60 % y 3 misiones desde la última revisión, al registrar una revisión la nave DEBE pasar a «0 de 3» y a «Apta».
- **HU-2.1-CA2:** con una nave al 10 % y 3 misiones, al registrar una revisión DEBE pasar a «0 de 3» y DEBE seguir «No apta» por combustible insuficiente.
- **HU-2.1-CA3:** con una nave en reparación, el botón DEBE estar deshabilitado y DEBE mostrarse el motivo.
- **HU-2.1-CA4:** después de registrar la revisión, la app DEBE mostrar «Revisión registrada.».
- **HU-2.1-CA5:** una misión asignada después de la revisión DEBE contar como «1 de 3».

### 6. Tickets y archivos
| Ticket | Crea | Modifica |
| --- | --- | --- |
| T-18 · Regla y servicio de revisión | `supabase/migraciones/002_registrar_revision.sql`, `src/dominio/revision.ts`, `src/dominio/revision.test.ts` | `src/services/navesService.ts` |
| T-19 · Botón y verificación | — | `src/components/TarjetaNave.tsx`, `src/components/ListaNaves.tsx`, esta spec (resultados) |

### Pendientes
(La implementación anota aquí lo que encuentre fuera de alcance.)

## Spec 06 · Corregir el combustible
Lista: Por hacer

**Historia:** HU-2.2 · Como jefe de hangar, quiero corregir el combustible de una nave, para que su aptitud refleje el nivel real.
**Épica:** E2 · Mantenimiento. **Regla:** R4 (el combustible se puede corregir en cualquier momento). **Tickets:** T-20 y T-21.

### 0. Decisiones de esta spec
1. **Mismas reglas que al registrar:** entero entre 0 y 100, con los mismos mensajes de `validarNave` (HU-1.1-CA7 y CA8).
2. **Un texto con solo espacios cuenta como vacío.**
3. **Se puede corregir aunque la nave esté en reparación.** R4 dice «en cualquier momento».

### 1. Base de datos
Archivo nuevo: `supabase/migraciones/003_corregir_combustible.sql`. Permiso para `anon`: `update` únicamente sobre la columna `combustible` de `naves`, con su política RLS. El `check` de la columna (0 a 100) ya existe.

### 2. Funciones puras (`src/dominio/nave.ts`)
- `validarCombustible(texto: string): { ok: true; valor: number } | { ok: false; error: string }`. Vacío o solo espacios: «Indica el combustible de la nave.». No numérico, decimal, negativo o mayor que 100: «El combustible debe ser un número entero entre 0 y 100.». `validarNave` pasa a usar los mismos textos, sin duplicarlos.

### 3. Servicio (`src/services/navesService.ts`)
- `corregirCombustible(naveId: string, combustible: number): Promise<Nave>`: actualiza solo `combustible` y devuelve la nave con `aNave`.

### 4. Componente
- En la Tarjeta de nave, un Campo de formulario «Corregir combustible» con un Botón secundario «Guardar». Los errores se muestran bajo el campo (DESIGN.md §6.2). Al guardar, la barra de combustible y la aptitud se actualizan.

### 5. Criterios de aceptación
- **HU-2.2-CA1:** al corregir de 24 % a 25 % una nave operativa con menos de 3 misiones, DEBE pasar de «No apta» a «Apta».
- **HU-2.2-CA2:** al corregir de 60 % a 10 %, DEBE pasar a «No apta» por combustible insuficiente.
- **HU-2.2-CA3:** con el campo vacío o con solo espacios, la app NO DEBE guardar y DEBE mostrar «Indica el combustible de la nave.».
- **HU-2.2-CA4:** con -1, 101, 24,5 o «abc», la app NO DEBE guardar y DEBE mostrar el mensaje de rango.
- **HU-2.2-CA5:** con 0 y con 100, la app DEBE guardar.
- **HU-2.2-CA6:** una nave en reparación DEBE poder corregir su combustible.

### 6. Tickets y archivos
| Ticket | Crea | Modifica |
| --- | --- | --- |
| T-20 · Regla y servicio de combustible | `supabase/migraciones/003_corregir_combustible.sql` | `src/dominio/nave.ts`, `src/dominio/nave.test.ts`, `src/services/navesService.ts` |
| T-21 · Campo y verificación | — | `src/components/TarjetaNave.tsx`, `src/components/ListaNaves.tsx`, esta spec (resultados) |

### Pendientes
(La implementación anota aquí lo que encuentre fuera de alcance.)

## Spec 07 · Completar una misión
Lista: Por hacer

**Historia:** HU-1.5 · Como jefe de hangar, quiero marcar una misión pendiente como completada, para dejar constancia de que la nave volvió y anotar el combustible que le queda.
**Épica:** E1 · Flota y misiones (con la parte de combustible de E2). **Reglas:** R3 (completar no cambia el contador) y R4 (el combustible restante reemplaza al de la nave). **Tickets:** T-22 a T-24.
**Wireframes aprobados:** `docs/specs/07-completar-mision/wireframes/` (2026-11-18).

### 0. Decisiones de esta spec
1. **Una misión está `pendiente` o `completada`.** Es una columna nueva de `misiones`, y todas las misiones existentes quedan como `pendiente`. Se cierra así la decisión 1 de la Spec 04, en la que «pendiente» equivalía a «asignada».
2. **Completar es una sola operación en la base de datos:** marca la misión como completada y reemplaza el combustible de la nave en la misma transacción. Si falla una de las dos, no se guarda ninguna.
3. **Solo se completa una misión pendiente cuya fecha de despegue es hoy o anterior.** Lo comprueba la app, para mostrar o no el botón, y lo vuelve a comprobar la base de datos.
4. **El combustible restante usa `validarCombustible`** (Spec 06), con sus dos mensajes, sin duplicarlos.
5. **Completar no cambia el contador ni `ultima_revision`** (R3). La aptitud cambia solo por el combustible nuevo.
6. **No se puede deshacer.** Nadie puede pasar una misión de `completada` a `pendiente`, ni desde la app ni llamando a la API.
7. **Orden de la lista:** primero las pendientes y después las completadas. Dentro de cada grupo se mantiene el orden de la Spec 04 (fecha de despegue y, si empatan, `createdAt`).
8. **Una misión a la vez:** mientras el campo de una misión está abierto, el botón «Completar» de las demás aparece deshabilitado.
9. **Tras completar, no hay aviso de éxito:** lo dicen la insignia, la barra y la aptitud, igual que en la Spec 06. La lista se actualiza sin volver a cargarla, y la tarjeta se recarga como tras corregir el combustible.

### 1. Pantallas
| Estado | Wireframes | Criterios |
| --- | --- | --- |
| Lista | `lista-movil.svg`, `lista-escritorio.svg` | HU-1.5-CA1, CA7 |
| Formulario (combustible abierto) | `combustible-abierto-movil.svg`, `combustible-abierto-escritorio.svg` | HU-1.5-CA2, CA7 |
| Error de validación | `error-validacion-movil.svg` | HU-1.5-CA3, CA7 |
| Guardando | `guardando-movil.svg` | HU-1.5-CA4, CA7 |
| Error de conexión | `error-conexion-movil.svg` | HU-1.5-CA6, CA7 |
| Éxito (misión completada) | `completada-movil.svg` | HU-1.5-CA5, CA7 |

**Normativo (manda el wireframe):**
- La estructura y el orden de los bloques y de los elementos dentro de cada misión.
- Los textos: «Completar», «Combustible restante», «Confirmar», «Cancelar», «Pendiente», «Completada» y «No se pudo completar la misión.».
- Las decisiones 1 a 10 del `README.md` de los wireframes.

**No normativo (manda DESIGN.md):** los colores, la tipografía, los tamaños, los radios y los espacios. Los grises de los wireframes no son tokens. Si chocan, se aplica la regla de AGENTS.md.

**Antes del código, actualizar DESIGN.md:**
- **§6.3 Botón:** «Completar» es secundario. «Confirmar», dentro de una misión, es la única excepción primaria de la Tarjeta de nave.
- **§6.4 Insignia:** dos variantes nuevas, `insignia--pendiente` («Pendiente») e `insignia--completada` («Completada»), con sus tokens. No pueden usar los colores de apta o no apta: el estado de una misión no es aptitud.
- **§6.7, bloque 9 «Misiones»:**
  - el orden de la decisión 7;
  - la insignia de cada misión;
  - el botón «Completar»;
  - el campo «Combustible restante» con «Confirmar» y «Cancelar»;
  - el estado deshabilitado del resto de botones «Completar».
- **§6.8 Avisos:** el aviso «No se pudo completar la misión.» aparece dentro de la misión, debajo de «Confirmar» y «Cancelar».

### 2. Base de datos
Archivo nuevo: `supabase/migraciones/004_completar_mision.sql`.
- **Columna:** `alter table misiones add column estado text not null default 'pendiente' check (estado in ('pendiente', 'completada'))`.
- **Insertar solo pendientes:** se sustituye la política «anon puede insertar misiones» por otra con `with check (estado = 'pendiente')`. Así nadie puede crear una misión ya completada llamando a la API.
- **Sin permisos de actualización en `misiones`:**
  - No se da `update` sobre `misiones` a `anon` ni se crea ninguna política de `update`. El estado solo cambia mediante la función, y así se cumple la decisión 6.
  - Los permisos de `naves` no cambian.
- **Función `completar_mision(p_mision_id uuid, p_combustible integer) returns setof naves`:**
  - **Permisos:** `security definer` y `set search_path = public`. Es necesario porque `anon` no puede actualizar `misiones`. Se ejecuta `revoke execute ... from public` y luego `grant execute ... to anon`.
  - **Pasos:**
    1. Rechaza `p_combustible` nulo o fuera de 0 a 100.
    2. Ejecuta `update misiones set estado = 'completada' where id = p_mision_id and estado = 'pendiente' and fecha_despegue <= current_date returning nave_id`. Si no actualiza ninguna fila, lanza una excepción: la misión no existe, ya estaba completada o todavía no ha despegado.
    3. Ejecuta `update naves set combustible = p_combustible where id = <nave_id> returning *`.
  - **Atómica:** todo ocurre en una sola transacción, porque es una sola llamada.
  - **Sin otros cambios:** no toca `ultima_revision`, así que el trigger de la migración 003 no se dispara, ni ninguna otra columna.
- **No cierra** el pendiente 3 de la Spec 05 ni el 1 de la Spec 06: sin inicio de sesión, cualquiera con la clave pública puede llamar a la función. Cuando haya usuarios, `grant execute` pasa a `authenticated`.

### 3. Tipos y funciones puras
- **`src/types/mision.ts`:**
  - `ESTADOS_MISION = ['pendiente', 'completada'] as const` y `type EstadoMision = (typeof ESTADOS_MISION)[number]`.
  - `Mision` gana `estado: EstadoMision`.
- **`src/dominio/mision.ts`:**
  - `puedeCompletarMision(mision: Pick<Mision, 'estado' | 'fechaDespegue'>, hoy: string): boolean`. Devuelve `true` solo si la misión está `pendiente` y `fechaDespegue <= hoy`, ambas en `YYYY-MM-DD`.
  - `ordenarMisiones` cambia según la decisión 7: primero las pendientes y después las completadas, cada grupo como antes. Sigue sin modificar el arreglo recibido, y los tests de HU-1.4-CA1 y CA2 siguen pasando.
  - `describirEstadoMision(estado: EstadoMision): string`: «Pendiente» o «Completada».
- **`src/dominio/nave.ts`:** sin cambios. Se reutiliza `validarCombustible`.

### 4. Servicio (`src/services/misionesService.ts`)
- `COLUMNAS_MISION`, `FilaMision` y `aMision` incluyen `estado`.
- `completar(misionId: string, combustible: number): Promise<Nave>`: llama a `completar_mision` con `rpc` y devuelve la nave actualizada con `aNave`.
  - El resultado se comprueba como `unknown`, igual que en `registrarRevision`.
  - Lanza un `Error` si Supabase falla o si no devuelve ninguna fila.

### 5. Componentes
- **`src/components/InsigniaEstado.tsx`:** dos variantes nuevas, `pendiente` y `completada`, con los textos de `describirEstadoMision`.
- **`src/components/CompletarMision.tsx` (nuevo):** es el formulario que se abre dentro de una misión.
  - **Props:** `onConfirmar: (combustible: number) => Promise<void>` (lanza un `Error` si falla) y `onCancelar: () => void`.
  - **Campo «Combustible restante»:**
    - Es de tipo texto con `inputMode="numeric"`, como en la Spec 06, pendiente 4.
    - Al confirmar se valida con `validarCombustible`.
    - Si hay error, el mensaje va debajo del campo con `aria-invalid` y `aria-describedby`, y se conserva lo escrito.
  - **Guardando:** el campo, «Confirmar» y «Cancelar» se deshabilitan. «Confirmar» conserva su texto y su ancho.
  - **Si `onConfirmar` falla:**
    - Se muestra el aviso de error «No se pudo completar la misión.» (`role="alert"`) debajo de los botones.
    - El valor sigue en el campo y los botones vuelven a estar habilitados.
- **`src/components/MisionesNave.tsx`:**
  - **Prop nueva:** `onCompletar: (misionId: string, combustible: number) => Promise<void>`.
  - **Estado nuevo:** `abiertaId: string | null`.
  - **Cada misión muestra:**
    - la insignia de su estado a la derecha del destino;
    - debajo, la fecha y la duración;
    - el botón «Completar» si `puedeCompletarMision(mision, fechaLocalHoy())`. Está deshabilitado si hay otra misión abierta, según la decisión 8.
  - **Al confirmar con éxito:**
    - la misión pasa a `completada` en la lista local;
    - la lista se reordena con `ordenarMisiones`;
    - se cierra el formulario.
- **`src/components/TarjetaNave.tsx`:** recibe la prop `onCompletarMision` y se la pasa a `MisionesNave`.
- **`src/components/ListaNaves.tsx`:** `completarMision(misionId, combustible)` llama a `misionesService.completar` y suma 1 a `recarga`, igual que `corregirCombustible`. Así se actualizan la barra, la aptitud y el contador.
- **Estilos:** solo tokens y sin estilos en línea. Las insignias nuevas van en `tarjeta-nave.css`; la misión y el formulario, en `misiones.css`.

### 6. Criterios de aceptación
- **HU-1.5-CA1:** con una misión pendiente que despegó ayer, una pendiente que despega mañana y una completada, la lista DEBE mostrar primero las dos pendientes y después la completada. Cada una DEBE mostrar «Pendiente» o «Completada», y solo la de ayer DEBE tener «Completar».
- **HU-1.5-CA2:** al pulsar «Completar», DEBE aparecer dentro de la misión el campo vacío «Combustible restante» con «Confirmar» y «Cancelar».
  - Los botones «Completar» de las demás misiones DEBEN estar deshabilitados.
  - «Cancelar» DEBE cerrar el campo y dejar la misión pendiente.
- **HU-1.5-CA3:** si el campo está vacío o tiene solo espacios, la app NO DEBE guardar y DEBE mostrar «Indica el combustible de la nave.».
  - Con -1, 101, 24,5 o «abc», tampoco DEBE guardar y DEBE mostrar «El combustible debe ser un número entero entre 0 y 100.».
  - En los dos casos, lo escrito DEBE seguir en el campo.
- **HU-1.5-CA4:** mientras guarda, el campo, «Confirmar» y «Cancelar» DEBEN estar deshabilitados, «Confirmar» DEBE conservar su texto y su ancho, y la misión DEBE seguir como «Pendiente».
- **HU-1.5-CA5:** una nave tiene un 60 % de combustible, 2 misiones y una misión pendiente que despegó ayer. Al completar esa misión con un 10 %:
  - la misión DEBE pasar al grupo de completadas, sin botón;
  - la barra DEBE mostrar 10 %;
  - la nave DEBE pasar a «No apta» por combustible insuficiente;
  - el contador DEBE seguir en «2 de 3»;
  - todo eso DEBE verse sin recargar la página.
- **HU-1.5-CA6:** si no se puede guardar, la app DEBE mostrar «No se pudo completar la misión.».
  - La misión DEBE seguir pendiente, y el combustible y el contador NO DEBEN cambiar.
  - El campo DEBE conservar el valor y «Confirmar» DEBE volver a estar habilitado.
- **HU-1.5-CA7:** a 390 px NO DEBE haber scroll horizontal, los botones y el campo DEBEN verse completos y cada botón DEBE medir al menos 40 × 40 px.
- **Regla de la base de datos (decisiones 3 y 6):**
  - `completar_mision` NO DEBE completar una misión ya completada ni una que despega después de hoy.
  - `anon` NO DEBE poder cambiar `misiones.estado` con un `update` directo ni insertar una misión `completada`.

### 7. Verificación
**Vitest** (los tests se escriben antes que el código):
| Criterio | Test |
| --- | --- |
| CA1 | `puedeCompletarMision`: pendiente con despegue ayer, hoy y mañana; completada con despegue ayer |
| CA1 | `ordenarMisiones`: las pendientes van antes que las completadas, cada grupo por fecha y por `createdAt`, y no modifica el arreglo; los tests de HU-1.4 siguen pasando |
| CA1 | `describirEstadoMision`: «Pendiente» y «Completada» |
| CA3 | Los mensajes de `validarCombustible`, ya cubiertos en `nave.test.ts` (Spec 06) |

**Datos de prueba:**
- Se preparan en el editor SQL de Supabase después de aplicar la migración 004.
- Se repiten antes de cada captura `exito`, porque esa captura completa la misión de verdad.
- «Aurora» tiene que ser la primera nave por nombre, y ninguna otra puede estar al 10 %.

```sql
delete from misiones where nave_id = (select id from naves where nombre = 'Aurora');
update naves set combustible = 60, en_reparacion = false, ultima_revision = now() - interval '1 day'
 where nombre = 'Aurora';
insert into misiones (nave_id, destino, fecha_despegue, duracion_dias, estado, created_at)
select id, 'Titán',  current_date - 1,  5, 'pendiente',  now()                     from naves where nombre = 'Aurora' union all
select id, 'Europa', current_date + 1,  3, 'pendiente',  now()                     from naves where nombre = 'Aurora' union all
select id, 'Ceres',  current_date - 16, 4, 'completada', now() - interval '2 days' from naves where nombre = 'Aurora';
```

**Capturas** (con `npm run dev` corriendo; se guardan en `docs/specs/07-completar-mision/capturas/`), en este orden:
1. **lista** (CA1): `npm run captura -- 07-completar-mision lista "clic:Ver misiones" "esperar:Titán"`
2. **formulario** (CA2): `npm run captura -- 07-completar-mision formulario "clic:Ver misiones" "esperar:Titán" "clic:Completar"`
3. **error-validacion** (CA3): `npm run captura -- 07-completar-mision error-validacion --anchos 390 "clic:Ver misiones" "esperar:Titán" "clic:Completar" "escribir:Combustible restante=24,5" "clic:Confirmar" "esperar:El combustible debe ser un número entero entre 0 y 100."`
4. **guardando** (CA4): `npm run captura -- 07-completar-mision guardando --anchos 390 "clic:Ver misiones" "esperar:Titán" "clic:Completar" "escribir:Combustible restante=10" lento "clic:Confirmar"`
5. **error-conexion** (CA6): `npm run captura -- 07-completar-mision error-conexion --anchos 390 "clic:Ver misiones" "esperar:Titán" "clic:Completar" "escribir:Combustible restante=10" sin-red "clic:Confirmar" "esperar:No se pudo completar la misión."`
6. **exito** (CA5), al final, porque completa «Titán» de verdad: `npm run captura -- 07-completar-mision exito --anchos 390 "clic:Ver misiones" "esperar:Titán" "clic:Completar" "escribir:Combustible restante=10" "clic:Confirmar" "esperar:10 %"`

**Después de las capturas:**
- Después de `guardando` y `error-conexion`, se comprueba en Supabase que «Titán» sigue `pendiente` y que «Aurora» sigue al 60 %.
- `exito` va solo a 390 px: con dos anchos, el segundo no encontraría el botón «Completar».

**Interfaz:** se compara cada captura con su wireframe (estructura, orden y textos) y se comprueba en el navegador:
- CA2: «Cancelar» y los otros «Completar» deshabilitados.
- CA5: el cambio se ve sin recargar la página.
- CA7: no hay scroll horizontal a 390 px, aparece el teclado numérico y los botones miden al menos 40 × 40 px.
- La regla de la base de datos, llamando a la API con la clave pública:
  - `completar_mision` sobre una misión completada o futura;
  - un `update` directo de `estado`;
  - un `insert` con `estado = 'completada'`.

D-01, D-02 y D-09 se comprueban como en las specs anteriores.

### 8. Tickets y archivos
| Ticket | Crea | Modifica |
| --- | --- | --- |
| T-22 · Estado de la misión, reglas y servicio | `supabase/migraciones/004_completar_mision.sql` | `src/types/mision.ts`, `src/dominio/mision.ts`, `src/dominio/mision.test.ts`, `src/services/misionesService.ts` |
| T-23 · Completar desde la lista | `src/components/CompletarMision.tsx` | `DESIGN.md` (§6.3, §6.4, §6.7 bloque 9, §6.8), `src/components/InsigniaEstado.tsx`, `src/components/MisionesNave.tsx`, `src/components/TarjetaNave.tsx`, `src/components/ListaNaves.tsx`, `src/styles/tarjeta-nave.css`, `src/styles/misiones.css` |
| T-24 · Verificar HU-1.5 | `docs/specs/07-completar-mision/capturas/*.png` | Esta spec (resultados de Vitest, capturas y navegador) |

### Pendientes
(La implementación anota aquí lo que encuentre fuera de alcance.)
- **Qué día es «hoy»:** la app usa la fecha local y la base de datos usa `current_date`, en UTC. En una zona horaria detrás de UTC, de noche, la base de datos puede aceptar una misión que la app todavía muestra como «Mañana». Es el mismo punto abierto de HU-1.3.
- **Nave en reparación con misiones pendientes:** hasta que exista HU-2.3 (R6), una nave en dique seco puede completar misiones. No contradice R4, que permite corregir el combustible en cualquier momento.

## HU-2.3 · Poner una nave en dique seco y sacarla
Lista: Backlog

Como jefe de hangar, quiero poner una nave en dique seco y sacarla de él, para que no reciba misiones mientras se repara.

- **Reglas:** R6 (al entrar pierde sus misiones pendientes y no recibe nuevas) y R7 (salir cuenta como revisión).
- **Falta antes de la spec:** qué significa «pierde sus misiones pendientes» si las misiones no tienen estado.

## Decisión · ¿«4 de 3» es posible?
Lista: Backlog

La Spec 02 dejó como `[SUPUESTO]` que el contador puede mostrar más misiones que el máximo, por ejemplo «4 de 3», si llegan datos antiguos. Hay que confirmarlo con el cliente antes de cerrar E1.

## HU-1.9 · Consultar el historial de misiones
Lista: Backlog

Como jefe de hangar, quiero ver las misiones completadas de una nave, para revisar su actividad pasada.

- **Falta antes de la spec:** el PRD tiene abierto si se conserva el historial. Depende de HU-1.5.
