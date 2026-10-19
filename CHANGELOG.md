# Cambios

Lo que cambia en Calcita en cada versión. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y las versiones, [SemVer](https://semver.org/lang/es/): mientras sea 0.x, cada versión con funciones nuevas sube el
número de en medio (0.9.0 → 0.10.0 → 0.11.0) y cada arreglo, el último.

## [0.31.0] - 2026-10-19

### Agregado

- `DESKTOP_MEDIA_QUERY` y `PHONE_MEDIA_QUERY` se exportan: un ajuste desde el tema que vale solo en escritorio o solo en el
  teléfono usa la misma regla que el marco (teléfono = menos de 900 px de ancho o menos de 500 de alto) y no una copia que
  se le pueda desfasar. Salió de un sistema que ya existía: para alinear la cápsula de la barra con su menú lateral tuvo
  que copiar la regla a mano.

## [0.30.1] - 2026-10-19

### Corregido

- Los campos dentro de `FormSection` vuelven a ser cápsulas, como se aprobaron: en la 0.30.0 salían con esquinas de 12 px.
  Antes la cápsula salía por accidente (el renglón decía 12 y `sx` lo multiplicaba por el radio del tema); ahora se escribe
  tal cual y `--calcita-field-radius` la cambia.
- `createToolkitTheme({fields: {radius}})` con un número se lee en px también dentro de `FormSection` (ahí se multiplicaba
  por el radio del tema: 8 daba 64 px).
- `Wordmark`: la regla de su imagen (alto y `display: block`) le ganaba al estilo propio de la imagen del proyecto; ahora va
  con `:where()` y gana lo del proyecto.

### Agregado

- `AppLayout wordmark={{light, dark}}`: una imagen para cada modo (el logo de color en claro y el blanco en oscuro). Se
  pintan las dos y el modo decide cuál se ve, sin parpadeo.
- README y catálogo: mejor no partir el código a mano (`manualChunks`); medido en un sistema real, 1,171 kB en cada pantalla
  con el reparto a mano y 971 kB sin él. Si aun así se reparte, qué dejar sin asignar.

## [0.30.0] - 2026-10-19

La 0.29.0 no se publicó en npm: la 0.30.0 la incluye completa (las piezas desde el tema, abajo).

### Agregado

- Variables CSS para los valores globales: `--calcita-panel-radius`, `--calcita-menu-radius`, `--calcita-field-radius`,
  `--calcita-glass-blur` y `--calcita-glass-saturate`, cada una con su valor de siempre de respaldo (sin la variable se ve
  igual). Se ponen en CSS suelto (también en la página de un sistema que ya existe), en un contenedor o desde el tema:
  `createToolkitTheme({cssTokens})`. `CSS_TOKENS`, `cssTokenOf` y `cssTokenDeclarationsOf` exportados.
- Catálogo, «Tema y vidrio»: la sección «Cambie el tema en vivo», con el tema de Calcita, el de MUI tal cual y el de otro
  sistema hecho solo con overrides (también sus campos, con `palette.field`), y las variables CSS en deslizadores.

## [0.29.0] - 2026-10-19

### Agregado

- Todas las piezas de Calcita (93) se cambian desde el tema del proyecto, como las de MUI: con su nombre en `components`
  (`CalcitaAppLayout`, `CalcitaServerTable`, `CalcitaMetricCard`, `CalcitaFormSection`…), `styleOverrides` para cada parte y
  `defaultProps`. El orden: el estilo de Calcita, encima el del tema del proyecto y al final el `sx` de la pantalla. Sirve
  también con un tema de MUI que no es de Calcita: un sistema que ya existe deja Calcita con su propia cara. La lista de
  piezas y partes está en el README. `piecePart` y `usePieceProps` (`src/theme/themePieces.js`) son las que lo arman.
  Salió de poner a un sistema que ya existía su tema de antes, tal cual, debajo de Calcita.

### Corregido

- `StatusChip` y `MetricCard` en modo oscuro: el texto (y la cifra) iba en el tono oscuro de su color y casi no se leía
  sobre el fondo oscuro. Ahora va en el tono claro.
- `ServerTable`: el `sx` que la pantalla pasa en `gridProps` ya no lo pisa el de la tabla.
- `SegmentedControl` y los grupos de botones del minimalista ya no usan `!important` para sus esquinas: el tema del
  proyecto las puede cambiar. Se ven igual que antes.

## [0.28.0] - 2026-10-19

### Agregado

- `createToolkitTheme({fields})`: cómo se ven los campos de captura, por modo: el relleno, el relleno con el cursor encima,
  la orilla y la orilla con el cursor encima; y sus esquinas. Vale con vidrio, con el minimalista y dentro de
  `FormSection`. Van en la paleta de cada modo (`palette.field`), así que también se escriben en `colorSchemes`.
  `FIELD_TONES` (los de omisión) y `fieldPaletteOf` exportados. Salió de la prueba en un sistema que ya existía: su gris
  se leía como campo deshabilitado y el tema del proyecto no le podía ganar a `FormSection`.

### Corregido

- Dentro de `FormSection`, en modo oscuro, los campos salían con el gris de claro: la regla de oscuro quedaba anidada debajo
  de un selector que empieza en `html body` y nunca aplicaba. Ahora los tonos van en variables del renglón.

## [0.27.0] - 2026-10-19

### Agregado

- `createToolkitTheme({minimalTones})`: el minimalista con los colores de la marca. Por modo: el fondo de la página
  (`default`), las tarjetas (`paper`), el relleno de campos, grupos y botones sin color (`fill`) y lo que flota, como la
  barra del teléfono (`floating`). Lo que no se pase se queda con el gris de Apple (`MINIMAL_TONES`, exportado). Salió de
  la prueba en un sistema que ya existía: el minimalista cambiaba el fondo del proyecto por los grises de Apple y no había
  forma limpia de escribir encima.

## [0.26.0] - 2026-10-19

Lo que salió al meter Calcita en un sistema que ya existía (una SPA con su propio core, su i18next, su router y su prefijo
en runtime): cada trampa, arreglada.

### Corregido

- En modo oscuro, los ajustes de Calcita le ganaban al `sx` del proyecto (un monograma con el color de la marca salía
  gris). Ahora lo que cambia de modo se escribe una vez con su variable (`--calcita-…`) y la regla de oscuro solo cambia la
  variable (`lightDarkStylesOf`): el `sx` gana en claro y en oscuro. Comparado píxel por píxel: el catálogo se ve igual.

### Agregado

- `AppLayout wordmark`: un logo ancho (la marca con su nombre en una sola imagen) en lugar del logo cuadrado y el nombre.
- Las ligas de la cuenta (`accountMenuItems`) también sin sesión, detrás del engrane, y con `href` a otro sistema.
- El menú: entradas con `href` (liga a otro sistema) y con `icon` (un ícono ya pintado, por ejemplo de iconify);
  `menuItemsWithIconsOf`.
- `addLogSink`: salidas propias del registro (Sentry, Datadog, un endpoint), además de la consola.
- `apiErrorOf(response)`: el mismo `ApiError` del cliente para una respuesta que no pasó por él (la subida con avance).
- El paquete exporta su `package.json`.
- README y catálogo: Calcita en su propio archivo si el proyecto usa `manualChunks` (si no, un círculo con MUI tumba la
  app al abrir).

## [0.25.0] - 2026-10-18

### Agregado

- Sistemas que ya existen: Calcita entra por pedazos (islas de React en una página de PHP, JSP o .NET). Navegación sin
  router con `createHashNavigation()` (pantallas después del `#`, sin recargar ni tocar el servidor) y
  `createBrowserNavigation({basePath})` (la app bajo un prefijo). Un `ToolkitProvider` dentro de otro toma del de afuera lo
  que no le digan y ya no le cambia el idioma a toda la app; cada parte escribe con el suyo (`useFormatters()`,
  `formattersOf`).
- Eventos hacia afuera en los componentes de la casa: `ServerTable` (`onSelectionChange`, `onQueryChange`, `onLoaded`,
  `onLoadError`), `createApiClient` (`onRequest`, `onResponse`, `onError`, y `toProblem` y `mapResponse` para backends que
  contestan a su manera), `AppLayout` (`onMenuCollapse`, `onMobileMenuChange`, `onMobileTabsChange`), las gráficas
  (`defaultView` y `onViewChange`, `CHART_VIEW`), `EventCalendar` (`onDatesChange`, `onViewChange`, `renderEvent`,
  `fullCalendarProps`), `KanbanBoard` (`onAddCard`, `onCardComplete`, `onColumnCollapse`), la bandeja
  (`onSelectionChange`, `onAttachmentClick`, `onExpand`), `MapView` (`onMapClick`, `renderPopup`), `GroupedTimeline`
  (`onGroupToggle`), `CollapsibleSection` (`onExpandedChange`), `SecretField` (`onRevealChange`), `ColorSchemeToggle` y
  `FontSizeToggle` (`onChange`), `AppearanceSettings` (`onFontSizeChange`, `onColorSchemeChange`), `InstallPromptBanner`
  (`onInstallChoice`, `onShowSteps`, `onDismiss`), `RecoveryCodesDialog` (`onCodesSaved`) y las descargas (`onFailed`,
  `onCanceled`).
- Textos propios en cada componente de la casa: `texts` con la forma de su namespace, y `ComponentTexts` para todo lo de
  adentro.
- `ToolkitProvider`: `languages` (los idiomas del proyecto, con su nombre y su locale) y `fileTypes` (tipos de archivo
  propios para las descargas).
- `ServerTable`: elegir renglones y actuar sobre ellos (`selectionActions`, se conservan entre páginas, «todos los que
  coinciden»); `SelectionActions` para lo mismo fuera de la tabla.
- Formularios: varias opciones en la lista y el catálogo (`multiple`), `FormWizard` para react-hook-form y `WizardLayout`.
- `ProfileScreen`: campos y pestañas propias (`extraFields`, `extraTabs`, `hiddenTabs`, `onTabChange`, `onProfileSaved`).
- Gráficas: `LineChart` (una serie o varias, cada una con color y trazo), `ColumnChart` con series agrupadas y
  `ChartTooltip` para las propias.
- `ErrorPage` con botones y contenido propios (`actions`, `extraActions`, `children`, `icon`, `onGoHome`);
  `withAccess(access, routes, {fallback})`; `RouteErrorScreen` con las props de `ErrorPage` y `onError`.
- `MetricCard` con `icon`, `children` y `onClick`.
- Calendario de producto: `EventDetails` (lugar, liga de la reunión, invitados con su respuesta, recordatorio y notas).
- Tablero de producto: tarjetas con etiquetas, responsables, fecha, pendientes, comentarios y adjuntos; columnas que se
  encogen (congelador) y terminar una tarea.
- Bandeja tipo correo: elegir varios, la conversación completa, etiquetas y acciones por mensaje.
- `BarSearch` (la búsqueda de la barra para cualquier pantalla) y `ActionsMenu` (el menú «⋯» de una tarjeta o un renglón).
- `calcita new`: la app detrás de un proxy con prefijo (`ASSET_URL=/ventas`): Vite, el router, el logo, `version.json` y el
  manifiesto con el prefijo.
- Ejemplos: tareas, citas y bandeja como producto (con su servidor de mentira), selección en pedidos, y en el catálogo la
  sección «En un sistema que ya existe».

### Cambiado

- **formik y yup ya no vienen dentro del paquete**: son `peerDependencies` (opcionales) y los instala el proyecto que use
  `/forms` o `/account` (`pnpm add formik yup`). Calcita usa la versión que ya tenga el sistema. `calcita new` ya los pide.
- Las gráficas leen sus colores del tema (`theme.vars` o la paleta): antes estaban escritos como `var(--mui-…)` y se perdían
  con un `cssVarPrefix` propio o sin variables CSS.
- Los formatos dentro de los componentes del paquete usan el proveedor más cercano; los sueltos (`formatDate`…) siguen con
  el de la raíz.

### Corregido

- Las ventanas abiertas con clic ya no muestran el borde azul del navegador alrededor (desde MUI 7.3 el foco cae en la
  ventana).
- La palomita de la opción elegida de una lista caía en otro renglón; un campo de búsqueda mostraba dos «×».
- Con vidrio, un botón con relleno en la barra seguía naranja.
- En el teléfono, con algo elegido la barra de arriba se salía por los dos lados: ahora solo quedan las acciones de lo
  elegido.
- El panel de descargas decía «0 bytes» de los archivos armados en el navegador.

## [0.24.0] - 2026-10-18

### Agregado

- `calcita new`: el proyecto nuevo nace con la actualización sola. Su build deja `version.json` y la versión en
  `VITE_BUILD_ID`, la raíz vigila con `usePublishedBuildWatch` y `ToolkitProvider` recibe su `buildId`. Su README explica
  qué no debe guardar el servidor.
- `usePublishedBuildWatch` acepta `buildId` (la versión de la pestaña). Sin él tomaba la de `ToolkitProvider`, que la raíz
  todavía no tenía en su primera revisión (`AccountProvider` lo pinta hasta tener la sesión): al abrir la app en la
  pantalla de entrar, el aviso no salía.
- `AuthLayout` también pinta el aviso de versión nueva (cápsula flotante): antes solo salía en las pantallas con sesión, y
  quien abría la app sin sesión no se enteraba.

## [0.23.0] - 2026-10-18

### Agregado

- `usePublishedBuildWatch`: la app se entera sola de que se publicó otra versión del front, sin depender del API. El build
  deja `version.json` con su versión y la app lo vuelve a leer al regresar del segundo plano y cada tanto. Si estuvo fuera
  15 minutos o más, se recarga sola; si no, sale el aviso «Hay una versión nueva» con su botón. Resuelve la app anclada al
  inicio del iPhone, que al abrirla retomaba la versión vieja de memoria. Opciones: `checkEveryMinutes`,
  `reloadAfterHiddenMinutes` (null: solo el aviso), `onReload` y `url`. La decisión es pura y se prueba sola
  (`buildWatchActionOf`).
- Ejemplos: su build deja `version.json` y la versión en `VITE_BUILD_ID`, y la raíz vigila con `usePublishedBuildWatch`.

## [0.22.0] - 2026-10-18

### Agregado

- `BarActions`: las cápsulas de UNA pantalla en la barra de arriba, como las barras de herramientas de macOS. La pantalla
  las pone en su código y, con la barra en cápsulas, el marco las sube a la barra (cada `<BarActions>` es su cápsula);
  con la franja entran a la franja; en el teléfono con cápsulas flotan arriba. Se extiende sin tocar el
  framework: cualquier contenido, varias por pantalla con `order`, `sx`, `inlineSx` y `bare` (cuando lo de adentro ya es
  una cápsula).
- En el teléfono con cápsulas, las cápsulas de la pantalla flotan arriba a la derecha y se quedan al bajar, como los
  botones de iOS 26, solo con ícono (la guía de Apple pide íconos antes que texto en las barras). Se ven todas las que
  caben a lo ancho; las que no, van a un menú «⋯» con su nombre (se mide el renglón; con varios grupos cede el último).
  La búsqueda de la tabla también flota: al picar la lupa se estira hasta las demás cápsulas.
- `BarCapsule`: la misma cápsula (vidrio o minimalista) para usarla fuera de la barra.
- `BarActionButton`: el botón de una acción que se acomoda solo: en una cápsula, solo el ícono con su nombre en el
  tooltip; en el menú «⋯», un renglón con su nombre; fuera de `BarActions`, ícono y texto sin relleno. Algo propio
  adentro de `BarActions` sabe dónde quedó con `useBarActionsPlacement` y, dentro del «⋯», cierra el menú con
  `useCloseBarActionsMenu`.
- Con la barra en cápsulas, las `actions` de `PageHeading` suben solas a la barra en su cápsula.
- `ServerTable` acepta `searchInBar`: su búsqueda va arriba, en la barra (sin cápsulas, en el teléfono se queda en la tabla). Sin usar se
  encoge a una cápsula con la lupa y se estira al picarla; con texto se queda abierta y Escape la borra y la cierra
  (`collapseSearchInBar={false}` la deja siempre abierta). La tabla de pedidos de los ejemplos ya la usa.
- «Hecho en Calcita» → «Marco y menú» reescrita para quien llega sin contexto: cada sección dice para qué sirve, enseña el
  código mínimo (comentado paso a paso) y trae su tabla «Cómo se extiende» (opción, qué hace y un ejemplo). La de los
  botones de una pantalla tiene ejemplo vivo: pone sus cápsulas en la barra de la misma app.
- Ejemplos: «Sucursales» trae «Agregar sucursal» con su formulario en una ventana (formik, el error del servidor en su
  campo) y la nueva sale en la lista y en el mapa.

### Cambiado

- Con vidrio, los botones dentro de las cápsulas de la barra van siempre del color del texto, aunque se les ponga color
  (en las barras de Apple los símbolos son de un solo color).
- `DownloadMenu` en una cápsula de la barra es solo el ícono de descarga con su nombre en el tooltip, como las demás
  acciones (antes la píldora «Descargar ▾» se veía como una cápsula dentro de otra); en el «⋯» del teléfono, un renglón
  que abre los formatos.
- La barra de pestañas del teléfono enseña las pestañas que caben a lo ancho (al menos 60 px cada una; acostado, 104) y
  las demás van a «Más»: en una ventana angosta salen menos y los nombres ya no se cortan; en una ancha, más. Antes eran
  siempre 4 y «Más». `mobileTabsOf` acepta cuántas caben (tercer dato; por omisión 5).
- `ServerTable` ya no enseña «Ir a página» por omisión: con las flechas basta en casi todas las tablas. Se prende con
  `showGoToPage`.

### Corregido

- Las migas de pan ya no enseñan la barra gris de desplazamiento en el teléfono: se deslizan como los filtros rápidos
  (sin barra, con la orilla desvanecida donde hay más).
- El minimalista con la barra en cápsulas se separa de las orillas como el vidrio: las cápsulas y el menú lateral ya no
  quedan pegados arriba y a la izquierda.
- La lista desplegable de los formularios (`SelectInput` y los `FormSelectField`) ahora se nombra con su etiqueta: el lector
  de pantalla no decía «Ciudad», solo lo elegido (la lista de MUI es un div y el `for` de la etiqueta no la unía).
- Construir el paquete ya no tumba al servidor de desarrollo de los ejemplos: se construye aparte (`.dist-next/`) y se
  reemplaza archivo por archivo en `dist/` (`scripts/swapBuild.js`). Antes, mientras se construía, las pantallas salían con
  «Algo falló».

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

[0.31.0]: https://github.com/StackCraftMx/calcita/compare/v0.30.1...v0.31.0
[0.30.1]: https://github.com/StackCraftMx/calcita/compare/v0.30.0...v0.30.1
[0.30.0]: https://github.com/StackCraftMx/calcita/compare/v0.29.0...v0.30.0
[0.29.0]: https://github.com/StackCraftMx/calcita/compare/v0.28.0...v0.29.0
[0.28.0]: https://github.com/StackCraftMx/calcita/compare/v0.27.0...v0.28.0
[0.27.0]: https://github.com/StackCraftMx/calcita/compare/v0.26.0...v0.27.0
[0.26.0]: https://github.com/StackCraftMx/calcita/compare/v0.25.0...v0.26.0
[0.25.0]: https://github.com/StackCraftMx/calcita/compare/v0.24.0...v0.25.0
[0.24.0]: https://github.com/StackCraftMx/calcita/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/StackCraftMx/calcita/compare/v0.22.0...v0.23.0
[0.22.0]: https://github.com/StackCraftMx/calcita/compare/v0.21.0...v0.22.0
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
