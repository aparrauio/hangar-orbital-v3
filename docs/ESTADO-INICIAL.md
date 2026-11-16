# Informe de recepción de Hangar Orbital

No modifiqué ningún archivo del proyecto. Los archivos de prueba del hook quedaron en el scratchpad, y no abrí `.env.local`.

**Resumen:** el código compila y sus 44 tests pasan, pero **nada está comprobado de punta a punta contra Supabase**. El sprint tiene 4 de 7 tickets abiertos. Además, el bloqueo de naves no aptas, que sostiene la métrica de éxito, solo se aplica en el cliente.

| Comprobación | Resultado |
|---|---|
| Tests (`vitest run`) | 44 de 44 pasan |
| Tipos (`tsc --noEmit`) | Sin errores |
| Formato (`prettier --check src`) | Correcto |
| `any` o claves en `src/` | Ninguna coincidencia (búsqueda por patrones) |
| `npm run build` | **No ejecutado:** escribe `dist/` e incrusta los valores de `.env.local` |
| App en el navegador y Supabase | **No probados:** no sé si la migración está aplicada ni qué tipo de clave hay en `.env.local` |

## 1. Qué hace la app y con qué stack
Es una sola pantalla, sin inicio de sesión, con tres bloques ([App.tsx](src/App.tsx)):
- **Registrar nave:** pide nombre único, clase (exploradora, carguera o transporte) y combustible entero de 0 a 100.
- **Asignar misión:** pide nave, destino, fecha no anterior a hoy y duración entera de 1 día o más. Antes de guardar, vuelve a leer la nave y comprueba su aptitud.
- **Flota:** muestra una tabla con datos, misiones desde la última revisión, estado y aptitud con sus motivos.

Una nave es apta si tiene 25 % o más de combustible, 3 misiones o menos desde la última revisión y no está en reparación. El contador no se guarda: se calcula con `created_at > ultima_revision`.

**Lo que no existe todavía:**
- Completar misiones o ver la lista de misiones de una nave.
- Editar combustible o registrar revisiones.
- Gestionar el dique seco.

**Stack:** Vite 8, React 19, TypeScript 7, Supabase JS 2.118, Vitest 4 y Prettier 3. Las capas son `types`, `dominio`, `services` y `components`, y solo los servicios importan Supabase.

**Sobre git:** sí hay repositorio, con un único commit de hoy (`50163af`, autor `webdevusfq`) y sin remoto. `package-lock.json` tiene un cambio sin confirmar: una línea con `"name"`.

## 2. Qué trae el harness
**Reglas ([AGENTS.md](AGENTS.md), importado desde `CLAUDE.md`):**
- Nombres del dominio en español, camelCase en TypeScript y snake_case en la base de datos.
- Nunca usar `any`, y los componentes no llaman a Supabase.
- Nunca leer ni modificar `.env` ni `.env.local`, y nunca escribir claves en el código.
- En el frontend solo va la clave pública.
- Nada se implementa sin una spec.
- Hay que ejecutar test y build antes de cerrar una tarea.

**Skill `commit`** ([SKILL.md](.claude/skills/commit/SKILL.md)):
- Solo se activa a mano (`disable-model-invocation: true`).
- Lee lo que hay en staging y se detiene si está vacío o si parece contener claves.
- Crea el commit en Conventional Commits, en español y con 72 caracteres como máximo.
- Nunca hace `git add` ni `git push`.

**Hook `formatear.cjs`** ([formatear.cjs](.claude/hooks/formatear.cjs)), el único que hay:
- **Cuándo se ejecuta:** en `PostToolUse`, tras cada `Edit` o `Write`.
- **Qué ejecuta:** `node .claude/hooks/formatear.cjs`, que formatea con el Prettier del proyecto el archivo tocado si es `.ts`, `.tsx`, `.js`, `.json` o `.css`.
- **Qué ignora:** otras extensiones, como `.md`, `.sql`, `.html` o `.cjs`, y los cambios hechos por `Bash`.
- **Si falla:** termina con código 0 sin avisar. Lo comprobé: sin Prettier disponible, deja el archivo igual y no da ningún error.

## 3. Estado del sprint
Las historias del sprint son HU-1.1 y HU-1.3.

| Ticket | Estado | Qué falta |
|---|---|---|
| T-01 Preparar el proyecto | Hecho | Nada |
| T-02 Reglas de nave y aptitud | Hecho | Nada |
| T-03 Guardar y mostrar naves | Pendiente | Verificar en navegador los avisos y la nave nueva en la lista |
| T-04 Verificar HU-1.1 | Pendiente | Resultados de CA1, CA2 y CA9, y aptitud visible en pantalla |
| T-05 Reglas de misión | Hecho | Nada (ver inconsistencia 4) |
| T-06 Guardar misión | Pendiente | Contador +1, que un rechazo no guarde nada, y lo que muestra la pantalla |
| T-07 Verificar HU-1.3 | Pendiente | Resultados de CA1, CA2 y CA7, y prueba con naves preparadas a mano |

**Criterios sin verificar:** según [AUDITORIA.md](docs/AUDITORIA.md), de 22 criterios cumplen 16, ninguno falla y 6 están sin verificar:
- **HU-1.1:** CA1, CA2 y CA9.
- **HU-1.3:** CA1, CA2 y CA7.

Las 21 filas de [VERIFICACION.md](docs/VERIFICACION.md) tienen vacío el resultado obtenido. Por eso, los 16 criterios que "cumplen" solo están probados en funciones del dominio, no en la app real.

**Fuera del sprint:**
- HU-1.2, HU-1.4 y HU-1.5 siguen por refinar.
- E2 no tiene historias ni tickets.

