# E1 · Flota y misiones — Historias de usuario

Épica: [docs/backlog/epicas.md](epicas.md). PRD: [docs/prd/hangar-mvp.md](../prd/hangar-mvp.md).
Rol único: jefe de hangar (todos tienen el mismo permiso).

## Historias del MVP

### HU-1.1 · Registrar una nave
**Estado:** refinada.

Como jefe de hangar, quiero registrar una nave nueva del hangar, para que quede en la flota y podamos asignarle misiones.
- **Alcance PRD:** A1 (registrar naves).
- **Nota:** según el supuesto del PRD, la nave se registra con su combustible actual y el contador de misiones a cero. Anotar el combustible es parte de E2; aquí solo se recoge el valor inicial.
- **Reglas del PRD que aplican:** R1 (aptitud) y los supuestos de combustible en porcentaje de 0 a 100 y de contador inicial a cero.
- **Decisiones del cliente:**
  - El nombre, la clase y el combustible son obligatorios.
  - El nombre no se puede repetir.
  - La clase es exploradora, carguera o transporte.

#### Criterios de aceptación
1. **Registro correcto**
   - DADO que estoy en la flota,
   - CUANDO registro una nave con un nombre nuevo, la clase carguera y un 60 % de combustible,
   - ENTONCES la nave aparece en la flota con su nombre, clase carguera, 60 % de combustible, 0 misiones desde la última revisión, fuera de dique seco, sin misiones pendientes y como apta.
2. **Clases disponibles**
   - DADO que estoy registrando una nave,
   - CUANDO elijo la clase,
   - ENTONCES solo puedo elegir entre exploradora, carguera y transporte.
3. **Exactamente un cuarto de tanque (R1)**
   - DADO que estoy en la flota,
   - CUANDO registro una nave con un 25 % de combustible,
   - ENTONCES la nave aparece como apta.
4. **Poco combustible (R1)**
   - DADO que estoy en la flota,
   - CUANDO registro una nave con un 10 % de combustible,
   - ENTONCES la nave queda registrada, pero aparece como no apta por falta de combustible.
5. **Sin nombre**
   - DADO que estoy registrando una nave,
   - CUANDO intento guardarla sin nombre,
   - ENTONCES la app no la registra y me avisa de que falta el nombre.
6. **Sin clase**
   - DADO que estoy registrando una nave,
   - CUANDO intento guardarla sin elegir una clase,
   - ENTONCES la app no la registra y me avisa de que falta la clase.
7. **Sin combustible anotado**
   - DADO que estoy registrando una nave,
   - CUANDO intento guardarla sin indicar el combustible,
   - ENTONCES la app no la registra y me avisa de que falta el combustible.
8. **Combustible fuera de rango**
   - DADO que estoy registrando una nave,
   - CUANDO indico un combustible menor que 0 % o mayor que 100 %,
   - ENTONCES la app no la registra y me avisa de que el valor debe estar entre 0 y 100.
9. **Nombre repetido**
   - DADO que ya existe en la flota una nave llamada "Aurora",
   - CUANDO intento registrar otra nave llamada "Aurora",
   - ENTONCES la app no la registra y me avisa de que ese nombre ya está en uso.

#### Casos borde sin cubrir
- Nombres que solo se diferencian en mayúsculas o espacios ("Aurora", "aurora", "Aurora "): ¿cuentan como el mismo nombre?
- Un nombre formado solo por espacios: ¿cuenta como "sin nombre"?
- Combustible con decimales (por ejemplo, 24,9 %): ¿se acepta y cómo se compara con el umbral del 25 %?
- Registrar una nave con el tanque al 0 %: ¿se acepta o se rechaza?
- Dos jefes registran a la vez una nave con el mismo nombre desde pantallas distintas.
- ¿Se puede registrar una nave que entra directamente en dique seco, o siempre se registra fuera de él?

### HU-1.2 · Consultar la flota
**Estado:** refinada.

