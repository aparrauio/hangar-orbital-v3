# Spec 06 · Corregir el combustible

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

### Resultados (T-20 y T-21)
**Automático, 2026-11-16:**
- `npm test`: 85 de 85 pasan.
  - Los 16 tests nuevos de `nave.test.ts` se escribieron antes que el código y fallaron primero. Cubren CA3, CA4 (también «24.5», «1e2» y «12abc»), CA5 y que `validarNave` y `validarCombustible` comparten los mismos mensajes.
  - Cubren además CA1 y CA2 en el dominio, con `puedeRecibirMision` al 24 %, al 25 % y al 10 %.
  - Los tests anteriores de `validarNave` siguen pasando sin cambios.
- `npm run build`: compila sin errores.
- D-01: los hexadecimales solo aparecen en `tokens.css`. D-02: solo aparece el relleno de `BarraCombustible.tsx`.

**Manual (navegador), pendiente:** primero hay que aplicar `003_corregir_combustible.sql` en Supabase. Lo tiene que hacer el usuario.
- [ ] HU-2.2-CA1: una nave al 24 % con menos de 3 misiones, corregida a 25 %, pasa de «No apta» a «Apta».
- [ ] HU-2.2-CA2: una nave al 60 %, corregida a 10 %, pasa a «No apta» por combustible.
- [ ] HU-2.2-CA3 y CA4: los mensajes aparecen bajo el campo y no se guarda nada.
- [ ] HU-2.2-CA5: 0 y 100 se guardan.
- [ ] HU-2.2-CA6: una nave en reparación (puesta desde el panel) puede corregir su combustible.
- [ ] Regla de la spec 05 con la migración 003 aplicada: «Registrar revisión» sigue sin funcionar en una nave en reparación, ni siquiera llamando a la API directamente.

### Pendientes
1. **Seguridad entre las migraciones 002 y 003:**
   - En Postgres, las políticas de `update` se suman y valen para la fila entera. La política abierta que necesita CA6 anulaba la condición `not en_reparacion` de la migración 002.
   - Con la aprobación del usuario, la 003 añade un trigger `before update of ultima_revision` que impide registrar una revisión a una nave en reparación.
   - Sigue pendiente lo de la Spec 05: sin inicio de sesión, cualquiera con la clave pública puede actualizar estas columnas. Cuando haya usuarios, hay que pasar a `authenticated`.
2. **DESIGN.md no está en la tabla de archivos.** Con la aprobación del usuario, se añadió el bloque 8 «Combustible» a §6.7 y se actualizaron §6.3 y §6.8. «Misiones» pasa a ser el bloque 9 y sigue siendo el último.
3. **`[SUPUESTO]` Error al guardar:** la spec no lo define. Se muestra el aviso de error «No se pudo corregir el combustible.» y no hay aviso de éxito, porque la barra ya muestra el cambio. Falta que el cliente lo confirme.
4. **El campo es de tipo texto con `inputMode="numeric"`**, no `type="number"`. Con `type="number"`, el navegador vacía los valores no numéricos, como «abc» o «24,5», y nunca llegarían a la validación de CA4.
