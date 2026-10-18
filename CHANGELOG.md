# Cambios

Lo que cambia en Calcita en cada versión. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y las versiones, [SemVer](https://semver.org/lang/es/): mientras sea 0.x, cada versión con funciones nuevas sube el
número de en medio (0.9.0 → 0.10.0 → 0.11.0) y cada arreglo, el último.

## [0.21.0] - 2026-10-18

### Agregado

- En el teléfono con vidrio, «Más» → «Editar la barra»: cada quien elige qué pantallas van en la barra de pestañas (hasta
  4, en el orden del menú), se recuerda en su navegador y «Como venía» regresa a las del proyecto. Solo se puede fijar lo
  que la persona puede ver.
- La barra de arriba en cápsulas, como las ventanas de macOS Tahoe, ya es la de omisión con vidrio y con el minimalista:
  sin franja, la ☰ con el nombre, el menú y la cuenta en cápsulas y el título suelto. Con vidrio, cápsulas de vidrio y el
  contenido pasando por debajo, desenfocado en la orilla (`scrollEdgeStylesOf`); con el minimalista, bloques del tono de
  las tarjetas, también en el teléfono. Con cápsulas, el menú encogido ya no se funde con la barra: la cuenta y los
  ajustes se quedan arriba. La franja se pide con `createToolkitTheme({bar: TOP_BAR.band})`. En los ejemplos se elige en
  el menú de la cuenta y en el configurador de tema, y su código la trae.
- El minimalista con cápsulas también lleva en el teléfono la barra de pestañas de abajo (con «Más», «Editar la barra» y
  la cápsula chica al bajar), sólida y del gris 5 de Apple para que no se pierda sobre las tarjetas. Con la franja sigue
  la barra de arriba con su cajón. La regla vive en un solo lugar (`usesMobileTabBar`) y la siguen los avisos que flotan
  encima de esa barra.

### Corregido

- Ejemplos: los colores, las esquinas y la barra del configurador se guardaban al abrir la página aunque nadie eligiera
  nada, y lo de fábrica de ese día tapaba lo de fábrica nuevo. Ahora se guardan solo cuando la persona los cambia.

## [0.20.0] - 2026-10-18

### Agregado

- Claro u oscuro tiene «Automático» en el menú de la cuenta: sigue lo que diga el equipo (es lo de omisión) y es la forma
  de volver a seguirlo después de picar el botón de la barra, que sigue con dos estados.
- En el teléfono con vidrio, la barra de pestañas se encoge al leer hacia abajo (queda una cápsula chica con la pestaña de
  ahorita y la cuenta más chica) y regresa al subir o al tocarla, como en iOS 26. Con «reducir movimiento» no se mueve.
  `AppLayout` acepta `minimizeTabBarOnScroll={false}` para dejarla fija.
- `isAndroidDevice()`: si la app se abrió en Android, para arrancar ahí con el estilo minimalista (el vidrio es el estilo
  de Apple y el desenfoque pesa en los teléfonos baratos). Los proyectos nuevos con vidrio (`calcita new`) y los ejemplos
  ya lo usan; en los ejemplos, el estilo que elige la persona gana y se guarda solo cuando lo elige.

## [0.19.0] - 2026-10-18

### Agregado

- `TwoStepVerificationCard` acepta `passkeyNotice`: un aviso en el diálogo de crear la llave, antes de que el navegador
  la guarde. La cuenta de demostración lo usa para avisar que la llave queda de verdad en el llavero de la persona
  (iCloud, Google o su gestor) mientras la página la olvida al recargar.

### Corregido

- `formatFileSize` escribe «74 bytes» y «1 byte» (decía «74 byte»: la forma corta de Intl no pone plural).
- Los comentarios de las descargas ya no hablan de axios: describen la petición de la casa (`createApiClient`).

## [0.18.0] - 2026-10-17

### Agregado

- «Hecho en Calcita» en los ejemplos: una página por cada pieza propia del framework, con su ejemplo vivo y su código en
  JavaScript y TypeScript, completo para copiar y pegar: cuenta y seguridad, marco y menú, permisos, servidor, tabla de
  servidor, formularios, confirmar y avisar, encabezados y tarjetas, diccionarios, formatos y dinero, descargas, reportes
  en Excel y CSV, subir archivos, gráficas, mapa, calendario, tablero, bandeja, traducciones, tema y vidrio, errores y
  registro, instalar la app y seguridad web.

### Corregido

- Tipos para TypeScript, encontrados al revisar cada ejemplo con TypeScript estricto:
  - los campos de formik y react-hook-form aceptan las props de su campo (`type`, `prefix`, `options`, `multiline`…)
    y `SubmitButton` las del botón de MUI; `applyServerProblem` acepta el error tal como llega a un `catch`;
  - las columnas de la tabla aceptan `width`, `flex`, `valueFormatter` y `renderCell`, y `fetchPage` recibe la forma
    real de la petición;
  - `composeMenu` y `composePermissionGroups` aceptan lo que regresa `import.meta.glob`;
  - `useConfirmAction`, las políticas de permisos, las gráficas, el tablero, el reintento de CSRF y el conector de la
    cuenta aceptan funciones con los tipos del proyecto;
  - el libro de Excel trae `xlsx.writeBuffer()`, `createToolkitTheme` acepta `light: true` y `useToolkitTranslation`
    se puede llamar sin namespace.

## [0.17.0] - 2026-10-17

### Agregado

- La cuenta completa en `@stackcraftmx/calcita/account`: entrar con su segundo paso, «¿Olvidó su contraseña?», elegir una
  contraseña nueva, Mi perfil y su seguridad. El proyecto solo escribe el conector (las llamadas a su backend):
  `createRestAccountConnector` si el backend sigue el contrato REST, o `createDemoAccountConnector`
  (`/account-demo`) para arrancar sin backend.
- `calcita new` arma la cuenta con su conector: la demostración sin `VITE_API_URL` y el backend REST con ella.
- En los ejemplos, la sección «Hecho en Calcita»: la cuenta, el servidor, las traducciones, la seguridad web, el mapa, el
  calendario, el tablero y la bandeja, cada uno con su código en JavaScript y TypeScript.

### Corregido

- Tipos: `moveCard` y `cardsOfColumn` conservan la forma de las tarjetas del proyecto.

## [0.16.0] - 2026-10-17

### Agregado

- CLI `calcita`: `calcita new` arma un proyecto de Vite con preguntas (menú a un lado o arriba, vidrio, sin vidrio o
  minimalista, claro y oscuro o solo claro, colores, formik o react-hook-form, textos de Calcita o i18next, pantallas de
  entrar y Mi perfil, PWA) y `make:module`, `make:page`, `make:form` y `make:component` agregan piezas con la forma
  de los ejemplos, sin pisar archivos.

## [0.15.0] - 2026-10-17

### Agregado

- Mapa con marcadores (`/maps`, Leaflet con OpenStreetMap), calendario (`/calendar`, FullCalendar), tablero kanban
  (`/kanban`, también con el teclado) y bandeja tipo correo (`InboxLayout`, `MessageList`, `MessageView`).
- En los ejemplos, la sección «Trabajo en equipo»: Sucursales, Calendario de entregas, Tareas y Bandeja.

## [0.14.0] - 2026-10-17

### Agregado

- Seguridad de la cuenta: llaves de acceso (`/passkeys`), verificación en dos pasos con app autenticadora y códigos de
  recuperación, el segundo paso al entrar, las sesiones abiertas y la bitácora de la cuenta.
- En los ejemplos, Mi perfil → Seguridad y el segundo paso al entrar, con servidor de mentira, y una página del catálogo
  sobre cómo evitar XSS.

## [0.13.0] - 2026-10-17

### Agregado

- `createApiClient`: la petición de la casa con el idioma, los errores RFC 9457 como `ApiError`, la sesión vencida, el
  CSRF de Laravel, el tiempo límite, la cancelación y las descargas con avance.
- Versión vieja en la pestaña: `StaleBuildBoundary`, `withChunkRecovery` y `RouteErrorScreen` recargan una vez
  cuando la pantalla que se pide ya no existe; `ErrorPage` con el tipo `newVersion`.

## [0.12.0] - 2026-10-17

### Agregado

- En el catálogo de los ejemplos, el código de cada ejemplo en JavaScript y TypeScript, con botón de copiar, y una página
  de cómo funcionan las traducciones (los textos del paquete, los del proyecto e i18next).

### Corregido

- Los tipos para TypeScript de los avisos (`toastSuccess`…), el `placeholder` de `TextInput` y el avance de las
  descargas.

## [0.11.1] - 2026-10-17

### Corregido

- Un globo de ayuda sin texto ya no enseña la llave: el traductor entiende el texto por omisión (`defaultValue`), como
  i18next.
- El encabezado del panel de descargas y el grupo resaltado de la línea de tiempo tienen fondo con cualquier tema de MUI.

### Quitado

- El filtro de rango de números de la tabla: ninguna columna lo pintaba.

## [0.11.0] - 2026-10-17

### Agregado

- Instalar la app (PWA): invitación abajo al centro, pasos para iPhone, iPad y Firefox de Android, el botón del
  navegador en Chrome y «Instalar la app» en el menú de la cuenta. Sin funcionar sin conexión: eso es de cada proyecto.
- Manifiesto e íconos de Stackcraft en los ejemplos.

## [0.10.0] - 2026-10-17

### Agregado

- Los ejemplos en una imagen de Docker, para probarlos sin instalar Node ni pnpm.
- Script para enseñar la demo por internet con un túnel de Cloudflare.

## [0.9.0] - 2026-10-17

### Agregado

- Proyecto de ejemplos con servidor de mentira: tabla, formularios, avisos, archivos, descargas, métricas, tablero,
  perfiles y permisos, catálogo de componentes y configurador de tema con su código en JS y TS.

## [0.8.0] - 2026-10-17

### Agregado

- Marco de la aplicación: menú lateral que se encoge, menú arriba, barra de pestañas en el teléfono, menú de la cuenta
  con los ajustes, avisos de versión nueva y contadores en el menú.

## [0.7.0] - 2026-10-17

### Agregado

- Tema con claro y oscuro, vidrio líquido según la guía de Apple y estilo minimalista.

## [0.6.0] - 2026-10-17

### Agregado

- Permisos por perfil y por regla, menú que se arma con los permisos y piezas para entrar y cambiar la contraseña.

## [0.5.0] - 2026-10-17

### Agregado

- Subir archivos con avance y cancelación, con dos motores a elegir, y reglas de tipo y peso.

## [0.4.0] - 2026-10-17

### Agregado

- Campos y formularios con formik o react-hook-form, fechas, colores, números exactos y formularios por pasos.

## [0.3.0] - 2026-10-17

### Agregado

- Dinero sin errores de decimales: suma, resta, multiplicación, división y formato por moneda.

## [0.2.0] - 2026-10-17

### Agregado

- Tabla que pagina, filtra y ordena en el servidor, con total real y la búsqueda en la dirección de la página.

## [0.1.0] - 2026-10-17

### Agregado

- Primera versión: proveedor del paquete, textos en español e inglés, formatos, fechas, errores del servidor,
  avisos y confirmaciones, encabezados, etiquetas, métricas, descargas a Excel, gráficas y adaptadores para
  react-router, i18next, Laravel y Next.js.

[0.21.0]: https://github.com/StackCraftMx/calcita/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/StackCraftMx/calcita/compare/v0.19.0...v0.20.0
[0.19.0]: https://github.com/StackCraftMx/calcita/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/StackCraftMx/calcita/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/StackCraftMx/calcita/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/StackCraftMx/calcita/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/StackCraftMx/calcita/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/StackCraftMx/calcita/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/StackCraftMx/calcita/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/StackCraftMx/calcita/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/StackCraftMx/calcita/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/StackCraftMx/calcita/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/StackCraftMx/calcita/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/StackCraftMx/calcita/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/StackCraftMx/calcita/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/StackCraftMx/calcita/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/StackCraftMx/calcita/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/StackCraftMx/calcita/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/StackCraftMx/calcita/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/StackCraftMx/calcita/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/StackCraftMx/calcita/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/StackCraftMx/calcita/releases/tag/v0.1.0