Como jefe de hangar, quiero ver la lista de todas las naves registradas, para saber con qué naves cuenta el hangar.
- **Alcance PRD:** A4. La regla de aptitud y sus motivos pertenecen a E2, pero ya se adelantaron en T-02 y T-03; esta historia define lo que el jefe ve y distingue en la flota.
- **Reglas del PRD que aplican:** R1 (aptitud), R3 (asignar suma al contador) y R6 (dique seco).
- **Spec:** [docs/specs/02-interfaz-flota.md](../specs/02-interfaz-flota.md).

#### Criterios de aceptación
1. **Todas las naves**
   - DADO que hay varias naves registradas,
   - CUANDO abro la flota,
   - ENTONCES veo una entrada por cada nave, ordenadas por nombre.
2. **Datos de cada nave**
   - DADO una nave registrada,
   - CUANDO la busco en la flota,
   - ENTONCES veo su nombre, su clase, su porcentaje de combustible, sus misiones desde la última revisión junto al máximo permitido y si está operativa o en reparación.
3. **Aptitud de un vistazo**
   - DADO una flota con naves aptas y no aptas,
   - CUANDO la recorro con la vista,
   - ENTONCES cada nave indica "Apta" o "No apta" en el mismo lugar, sin que tenga que leer el resto de sus datos.
4. **Motivos de una nave no apta**
   - DADO una nave no apta por uno o varios motivos,
   - CUANDO la miro en la flota,
   - ENTONCES veo todos sus motivos escritos; una nave apta no muestra ninguno.
5. **Combustible frente al mínimo**
   - DADO una nave con un 10 % de combustible y otra con un 25 %,
   - CUANDO las comparo,
   - ENTONCES veo dónde está el mínimo y distingo que la primera no lo alcanza y que la segunda sí.
6. **Misiones frente al máximo**
   - DADO una nave con 2 misiones desde la última revisión y otra con 3,
   - CUANDO las comparo,
   - ENTONCES veo "2 de 3" en la primera, que sigue apta, y "3 de 3" en la segunda, que ya no lo está.
7. **Nave en reparación**
   - DADO una nave en dique seco y otra fuera de él,
   - CUANDO las comparo,
   - ENTONCES la primera destaca como "En reparación" y aparece como no apta con ese motivo, y la segunda indica "Operativa" sin destacar.
8. **Estados escritos**
   - DADO cualquier nave de la flota,
   - CUANDO leo su aptitud y su estado,
   - ENTONCES los dos están escritos con palabras y no tengo que interpretar ninguna otra señal para entenderlos.
9. **Flota vacía**
   - DADO que no hay ninguna nave registrada,
   - CUANDO abro la flota,
   - ENTONCES la app me avisa de que todavía no hay naves.
10. **Flota cargando**
    - DADO que la flota aún no ha terminado de cargar por primera vez,
    - CUANDO la miro,
    - ENTONCES la app me indica que está cargando y no me dice que no hay naves.
11. **Error al cargar**
    - DADO que la flota no se puede cargar,
    - CUANDO abro la pantalla,
    - ENTONCES la app me avisa del error y no me dice que no hay naves.
12. **Flota al día tras una acción propia**
    - DADO que tengo la flota a la vista,
    - CUANDO registro una nave o le asigno una misión,
    - ENTONCES la flota muestra el cambio sin que recargue la página.

#### Casos borde sin cubrir
- **Más misiones que el máximo:** una nave puede superar el máximo por datos cargados a mano o por dos asignaciones simultáneas. La spec 02 define provisionalmente cómo se muestra, a falta de que lo confirme el cliente.
- **Cambios de otro jefe:** la flota no se actualiza sola con lo que hace otro jefe; hay que recargar la página para verlo.
- **Combustible sin actualizar:** hasta que exista E2, una nave puede seguir como "Apta" después de volar, porque su combustible no cambia desde la app.
- **Flota muy grande:** no se ha decidido si hace falta buscar, filtrar o paginar. El PRD no lo pide.
- **Fallo parcial:** si se cargan las naves pero falla el conteo de una sola, la app muestra el error de toda la flota.

### HU-1.3 · Asignar una misión a una nave apta
**Estado:** refinada.

