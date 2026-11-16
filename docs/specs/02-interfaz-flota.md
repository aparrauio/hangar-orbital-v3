# Spec 02 · Interfaz de la flota y de los formularios

- **Historias:** HU-1.2 (consultar la flota) y la interfaz de los formularios de HU-1.1 y HU-1.3.
- **Origen:** [docs/backlog/E1-flota-y-misiones.md](../backlog/E1-flota-y-misiones.md), [DESIGN.md](../../DESIGN.md) y [docs/specs/01-flota-y-misiones.md](01-flota-y-misiones.md).
- **Tickets:** T-08 a T-11.
- **Referencia visual:** [docs/diseno/brand-board.html](../diseno/brand-board.html). Si difiere de DESIGN.md, gana DESIGN.md.

Esta spec cambia cómo se ve la app, no lo que hace. Las reglas de negocio, los servicios y la base de datos siguen como están. Los valores de los tokens y los componentes viven en DESIGN.md; aquí solo se citan por su nombre.

## 0. Decisiones de esta spec
1. **Textos.** Los mensajes siguen siendo los de la spec 01, carácter por carácter. Además, esta spec fija los textos de la sección 1.3, que la spec 01 no incluye.
2. **La flota no va dentro de un Panel.** DESIGN.md §5 y el brand board la tratan como una sección cuyas tarjetas ya tienen su propia superficie. Su título usa el mismo estilo que el título de un Panel.
3. **Más misiones que el máximo.** El contador muestra el número real, por ejemplo «4 de 3», con todas las marcas ocupadas. El número de marcas nunca supera el máximo. **[SUPUESTO]** DESIGN.md no define este caso; falta que lo confirme el cliente.
4. **El botón conserva su texto al enviar.** «Registrando…», que aparece en el brand board, no está en la spec 01 y no se usa.
5. **El Botón secundario no se usa.** Esta spec no incluye acciones de apoyo. «Limpiar», del brand board, es solo una ilustración.
6. **Sin divisor en la tarjeta.** El brand board dibuja uno antes del estado, pero el orden fijo de DESIGN.md §6.7 no lo incluye.
7. **Los errores de campo conservan `role="alert"`.** DESIGN.md no lo pide ni lo prohíbe, y quitarlo cambiaría el comportamiento actual para los lectores de pantalla.
8. **Nombres de clase.** Se usan los del brand board, en español y en kebab-case, como pide DESIGN.md §6.

## 1. Componentes por parte de la pantalla
Los nombres de la columna "Componentes de DESIGN.md" son los de sus secciones 5 y 6.

### 1.1 Tablero y formularios

| Parte de la pantalla | Componentes de DESIGN.md | Archivo de React |
|---|---|---|
| Título y subtítulo | Encabezado (§5) | `src/App.tsx` |
| Distribución general | Tablero y Pantalla angosta (§5) | `src/App.tsx` |
| Registrar nave | Panel, Campo de formulario, Botón primario, Avisos | `src/App.tsx`, `src/components/FormularioNave.tsx` |
| Asignar misión | Panel, Campo de formulario, Botón primario, Avisos | `src/App.tsx`, `src/components/FormularioMision.tsx` |
| Rechazo por nave no apta | Aviso de error, con la lista de `MENSAJES_MOTIVO` | `src/components/FormularioMision.tsx` |

### 1.2 Flota

| Parte de la pantalla | Componentes de DESIGN.md | Archivo de React |
|---|---|---|
| Lista de naves | Grilla de la flota (§5), `ul` con un `li` por Tarjeta de nave (§6.7) | `src/components/ListaNaves.tsx` |
| Cada nave | Tarjeta de nave | `src/components/TarjetaNave.tsx` |
| Cabecera de la tarjeta | Nombre de la nave e Insignia de estado (`insignia--apta` o `insignia--no-apta`) | `src/components/TarjetaNave.tsx`, `src/components/InsigniaEstado.tsx` |
| Clase | Clase de la Tarjeta de nave | `src/components/TarjetaNave.tsx` |
| Combustible | Barra de combustible | `src/components/BarraCombustible.tsx` |
| Misiones | Contador de misiones | `src/components/ContadorMisiones.tsx` |
| Estado | «Operativa» en texto suave, o Insignia de estado (`insignia--reparacion`) | `src/components/TarjetaNave.tsx`, `src/components/InsigniaEstado.tsx` |
| Motivos | Motivos de la Tarjeta de nave, con `MENSAJES_MOTIVO` | `src/components/TarjetaNave.tsx` |
| Cargando y vacío | Estados de la flota (§6.9) | `src/components/ListaNaves.tsx` |
| Error al cargar | Estados de la flota (§6.9), con Aviso de error | `src/components/ListaNaves.tsx` |

