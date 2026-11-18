---
name: siguiente-spec
description: Toma de Trello (vía MCP) la siguiente spec de la lista "Por hacer" del tablero Hangar Orbital, la mueve a "En curso" y la implementa con tests en una rama propia. Úsala para empezar la siguiente tarea.
disable-model-invocation: true
---

# Siguiente spec

## Antes de empezar

1. Ejecuta `git status`. Si hay cambios sin commit, detente y avisa al usuario.
2. Cámbiate a `main` y actualízala con `git pull`.

## Elegir la spec

3. En el tablero **Hangar Orbital**, toma la **primera tarjeta de la lista «Por hacer»**. No consideres tarjetas de otras listas: las de «En curso» o «En revisión» ya están en marcha. Si «Por hacer» está vacía, avisa y detente.
4. La descripción de la tarjeta es la spec. Resume en pocas líneas su objetivo y sus criterios de aceptación.
5. Propón un plan: qué archivos vas a crear o cambiar (según la tabla de tickets de la spec), qué test escribirás para cada criterio que se verifica con Vitest y qué queda fuera. Si toca `src/components/` o `src/styles/`, di qué secciones de DESIGN.md vas a seguir. Si la spec tiene una sección «Pantallas», lee sus wireframes (los SVG y su `README.md`) y di, para cada estado, qué componente lo muestra y dónde. **Espera a que el usuario apruebe el plan** antes de seguir.

## Cuando el usuario apruebe el plan

6. Crea la rama `spec/<número>-<slug>` desde `main` (por ejemplo, «Spec 04 · Ver las misiones de una nave» → `spec/04-ver-misiones-nave`).
7. Guarda la descripción de la tarjeta, sin cambios, en `docs/specs/<número>-<slug>.md`, con el título de la tarjeta como encabezado `#`.
8. Crea `.claude/estado/spec-en-curso.json` con este contenido:
   ```json
   { "titulo": "<título de la tarjeta>", "tarjeta": "<enlace a la tarjeta>", "spec": "docs/specs/<archivo>.md", "base": "main", "intentos": 0 }
   ```
9. En Trello, mueve la tarjeta a **«En curso»** y agrega un comentario: «En curso en la rama `spec/<número>-<slug>`».

## Implementar

10. Para cada criterio que se verifica con Vitest: escribe primero el test, comprueba que falla, escribe el código y comprueba que pasa. Al final, `npm test` y `npm run build` deben pasar.
11. Si la spec tiene una sección «Pantallas», compara la pantalla con sus wireframes antes del commit:
    - Arranca `npm run dev` en segundo plano si no está corriendo.
    - Ejecuta los comandos de `npm run captura` de la sección «Verificación» de la spec, en el orden en que aparecen.
    - Abre cada captura de `docs/specs/<número>-<slug>/capturas/` junto a su wireframe y compáralos en **estructura, orden y textos**. No compares colores ni tipografía: vienen de DESIGN.md.
    - Corrige las diferencias, vuelve a capturar y anota en la spec, en «Resultados», qué estado comparaste y si coincide.
12. No cambies nada que la spec no pida. Si encuentras algo fuera de alcance, anótalo en la sección «Pendientes» de la spec.
13. Haz el commit tú mismo con las reglas de formato de `.claude/skills/commit/SKILL.md`. Esta skill te autoriza a hacer `git add`, pero solo de los archivos de la tabla de la spec y de `docs/specs/` (incluidas las capturas). Usa el número de spec en el mensaje (por ejemplo, `feat(spec-04): ver las misiones de una nave`).
14. Termina con un resumen de dos líneas. **No hagas push ni abras el PR:** al terminar, el hook de revisión adversarial revisa el cambio y, si lo aprueba, abre el PR.

## Cuando el hook responda

- **Si rechaza:** corrige solo los hallazgos de severidad alta, vuelve a ejecutar `npm test`, haz commit y termina otra vez.
- **Si aprueba:** mueve la tarjeta a **«En revisión»**, comenta en ella el enlace del PR, borra la carpeta `.claude/estado` y responde solo con la URL del PR.

**Nunca muevas una tarjeta a «Hecho».** Eso lo decide una persona después de revisar el PR.