Como jefe de hangar, quiero asignar una misión a una nave, y que la app lo impida si la nave no es apta, para que ninguna nave no apta salga a misión.
- **Alcance PRD:** A2 (asignar misiones con bloqueo). **Reglas:** R2.
- **Depende de:** la regla de aptitud R1 (E2).
- **Punto abierto que la afecta:** si una nave puede tener dos misiones con fechas superpuestas.
- **Reglas del PRD que aplican:** R1 (aptitud), R2 (no se asigna a una nave no apta), R3 (asignar suma al contador) y R6 (una nave en dique seco no recibe misiones).
- **Decisiones del cliente:**
  - Una misión necesita nave, destino, fecha de despegue y duración.
  - La fecha de despegue puede ser hoy, pero no anterior.
  - La duración es un número entero de días, como mínimo 1.
  - Una nave en reparación no recibe misiones.

#### Criterios de aceptación
1. **Asignación a una nave apta (R2)**
   - DADO una nave con un 60 % de combustible, 1 misión asignada desde la última revisión y fuera de dique seco,
   - CUANDO le asigno una misión con destino, fecha de despegue mañana y duración de 5 días,
   - ENTONCES la misión aparece como pendiente de esa nave, con su destino, fecha y duración.
2. **Asignar suma al contador (R3)**
   - DADO una nave apta con 2 misiones asignadas desde la última revisión,
   - CUANDO le asigno una misión válida,
   - ENTONCES la nave pasa a mostrar 3 misiones desde la última revisión y deja de estar apta.
3. **Última misión permitida (R1)**
   - DADO una nave con 2 misiones asignadas desde la última revisión y el resto de condiciones en regla,
   - CUANDO le asigno una misión válida,
   - ENTONCES la app la acepta.
4. **Límite de misiones alcanzado (R1, R2)**
   - DADO una nave con 3 misiones asignadas desde la última revisión,
   - CUANDO intento asignarle una misión,
   - ENTONCES la app no la asigna y me indica que la nave necesita revisión.
5. **Combustible insuficiente (R1, R2)**
   - DADO una nave con un 24 % de combustible,
   - CUANDO intento asignarle una misión,
   - ENTONCES la app no la asigna y me indica que el combustible es insuficiente.
6. **Combustible justo en el límite (R1)**
   - DADO una nave con un 25 % de combustible y el resto de condiciones en regla,
   - CUANDO le asigno una misión válida,
   - ENTONCES la app la acepta.
7. **Nave en reparación (R6, R2)**
   - DADO una nave en dique seco, aunque tenga combustible y pocas misiones,
   - CUANDO intento asignarle una misión,
   - ENTONCES la app no la asigna y me indica que la nave está en reparación.
8. **Varios motivos a la vez**
   - DADO una nave con poco combustible y 3 misiones desde la última revisión,
   - CUANDO intento asignarle una misión,
   - ENTONCES la app no la asigna y me indica los dos motivos, no solo uno.
9. **Datos obligatorios de la misión**
   - DADO que estoy asignando una misión,
   - CUANDO intento guardarla sin nave, sin destino, sin fecha de despegue o sin duración,
   - ENTONCES la app no la asigna y me avisa de qué dato falta.
10. **Despegue hoy**
    - DADO una nave apta,
    - CUANDO le asigno una misión con fecha de despegue hoy,
    - ENTONCES la app la acepta.
11. **Despegue en el pasado**
    - DADO una nave apta,
    - CUANDO intento asignarle una misión con fecha de despegue ayer,
    - ENTONCES la app no la asigna y me avisa de que la fecha no puede ser anterior a hoy.
12. **Duración mínima**
    - DADO una nave apta,
    - CUANDO le asigno una misión de 1 día,
    - ENTONCES la app la acepta.
13. **Duración no válida**
    - DADO una nave apta,
    - CUANDO intento asignarle una misión de 0 días, de días negativos o de 2,5 días,
    - ENTONCES la app no la asigna y me avisa de que la duración debe ser un número entero de días, como mínimo 1.