Reglas para estos componentes:
- `ListaNaves` sigue obteniendo los datos como hasta ahora y se los pasa a `TarjetaNave`. Ningún componente nuevo llama a los servicios.
- `BarraCombustible` y `ContadorMisiones` importan `COMBUSTIBLE_MINIMO` y `MAX_MISIONES_SIN_REVISION` de `src/dominio/aptitud.ts`.
- La aptitud y los motivos siguen saliendo de `puedeRecibirMision`. La tarjeta no recalcula la regla: solo la barra compara el combustible con el mínimo para elegir su relleno.

### 1.3 Textos que añade esta spec

| Texto | Dónde | Origen |
|---|---|---|
| «Control de despegues» | Subtítulo del Encabezado | DESIGN.md §5 |
| «Cargando la flota…» | Estado de carga | Ya está en `ListaNaves.tsx`; DESIGN.md §6.9 lo atribuye a la spec 01, que no lo incluye |
| «Misiones desde la revisión» | Etiqueta del Contador de misiones | DESIGN.md §6.6 |
| «{n} de {máximo}» | Valor del Contador de misiones | DESIGN.md §6.6 |

También se conservan los textos actuales que la spec 01 no fija:
- Las etiquetas de los campos y la opción «Elige una nave».
- El singular «1 día» de la confirmación, que ya espera V-16.

Desaparecen los encabezados de la tabla actual («Nave», «Clase», «Combustible», «Misiones desde la última revisión», «Estado» y «Aptitud»), porque la flota deja de ser una tabla.

## 2. Archivos de `src/styles/`

| Archivo | Contiene | Ticket |
|---|---|---|
| `tokens.css` | Todos los tokens de DESIGN.md §4, dentro de `:root`. Es el único archivo con colores, fuentes y tamaños literales. | T-08 |
| `base.css` | Tema oscuro, tipografía e interlineado base, utilidades de cifras y `prefers-reduced-motion`. | T-08 |
| `tarjeta-nave.css` | Tarjeta de nave, Insignia de estado, Barra de combustible, Contador de misiones y los estados de cargando y vacío. | T-09 |
| `formularios.css` | Campo de formulario y Botón, con sus estados de foco, error y enviando. | T-10 |
| `avisos.css` | Avisos de éxito y de error. | T-10 |
| `layout.css` | Encabezado, Tablero, Pantalla angosta, Panel y grilla de la flota. | T-11 |

**Cómo se importan:** cada archivo se importa desde `src/main.tsx`, y ningún componente importa CSS. Deben quedar en este orden, para que los tokens estén definidos primero y los componentes se apliquen sobre la base:
1. `tokens.css`
2. `base.css`
3. `layout.css`
4. `formularios.css`
5. `avisos.css`
6. `tarjeta-nave.css`

Cada ticket añade sus importaciones respetando ese orden. **Fuentes:** `index.html` las carga desde Google Fonts, como indica DESIGN.md §4.2, con las mismas familias y pesos que el brand board.

## 3. Criterios