## 4. Inconsistencias
**Afectan al estado real del proyecto:**
1. **Commit auditado inexistente:** la auditoría se hizo sobre `39d0df9`, que no está en este repositorio. No se puede demostrar que describa este código.
2. **Dos definiciones de "verificado":** la [spec](docs/specs/01-flota-y-misiones.md#L281-L287) pide 6 pruebas manuales, mientras que `VERIFICACION.md` exige anotar las 21 filas. Las 15 filas restantes cubren justo los 16 criterios marcados como "cumple".
3. **La misión pendiente no se ve:** el [backlog](docs/backlog/E1-flota-y-misiones.md#L89-L90) y la definición de hecho de T-06 piden mostrarla. La spec lo rebajó a un mensaje de confirmación, y al recargar la pantalla solo queda el número de misiones.
4. **T-05 no coincide con su descripción:** pide una función pura que decida la asignación, pero en el código son dos funciones combinadas en `misionesService.crear`, que no tiene test. Aun así, el ticket figura como hecho, con una nota que lo aclara.
5. **Contador y estado de misión:**
   - La spec elimina ambos y dice que ["así lo decidió el cliente"](docs/specs/01-flota-y-misiones.md#L8), pero ningún documento lo respalda.
   - El PRD sigue hablando de un contador y de estados pendiente y completada.
   - El [backlog](docs/backlog/E1-flota-y-misiones.md#L295) aún pide cambiar a mano un contador que ya no existe.
6. **Solución de R-01 fuera de alcance:** la auditoría la hace depender en parte del inicio de sesión, que el PRD excluye del MVP. Además, no dice quién aceptó ese riesgo.

**Menores:**

7. **Desglose de tests desactualizado:** la [spec](docs/specs/01-flota-y-misiones.md#L273-L275) dice 17, 12 y 15, y lo real es 18 en `nave`, 11 en `aptitud` y 15 en `mision`. El total de 44 sí coincide.
8. **Casos abiertos en el backlog que la spec ya resolvió:**
   - El reloj de "hoy" (aparece como [bloqueo de T-05](docs/backlog/E1-flota-y-misiones.md#L258)).
   - Los decimales en el combustible.
   - Los nombres formados solo por espacios.
   - La pantalla desactualizada.
9. **Cambio ya incorporado:** la [spec §8](docs/specs/01-flota-y-misiones.md#L290) dice que cambia el reparto respecto al backlog, pero el backlog ya lo refleja.
10. **Datos distintos entre guía y criterios:**
    - V-03 usa 80 % y el CA1 pide 60 %.
    - V-10 parte de 0 misiones y el CA1 de HU-1.3 de 1.
    - La spec escribe "{n} días", mientras que V-16 y el código usan "1 día".

## 5. Riesgos abiertos
**Altos:**
- **El bloqueo se puede saltar:** cualquiera con la clave pública puede insertar misiones directamente, como ya recoge R-01. Además, la [política de insertar](supabase/migraciones/001_hangar.sql#L33-L39) no limita columnas. Según el SQL, también se podrían enviar `created_at`, `ultima_revision`, `en_reparacion` o una fecha pasada. Esto lo deduzco del SQL, no lo probé. La auditoría no recoge este alcance adicional.
- **Condición de carrera:** [`crear`](src/services/misionesService.ts#L60-L63) comprueba y luego inserta en pasos separados. Dos jefes a la vez podrían superar el límite de misiones, o asignar a una nave que acaba de entrar en reparación.
- **La aptitud se queda obsoleta sin E2:**
  - El combustible no cambia nunca desde la app, así que una nave puede seguir como "Apta" después de volar.
  - Una nave con 4 misiones o con poco combustible queda bloqueada, salvo que se edite desde el panel de Supabase.
  - Esto choca con el objetivo del PRD.
- **Sin evidencia de funcionamiento real:** faltan las 21 filas de verificación. El build tampoco se ha comprobado en esta revisión, y no se sabe si la migración está aplicada.

**Medios:**
- **Decisiones de negocio sin confirmar:**
  - Si se acepta la cuarta misión sin revisión (observación de la auditoría).
  - Los 4 puntos abiertos del PRD: fechas superpuestas, combustible al salir del dique seco, misiones pendientes de una nave que deja de ser apta e historial.
  - Si "Aurora" y "aurora" cuentan como el mismo nombre.
- **Huecos en los tests:** los servicios, los componentes y `fecha.ts` no tienen tests, y la decisión final de bloquear está en un servicio.
- **Reglas sin control técnico:** `settings.json` no tiene reglas `deny` ni hooks que impidan leer `.env.local`, o que obliguen a pasar test y build. Solo las sostienen las instrucciones, y el formateo puede fallar sin avisar.
- **Clave sin comprobar:** todo lo que tenga prefijo `VITE_` acaba en el bundle, y no puedo confirmar que `.env.local` tenga la clave pública sin incumplir la regla de no leerlo.
- **Trazabilidad débil:**
  - No hay historial ni registro de qué jefe hizo cada acción.
  - La migración está en `supabase/migraciones/`, sin `config.toml`, y hasta donde sé la CLI de Supabase usa `supabase/migrations/` por defecto. Nada registra qué se aplicó.

**Bajos:**
- **Flota desactualizada entre jefes:** la lista solo se recarga con las acciones propias. Los cambios de otro jefe no aparecen hasta recargar, aunque la asignación vuelve a comprobar los datos.
- **"Hoy" depende del navegador:** la fecha sale del reloj del equipo y la base de datos no la valida.
- **Variables de entorno ausentes:** `supabase.ts` lanza un error al cargar y no vi ningún manejo de ese error en `main.tsx` ni en `App.tsx`, así que la pantalla probablemente quedaría en blanco.