#### Casos borde sin cubrir
- **Fechas superpuestas (punto abierto del PRD):** no está decidido si una nave puede tener dos misiones cuyas fechas se solapen.
- **Qué día es "hoy":** si los jefes trabajan en turnos de noche o en zonas horarias distintas, hay que acordar con qué reloj se decide que una fecha ya pasó.
- **Pantalla desactualizada:** la nave era apta cuando la vi, pero otro jefe la puso en dique seco antes de que yo confirmara. ¿La app vuelve a comprobar la aptitud al confirmar?
- **Dos jefes asignando a la vez** una misión a la misma nave.
- **Misión repetida:** ¿se puede asignar a la misma nave dos misiones con el mismo destino y la misma fecha?
- **Fecha de despegue muy lejana:** ¿hay un máximo, o una misión puede programarse para dentro de años?
- **Combustible para la misión:** una nave al 25 % es apta aunque la misión vaya a consumir más. Es un riesgo aceptado, porque el cálculo de consumo está fuera de alcance, pero conviene dejarlo explícito con el cliente.

### HU-1.4 · Ver las misiones pendientes de una nave
**Estado:** por refinar.

Como jefe de hangar, quiero ver las misiones pendientes de cada nave, para saber qué tiene asignado antes de darle otra misión o completarla.
- **Alcance PRD:** A2 (necesaria para gestionar las misiones asignadas).

### HU-1.5 · Completar una misión
**Estado:** por refinar.

Como jefe de hangar, quiero marcar una misión pendiente como completada, para dejar constancia de que la nave volvió y anotar el combustible que le queda.
- **Alcance PRD:** A2 (marcar como completadas). **Reglas:** R4. La misión ya sumó al contador al asignarse (R3), así que completarla no lo cambia.
- **Nota:** anotar el combustible restante al completar es obligatorio (R4), pero esa parte pertenece a E2. Las dos historias tienen que salir juntas.

## Historias fuera de alcance
Se dejan anotadas para no perderlas, pero no entran en el MVP.

### HU-1.6 · Cancelar una misión — fuera de alcance
Como jefe de hangar, quiero cancelar una misión pendiente, para liberar la nave si la misión ya no se va a hacer.
- **Motivo:** el PRD asume que una misión solo puede estar pendiente o completada, sin misiones canceladas ([SUPUESTO]).

### HU-1.7 · Editar o dar de baja una nave — fuera de alcance
Como jefe de hangar, quiero corregir los datos de una nave o darla de baja, para que la flota refleje la realidad.
- **Motivo:** el alcance del PRD no lo incluye. Si se necesita para corregir errores de registro, habría que añadirlo al PRD.

### HU-1.8 · Asignar tripulación a una misión — fuera de alcance
Como jefe de hangar, quiero asignar tripulantes a una misión, para saber quién va a bordo.
- **Motivo:** la tripulación es no-alcance explícito (la gestiona el Centro de Comando).

### HU-1.9 · Consultar el historial de misiones — pendiente de decisión
Como jefe de hangar, quiero ver las misiones completadas de una nave, para revisar su actividad pasada.
- **Motivo:** el PRD tiene abierto si hace falta conservar el historial. No entra en el MVP hasta que se decida.

## Tickets del sprint
Historias del sprint: HU-1.1 y HU-1.3. Según AGENTS.md, ninguna funcionalidad se implementa sin spec, así que antes de T-02 tiene que existir en `docs/specs/` la spec de las dos historias. HU-1.2 y la interfaz de los formularios se añadieron después, con los tickets T-08 a T-11 y la spec `docs/specs/02-interfaz-flota.md`.

### HU-1.1 · Registrar una nave

#### T-01 · Preparar el proyecto
**Estado:** hecho.

- **Historia:** HU-1.1 (también la necesita HU-1.3).
- **Tipo:** Configuración.
- **Descripción:** crear el proyecto con su stack, los tests y el formato, y dejar listo en `src/lib/supabase.ts` el cliente de Supabase. El cliente lee la URL y la clave pública desde variables de entorno.
- **Definition of Done:**
  - [x] `npm run dev` arranca la app vacía.
  - [x] `npm test` se ejecuta y pasa al menos un test de prueba.
  - [x] `npm run build` compila sin errores.
  - [x] Prettier está configurado y el código está formateado.
  - [x] El cliente de Supabase usa solo la clave pública y no hay claves escritas en el código.
  - [x] Existen las carpetas previstas en AGENTS.md.