### 3.1 HU-1.2 · Consultar la flota
- **HU-1.2-CA1:** con varias naves registradas, la app DEBE mostrar una Tarjeta de nave por cada una, ordenadas por nombre.
- **HU-1.2-CA2:** cada tarjeta DEBE mostrar nombre, clase, porcentaje de combustible, misiones desde la última revisión junto al máximo, y si la nave está operativa o en reparación.
- **HU-1.2-CA3:** cada tarjeta DEBE mostrar «Apta» o «No apta» en el mismo lugar, y NO DEBE obligar a leer otros datos para conocer la aptitud.
- **HU-1.2-CA4:** una nave no apta DEBE mostrar todos sus motivos, y una nave apta NO DEBE mostrar ninguno.
- **HU-1.2-CA5:** la Barra de combustible DEBE indicar el mínimo, y DEBE distinguir una nave con un 10 % (no lo alcanza) de otra con un 25 % (lo alcanza).
- **HU-1.2-CA6:** una nave con 2 misiones DEBE mostrar «2 de 3» y seguir apta. Una con 3 DEBE mostrar «3 de 3» y NO DEBE seguir apta.
- **HU-1.2-CA7:** una nave en reparación DEBE mostrar la insignia «En reparación» y «No apta» con su motivo. Una nave operativa DEBE mostrar «Operativa» y NO DEBE llevar insignia de estado.
- **HU-1.2-CA8:** la aptitud y el estado DEBEN estar escritos con palabras, y NO DEBEN depender solo de otra señal.
- **HU-1.2-CA9:** sin naves registradas, la app DEBE mostrar «Todavía no hay naves registradas.».
- **HU-1.2-CA10:** durante la primera carga, la app DEBE mostrar «Cargando la flota…» y NO DEBE mostrar el mensaje de flota vacía.
- **HU-1.2-CA11:** si la flota no se puede cargar, la app DEBE mostrar «No se pudo cargar la flota.» y NO DEBE mostrar el mensaje de flota vacía.
- **HU-1.2-CA12:** tras registrar una nave o asignar una misión, la flota DEBE mostrar el cambio sin recargar la página.

### 3.2 Criterios de DESIGN.md
Se aplican los diez, con su texto de DESIGN.md §9. La columna "Cómo se aplica aquí" solo añade lo que esta spec precisa.

| Criterio | Texto | Cómo se aplica aquí | Ticket |
|---|---|---|---|
| D-01 | Ningún archivo de `src/` fuera de `tokens.css` contiene un color hexadecimal. | Sin cambios. | T-08, y se repite en T-11 |
| D-02 | No hay estilos en línea, salvo el ancho de la barra de combustible. | La única coincidencia permitida está en `BarraCombustible.tsx`. | T-08, T-09 y se repite en T-11 |
| D-03 | Cada nave muestra su aptitud con insignia y texto, en la esquina superior derecha de su tarjeta. | Sin cambios. | T-09 |
| D-04 | Una nave no apta muestra sus motivos con los textos de `MENSAJES_MOTIVO`. | Sin cambios. | T-09 |
| D-05 | La barra marca el umbral y se pinta en rojo por debajo de él. | Sin cambios. | T-09 |
| D-06 | El contador muestra «n de 3» y tantas marcas como el máximo del dominio. | Con más misiones que el máximo, se aplica la decisión 3 de la sección 0. | T-09 |
| D-07 | Al recorrer la app con Tab, todo control muestra el foco en cian. | Sin cambios. | T-10 |
| D-08 | Un campo con error tiene borde rojo, mensaje debajo y `aria-invalid="true"`. | El mensaje se enlaza además con `aria-describedby`. | T-10 |
| D-09 | A 1280 px el tablero tiene dos columnas; a 390 px, una, sin scroll horizontal. | Sin cambios. | T-11 |
| D-10 | Los textos visibles coinciden con los de la spec 01. | Se comparan con la spec 01 y con la sección 1.3 de esta spec. | T-11 |

### 3.3 Alcance
- **ALC-01:** ningún ticket de esta spec DEBE modificar `src/dominio/`, `src/services/` ni `supabase/`.
- **ALC-02:** el proyecto NO DEBE añadir dependencias de estilos. `package.json` no cambia.

## 4. Verificación por criterio
Las pruebas en el navegador necesitan los requisitos previos de [docs/VERIFICACION.md](../VERIFICACION.md): `.env.local`, migración aplicada y app arrancada. Las naves al 10 %, en reparación o con cierto número de misiones se preparan como indica esa guía.

