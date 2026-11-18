# Spec 07 · Completar una misión

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

### Resultados (T-22 a T-24)
**Automático, 2026-11-18:**
- `npm test`: 94 de 94 pasan.
  - Los 9 tests nuevos de `mision.test.ts` se escribieron antes que el código, y los 8 que dependían de él fallaron primero.
  - Cubren `puedeCompletarMision` (ayer, hoy, mañana, completada, y cambios de mes y de año), `ordenarMisiones` (pendientes primero, cada grupo por fecha y por `createdAt`, sin modificar el arreglo) y `describirEstadoMision`.
  - Los tests de HU-1.4 siguen pasando sin cambios en sus expectativas.
- `npm run build`: compila sin errores.
- D-01: los hexadecimales solo aparecen en `tokens.css`. D-02: solo aparece el relleno de `BarraCombustible.tsx`.

**Capturas contra wireframes, 2026-11-18:** se aplicaron la migración 004 y los datos de prueba, y se compararon la estructura, el orden y los textos.
| Estado | Captura | Wireframe | ¿Coincide? |
| --- | --- | --- | --- |
| Lista | `lista-movil.png`, `lista-escritorio.png` | `lista-*.svg` | Sí: Titán y Europa pendientes, Ceres completada; solo Titán tiene «Completar» |
| Formulario | `formulario-movil.png`, `formulario-escritorio.png` | `combustible-abierto-*.svg` | Sí: el campo vacío en lugar de «Completar», con «Confirmar» (primario) y «Cancelar» |
| Error de validación | `error-validacion-movil.png` | `error-validacion-movil.svg` | Sí: «24,5» se conserva y el mensaje de rango aparece debajo del campo |
| Guardando | `guardando-movil.png` | `guardando-movil.svg` | Sí: el campo y los dos botones deshabilitados, con el mismo texto; la misión sigue «Pendiente» |
| Error de conexión | `error-conexion-movil.png` | `error-conexion-movil.svg` | Sí: el aviso «No se pudo completar la misión.» debajo de los botones, el valor 10 se conserva y Aurora sigue al 60 % |
| Éxito | `exito-movil.png` | `completada-movil.svg` | Sí: Europa, Ceres y Titán en ese orden; 10 %, «No apta» con su motivo y «2 de 3» |

- Después de `guardando` y `error-conexion` se comprobó en la app que Titán seguía pendiente y que Aurora seguía al 60 %.
- **Diferencia sin corregir:** en escritorio la flota tiene dos columnas y no tres como en el wireframe, porque la grilla viene de DESIGN.md §5. Con las tarjetas más anchas, «Confirmar» y «Cancelar» caben en una fila (decisión 4 del README de los wireframes).

**Manual (navegador), pendiente:** lo tiene que confirmar el usuario.
- [ ] HU-1.5-CA2: con dos misiones completables, al abrir una, el «Completar» de la otra aparece deshabilitado; «Cancelar» cierra el campo.
- [ ] HU-1.5-CA7: aparece el teclado numérico en un celular real y los botones miden al menos 40 × 40 px.
- [ ] Regla de la base de datos, con la clave pública:
  - `completar_mision` sobre una misión completada o futura falla;
  - un `update` directo de `misiones.estado` no cambia nada;
  - un `insert` con `estado = 'completada'` es rechazado.

### Pendientes
(La implementación anota aquí lo que encuentre fuera de alcance.)
- **El script de datos de prueba no avisa si «Aurora» no existe:** el `update` y el `insert` no afectan a ninguna fila y no dan error. En la primera ejecución pasó así y hubo que registrar la nave a mano.
- **Qué día es «hoy»:** la app usa la fecha local y la base de datos usa `current_date`, en UTC. En una zona horaria detrás de UTC, de noche, la base de datos puede aceptar una misión que la app todavía muestra como «Mañana». Es el mismo punto abierto de HU-1.3.
- **Nave en reparación con misiones pendientes:** hasta que exista HU-2.3 (R6), una nave en dique seco puede completar misiones. No contradice R4, que permite corregir el combustible en cualquier momento.