- **Dependencias:** ninguna.

#### T-02 · Reglas de la nave: registro y aptitud
**Estado:** hecho.

- **Historia:** HU-1.1.
- **Tipo:** Modelo/Dominio.
- **Descripción:** en `src/types/` y `src/dominio/`, definir la nave y sus tres clases, y escribir dos funciones puras:
  - una que valide los datos de registro (nombre, clase y combustible entre 0 y 100);
  - una que calcule si la nave está apta y por qué motivos no (R1).
- **Nota:** la aptitud es una regla de E2, pero aquí se adelanta lo mínimo, porque HU-1.1 la muestra y HU-1.3 la usa para bloquear.
- **Definition of Done:**
  - [x] Hay tests unitarios para cada regla de validación, incluidos los límites (0 %, 100 %, valores fuera de rango, nombre o clase vacíos).
  - [x] Hay tests de aptitud en los límites (25 % y 24 %; 2 y 3 misiones; dentro y fuera de dique seco) y para varios motivos a la vez.
  - [x] Ningún tipo usa `any`.
  - [x] `npm test` pasa.
- **Dependencias:** T-01 y la spec de HU-1.1.

#### T-03 · Guardar y mostrar naves
**Estado:** pendiente: el código está hecho, pero falta verificar en el navegador lo que se ve en pantalla.

- **Historia:** HU-1.1.
- **Tipo:** Datos/Interfaz.
- **Descripción:** añadir la migración de naves y misiones, y un servicio en `src/services/` para registrar y listar naves. Añadir también la función que cuenta las misiones de una nave desde su última revisión, porque la lista la necesita para mostrar la aptitud. Añadir también un componente con el formulario de registro y la lista de naves, que muestre si cada nave está apta usando T-02.
- **Definition of Done:**
  - [x] La migración está en `supabase/migraciones/`, en snake_case, e impide nombres repetidos.
  - [x] Solo el servicio llama a Supabase; el componente no.
  - [ ] El formulario muestra el aviso de cada dato que falta o no es válido, y el de nombre repetido. *(Implementado; sin verificar en el navegador.)*
  - [ ] Una nave nueva aparece en la lista con su clase, su combustible, 0 misiones, fuera de dique seco y su aptitud. *(Implementado; sin verificar en el navegador.)*
  - [x] `npm test` y `npm run build` pasan.
- **Dependencias:** T-02.
- **Bloqueado en parte por:** si "Aurora" y "aurora " cuentan como el mismo nombre (caso borde abierto).

#### T-04 · Verificar los criterios de HU-1.1
**Estado:** pendiente: faltan los resultados del navegador en `docs/VERIFICACION.md`.

- **Historia:** HU-1.1.
- **Tipo:** Test.
- **Descripción:** comprobar los 9 criterios de aceptación de HU-1.1, con tests automáticos donde se pueda y con una prueba manual en pantalla para el resto.
- **Definition of Done:**
  - [ ] Cada criterio (1–9) tiene un test o una prueba manual anotada con su resultado. *(CA3 a CA8 tienen test; CA1, CA2 y CA9 no tienen resultado anotado.)*
  - [ ] Los criterios 1, 3 y 4 (aptitud visible) se comprueban en la pantalla.
  - [x] `npm test` y `npm run build` pasan.
- **Dependencias:** T-03.

### HU-1.3 · Asignar una misión a una nave apta

#### T-05 · Reglas de la misión y de la asignación
**Estado:** hecho.

- **Historia:** HU-1.3.
- **Tipo:** Modelo/Dominio.
- **Descripción:** en `src/types/` y `src/dominio/`, definir la misión y escribir una función pura que decida si se puede asignar. Comprueba los datos obligatorios, que la fecha no sea anterior a hoy y que la duración sea un entero de 1 o más. Además, usa la aptitud de T-02 y devuelve todos los motivos de rechazo.
- **Definition of Done:**
  - [x] Hay tests de datos que faltan, de fecha hoy y ayer, y de duración 1, 0, negativa y decimal.
  - [x] Hay tests de rechazo por aptitud, y uno que comprueba que se devuelven varios motivos a la vez. *(Están en `aptitud.test.ts`. La combinación de validación y aptitud vive en `misionesService.crear`, que no tiene test unitario.)*
  - [x] "Hoy" se recibe como parámetro, para que los tests no dependan del reloj.
  - [x] Ningún tipo usa `any` y `npm test` pasa.