| Criterio | Verificación | Qué se comprueba |
|---|---|---|
| HU-1.2-CA1 | Navegador | Registrar tres naves en desorden y verlas ordenadas por nombre. |
| HU-1.2-CA2 | Navegador | Una tarjeta muestra los cinco datos. |
| HU-1.2-CA3 | Navegador | Con naves aptas y no aptas, la aptitud sale en el mismo lugar en todas. |
| HU-1.2-CA4 | Navegador | Una nave con dos motivos los muestra los dos; una apta, ninguno. |
| HU-1.2-CA5 | Navegador | Naves al 10 % y al 25 %. |
| HU-1.2-CA6 | Navegador | Una nave pasa de «2 de 3», apta, a «3 de 3», no apta, al asignarle una misión. |
| HU-1.2-CA7 | Navegador | Una nave con `en_reparacion = true`, puesta desde el panel de Supabase, y otra operativa. |
| HU-1.2-CA8 | Navegador y revisión de código | Los estados llevan texto visible en el DOM, también con los estilos desactivados. |
| HU-1.2-CA9 | Navegador | Con la tabla `naves` vacía. |
| HU-1.2-CA10 | Navegador | Con la red limitada desde las herramientas de desarrollo, en la primera carga. |
| HU-1.2-CA11 | Navegador | Con la red desconectada desde las herramientas de desarrollo, al cargar. |
| HU-1.2-CA12 | Navegador | Registrar una nave y asignar una misión, sin recargar. |
| D-01 | Comando | `grep -rnE "#[0-9a-fA-F]{3,8}\b" src --include=*.css --include=*.tsx` solo lista `tokens.css`. |
| D-02 | Comando | `grep -rn "style={" src` solo lista el relleno de `BarraCombustible.tsx`. |
| D-03 | Navegador | La insignia está arriba a la derecha en cada tarjeta. |
| D-04 | Navegador | Los motivos coinciden con `MENSAJES_MOTIVO`. |
| D-05 | Navegador y revisión de código | Naves al 10 % y al 25 %; el umbral se importa de `aptitud.ts`. |
| D-06 | Navegador y revisión de código | «n de 3» y tres marcas; el máximo se importa de `aptitud.ts`. |
| D-07 | Navegador | Recorrer toda la app solo con Tab. |
| D-08 | Navegador e inspector | Enviar un formulario vacío y revisar el borde, el mensaje, `aria-invalid` y `aria-describedby`. |
| D-09 | Navegador | Modo responsive a 1280 px y a 390 px. |
| D-10 | Navegador | Recorrer [docs/VERIFICACION.md](../VERIFICACION.md) y la sección 1.3 de esta spec. |
| ALC-01 | Comando | `git diff HEAD --name-only -- src/dominio src/services supabase` no lista nada antes de cada commit. |
| ALC-02 | Comando | `git diff HEAD --name-only -- package.json package-lock.json` no lista nada antes de cada commit. |

### Resultados
Cada ticket anota aquí el resultado de las filas que le corresponden, con su fecha.

**T-08, comandos (2026-11-04):**
- `npm test`: 45 de 45 pasan. `npm run build`: compila sin errores.
- D-01: los hexadecimales solo aparecen en `tokens.css`. D-02: sin estilos en línea.
- ALC-01 y ALC-02: sin cambios en esas rutas.

**T-08, navegador (2026-11-04):** confirmado por el usuario, sin detalle por punto.

**T-09, comandos (2026-11-04):**
- `npm test`: 45 de 45 pasan. `npm run build`: compila sin errores.
- D-01: los hexadecimales solo aparecen en `tokens.css`. D-02: solo aparece el relleno de `BarraCombustible.tsx`.
- D-05 y D-06, revisión de código: el umbral y el máximo se importan de `aptitud.ts`.
- ALC-01 y ALC-02: sin cambios en esas rutas.

**T-09, navegador (2026-11-04):** HU-1.2-CA1 a CA10 y CA12, y D-03 a D-06, confirmados por el usuario, sin detalle por criterio.

**T-10, comandos (2026-11-04):**
- `npm test`: 45 de 45 pasan. `npm run build`: compila sin errores.
- D-01: los hexadecimales solo aparecen en `tokens.css`. D-02: solo aparece el relleno de `BarraCombustible.tsx`.
- ALC-01 y ALC-02: sin cambios en esas rutas.

**T-10, navegador (2026-11-04):** HU-1.2-CA11, D-07 y D-08 confirmados por el usuario, sin detalle por criterio.

**T-11, comandos (2026-11-04):**
- `npm test`: 45 de 45 pasan. `npm run build`: compila sin errores.
- D-01: los hexadecimales solo aparecen en `tokens.css`. D-02: solo aparece el relleno de `BarraCombustible.tsx`.
- ALC-01 y ALC-02: sin cambios en esas rutas.

**T-11, D-09 medido en Chrome (2026-11-04):** con emulación del ancho y datos reales, solo de lectura. Sin scroll horizontal y sin elementos fuera de la ventana en ningún ancho.
- 1280 px: tablero de dos columnas; flota de dos.
- 900 px: tablero de dos columnas; flota de una.
- 899 px: tablero de una columna; flota de tres.
- 390 px: tablero de una columna; flota de una.

