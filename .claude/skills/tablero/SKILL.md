---
name: tablero
description: Crea o actualiza en Trello (vía MCP) el tablero de Hangar Orbital con sus listas y carga como tarjetas las specs e historias de docs/tablero/tarjetas.md. Úsala al preparar el tablero o al agregar specs nuevas.
disable-model-invocation: true
---

# Tablero de Trello

Sigue estos pasos en orden. No toques código ni archivos del repositorio.

1. Lee `docs/tablero/tarjetas.md`. Cada tarjeta empieza con una línea que comienza con `## ` (su título), sigue con una línea `Lista: <nombre>` y después su descripción en markdown, hasta la siguiente línea que empiece con `## `.
2. Con el MCP de Trello, busca un tablero llamado **Hangar Orbital** en el espacio de trabajo autorizado. Si no existe, créalo.
3. Deja el tablero con estas listas, en este orden y con estos nombres exactos: **Backlog**, **Por hacer**, **En curso**, **En revisión** y **Hecho**. Crea las que falten. Si el tablero trae listas por defecto con otros nombres (por ejemplo «To Do», «Doing», «Done»), archívalas si están vacías.
4. Para cada tarjeta del archivo:
   - Si ya hay una tarjeta con el mismo título en el tablero, no la dupliques: déjala donde está.
   - Si no existe, créala en su lista con la descripción tal cual, sin resumirla ni cambiarla.
   - Respeta el orden del archivo: en «Por hacer», la primera tarjeta queda arriba y es la de mayor prioridad.
5. Termina con una tabla: lista, tarjetas creadas y tarjetas que ya existían. Incluye el enlace al tablero.