- **Dependencias:** T-02 y la spec de HU-1.3.
- **Bloqueado en parte por:** con qué reloj se decide qué día es "hoy" (caso borde abierto).

#### T-06 · Guardar la misión y mostrar el resultado
**Estado:** pendiente: el código está hecho, pero falta verificar en el navegador lo que se ve en pantalla y lo que queda guardado.

- **Historia:** HU-1.3.
- **Tipo:** Datos/Interfaz.
- **Descripción:** añadir un servicio que asigne misiones a una nave. La migración de misiones se adelanta a T-03 (ver la spec 01). En este sprint las misiones no tienen estado: el estado llegará con HU-1.5. El servicio vuelve a comprobar la aptitud con los datos actuales antes de guardar. Añadir también un componente con el formulario de asignación, que muestre la misión pendiente o los motivos de rechazo.
- **Definition of Done:**
  - [x] Solo el servicio llama a Supabase.
  - [ ] Al asignar una misión, el contador de misiones de la nave sube en 1 (R3). *(Sin verificar: V-17.)*
  - [ ] Una asignación rechazada no deja ninguna misión guardada. *(En el código, `crear` vuelve antes de insertar; falta comprobarlo en Supabase.)*
  - [ ] La pantalla muestra la misión pendiente con su destino, fecha y duración, o todos los motivos de rechazo. *(Sin verificar: V-10, V-11 y V-20.)*
  - [x] `npm test` y `npm run build` pasan.
- **Dependencias:** T-03 y T-05.

#### T-07 · Verificar los criterios de HU-1.3
**Estado:** pendiente: faltan los resultados del navegador en `docs/VERIFICACION.md`.

- **Historia:** HU-1.3.
- **Tipo:** Test.
- **Descripción:** comprobar los 13 criterios de aceptación de HU-1.3, con tests automáticos donde se pueda y con una prueba manual en pantalla para el resto.
- **Definition of Done:**
  - [ ] Cada criterio (1–13) tiene un test o una prueba manual anotada con su resultado. *(CA3 a CA6 y CA8 a CA13 tienen test; CA1, CA2 y CA7 no tienen resultado anotado.)*
  - [ ] La prueba manual incluye una nave en dique seco y una con 3 misiones, preparadas a mano porque esas funciones son de E2.
  - [x] `npm test` y `npm run build` pasan.
- **Dependencias:** T-06.

### HU-1.2 · Consultar la flota, e interfaz de los formularios
Detalle, criterios y archivos en la [spec 02](../specs/02-interfaz-flota.md). Ningún ticket toca `src/dominio/`, `src/services/` ni `supabase/`.

#### T-08 · Tokens, base y fuentes
**Estado:** hecho, según los resultados de la spec 02. La pantalla tiene una confirmación general del usuario, sin resultado por fila en `docs/VERIFICACION-UI.md`.

- **Historia:** HU-1.2 y formularios existentes.
- **Tipo:** Configuración.
- **Descripción:** crear los tokens y los estilos base de DESIGN.md, cargar las fuentes e importar los estilos desde `src/main.tsx`.
- **Definition of Done:**
  - [x] `tokens.css` define todos los tokens de DESIGN.md §4, con sus nombres exactos.
  - [x] `index.html` carga las tres familias de IBM Plex con `display=swap`.
  - [x] La página usa el fondo, el texto y las fuentes base, y desactiva las transiciones con `prefers-reduced-motion`. *(Confirmación general del usuario.)*
  - [x] D-01 y D-02 pasan: los hexadecimales solo aparecen en `tokens.css` y no hay estilos en línea.
  - [x] `npm test` y `npm run build` pasan.
- **Dependencias:** spec 02.

#### T-09 · Tarjeta de nave
**Estado:** hecho, según los resultados de la spec 02. La pantalla tiene una confirmación general del usuario, sin resultado por fila en `docs/VERIFICACION-UI.md`.

