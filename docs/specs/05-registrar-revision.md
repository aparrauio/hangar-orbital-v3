# Spec 05 · Registrar una revisión

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

### Resultados (T-18 y T-19)
**Automático, 2026-11-16:**
- `npm test`: 69 de 69 pasan. `revision.test.ts` (5 tests, escritos antes que el código y fallando primero) cubre CA3 con `puedeRegistrarRevision`, y CA1, CA2 y CA5 en el dominio: con el contador a 0 o a 1, `puedeRecibirMision` da la aptitud esperada.
- `npm run build`: compila sin errores.
- D-01: los hexadecimales solo aparecen en `tokens.css`. D-02: solo aparece el relleno de `BarraCombustible.tsx`.

**Manual (navegador), pendiente:** primero hay que aplicar `002_registrar_revision.sql` en Supabase. Lo tiene que hacer el usuario.
- [ ] HU-2.1-CA1: una nave al 60 % con 3 misiones pasa a «0 de 3» y a «Apta».
- [ ] HU-2.1-CA2: una nave al 10 % con 3 misiones pasa a «0 de 3» y sigue «No apta» por combustible.
- [ ] HU-2.1-CA3: con una nave en reparación (puesta desde el panel), el botón está deshabilitado y se ve el motivo.
- [ ] HU-2.1-CA4: aparece «Revisión registrada.».
- [ ] HU-2.1-CA5: una misión asignada después cuenta como «1 de 3».

### Pendientes
1. **DESIGN.md no está en la tabla de archivos.** Con la aprobación del usuario, se añadió el bloque «Revisión» a §6.7 y se actualizaron §6.3 y §6.8. Va como bloque 7 y «Misiones» pasa a ser el 8, porque la Spec 04 exige que «Misiones» sea el último bloque de la tarjeta.
2. **La política RLS de actualización usa `using (not en_reparacion)`** en lugar de `using (true)`, con la aprobación del usuario. Así, la regla de la decisión 2 también se cumple si alguien llama a la API sin pasar por la app.
3. **Cualquiera con la clave pública puede actualizar `ultima_revision`** de una nave operativa directamente, sin pasar por la función, porque el MVP no tiene inicio de sesión (Spec 01, §1). Cuando haya usuarios, la política debe pasar al rol `authenticated`.
4. **Sin tipos generados de Supabase:** el resultado de `rpc` se comprueba como `unknown` antes de usarlo. Generar los tipos de la base de datos permitiría tiparlo directamente.
