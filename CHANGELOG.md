# Cambios

Lo que cambia en Calcita en cada versión. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y las versiones, [SemVer](https://semver.org/lang/es/): mientras sea 0.x, cada versión con funciones nuevas sube el
número de en medio (0.9.0 → 0.10.0 → 0.11.0) y cada arreglo, el último.

## [0.53.0] - 2026-11-03

### Agregado

- Lo obligatorio, a la vista: `required` pone un asterisco en la etiqueta en los 17 campos de la casa (antes no salía en
  ninguno, y 16 avisaban en la consola que no conocían la opción). El asterisco va en el estilo de la etiqueta: su texto no
  cambia (las pruebas que buscan el campo por su etiqueta lo siguen encontrando) y el lector de pantalla no lo lee; el campo
  lo dice con `required` o, donde el navegador no sabe revisarlo, con `aria-required`. Se cambia desde el tema
  (`'&[data-required]::after'` de la etiqueta) o con el texto `common.form.requiredMark`.
- `ToolkitProvider requiredFromSchema`: los campos de formik leen del esquema de yup qué es obligatorio (también con `.when`
  y con una lista `.min(1)`); lo que la pantalla diga con `required` gana. Por omisión no. El `Formik` de
  `@stackcraftmx/calcita/forms` comparte el esquema con los campos (formik no lo hace); con el de `'formik'`,
  `FormSchemaProvider`. La regla sin React: `isRequiredInSchema`.
- `FormSection labelPlacement` (`FORM_LABEL_PLACEMENT.topOnPhone`): en el teléfono la etiqueta sube arriba del campo; por
  omisión `side`, como antes.
- `DateInput`, `DateTimeInput`, `TimeInput` y `MonthInput`: `format` con nombre (`'DD/MMM/YYYY'` enseña «16/jul/2029»), también
  desde el tema.
- `FormWizard` (formik y react-hook-form) y `WizardLayout`: `hideBackOnFirstStep` no pinta «Anterior» en el primer paso; por
  omisión sale apagado, como antes.
- `Toaster` acepta lo de sonner (`position` con `TOASTER_POSITION`, `duration`, `visibleToasts`, `offset`, `toastOptions`…);
  sin nada, abajo a la izquierda como antes.
- Ejemplos: en Formularios «12. Lo obligatorio, a la vista» y «13. En el teléfono, la etiqueta arriba»; en Fechas «9. El formato
  a su gusto y lo obligatorio»; en Confirmar y avisar «3. Dónde salen los avisos». En la app de ejemplo, los formularios de
  formik con su asterisco desde el esquema, el alta de cliente con la etiqueta arriba en el teléfono y la fecha con el mes en
  letras, y la solicitud de crédito sin «Anterior» en el primer paso.

### Arreglado

- Los campos de formik y de react-hook-form (los 29) pisaban el `onChange` y el `onBlur` que les pasaba la pantalla: el del
  formulario iba después y el de la pantalla nunca corría. Ahora corren los dos, primero el del formulario y luego el de la
  pantalla con el valor nuevo; los tipos ya los aceptan.

## [0.52.1] - 2026-11-03

### Arreglado

- `DateInput`, `DateTimeInput`, `TimeInput` y `MonthInput`: el `format` (y en fecha con hora y en hora, el `ampm`) que la
  pantalla pasa en `pickerProps` se perdía, porque el de la casa iba después y lo pisaba sin avisar. Ahora gana el de la
  pantalla (`pickerProps={{format: 'DD/MMM/YYYY'}}` enseña «16/jul/2029»); sin él, igual que antes.
- README: qué instalar para cada entrada aparte (las fechas piden `@mui/x-date-pickers` y `dayjs`) y que al subir de versión
  basta con volver a prender el servidor de Vite (no hace falta borrar `node_modules/.vite`).

## [0.52.0] - 2026-11-03

### Agregado

- `FormWizard` (formik y react-hook-form) para editar un registro por pasos: `initialStepKey` abre en el paso que diga el
  servidor (una llave que no existe abre el primero y lo avisa en la consola), `orientation` (`WIZARD_ORIENTATION.vertical`:
  un paso debajo del otro, con los campos y los botones dentro del paso abierto), `stepSelection`
  (`WIZARD_STEP_SELECTION.free`: el título de otro paso se pulsa y salta directo; `.checked`: solo si el paso abierto no
  tiene errores; `.none`, lo de siempre) y `onStepChange(stepKey, index)`. `steps[].completed` pone la palomita cuando los
  títulos se pulsan. Sin estas opciones, igual que antes.
- `WizardLayout`: `orientation` y `onStepSelect` (los títulos se vuelven botones); `skippedKeys` y `onSkip` ya no son
  obligatorios (sin `onSkip` no sale «Omitir este paso»). Las reglas puras salen de la puerta principal: `openingStepOf`,
  `stepSelectionActionOf`, `isStepCompleted`.
- `RecordCard` `footerAlign` (`RECORD_CARD_FOOTER_ALIGN`): el footer y «Ver detalle» juntos a la izquierda (`start`) o a la
  derecha (`end`); por omisión `spaceBetween`, como antes.
- CLI: `calcita check:texts --source resources/js`, para el código fuera de `src/` (un Laravel).
- Ejemplos: «11. Editar por pasos» en Formularios; en la solicitud de crédito, «Corregir la solicitud» la abre del servidor en
  el paso que pide la mesa, en vertical y con los títulos que se pulsan; en Encabezados y tarjetas, una tarjeta con el pie a
  la derecha.

## [0.51.1] - 2026-11-03

### Arreglado

- `calcita check:texts` daba verde sin haber revisado nada: en un proyecto con el código fuera de `src/` contestaba «Revisé
  0 llaves… Todo en su lugar». Ahora sin la carpeta del código o sin ningún archivo de textos sale con problema.
- `calcita check:texts` no leía un archivo de textos que reexporta otro con `@/` (node no conoce el alias) y todas sus llaves
  salían como faltantes: ahora `@/` apunta a la carpeta del código, como en Vite (Node 22.15 o más). Si aun así un archivo
  no se lee, se dice cuál y no se comparan llaves (la lista saldría falsa). Lo reexportado por otro archivo de textos cuenta
  una vez y no como repetido.
- Tipos: `BackButton` y `BarActionButton` declaran `sx` (ya lo pasaban a su botón; el editor lo marcaba como de más).

## [0.51.0] - 2026-11-03

### Agregado

- `slots` y `slotProps` en todas las piezas con nombre en el tema, como en MUI: una parte se cambia por otro componente
  (`slots={{avatar: StoreAvatar}}`) o recibe props de más (`slotProps={{root: {elevation: 3}}}`, también como función),
  con el nombre de la parte de styleOverrides. Desde la pantalla o, para toda la app, desde el tema (`defaultProps`).
  `className`, `style` y `sx` se suman a los de Calcita; una pieza dentro de otra igual no toma los de la de afuera (las
  tarjetas de `ServerTable` sí toman los de su tabla: `withPieceSlots(…, {sharedWithParent: true})`). `TextInput` conserva su
  `slotProps` para el `TextField` de MUI.
- Nombre en el tema (y slots) para 16 piezas que no lo tenían: `CalcitaFieldFrame` (root, label), `CalcitaNumberInput`,
  `CalcitaCatalogInput`, `CalcitaDateInput`, `CalcitaDateTimeInput`, `CalcitaTimeInput`, `CalcitaMonthInput`,
  `CalcitaBackButton`, `CalcitaCopyButton`, `CalcitaSecretField`, `CalcitaHelpButton`, `CalcitaRecordCardSkeleton`,
  `CalcitaServerTableFilterDrawer`, `CalcitaBarActionButton` y `CalcitaSubmitButton` (formik y react-hook-form); con las de
  antes son 130 en el README.
- `piecePart`, `usePieceProps`, `withPieceSlots` y `mergedSlotProps` salen de la puerta principal: una pieza propia del
  proyecto con el mismo mecanismo (nombre en el tema, partes, slots).
- Ejemplos: «4. Cambiar una parte de una pieza» en Tema y vidrio.

## [0.50.0] - 2026-11-03

### Agregado

- `createPathIndex`: el índice de direcciones con nombre. Cada módulo publica las suyas (paths.js, o uris.js para el API) y el
  índice las junta con el glob de Vite; se piden por camino (`pathOf('admin:profile:detail', {groupId, userId, tab})`): lo que
  la ruta pide se sustituye, lo que sobra va como consulta y un nombre que no existe (o una parte que falta) truena diciendo
  qué sí hay. `fillPath` llena una ruta suelta.
- `documentBasePath()`: el prefijo con que el servidor sirvió la página, leído de su `<base href>` (`null` sin `<base>`). Con
  `ASSET_URL=./` una sola compilación sirve detrás de cualquier prefijo que decida el servidor (Laravel, un proxy). El proyecto
  de `calcita new` y los ejemplos ya lo usan para el router y `publicUrlOf`; sin `<base>`, todo sigue igual.
- `combineTexts` en el paquete (antes era una copia en los ejemplos y otra en la plantilla del CLI): junta los textos de cada
  módulo por idioma y namespace, suma los objetos de adentro (`validation.fields` de dos módulos) y truena con un texto
  repetido, diciendo cuál y en qué idioma.
- CLI: `calcita check:texts`, que revisa que cada `t('llave')` escrita tal cual exista en todos los idiomas (con el namespace
  de su archivo o el de la llave; los de Calcita también) y que los idiomas tengan las mismas llaves.
- Proyecto nuevo del CLI: ESLint (`pnpm lint`, con `no-undef` y las reglas de los hooks de React) y `pnpm check:texts`;
  `ASSET_URL=./` para archivos relativos a la página.
- `isPlainLeftClick` suelto (el clic normal, sin Cmd/Ctrl/Shift ni el botón de en medio).
- Ejemplos: «7. Direcciones con nombre y lo que se arma solo» en Marco y menú.

### Cambiado

- Ejemplos y plantilla del CLI: `combineTexts` viene de `@stackcraftmx/calcita` (se borraron sus copias). Un proyecto que ya
  tiene su copia puede quedarse con ella.

## [0.49.0] - 2026-11-03

### Agregado

- `stackedColumn` (`/table`): los datos que se leen de corrido en una celda, uno debajo del otro, los que hagan falta (el
  principal en negritas, los demás en gris). Cada dato va solo, si el encabezado de la columna ya dice qué son, o con su
  etiqueta arriba y una nota corta (`{label, value, note}`) si el encabezado nombra al grupo. Un dato vacío no se pinta,
  salvo el principal o uno con etiqueta, que enseñan «—» (texto `table.cells.empty`). Con una columna así la tabla pone los
  renglones a su alto sola. `StackedCell` es la misma celda para un `renderCell` propio. Pieza del tema `CalcitaStackedCell`
  (root, line, label, valueRow, primary, secondary, note).
- `statusColumn`: el estatus desde su diccionario (StatusChip), con filtro de facetas (o sin él, `filter: false`) y, con `t`,
  el ancho de su etiqueta más larga medido en el idioma de la pantalla (`statusColumnWidthOf`, `textWidthOf`).
- `actionsColumn`: el menú «⋯» de cada renglón en su columna, de ancho fijo (`ACTIONS_COLUMN_FIELD` para dejarla fija;
  `DETAIL_COLUMN_FIELD` es el de `detailColumn`).
- `ServerTable` con `renderCard`: la misma lista en tarjetas, con la misma búsqueda, filtros, orden y páginas; un botón
  (tabla o tarjetas) cambia de vista y con `prefix` la vista va en la dirección, reemplazando el historial. `view`,
  `defaultView`, `onViewChange`, `showViewToggle` y `cardSkeleton`. Partes del tema `cards`, `cardsPagination` y
  `viewToggle`. Sueltos: `TableCardsView`, `TableViewToggle`, `useTableView` y `TABLE_VIEW`.
- Ejemplos: «4. Columnas listas y la vista de tarjetas» en Tabla de servidor (una lista de clientes) y Pedidos con su vista de
  tarjetas dentro de la tabla: cambiar de vista ya no pierde lo filtrado (antes las tarjetas iban aparte y sin filtros).

## [0.48.0] - 2026-11-03

### Agregado

- `ActionsMenu`: renglones con `to` (y `replace`), una pantalla de la app con la navegación del proyecto: el clic normal no
  recarga la app y Cmd/Ctrl+clic o el botón de en medio la abren en otra pestaña. `onClick` recibe el evento del clic.
- `RouteTabs`: `replace`. Con `mode="query"` (`?tab=`) las pestañas reemplazan la entrada del historial por omisión: son
  vistas de la misma ficha y «atrás» (y el `BackButton`) salen de ella en vez de pasear por las pestañas. Las de ruta siguen
  dejando su paso.
- La navegación del navegador y la de `#` saben reemplazar: `navigate(destino, {replace: true})` y `<Link replace>` (con
  Cmd/Ctrl+clic siguen abriendo otra pestaña). `isPlainLeftClick` dice si un clic es el normal.
- `ServerTable`: `fixedColumn` acepta una lista (`['actions', 'company']`): cada columna se pega donde termina la anterior y la
  raya va solo en la última. Las que no son la última llevan su `width`; si no, avisa en la consola una vez.
- Textos que no existen: la pantalla sigue enseñando la llave, y ahora Calcita avisa en la consola una vez por idioma y llave
  (el nivel lo pone `setLogLevel`). Con `onMissingText` en `ToolkitProvider` se le avisa al proyecto (Sentry, una prueba). Un
  texto pedido con `defaultValue` es opcional y no avisa.
- `MarkedText`: un texto traducido con palabras resaltadas en una sola llave (`<highlight>…</highlight>`), como `<Trans>` de
  react-i18next sin i18next. No pinta HTML: solo las marcas que se nombran. `parseMarkedText` es la lectura sin React.
- Mensajes de error propios sin tocar el esquema: cada mensaje de `buildYupLocale()` lleva su regla y su campo, y el texto sale
  del primero que exista: el de la pantalla (`messages` en cualquier campo de la casa), el de los textos del proyecto para ese
  campo (`validation.fields.<campo>.<regla>`) o el general. `{{label}}` en los textos dice el nombre del campo.
- Mensajes de un sistema que ya existe: Calcita entiende `{key}`, `{msg}` (el `setLocale` de muchos sistemas con i18next),
  `{message}`, el error entero de react-hook-form y un texto; para otra forma, `readValidationMessage` en `ToolkitProvider`.
  Una forma desconocida ya no se pinta «[object Object]»: sale el mensaje general y se avisa. `useValidationText` para un
  campo propio; `ruleMessageOf`, `normalizedValidationMessage` y `fieldKeyOf` sueltos.
- Reglas: `sameAsFieldRule` (confirmar una contraseña, una CLABE, un correo) y `percentRule` en `/forms` y `/react-hook-form`;
  `postalCodeRule` e `isValidPostalCode` en `/mexico`.
- Ejemplos: «10. Mensajes de error propios» en Formularios, «6. Una palabra resaltada» en Traducciones, dos columnas fijas en
  la tabla de Hecho en Calcita, «Abrir el pedido» con destino en las tarjetas de Pedidos, «Confirme la CLABE» en la solicitud
  de crédito (con su mensaje propio y revisada por el servidor), el descuento entre 0 y 100 % en las condiciones del cliente y
  el inicio con su palabra resaltada.

### Arreglado

- `SelectInput` de una sola opción con un valor que es número (un recordatorio de 60 minutos) tumbaba la pantalla: el cálculo
  de «Elegir todos» corría también sin `multiple`.
- `MaskedInput` no dejaba pasar `messages` al campo de texto.
- Ejemplos: la paginación de las tarjetas de Pedidos ponía la llave como nombre de los «…» (lo encontró el aviso nuevo).

### Cambiado

- Las reglas de `/mexico` (`rfcRule`, `curpRule`, `clabeRule`) traen en su mensaje el nombre de la regla (`rule`), además de
  `key`: la forma de antes sigue igual.

## [0.47.1] - 2026-11-03

### Arreglado

- `ServerTable` en renglones altos: el DataGrid le da a cada celda una altura de línea igual al alto del renglón, y todo
  texto que no trajera la suya quedaba a media celda o hasta abajo (con renglones de 100 px el primer dato bajaba 42 px y el
  segundo se salía de la celda y no se veía). Las celdas ya se centran con flex: la altura de línea vuelve a la del texto.
  En las tablas de siempre no cambia nada a la vista (medido píxel por píxel en Pedidos: solo el punto del estatus, 1 px).
- `ServerTable` con `gridSx`: se combinaba DENTRO del objeto de estilos de la tabla y una llave igual reemplazaba la de la
  tabla entera (pasar `'& .MuiDataGrid-cell': {alignItems: 'flex-start'}` borraba el `display: flex` sin avisar). Ahora va
  después y se combina regla por regla; también el `sx` que llegue en `gridProps`.
- `ServerTable` con `getRowHeight` que regresa `'auto'`: la tabla lo contaba con el alto de siempre y cortaba los renglones
  de abajo. Ahora se mide sola (`autoHeight` del DataGrid); con `maxGridHeight` cuenta cada renglón con el
  `getEstimatedRowHeight` que llegue en `gridProps`.
- La misma trampa del `sx` en `RecordCard`, `RecordCardSkeleton`, `RouteTabs`, `CheckboxGroupInput`, `TransferListInput`,
  `RepeatingFields`, `FileInput`, `FileUploadInput`, `AttachmentsInput`, `ImageInput`, `FileDropzone` y el chip de archivo:
  el `sx` de la pantalla ahora va después del tema del proyecto y se combina regla por regla.

### Agregado

- `sxListOf(sx)`: el `sx` de la pantalla como lista, para ponerlo después del estilo propio sin perder llaves
  (`sx={[{p: 2}, ...sxListOf(sx)]}`).

## [0.47.0] - 2026-11-02

### Agregado

- `RecordCard`: la tarjeta de un registro. Encabezado con avatar (iniciales), folio, título y subtítulo, estatus e
  insignias, botón para abrirlo (`onOpen`) y menú «⋯»; grupos de datos (`groups`, o `content` libre) lado a lado en
  escritorio y uno debajo de otro en el teléfono; dato principal grande (`highlight`); `trailing` para lo que va al final
  del cuerpo y `columns` para fijar el ancho de cada columna (el orden es el que se da: sirve para un orden obligatorio);
  `footer`, `details` que se despliega (`onDetailsToggle`), `header` propio y `children`. Pieza del tema `CalcitaRecordCard`.
- `RecordCardSkeleton`: su esqueleto con la misma forma.
- `ActionsMenu`: submenús (`children`) que se abren dentro del mismo menú con «Regresar» (también con → y ←), títulos de
  sección y separadores (`ACTIONS_MENU_ROW`), ligas (`href`, `download`), explicación por renglón (`description`) y renglones
  propios (`render`). Lo de antes sigue igual.
- Ejemplos: Pedidos con pestañas «Tabla / Tarjetas» (`?view=cards`), cada pedido en su tarjeta con su seguimiento y un menú
  con submenús; «3. Tarjetas de registro» en Encabezados y tarjetas, con un ejemplo de orden fijo.

## [0.46.0] - 2026-11-02

### Agregado

- `FilterDrawer`: la búsqueda en cajón, un panel que sale de un lado (`anchor`, `width`, `title`) con los campos que filtran
  una lista, declarados una vez (`FILTER_FIELD_KIND`: text, select, multiSelect, catalog, checkboxes, numberRange, dateRange,
  comparison y custom). Trabaja sobre un borrador: la lista no se mueve hasta «Buscar»; «Limpiar» vacía el cajón y un rango
  al revés no deja buscar. En el teléfono ocupa todo el ancho. Pieza del tema `CalcitaFilterDrawer`.
- `ServerTableFilterDrawer` (`/table`): el botón «Filtros (N)» con su cajón, conectado a los filtros de la tabla (en la
  dirección, con sus chips). `filterDrawerDefaultsOf`, `filterDrawerKindsOf` y `filterDrawerChipsOf` arman lo que la tabla
  necesita; `comparisonOf` y `comparisonTextOf` leen y escriben un monto con operador (`gte:500`).
- `useTableFilter()` también da `setFilters` (varios filtros en una sola consulta).
- Ejemplos: «3. Búsqueda en cajón» en Tabla de servidor (saliendo de la izquierda) y Pedidos con su botón «Filtros», piezas
  desde y hasta y el total con operador (el servidor de mentira compara con Money).

## [0.45.0] - 2026-11-02

### Agregado

- `HelpCarouselDialog`: la ayuda en carrusel, pasos con imagen o ilustración, título y texto; se avanza con «Siguiente», los
  puntos, las flechas del teclado o deslizando con el dedo; «Listo» en el último; casilla «No volver a mostrar»; sin
  animación con «reducir movimiento». Avisa `onClose(reason, {dontShowAgain})` (`HELP_CLOSE_REASON`) y `onStepChange`.
  Pieza del tema `CalcitaHelpCarouselDialog`.
- `useHelpCarousel({helpKey, version, autoOpen, seen})`: la abre sola la primera vez y por versión; terminarla la recuerda,
  cerrarla antes solo con «No volver a mostrar»; `seen` para lo que ya sabe el servidor del proyecto.
- `HelpButton`: el «?» que vuelve a abrir la ayuda.
- Ejemplos: «6. Ayuda en carrusel» en Marco y menú; Tareas la enseña sola la primera vez, con su «?» en el encabezado.

## [0.44.0] - 2026-11-02

### Agregado

- `RouteTabs`: pestañas donde cada una es una dirección (se comparte la liga, «atrás» regresa a la anterior, se abre en
  otra pestaña del navegador). Por ruta (`tabs[].to`, `exact`) o dentro de una pantalla en la consulta (`mode="query"`,
  `paramName`), con ícono, conteo (`badge`), permiso (`access`, con la regla de ToolkitProvider), apagada u oculta, y
  `onChange`. `useActiveRouteTab` dice cuál está activa para pintar su panel. Usa la navegación conectada (react-router,
  Next o la del navegador). Pieza del tema `CalcitaRouteTabs`.
- Ejemplos: «5. Pestañas por ruta» en Marco y menú; las pestañas de Formularios ya son `RouteTabs`.

## [0.43.0] - 2026-11-02

### Agregado

- `IconBadge`: la insignia, un ícono y un texto corto con el color de lo que significan; con borde, tenue o sin caja
  (`ICON_BADGE_VARIANT`), en dos tamaños, con su explicación al pasar el cursor. Desde un diccionario (`dictionary` y
  `value`) saca texto, explicación, color e ícono. El texto se lee en claro y en oscuro (medido: 5.3 : 1 o más). Pieza del
  tema `CalcitaIconBadge` y clases fijas `ICON_BADGE_CLASSES`.
- `dictionaryEntryOf` acepta `{icon}`: el ícono con que se pinta la entrada en una insignia.
- Ejemplos: «3. Insignias» en Diccionarios de Hecho en Calcita; el detalle de pedido con la forma de pago y el segundo
  intento de entrega como insignias.

### Cambiado

- Los comentarios, los textos y los ejemplos de la cuenta regresiva, «publicar con anticipación» y la lista de
  transferencia usan casos neutros (unas inscripciones, una promoción, quién puede ver un reporte).

## [0.42.0] - 2026-11-02

### Agregado

- `CheckboxGroupInput` y `FormCheckboxGroupField` (formik y react-hook-form): pocas opciones a la vista con su casilla y su
  explicación, en columna o en renglón (`row`), con «Elegir todos» (`selectAll`). Pieza del tema `CalcitaCheckboxGroupInput`.
- `TransferListInput` y `FormTransferListField`: dos columnas, «Disponibles» y «Elegidos», con buscador en cada una,
  «marcar los que se ven», pasar los marcados, pasar todos y doble clic para pasar uno; en el teléfono una debajo de otra.
  Pieza del tema `CalcitaTransferListInput`.
- `SelectInput` con `multiple`: `selectAll` («Elegir todos» con su casilla a medias) y `checkboxes` (una casilla por opción
  en lugar de la palomita); `options[].disabled`.
- `CatalogInput` con `multiple`: `selectAll` (con algo buscado, «Elegir los N que coinciden», y lo buscado se queda para
  seguir eligiendo), `checkboxes` y `limitTags` («+3 más» con el campo sin foco).
- `selectAllStateOf`: la regla de «todos» sin React.
- Ejemplos: secciones 8 y 9 en Formularios de Hecho en Calcita; el alta de cliente con «Elegir todos» en días y estados; en
  «Condiciones del cliente», los avisos de cobranza (casillas) y las sucursales donde puede comprar (transferencia), con el
  servidor de mentira que revisa que cada sucursal del reparto esté entre ellas.

## [0.41.1] - 2026-11-02

### Arreglado

- `NumberInput` (y `FormNumberField`): al entrar con Tab a un monto que llegó sin decimales («50000», que se pinta
  «50,000.00»), lo tecleado se pegaba al final en lugar de reemplazar (salía 50,000,100,000). Al entrar el texto cambia y el
  navegador perdía la selección; ahora, si estaba todo seleccionado, se vuelve a seleccionar. Con un clic no cambia nada.

## [0.41.0] - 2026-11-02

### Agregado

- `FormRepeatingFields` (formik y react-hook-form) y la vista `RepeatingFields`: renglones de campos que se repiten, con su
  número, «Quitar» y «Agregar»; `minRows` (con el mínimo, «Limpiar») y `maxRows`; quitar lo decide la pantalla
  (`removeBlockedReason` con su motivo, `confirmRemove` para lo guardado); el renglón con error en rojo; campos lado a lado
  en escritorio (`columns`) y uno debajo de otro en el teléfono; `rowLabelOf`, `rowActionsOf`, `footer`, `onAdd`,
  `onRemove`. Llaves estables por renglón (`useRowKeys`). Pieza del tema `CalcitaRepeatingFields`.
- Reglas de listas para yup: `uniqueInListRule` (sin repetidos), `orderedInListRule` (en orden, dice entre cuáles va) y
  `listTotalAtMostRule` con `listTotalOf` (la suma con Money contra un tope de otro campo), en `/forms` y
  `/react-hook-form`.
- `/react-hook-form` también pasa `useWatch` y `useFieldArray`.
- Ejemplos: secciones 6 y 7 en Formularios de Hecho en Calcita y la pantalla «Condiciones del cliente» (reparto del crédito
  por sucursal, descuentos por volumen y contactos) con su servidor de mentira.

### Cambiado

- `applyServerProblem` (formik y react-hook-form): el error del servidor en un campo de un renglón que el formulario tiene
  (`contacts.2.email`) va a ese renglón; antes se reducía a `email` y, sin ese campo, iba al aviso de arriba. Lo demás no
  cambia (`splitRowFieldErrors`).

## [0.40.0] - 2026-11-02

### Agregado

- `FileUploadInput` y `FormFileUploadField` (formik y react-hook-form): el cargador mini que SUBE en cuanto se elige, para
  listas de documentos. Estado en una etiqueta (Por cargar, Subiendo N %, Procesando, Cargado, No se cargó), «Cargar» que
  ya cargado dice «Sustituir», bajar el subido (`download`), quitar, cancelar a media subida y abajo el avance en palabras
  (lo que va, la velocidad y lo que falta) o el motivo del error. Al formulario llega solo el id que da el servidor
  (`idOf`); una llave por archivo elegido viaja con la subida. Eventos `onStatusChange`, `onUploaded`, `onUploadFailed`,
  `onCancel` y `onRemove`; lo del negocio junto con `actions`. Pieza del tema `CalcitaFileUploadInput`.
- `FILE_UPLOAD_STATUS` y `transferProgressOf` (la velocidad y lo que falta de una subida).
- `uploadWithProgress` y `uploadMachine` también dan los bytes que van (`transfer`), además del porcentaje; quien ya los
  usaba no cambia nada.
- Ejemplos: «4. El cargador mini» en Subir archivos; la solicitud de crédito pide sus documentos en un paso nuevo (el
  servidor de mentira rechaza un PDF que no lo es y revisa que los ids sean de documentos subidos).

## [0.39.0] - 2026-11-02

### Agregado

- `DateTimeInput` con `minimumMinutesFromNow`: «al menos N minutos después de ahora» (publicar con anticipación), con un
  mínimo que se recorre solo con el reloj mientras la pantalla está abierta (`useCurrentMinute`).
- `instantPlusMinutes`, `earliestInstantFromNow` y `latestInstantOf` para armar mínimos (el fin, al menos N minutos después
  del inicio), y las reglas de yup `minutesFromNowRule` y `minutesAfterRule` con sus mensajes en español e inglés.
- Ejemplos: «Publicar con anticipación» en Fechas y horas; posponer correo a mano, al menos 5 minutos después de ahora (el
  servidor de mentira lo vuelve a revisar).

### Cambiado

- `DateTimeInput` y `TimeInput`: los minutos van de uno en uno (MUI X los trae de 5 en 5); `minutesStep` los sigue
  cambiando.

### Arreglado

- Con vidrio, las columnas de horas y minutos heredaban la palomita de los menús: tapaba el número y lo corría. Ahora el
  elegido va como el día elegido del calendario, centrado y sin palomita; en oscuro ya no sale el número negro sobre el
  naranja (también en el minimalista).
- Ejemplo de la cuenta regresiva: las inscripciones cerraban en 8 segundos y al llegar a la sección ya decía «Cerrada»; ahora
  cierra en 2 minutos, con «Cerrar en 10 segundos» para ver el cierre, y la oferta y sus cajas traen segundos.

## [0.38.0] - 2026-11-02

### Agregado

- Puerta nueva `/rich-text` con Tiptap 3: `RichTextEditor` (estilo, negrita, cursiva, subrayado, tachado, listas, cita,
  código, ligas seguras, alineación, quitar el formato, deshacer y rehacer; `maxLength` con contador; `features` para elegir
  los botones; `toolbarActions`, `onEditorReady` y `extensions` para lo demás), `FormRichTextField` (formik) y `RichTextView`
  (enseña el HTML guardado sin dejar pasar `<script>`, `onclick` ni ligas `javascript:`). Viaja HTML; vacío es `''`.
- `linkUrlOf`, `isSafeLinkUrl` y `normalizedHtmlOf`: qué liga se acepta (https, http, mailto, tel) y el texto vacío.
- Ejemplos: página «Texto con formato» en Hecho en Calcita; la descripción de las tareas con el editor.

## [0.37.0] - 2026-11-01

### Agregado

- Puerta nueva `/mexico` (pide `jsrsasign` solo para abrir la llave de la e.firma; se baja hasta que se usa):
  - `isValidRfc` (forma y fecha; el dígito verificador con `{strict: true}`), `isValidCurp`, `isValidClabe`, `rfcKindOf`,
    los cálculos de cada dígito verificador y las reglas de yup `rfcRule`, `curpRule` y `clabeRule`.
  - `readCertificate` y `certificateStatusOf`: el certificado (.cer) de una e.firma o un sello digital leído en el
    navegador (RFC y CURP propios y del representante, nombre, número de certificado, vigencia).
  - `readCfdi` y `readCfdiFile`: la factura electrónica (CFDI 3.3 y 4.0) leída del XML, con los montos en texto.
  - `CfdiSummary`: el resumen de la factura con su folio fiscal, el aviso si es para otro RFC o si no está timbrada.
  - `verifyEfirmaKey`: abre la llave (.key) con su contraseña en el navegador y comprueba que es la del certificado, con el
    motivo de un «no» (`EFIRMA_KEY_PROBLEM`).
  - `EfirmaFields`: el .cer, el .key y la contraseña, con el certificado a la vista y «Revisar la e.firma» en el navegador;
    con `onVerifyKey` la revisión es del proyecto.
- Ejemplos: página «México: claves, e.firma y facturas» en Hecho en Calcita; módulo «Documentos fiscales» (cargar facturas
  de proveedores sin repetir el folio fiscal, la e.firma de la tienda y archivos de ejemplo para probar); la CLABE de la
  solicitud de crédito revisa su dígito verificador en la pantalla y en el servidor.

## [0.36.0] - 2026-11-01

### Agregado

- `MaskedInput` y su `FormMaskedField` (formik y react-hook-form): campo con máscara que enseña los separadores mientras se
  escribe y manda el valor limpio. `INPUT_MASK` con teléfono, código postal, CLABE, tarjeta, RFC, CURP y folio fiscal; una
  propia con `9`, `A`, `X` y `H`. Pegar con otros separadores funciona y escribir en medio no manda el cursor al final.
  `maskedTextOf`, `rawValueOf`, `isMaskComplete` y `maskPatternOf` sin React.
- `Countdown`, `useCountdown`, `countdownPartsOf` y `countdownClockOf`: la cuenta regresiva hasta un momento, con
  `onComplete` (una vez) y lo que dice al llegar a cero; para un lector de pantalla es un temporizador que no anuncia cada
  segundo.
- `PdfViewerDialog`: un PDF en la hoja de lectura de la casa con el visor del navegador, «Abrir en otra pestaña» y
  «Descargar».
- `CookieNotice` y `useCookieConsent`: el aviso de cookies por versión, recordado en el navegador.
- `TermsAcceptanceDialog`: aceptar los términos de una versión antes de seguir, leyendo hasta el final (o con un PDF).
- Ejemplos: «Documentos y avisos legales» en Hecho en Calcita, «Campos con máscara» en Formularios y «Cuenta regresiva» en
  Fechas y horas; la app de ejemplos trae su aviso de cookies (la política en el visor de PDF) y pide los términos nuevos a
  quien aceptó una versión vieja; el teléfono y la CLABE con máscara en el alta de cliente y la solicitud de crédito; la
  cita dice cuánto falta para empezar.

## [0.35.0] - 2026-11-01

### Agregado

- `CopyButton`: si el navegador no deja copiar, lo dice en rojo («No se pudo copiar…») en lugar de fingir que copió, y
  avisa con `onCopyFailed`. `value` puede ser una función (se arma al picar). La confirmación se queda a la vista mientras
  dura y se anuncia a los lectores de pantalla.
- `tableRowTextOf`: un renglón como texto separado por tabuladores, para que al pegarlo en Excel cada dato caiga en su celda.
- CLI: los proyectos nuevos traen pruebas de pantalla (`pnpm test`, Vitest con jsdom y Testing Library). `openScreen` abre la
  app completa en una dirección con el servidor de mentira (y la sesión de la demostración); vienen las del inicio, la de
  entrar y las del módulo de ejemplo, y `make:module` arma la de cada módulo nuevo.
- Ejemplos: «Ir a la página» en la tabla de pedidos y «Copiar el pedido para pegarlo en Excel» en su detalle.

### Corregido

- «Ir a la página» de `ServerTable` llega a todas las páginas: la lista pinta solo las que se ven (react-window) y abre en la
  página actual. Antes se cortaba en 100 y la 101 solo se alcanzaba tecleando.

### Cambiado

- **`/table` pide `react-window`** (2 o más nuevo), para la lista de «Ir a la página». Un proyecto que ya usa la tabla
  agrega `pnpm add react-window`.

## [0.34.0] - 2026-11-01

### Agregado

- `FileInput` y su `FormFileField` (formik y react-hook-form): un archivo del tamaño de un campo, con «Elegir archivo», el
  elegido en su chip con la × y su ayuda o su error abajo; dentro de una `FormSection` es un renglón. Acepta lo ya guardado
  (`{name, size}`) al editar.
- `AttachmentsInput` y su `FormAttachmentsField`: varios archivos como en un correo, con `maxFiles`, `maxTotalSize`,
  `onRemove`, y `showButton={false}` + `pickerRef` para abrir la ventana desde un botón propio. Un archivo con el mismo
  nombre reemplaza al que estaba. La lista conserva el tipo de lo ya guardado.
- `ImageInput` y su `FormImageField`: una foto con su vista previa (sin subirla), en círculo o recuadro (`IMAGE_SHAPE`),
  con `placeholder` para las iniciales.
- `TemplateDownloadButton`: «Descargar la plantilla» con `href` (un archivo fijo) o `request` (su API, por el panel de
  descargas). `template` en `FileDropzone`, `FileInput` y `AttachmentsInput` lo pone junto a su botón.
- `useFilePicker` (para armar un cargador propio), `screenFiles` (qué pasa y qué no, con su motivo: tipo, peso, cuántos y
  cuánto juntos) y `fileAppearanceOf` (el ícono y el color de cada tipo de archivo).
- Ejemplos: secciones 3 a 7 en «Subir archivos» de Hecho en Calcita; la importación de pagos ofrece su plantilla de Excel,
  el alta de cliente pide la constancia fiscal, el correo adjunta con el clip y la sucursal nueva lleva su foto en el globo
  del mapa.

### Cambiado

- `FileDropzone` usa las mismas piezas que los cargadores nuevos (`useFilePicker`, el chip del archivo); se ve y se porta
  igual.

## [0.33.0] - 2026-11-01

### Agregado

- `/date-pickers`: `DateTimeInput` y `FormDateTimeField` (fecha con hora), `TimeInput` y `FormTimeField` (hora del día) y
  `MonthInput` y `FormMonthField` (mes), con los selectores de MUI X. La fecha con hora viaja como instante en UTC
  (`'2026-11-01T18:30:00Z'`; también lee lo que llega con desfase, `'…-06:00'`) y se ve en la zona del proveedor con su
  nombre abajo (`timeZone` la cambia en un solo campo; `showTimeZone` y `timeZoneLabel` lo quitan o lo cambian). La hora
  viaja `'HH:mm'` de 24 horas y el mes `'AAAA-MM'`. La hora se ve de 24 horas o con a. m. y p. m. según `hourCycle`.
- `CALENDAR_MONTH_FORMAT`, `INSTANT_FORMAT`, `TIME_OF_DAY_FORMAT` y `timeZoneNameOf` (el nombre de una zona como lo dice
  una persona).
- `pickerProps` en los cuatro campos (también en `DateInput`): lo demás del selector de MUI X (`shouldDisableDate`,
  `slots`, `localeText`…); su `onClose` también se llama.
- Ejemplos: página «Fechas y horas» en Hecho en Calcita; las citas eligen la hora con `TimeInput`, el correo pospone hasta
  un día y hora con `DateTimeInput`, y el reporte por mes se filtra entre dos meses con `MonthInput`.

## [0.32.2] - 2026-10-19

### Corregido

- `SessionsCard`: cada sesión era un `<li>` dentro del `<li>` de la lista (HTML no válido; React lo marcaba en la consola
  mientras se programa). Ahora el renglón va como `div` dentro de su `<li>`.

## [0.32.1] - 2026-10-19

### Corregido

- `TextInput` respeta lo que la pantalla pasa en `slotProps` (por ejemplo `htmlInput: {maxLength}`): se pisaba con los
  adornos de la casa y el tope de caracteres se perdía sin avisar. Salió al pasar a Calcita la búsqueda de un sistema que ya
  existía.
- `TextInput` documenta `helperText=""`: sin él, el campo deja su renglón vacío abajo (para que no brinque al salir un error)
  y un botón al lado en el mismo renglón queda más abajo que la caja.

## [0.32.0] - 2026-10-19

### Agregado

- `ToolkitProvider hourCycle`: la hora de 24 horas («15:10», como antes y por omisión) o de 12 con a.m. y p.m. («3:10 p.m.»),
  con `HOUR_CYCLE.twentyFourHours` o `HOUR_CYCLE.twelveHours`. La usan `formatDateTime`, `formatTime` y `useFormatters()`.
  Antes la hora era siempre de 24 horas y un sistema que ya existía no podía conservar la suya.
- Aviso en la consola, mientras se programa, cuando una pieza recibe una opción que no conoce (`Calcita · ServerTable no
  conoce la opción «countNoun» y no la usa…`): en las piezas con nombre en el tema, los componentes que leen sus opciones,
  `detailColumn` y `createToolkitTheme`. Una vez por pieza y opción; en producción no avisa. Salió de pasar las pantallas de
  un sistema que ya existía: opciones con otro nombre se perdían en silencio y la pantalla salía sin esos textos.

### Corregido

- `CalendarHeatmap` ya no truena sin `startsOn` y `endsOn`: sin ellos abarca el último año hasta hoy (en la zona del
  proveedor), y sin `describeValue` el globo de cada día dice solo el número. `days` también se puede omitir.

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