- **Historia:** HU-1.2.
- **Tipo:** Interfaz.
- **Descripción:** sustituir la tabla de la flota por una lista de tarjetas de nave, con su insignia, su barra de combustible, su contador de misiones y sus motivos, y dar estilo a los estados de cargando y vacío.
- **Definition of Done:**
  - [x] HU-1.2-CA1 a CA10 y CA12 se comprueban en el navegador y quedan anotados en la spec 02. *(Confirmación general del usuario, sin detalle por criterio.)*
  - [x] D-03, D-04, D-05 y D-06 pasan. *(Confirmación general del usuario.)*
  - [x] El umbral y el máximo se importan de `src/dominio/aptitud.ts`; ningún componente escribe esos valores a mano.
  - [x] El único `style={` de `src/` es el ancho del relleno de la barra (D-02).
  - [x] `npm test` y `npm run build` pasan.
- **Dependencias:** T-08.

#### T-10 · Formularios y avisos
**Estado:** hecho, según los resultados de la spec 02. La pantalla tiene una confirmación general del usuario, sin resultado por fila en `docs/VERIFICACION-UI.md`.

- **Historia:** formularios de HU-1.1 y HU-1.3; aviso de error de HU-1.2.
- **Tipo:** Interfaz.
- **Descripción:** aplicar el campo de formulario, el botón y los avisos de DESIGN.md a los dos formularios y al error de carga de la flota, sin cambiar su comportamiento ni sus textos.
- **Definition of Done:**
  - [x] HU-1.2-CA11 se comprueba en el navegador y queda anotado en la spec 02. *(Confirmación general del usuario, sin detalle por criterio.)*
  - [x] D-07 y D-08 pasan. *(Confirmación general del usuario.)*
  - [x] Cada campo con error enlaza su mensaje con `aria-describedby`.
  - [x] El botón deshabilitado al enviar conserva su texto y su ancho. *(Confirmación general del usuario.)*
  - [x] `npm test` y `npm run build` pasan.
- **Dependencias:** T-08.

#### T-11 · Layout del tablero
**Estado:** hecho, según los resultados de la spec 02. La pantalla tiene una confirmación general del usuario, sin resultado por fila en `docs/VERIFICACION-UI.md` ni en `docs/VERIFICACION.md`.

- **Historia:** HU-1.2 y formularios existentes.
- **Tipo:** Interfaz.
- **Descripción:** montar el encabezado, los paneles y el tablero de DESIGN.md §5, con la grilla de la flota y la versión de una columna.
- **Definition of Done:**
  - [x] D-09 pasa a 1280 px y a 390 px.
  - [x] D-01, D-02 y D-10 pasan sobre la pantalla completa. *(D-01 y D-02, por comando; D-10, por confirmación general del usuario.)*
  - [x] La tabla de verificación de la spec 02 tiene anotado el resultado de todas sus filas. *(Las de navegador, como confirmación general del usuario; 37 de 39 filas de `docs/VERIFICACION-UI.md` siguen vacías.)*
  - [x] `npm test` y `npm run build` pasan.
- **Dependencias:** T-09 y T-10.

### Orden de ejecución sugerido
1. **Antes de empezar:** la spec de HU-1.1 y HU-1.3 en `docs/specs/`.
2. **T-01:** preparar el proyecto.
3. **T-02:** reglas de la nave y aptitud. Las dos historias dependen de él.
4. **T-03 y T-05 en paralelo.** No dependen entre sí.
5. **T-04:** verificar HU-1.1. Así queda cerrada la primera historia.
6. **T-06:** guardar y mostrar la misión.
7. **T-07:** verificar HU-1.3.
8. **T-08:** tokens, base y fuentes.
9. **T-09 y T-10 en paralelo.** Solo coinciden en `src/components/ListaNaves.tsx` y en la lista de importaciones de `src/main.tsx`.
10. **T-11:** layout del tablero y comprobación final.

Para preparar las naves de prueba de T-07, hace falta cambiar a mano el contador de misiones y el dique seco, porque las pantallas que hacen eso son de E2.