**T-11, navegador (2026-11-04):** pantalla completa, incluidos D-09 y D-10, confirmada por el usuario, sin detalle por criterio. La columna "Resultado obtenido" de `docs/VERIFICACION.md` sigue sin rellenar, así que esta confirmación no cierra T-04 ni T-07.

## 5. Tickets

### T-08 · Tokens, base y fuentes
- **Tipo:** Configuración.
- **Dependencias:** esta spec.
- **Definition of Done:**
  - [x] `tokens.css` define todos los tokens de DESIGN.md §4, con sus nombres exactos.
  - [x] `index.html` carga las tres familias de IBM Plex con `display=swap`.
  - [x] La página usa el fondo, el texto y las fuentes base, y desactiva las transiciones con `prefers-reduced-motion`.
  - [x] D-01 y D-02 pasan: los hexadecimales solo aparecen en `tokens.css` y no hay estilos en línea.
  - [x] `npm test` y `npm run build` pasan.

### T-09 · Tarjeta de nave
- **Tipo:** Interfaz.
- **Dependencias:** T-08.
- **Definition of Done:**
  - [x] HU-1.2-CA1 a CA10 y CA12 se comprueban en el navegador y quedan anotados en esta spec.
  - [x] D-03, D-04, D-05 y D-06 pasan.
  - [x] El umbral y el máximo se importan de `src/dominio/aptitud.ts`; ningún componente escribe esos valores a mano.
  - [x] El único `style={` de `src/` es el ancho del relleno de la barra (D-02).
  - [x] `npm test` y `npm run build` pasan.

### T-10 · Formularios y avisos
- **Tipo:** Interfaz.
- **Dependencias:** T-08.
- **Definition of Done:**
  - [x] HU-1.2-CA11 se comprueba en el navegador y queda anotado en esta spec.
  - [x] D-07 y D-08 pasan.
  - [x] Cada campo con error enlaza su mensaje con `aria-describedby`.
  - [x] El botón deshabilitado al enviar conserva su texto y su ancho.
  - [x] `npm test` y `npm run build` pasan.

### T-11 · Layout del tablero
- **Tipo:** Interfaz.
- **Dependencias:** T-09 y T-10.
- **Definition of Done:**
  - [x] D-09 pasa a 1280 px y a 390 px.
  - [x] D-01, D-02 y D-10 pasan sobre la pantalla completa.
  - [x] La tabla de verificación de esta spec tiene anotado el resultado de todas sus filas. *(Las de navegador, como confirmación general del usuario, sin detalle por criterio.)*
  - [x] `npm test` y `npm run build` pasan.

## 6. Tickets y archivos
Ningún ticket toca `src/dominio/`, `src/services/` ni `supabase/`. Los componentes solo importan constantes y funciones que ya existen en `src/dominio/aptitud.ts`.

| Ticket | Crea | Modifica |
|---|---|---|
| T-08 · Tokens, base y fuentes | `src/styles/tokens.css`, `src/styles/base.css` | `index.html`, `src/main.tsx` |
| T-09 · Tarjeta de nave | `src/styles/tarjeta-nave.css`, `src/components/TarjetaNave.tsx`, `src/components/InsigniaEstado.tsx`, `src/components/BarraCombustible.tsx`, `src/components/ContadorMisiones.tsx` | `src/components/ListaNaves.tsx`, `src/main.tsx` |
| T-10 · Formularios y avisos | `src/styles/formularios.css`, `src/styles/avisos.css` | `src/components/FormularioNave.tsx`, `src/components/FormularioMision.tsx`, `src/components/ListaNaves.tsx` (solo el error de carga), `src/main.tsx` |
| T-11 · Layout del tablero | `src/styles/layout.css` | `src/App.tsx`, `src/main.tsx` |

Cada ticket anota además sus resultados en esta spec.

## Pendientes
1. **Contador por encima del máximo:** falta que el cliente confirme la decisión 3 de la sección 0.
2. **Verificación de T-04 y T-07:** T-09 cambia cómo se ve la flota. Los resultados de `docs/VERIFICACION.md` anotados antes de T-09 no cubren la pantalla nueva. Esa guía habla de «0 misiones», y tras T-09 se leerá como «0 de 3».
3. **Criterios sin confirmar:** los criterios de HU-1.2 se redactaron a partir del PRD y de DESIGN.md. El cliente aún no los ha revisado.
