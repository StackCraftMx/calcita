# Calcita

`@stackcraftmx/calcita` · un framework de React sobre MUI 7 con el vidrio líquido de Apple. La calcita es el cristal
transparente famoso por doblar la luz, y eso es lo que define al vidrio líquido: su lente.

Arranca un proyecto sin copiar y volver a probar lo de siempre: el marco de la app con menú y permisos, tabla de servidor,
diálogos de confirmación, avisos, descargas, formularios, formatos de número y fecha, errores RFC 9457, reportes en Excel,
la cuenta completa, mapa, calendario, tablero kanban, bandeja tipo correo y el tema con vidrio líquido, interpretado
componente por componente según la guía de Apple.

JavaScript con sus tipos generados: se usa igual desde un proyecto en TypeScript. Sirve para un proyecto nuevo y también
para meterlo por pedazos en un sistema que ya existe (ver «En un sistema que ya existe»).

> **Versiones:** Calcita está hecha y probada con **MUI 7** (Material 7.3, MUI X 8), React 19 y react-router 7. MUI 9 ya
> existe, pero cambia piezas que Calcita usa: todavía no está soportado. Con MUI 9 en el proyecto, quédese en MUI 7 por
> ahora.

## Arrancar un proyecto con el CLI

```bash
pnpm dlx @stackcraftmx/calcita new mi-tienda     # o: npx @stackcraftmx/calcita new mi-tienda
cd mi-tienda
pnpm install
pnpm dev
```

Pregunta cómo lo quiere (Enter acepta lo recomendado): el menú a un lado o arriba; vidrio, sin vidrio o minimalista; claro
y oscuro o solo claro; los colores de Stackcraft, los de MUI o uno propio; formik o react-hook-form; los textos de Calcita o
i18next; las pantallas de entrar, «¿Olvidó su contraseña?» y Mi perfil; y si se puede instalar como app (PWA). Con `--yes`
no pregunta, y cada respuesta también va como opción (`--forms=react-hook-form`, `--menu-position=top`…;
`calcita --help` las dice todas).

Sale un proyecto de Vite con la forma de los ejemplos: `src/app` (el único lugar donde se conecta el framework),
`src/core` (lo que comparten los módulos), `src/fakeServer` (el servidor de mentira, con la forma del API de verdad) y
`src/modules/<módulo>`, cada uno con su menú, sus rutas, sus pantallas, su API y sus textos en español e inglés, que se
descubren solos. Trae un módulo de ejemplo (Contactos: lista, formulario, errores del servidor en su campo) y
`src/core/apiClient.js` listo para cambiar el servidor de mentira por el de verdad.

Para crecerlo, dentro del proyecto:

```bash
pnpm exec calcita make:module purchase-orders --label-es "Órdenes de compra" --label-en "Purchase orders"
pnpm exec calcita make:page purchase-orders OrderDetail        # la pantalla y su ruta en routes.js del módulo
pnpm exec calcita make:form purchase-orders SupplierForm       # con la librería del proyecto (calcita.json)
pnpm exec calcita make:component StatusBadge                   # en src/core, y en su puerta
pnpm exec calcita make:component OrderTotals --module purchase-orders
```

El CLI nunca pisa un archivo que ya existe. Sus plantillas son los archivos tal cual (`cli/templates`), con
`//#if pwa` … `//#endif` en lo que depende de una respuesta.

## Arrancar en un proyecto que ya existe

```bash
pnpm add @stackcraftmx/calcita @mui/material @mui/icons-material @emotion/react @emotion/styled xstate @xstate/react sonner
pnpm add formik yup     # solo si usa /forms o /account
```

Con npm es igual, con `npm install` en lugar de `pnpm add`. Desde la 0.25, formik y yup los pone el proyecto: Calcita usa
la versión que ya tenga, no se casa con una.

```jsx
import {ThemeProvider, createTheme} from '@mui/material/styles';
import {ToolkitProvider, Toaster} from '@stackcraftmx/calcita';

const theme = createTheme(); // el tema lo arma cada proyecto; sin él, los colores por omisión de MUI

export const App = () => (
    <ThemeProvider theme={theme}>
        <ToolkitProvider appName="Mi aplicación">
            <Toaster />
            {/* las pantallas */}
        </ToolkitProvider>
    </ThemeProvider>
);
```

Sin nada más, todo sale en español, con la zona horaria del navegador, montos en pesos y la navegación del navegador.

## Lo que se conecta en ToolkitProvider

| Prop | Para qué | Por omisión |
|---|---|---|
| `language`, `onLanguageChange` | idioma activo y a quién avisar cuando se cambia | `es` |
| `languages` | los idiomas que ofrece la app, con su nombre y su locale (`{code: 'pt', label: 'Português', locale: 'pt-BR'}`); sus traducciones van en `texts` | español e inglés |
| `texts` | cambiar textos del paquete, por idioma: `{es: {common: {actions: {back: 'Volver'}}}}` | los del paquete |
| `translate` | un traductor propio, por ejemplo i18next | ninguno |
| `timeZone` | zona en que se pintan las horas | la del navegador |
| `currency` | moneda de los montos (ISO 4217) | `MXN` |
| `appName` | nombre en el título de la pestaña | ninguno |
| `navigation` | el router: `{useNavigate, useLocation, Link}` | la del navegador |
| `canAccess` | quién ve qué (menú, rutas, botones): la regla del proyecto, normalmente `createAccessChecker(...)` | solo lo que no tiene regla |
| `buildId` | la compilación del front que corre en la pestaña, para el aviso de versión nueva | ninguna (sin aviso) |
| `fileTypes` | tipos de archivo propios para las descargas (su ícono y su color), además de Excel, CSV y PDF | los de la casa |

Un `ToolkitProvider` dentro de otro (una parte de la app en otro idioma, una vista previa) toma del de afuera lo que no le
digan, y lo de adentro usa el suyo: el más cercano. No le cambia nada al resto de la app. Dentro de un componente,
`useFormatters()` da los formatos (`formatDate`, `formatCurrency`…) con el idioma, la zona y la moneda del proveedor más
cercano; los sueltos usan los del proveedor de la raíz.

Con react-router y i18next:

```jsx
import {reactRouterNavigation} from '@stackcraftmx/calcita/react-router';
import {translateWithI18next} from '@stackcraftmx/calcita/i18next';

<ToolkitProvider
    navigation={reactRouterNavigation}
    language={i18n.resolvedLanguage}
    onLanguageChange={(language) => i18n.changeLanguage(language)}
    translate={translateWithI18next(i18n)}
>
```

## Aviso de versión nueva

Una pestaña abierta desde hace horas sigue corriendo el front con que se abrió. Si el servidor anuncia en sus
respuestas qué compilación está publicada, el paquete enseña una franja «Hay una versión nueva» con su botón
«Recargar». No recarga solo: la persona decide cuándo.

```jsx
import {NewBuildNotice, reportPublishedBuild} from '@stackcraftmx/calcita';

// 1. la compilación de esta pestaña (por ejemplo, de una variable de entorno al construir)
<ToolkitProvider buildId={import.meta.env.VITE_BUILD_ID}>

// 2. el cliente HTTP entrega la que anuncia el servidor en cada respuesta (aquí, en un header)
axiosClient.interceptors.response.use((response) => {
    reportPublishedBuild(response.headers['x-frontend-build']);
    return response;
});

// 3. la franja, donde se vea siempre (normalmente dentro del AppBar); sin versión nueva no ocupa lugar
<NewBuildNotice />
```

Con `AppLayout` no hace falta el paso 3: el marco ya lo pone. Con vidrio no es franja sino una cápsula que flota aparte
de la barra (`variant="floating"`): en escritorio, centrada debajo de la barra de arriba; en el teléfono, encima de la
barra de abajo, como el reproductor chico que Apple pone encima de las pestañas.

Sin API que anuncie la versión, o con la app anclada al inicio del iPhone (al abrirla, el iPhone no vuelve a pedir la
página: retoma la que tenía en memoria, aunque haya pasado un día), `usePublishedBuildWatch` se entera sola. El build deja
un archivo con su versión y la app lo vuelve a leer cada vez que regresa del segundo plano y cada tanto. Si estuvo fuera
15 minutos o más, se recarga sola con lo nuevo; si solo salió un momento (a copiar un código del SMS), sale el aviso con su
botón, para no borrar lo que llevaba escrito.

```js
// vite.config.js: la versión va dentro de la app y en dist/version.json
const BUILD_ID = process.env.VITE_BUILD_ID || new Date().toISOString();
export default defineConfig({
    plugins: [react(), {
        name: 'build-version', apply: 'build',
        generateBundle() { this.emitFile({type: 'asset', fileName: 'version.json', source: JSON.stringify({buildId: BUILD_ID})}); },
    }],
    define: {'import.meta.env.VITE_BUILD_ID': JSON.stringify(BUILD_ID)},
});

// en la raíz de la app, una vez (en desarrollo no hay archivo: sin url no hace nada)
usePublishedBuildWatch({url: import.meta.env.PROD ? `${import.meta.env.BASE_URL}version.json` : null, buildId: import.meta.env.VITE_BUILD_ID});
// opciones: checkEveryMinutes (5), reloadAfterHiddenMinutes (15; null = nunca recarga sola), onReload
```

El servidor no debe guardar `version.json` (con `Cache-Control: no-cache`, como el `index.html`).

## Qué trae cada puerta

Cada puerta pide solo sus librerías; un proyecto instala lo que usa.

| Importar de | Trae | Pide además |
|---|---|---|
| `@stackcraftmx/calcita` | proveedor, marco de la app, diálogos, avisos, descargas, encabezados, filtros, chips, métricas, formatos (`useFormatters`), fechas, errores RFC 9457, la petición de la casa (`createApiClient`), la recuperación de versión vieja, la navegación sin router (`createBrowserNavigation`, `createHashNavigation`), la búsqueda de la barra (`BarSearch`), el menú «⋯» (`ActionsMenu`), las acciones de lo elegido (`SelectionActions`), la seguridad de la cuenta (códigos de recuperación, sesiones, bitácora) y la bandeja tipo correo (`InboxLayout`, `MessageList` con selección, `MessageView` con la conversación) | — |
| `@stackcraftmx/calcita/table` | `ServerTable`: paginada, filtrada y ordenada en el servidor, con su estado en la URL | `@mui/x-data-grid`, `nuqs` |
| `@stackcraftmx/calcita/forms` | campos de formik (texto, lista de una o varias opciones, número con miles, catálogo, color), formulario por pasos, aviso de arriba, errores del servidor pegados a cada campo | `formik`, `yup` |
| `@stackcraftmx/calcita/react-hook-form` | los mismos campos con los mismos nombres, conectados a react-hook-form, su formulario por pasos y `yupResolver` | `react-hook-form`, `@hookform/resolvers` (y `yup` si valida con yup) |
| `@stackcraftmx/calcita/date-pickers` | la fecha con el DatePicker de MUI X (`DateInput`, `FormDateField`); viaja `AAAA-MM-DD` | `@mui/x-date-pickers` 8, `dayjs` |
| `@stackcraftmx/calcita/charts` | barras, columnas y líneas (una serie o varias), cada una con su vista de tabla, y `ChartTooltip` para las propias | `recharts` |
| `@stackcraftmx/calcita/timeline` | línea de tiempo por grupos | `@mui/lab` |
| `@stackcraftmx/calcita/excel` | reporte en Excel (Resumen y Datos) y CSV | `exceljs`, que se le pasa al llamarlo |
| `@stackcraftmx/calcita/react-router` | el adaptador de navegación | `react-router` |
| `@stackcraftmx/calcita/i18next` | el adaptador de textos | `i18next` (la instancia del proyecto) |
| `@stackcraftmx/calcita/laravel` | el reintento del 419 de Sanctum | — |
| `@stackcraftmx/calcita/filepond` | `FileDropzone` con FilePond: el mismo uso que la de la puerta principal, más varios archivos, avance por archivo y `createPondServer` | `filepond`, `react-filepond`, `filepond-plugin-file-validate-type`, `filepond-plugin-file-validate-size` |
| `@stackcraftmx/calcita/next` | la navegación de Next.js (App Router) para ToolkitProvider; los componentes ya vienen marcados con `'use client'` y los puros sirven en el servidor | `next` |
| `@stackcraftmx/calcita/money` | `Money`: dinero exacto en centavos enteros, con suma, resta, multiplicación, división, potencia, raíz y su formato con la moneda | — |
| `@stackcraftmx/calcita/passkeys` | llaves de acceso (passkeys): crearlas y firmar con ellas, con los errores del navegador en palabras de la persona | `@simplewebauthn/browser` 14 |
| `@stackcraftmx/calcita/account` | la cuenta completa: `SignInScreen` (con el segundo paso), `ForgotPasswordScreen`, `ResetPasswordScreen`, `ProfileScreen` (con campos y pestañas propias), `AccountSecuritySection`, `AccountProvider` y `createRestAccountConnector` | `@simplewebauthn/browser` 14, `formik`, `yup` |
| `@stackcraftmx/calcita/account-demo` | `createDemoAccountConnector`: la cuenta en el navegador, sin backend (y los códigos TOTP) | — |
| `@stackcraftmx/calcita/maps` | `MapView`: mapa con marcadores del color del tema, el elegido con su globo, se acomoda solo; en oscuro, mosaicos oscuros | `leaflet`, `react-leaflet` 5 |
| `@stackcraftmx/calcita/calendar` | `EventCalendar`: mes, semana, día y lista, con la barra del framework; arrastrar cambia la cita y regresa si el servidor dice que no. `EventDetails`: el detalle de una cita (lugar, liga de la reunión, invitados con su respuesta, recordatorio, notas) | `@fullcalendar/react`, `core`, `daygrid`, `timegrid`, `list`, `interaction` 6.1 |
| `@stackcraftmx/calcita/kanban` | `KanbanBoard`: columnas con tope (y que se encogen, como un congelador) y tarjetas de producto (etiquetas, responsables, fecha, pendientes, terminar) que se arrastran con el ratón, el dedo o el teclado; `moveCard` para ver la movida al instante | `@hello-pangea/dnd` 18 |

## El tema

`createToolkitTheme()` es opcional (ToolkitProvider funciona con cualquier tema de MUI) y trae el estilo de Stackcraft:
claro y oscuro con variables CSS, letra base de 16 px (con menos, el iPhone hace zoom al entrar a un campo), tamaños que
se ajustan al ancho, transiciones de 220 ms, esquinas de 8 px, botones sin mayúsculas y contorno de foco visible.

```js
const theme = createToolkitTheme();                                   // los colores de Stackcraft
const theme = createToolkitTheme({glass: true});                      // vidrio líquido en lo que flota y en los controles
const theme = createToolkitTheme({colorSchemes: {light: {palette: {primary: {main: '#0B5FFF'}}}, dark: {palette: {…}}}});
const theme = createToolkitTheme({components: {MuiCard: {…}}});        // se SUMA a los ajustes del framework
```

El vidrio es la versión en CSS del Liquid Glass de Apple (60 % de opacidad por omisión). Va en lo que flota sobre el
contenido y en los controles, como pide su guía:

- la barra y el menú lateral, que en escritorio flotan a 8 px de la orilla;
- los menús, las listas de opciones, el calendario, los menús de la tabla, los diálogos, los tooltips, los avisos, el
  panel de descargas, el botón flotante y la barra de pestañas de abajo;
- la «gota» que marca lo elegido en las pestañas y en los botones de opción, que se desliza a la opción nueva;
- botones en píldora que se hunden al apretarlos;
- un lienzo con manchas tenues de color, para que el vidrio tenga algo que desenfocar.

Las tarjetas del contenido se quedan sólidas, para que el texto largo se lea, salvo que el proyecto las pida de vidrio.
Todo se pinta sólido si la persona pidió en su equipo «Reducir transparencia» o «Aumentar contraste». La refracción (el
lente que dobla lo de atrás en la orilla del vidrio) sale en Chrome y sus parientes (Edge, Brave, Arc) con
`GlassLensFilter`, que `AppLayout` y `AuthLayout` ya ponen; Safari y Firefox no pintan ese filtro y ahí el vidrio se queda
esmerilado.

```js
const theme = createToolkitTheme({glass: {opacity: 0.7}});            // más transparente (0 a 1)
const theme = createToolkitTheme({glass: {surfaces: true}});          // también las tarjetas del contenido
```

`surfaces` se puede usar, pero avisa en la consola: cada tarjeta de vidrio desenfoca lo que tiene detrás (pesa más en
equipos modestos) y la guía de Apple pide el contenido sin vidrio. Va bien en una portada o una demostración, no en
pantallas de trabajo.

La barra de arriba va sin franja, como las ventanas de macOS Tahoe: la ☰ con el nombre, el menú y la cuenta en cápsulas,
y el título suelto. Con vidrio las cápsulas son de vidrio y el contenido pasa por debajo, desenfocado en la orilla para
que todo se lea (`scrollEdgeStylesOf`); con el minimalista son bloques del tono de las tarjetas, también en el teléfono.
Con cápsulas, el menú encogido deja la cuenta arriba en su cápsula, y en el teléfono el minimalista también lleva la
barra de pestañas de abajo (sólida, del gris 5 de Apple). Quien prefiera la franja de lado a lado la pide;
está en el mismo alto y el mismo lugar, así que nada más se mueve. El estilo de Stackcraft sin vidrio sigue con su barra.

```js
const theme = createToolkitTheme({glass: true, bar: TOP_BAR.band});   // la franja; por omisión TOP_BAR.capsules
```

Cada pantalla puede poner sus propias cápsulas en la barra (buscar, agregar, exportar) con `BarActions`: las escribe en
su código donde quiera y, en escritorio con cápsulas, el marco las sube a la barra; con la franja entran a la franja, y en
el teléfono, con cápsulas, flotan arriba a la derecha y se quedan al bajar: las que caben, solo con ícono, y las que no,
en un menú «⋯». Las `actions` de `PageHeading` ya suben solas, y `ServerTable` sube su búsqueda con
`searchInBar`. «Hecho en Calcita» → «Marco y menú» lo enseña vivo.

```jsx
<BarActions label="Buscar en pedidos" order={1}>
    <IconButton aria-label="Buscar" onClick={openSearch}><SearchRoundedIcon /></IconButton>
</BarActions>
<BarActions label="Acciones de pedidos" order={2}>                       {/* otro grupo, otra cápsula */}
    {/* en la cápsula, solo el ícono con su nombre en el tooltip */}
    <BarActionButton label="Agregar pedido" icon={<AddRoundedIcon />} onClick={openNew} />
</BarActions>
<BarCapsule aria-label="Zoom">…</BarCapsule>                              {/* la misma cápsula, fuera de la barra */}
```

En Android conviene arrancar con el minimalista: el vidrio es el estilo de Apple (allá se ve ajeno) y el desenfoque pesa
en los teléfonos baratos. `isAndroidDevice()` lo dice; con Next, desde el servidor, se le pasa la identificación del
navegador: `isAndroidDevice({userAgent: headers.get('user-agent')})`. Sirve para elegir un estilo, no para seguridad.

```js
const theme = isAndroidDevice() ? createToolkitTheme({look: THEME_LOOK.minimal}) : createToolkitTheme({glass: true});
```

Los campos de captura (con vidrio, con el minimalista y dentro de `FormSection`) traen el gris de relleno de Apple. Para que
se vean como los de su sistema: `fields`, por modo, con el relleno (`fill`), el relleno con el cursor encima (`hoverFill`),
la orilla (`border`) y la orilla con el cursor encima (`hoverBorder`); y sus esquinas (`radius`). Lo que no se pase se queda
como lo trae el estilo (`FIELD_TONES`). Van en la paleta de cada modo (`palette.field`): cambian solos con el modo y también
se pueden escribir en `colorSchemes`.

```js
createToolkitTheme({glass: true, fields: {radius: 8, light: {fill: '#FFFFFF', hoverFill: '#FFFFFF', border: '#C4CDD5'}}});
```

El minimalista separa las superficies por su tono con los grises de Apple. Para pintarlo con los colores de la marca:
`minimalTones`, por modo, con el fondo de la página (`default`), las tarjetas (`paper`), el relleno de campos, grupos y
botones sin color (`fill`) y lo que flota, como la barra del teléfono (`floating`). Lo que no se pase se queda con el gris
de Apple (`MINIMAL_TONES`). Ojo: con el minimalista el fondo sale de aquí y no de la paleta.

```js
createToolkitTheme({
    colorSchemes: {light: {palette: brandLight}, dark: {palette: brandDark}},
    look: THEME_LOOK.minimal,
    minimalTones: {light: {default: '#EEF4FF', fill: '#DCE6F5'}, dark: {default: '#101827', paper: '#1A2333'}},
});
```

Para lo que el proyecto quiera hacer flotar (los botones encima de un mapa, una barra de acciones): `GlassPanel`, que es
de vidrio si el tema lo trae y una tarjeta con sombra si no. Para algo propio: `sx={(theme) => glassStylesOf(theme)}` e
`isGlassTheme(theme)`. Cada ajuste vive en su archivo (`src/theme/components/MuiButton.js`…).

Todas las piezas de Calcita se cambian desde el tema del proyecto igual que las de MUI: con su nombre en `components`,
`styleOverrides` para cada parte y `defaultProps`. El orden, de abajo hacia arriba: el estilo de Calcita, encima el del
tema del proyecto y al final el `sx` que pase la pantalla. Los números se leen como en MUI (`borderRadius: 4` son 4 px).
Sirve con `createToolkitTheme` y con cualquier tema de MUI (el que ya tenía un sistema, tal cual): así un sistema puede
dejar Calcita con su propia cara, parte por parte.

<details>
<summary>Las piezas, con su nombre en el tema y sus partes</summary>

| Nombre en el tema | Partes |
| --- | --- |
| `CalcitaAccountMenu` | `button`, `avatar`, `header`, `name`, `settings` |
| `CalcitaAccountSecurity` | `title`, `form` |
| `CalcitaActionsMenu` | `item`, `itemIcon` |
| `CalcitaActivityLog` | `itemIcon` |
| `CalcitaAppearanceSettings` | `selectSection`, `section`, `sectionLabel`, `option`, `divider` |
| `CalcitaAppLayout` | `skipLink`, `brand`, `brandLogo`, `brandText`, `brandName`, `brandCaption`, `titleArea`, `phoneTitle`, `desktopTitle`, `railBrand`, `railLogo`, `collapseButton`, `root`, `scrollEdge`, `bar`, `toolbar`, `menuButton`, `spacer`, `tools`, `progress`, `body`, `drawer`, `main`, `phoneSlot`, `content`, `phoneDrawer` |
| `CalcitaAuditTrailDialog` | `description` |
| `CalcitaAuthLayout` | `root`, `tools`, `body`, `brand`, `logo`, `brandName`, `card`, `description`, `content`, `footer` |
| `CalcitaBarActions` | `group` |
| `CalcitaBarCapsule` | `root` |
| `CalcitaBarList` | `row`, `chart` |
| `CalcitaBarSearch` | `field` |
| `CalcitaCalendarHeatmap` | `header`, `toggle`, `tableArea`, `dateCell`, `valueCell`, `descriptionCell`, `gridArea`, `grid`, `monthLabel`, `week`, `dayLabel`, `cell`, `legend`, `legendLess`, `legendCell`, `legendMore` |
| `CalcitaChart` | `tableArea`, `legend`, `legendItem`, `legendLine`, `legendSwatch`, `reference`, `referenceLine` |
| `CalcitaChartTooltip` | `root` |
| `CalcitaCollapsibleSection` | `root`, `accordion`, `summary`, `titleArea`, `collapsedTitle`, `expandedTitle`, `details` |
| `CalcitaColorInput` | `swatch`, `nativeInput` |
| `CalcitaColorSchemeToggle` | `button` |
| `CalcitaColumnChart` | `chart` |
| `CalcitaConfirmDialog` | `problem`, `actions` |
| `CalcitaContentDialog` | `header`, `title`, `closeButton`, `body` |
| `CalcitaDateRangeFilter` | `chip`, `panel`, `actions` |
| `CalcitaDefinitionList` | `root`, `entry`, `label`, `value` |
| `CalcitaDemoTotpCode` | `root`, `code` |
| `CalcitaDetailHeader` | `root`, `titleArea`, `title`, `badges`, `actions` |
| `CalcitaDownloadManager` | `doneIcon`, `failedIcon`, `canceledIcon`, `cancelButton`, `progress`, `cancelIcon`, `item`, `itemText`, `itemStatus`, `itemActions`, `panel`, `header`, `title`, `list` |
| `CalcitaDownloadMenu` | `button` |
| `CalcitaEmptyState` | `root`, `icon` |
| `CalcitaErrorPage` | `root`, `actions` |
| `CalcitaEventCalendar` | `toolbar`, `navigation`, `title`, `calendar` |
| `CalcitaEventDetails` | `row`, `rowContent`, `titleRow`, `toneDot`, `linkRow`, `link`, `guestsTitle`, `guest`, `guestAvatar`, `guestName`, `notes`, `actions` |
| `CalcitaFileDropzone` | `root`, `fileArea`, `fileChip`, `hint`, `actions`, `limits`, `extra` |
| `CalcitaFilterChips` | `root`, `header`, `clearButton` |
| `CalcitaFontSizeToggle` | `button` |
| `CalcitaFormProblemAlert` | `root` |
| `CalcitaFormRow` | `root`, `label`, `control` |
| `CalcitaFormSection` | `root`, `title`, `card`, `footer` |
| `CalcitaFullPageLoader` | `root` |
| `CalcitaGlassPanel` | `root` |
| `CalcitaGoToPage` | `root`, `field` |
| `CalcitaGroupedTimeline` | `group`, `groupHeader`, `groupButton`, `groupTitle`, `expandIcon`, `timeline`, `opposite`, `connector`, `content`, `entryTitle` |
| `CalcitaHeaderFilter` | `button`, `badge`, `panel` |
| `CalcitaHeaderTools` | `divider`, `root` |
| `CalcitaInboxLayout` | `labelDot`, `folder`, `folderIcon`, `folderCount`, `root`, `folders`, `foldersHeader`, `labelsTitle`, `listPane`, `phoneTabs`, `phoneTabBadge`, `listHeader`, `list`, `detail`, `backButton` |
| `CalcitaInstallAppSetting` | `root` |
| `CalcitaInstallInstructions` | `steps` |
| `CalcitaInstallPromptBanner` | `root`, `alert` |
| `CalcitaKanbanBoard` | `completeButton`, `tags`, `titleRow`, `doneIcon`, `cardTitle`, `meta`, `due`, `dueIcon`, `dueText`, `checklist`, `checklistIcon`, `comments`, `commentsIcon`, `attachments`, `attachmentsIcon`, `assignees`, `root`, `collapsedColumn`, `collapsedTitle`, `hidden`, `column`, `columnHeader`, `columnTitle`, `quickAdd`, `dropZone`, `card`, `cardActions`, `cardContent`, `empty` |
| `CalcitaLanguageToggle` | `button` |
| `CalcitaLineChart` | `chart` |
| `CalcitaMapView` | `popupText`, `root` |
| `CalcitaMessageList` | `empty`, `selectedAvatar`, `item`, `actions`, `starButton`, `itemButton`, `avatarSlot`, `avatarButton`, `avatar`, `body`, `text`, `topRow`, `unreadDot`, `sender`, `threadCount`, `date`, `subject`, `labels` |
| `CalcitaMessageView` | `header`, `headerText`, `recipients`, `body`, `empty`, `labels`, `attachments`, `divider`, `collapsed`, `collapsedAvatar`, `collapsedText`, `collapsedSender`, `collapsedDate` |
| `CalcitaMetricCard` | `root`, `action`, `header`, `icon`, `label`, `value`, `caption`, `extra`, `trend` |
| `CalcitaMobileTabBar` | `tab`, `tabIconPlaceholder`, `tabLabel`, `root`, `bar`, `minimized`, `account`, `sheetHeader` |
| `CalcitaModalWaiting` | `root`, `title`, `body`, `text` |
| `CalcitaMultiSelectFilter` | `list`, `option` |
| `CalcitaNewBuildNotice` | `floating`, `icon`, `message`, `reloadButton`, `banner` |
| `CalcitaPageBreadcrumbs` | `root`, `link`, `current` |
| `CalcitaPageHeader` | `root`, `subtitle`, `action` |
| `CalcitaPageHeading` | `root`, `breadcrumbs`, `titleRow`, `title`, `actions`, `description` |
| `CalcitaPasswordChecklist` | `title`, `list`, `item`, `hidden` |
| `CalcitaPeriodRangeSelector` | `field`, `select`, `root` |
| `CalcitaPermissionMatrix` | `permission`, `checkbox`, `group`, `groupHeader`, `groupTitle`, `grid` |
| `CalcitaPondDropzone` | `root`, `summary`, `limits`, `actions`, `extra` |
| `CalcitaProfileHeader` | `root`, `cover`, `body`, `avatar`, `text`, `name`, `chips`, `actions` |
| `CalcitaProfileScreen` | `sectionTitle`, `form`, `preferences` |
| `CalcitaQuickFilters` | `root`, `caption`, `chip`, `chipLabel`, `chipCount` |
| `CalcitaRecoveryCodesDialog` | `codes`, `actions` |
| `CalcitaScrollableRow` | `root` |
| `CalcitaSecondStepForm` | `actions` |
| `CalcitaSectionCard` | `root`, `header`, `title` |
| `CalcitaSegmentedControl` | `root` |
| `CalcitaSelectInput` | `option`, `optionText` |
| `CalcitaSelectionActions` | `bar`, `count`, `clear`, `phoneCount`, `phoneActions` |
| `CalcitaServerTable` | `toolbar`, `summary`, `customHeader`, `count`, `countRow`, `selectionNotice`, `error`, `card`, `grid`, `pagination` |
| `CalcitaSessionsCard` | `item`, `itemIcon`, `itemHeader`, `actions` |
| `CalcitaSettingsMenu` | `divider` |
| `CalcitaSideMenu` | `scrollArrow`, `root`, `brand`, `brandLogo`, `brandText`, `brandName`, `brandCaption`, `railTop`, `listArea`, `list`, `section`, `sectionTitle`, `sectionTitleText`, `footer`, `railBottom` |
| `CalcitaSideMenuEntry` | `button`, `icon`, `iconPlaceholder`, `text`, `badge`, `expand` |
| `CalcitaSignInForm` | `footer` |
| `CalcitaSignInScreen` | `alert` |
| `CalcitaSortableFilterHeader` | `title`, `root`, `sortButton`, `sortIndicator`, `clearButton` |
| `CalcitaStatusChip` | `root`, `dot`, `label`, `chip` |
| `CalcitaSubmenuActionsMenu` | `badge` |
| `CalcitaTabBarEditor` | `root`, `header`, `title`, `list`, `itemIcon`, `footer` |
| `CalcitaTableToggle` | `root`, `button` |
| `CalcitaTag` | `root` |
| `CalcitaTextInput` | `field` |
| `CalcitaTopMenu` | `link`, `root` |
| `CalcitaTwoStepVerification` | `qr`, `secret`, `secretCode`, `header`, `headerTitle`, `headerText`, `menuIcon` |
| `CalcitaWizardLayout` | `stepper`, `phoneSteps`, `actions` |
| `CalcitaWordmark` | `root` |

</details>

Para cambiar de un jalón los valores globales, sin tocar pieza por pieza, Calcita los lee de variables CSS. Cada una trae su
valor de siempre de respaldo: sin ella se ve igual.

| Variable | Qué cambia | De fábrica |
| --- | --- | --- |
| `--calcita-panel-radius` | las esquinas de lo que flota grande y las tarjetas grandes (menú lateral, diálogos, la sección de un formulario) | 20px (16px en el minimalista) |
| `--calcita-menu-radius` | las esquinas de menús, listas desplegables, globos y avisos | 12px |
| `--calcita-field-radius` | las esquinas de los campos de captura | 12px (10px en el minimalista; cápsula dentro de `FormSection`) |
| `--calcita-glass-blur` | el desenfoque del vidrio | 20px |
| `--calcita-glass-saturate` | cuánto aviva el vidrio los colores de atrás | 180% |

```css
:root { --calcita-panel-radius: 6px; --calcita-glass-blur: 12px; }   /* también en la página de un sistema que ya existe */
```

```js
createToolkitTheme({cssTokens: {panelRadius: 6, glassBlur: 12}});    // las mismas, declaradas por el tema (un número va en px)
```

Los colores de los campos son variables de MUI (`--mui-palette-field-fill`, `--mui-palette-field-border`…; ver `fields`).
Lo que se pinta flotando al final de la página (menús, ventanas) toma las de `:root`, no las de un contenedor.

```js
createTheme({
    components: {
        CalcitaStatusChip: {defaultProps: {variant: 'chip'}},
        CalcitaFormSection: {styleOverrides: {card: {borderRadius: 4}}},
        CalcitaSegmentedControl: {styleOverrides: {root: {'& .MuiToggleButton-root': {textTransform: 'uppercase'}}}},
    },
});
```

Para un ajuste solo en escritorio o solo en el teléfono, las mismas reglas que usa el marco: `DESKTOP_MEDIA_QUERY` y
`PHONE_MEDIA_QUERY` (teléfono es angosto, menos de 900 px, o bajito, menos de 500 px de alto: un teléfono acostado).

```js
import {DESKTOP_MEDIA_QUERY} from '@stackcraftmx/calcita';

// la barra sin el espacio de la izquierda, solo en escritorio
createToolkitTheme({components: {CalcitaAppLayout: {styleOverrides: {toolbar: {[DESKTOP_MEDIA_QUERY]: {paddingLeft: 0}}}}}});
```

## El marco de la app, el menú y los permisos

`AppLayout` es el marco de las plantillas de MUI: la barra a todo lo ancho, con el logo y el nombre de la app; debajo,
el menú lateral por secciones, que la ☰ encoge a solo íconos (y lo recuerda). La barra trae el título de la página
cuando el grande sale de la vista, el tamaño de letra, el idioma, claro u oscuro y la cuenta (Mi perfil, lo que agregue
el proyecto y Salir). Con `menuPosition="top"` el menú va dentro de la barra. En el teléfono, la hamburguesa abre el menú
en un cajón y los ajustes se juntan detrás de un engrane. Con vidrio, en el teléfono las secciones van en una barra de
pestañas abajo que se encoge al leer hacia abajo y regresa al subir, como en iOS 26 (`minimizeTabBarOnScroll={false}` la
deja fija). Van las que el `menu.js` marca con `mobileTab: true`, y en «Más» → «Editar la barra» cada quien elige las suyas
(se recuerda en su navegador; «Como venía» regresa a las del proyecto). Van tantas como quepan a lo ancho sin cortar su
nombre; las demás, en «Más».

Claro u oscuro tiene tres opciones en el menú de la cuenta: Claro, Oscuro y Automático, que sigue lo que diga el equipo y
es lo de omisión. El botón de la barra fija claro u oscuro; Automático es la forma de volver a seguir al equipo.

Una marca que es una palabra larga va en `wordmark` (a 24 px de alto, en lugar del logo cuadrado y el nombre). Una entrada
del menú puede llevar a otro sistema (`href`) y traer su ícono ya pintado (`icon`) en lugar del componente (`Icon`).

El menú no se escribe en una lista central: cada módulo trae su `menu.js` y `composeMenu` los junta, los ordena y deja
solo los que la sesión puede ver (también dentro de los submenús).

```js
// modules/orders/menu.js
export const order = 10;
export const access = {ability: 'orders.view'};          // o {role}, {anyOf}, {policy: 'sameOrganization'}, {check}
export function buildMenuItem() {
    return {
        to: '/orders', labelKey: 'orders:menu.label', sectionKey: 'app:sections.operation', Icon: ReceiptLongIcon,
        badge: 3,                                                          // opcional
        children: [{to: '/orders/returns', labelKey: 'orders:menu.returns', access: {ability: 'returns.view'}}], // opcional
    };
}
```

```jsx
const canAccess = createAccessChecker({abilities: session.abilities, roles: session.roles, policies, context: {session}});
const menuItems = composeMenu(import.meta.glob('@/modules/*/menu.js', {eager: true}), {canAccess});

<ToolkitProvider canAccess={canAccess}>
    <AppLayout logo={<Logo />} menuItems={menuItems} user={session.user} profilePath="/me" onSignOut={signOut}
               headerActions={<MiBoton />} sidebarFooter={<MiTarjeta />} accountMenuItems={[{to: '/billing', label: 'Facturación'}]}>
        …
    </AppLayout>
</ToolkitProvider>
```

En cada pantalla, `PageHeading` pone el título, la descripción y los botones, y arma las migas solo desde el menú
(Inicio › Sección › Pantalla). `PageHeader` es el encabezado centrado de una portada y `DetailHeader` el de un registro.

La misma regla protege las rutas (`withAccess(access, routes)` de `/react-router`: quien no puede ve «sin permiso», o la
página propia que se pase en `{fallback}`) y
los botones (`<Can access={…}>`, `useCan`). El framework no sabe de roles: RBAC por permisos o roles y ABAC por políticas
con nombre o reglas escritas ahí mismo, como cada proyecto las necesite. Lo que se pinta no protege nada: el backend
vuelve a revisar cada petición. `ErrorPage` trae las pantallas de 404, 403 y 500, y se extiende sin tocarla: botones
propios junto a los de la casa (`extraActions`) o en su lugar (`actions`), algo debajo del texto (`children`), otro ícono y
`onGoHome`.

El marco avisa cuando la persona encoge el menú (`onMenuCollapse`), abre el menú del teléfono (`onMobileMenuChange`) o elige
sus pestañas (`onMobileTabsChange`), para guardar esas preferencias en el servidor del proyecto si se quiere; sus textos se
cambian con `texts`.

## Eventos y textos de cada componente

Cada componente de la casa avisa hacia afuera todo lo que pasa adentro (`onSelect`, `onChange`, `onViewChange`,
`onMenuCollapse`, `onCardComplete`, `onDatesChange`…) y nunca llama un servidor propio: el proyecto decide qué hacer. Así se
mide, se guarda una preferencia en el servidor del proyecto o se conecta un sistema viejo sin tocar Calcita.

Cada texto también se cambia desde afuera: el componente recibe `texts` con la forma de su namespace en los textos del
paquete (`src/locales/es.js`), y `ComponentTexts` los cambia para todo lo que va adentro (un módulo con su propio
vocabulario):

```jsx
<ServerTable texts={{count: {records_one: '{{total}} pedido', records_other: '{{total}} pedidos'}}} … />

<ComponentTexts namespace="table" texts={{emptyState: {title: 'Sin pedidos'}}}>
    <OrdersModule />
</ComponentTexts>
```

## En un sistema que ya existe

Calcita entra por pedazos en un sistema hecho en PHP, JSP o .NET, sin reescribirlo: cada pedazo es una «isla» de React en
un `<div>` de la página vieja, con su propio `ToolkitProvider`.

- **Sin router:** `createHashNavigation()` pone las pantallas después del `#` (`/app.php#/ventas`): cambiar de pantalla no
  recarga, atrás y adelante funcionan y recargar no le pide nada nuevo al servidor viejo. Con la app bajo un prefijo y sin
  router, `createBrowserNavigation({basePath: '/portal'})`.
- **Su tema de MUI tal cual:** Calcita lee los colores del tema, con o sin variables CSS y con el prefijo que traiga
  (`cssVarPrefix`).
- **Varias islas, cada una con lo suyo:** dos islas pueden ir en idiomas y monedas distintas; `useFormatters()` escribe con
  los de su isla.
- **Un backend que contesta a su manera:** `createApiClient({toProblem, mapResponse})` convierte sus errores a RFC 9457
  (Laravel manda `{message, errors}`) y desenvuelve sus respuestas (`{data: …}`); `onError` recibe cada error en un lugar.
  Una subida con avance (`uploadWithProgress`) regresa la respuesta tal cual: `apiErrorOf(response)` da el mismo `ApiError`.
- **Su marca y su menú:** un logo ancho (`wordmark`) en lugar del cuadrado y el nombre; entradas del menú con liga a otro
  sistema (`href`) o con un ícono ya pintado (`icon`, por ejemplo de iconify); y las ligas de la cuenta (`accountMenuItems`)
  salen también sin sesión, detrás del engrane («Regresar al sistema»).
- **Su `sx` gana:** lo que el proyecto pinte con `sx` les gana a los ajustes de Calcita en claro y en oscuro.
- **Su registro:** `addLogSink` manda cada anotación también a su reporte (Sentry, Datadog, su endpoint).
- **Mejor no parta el código a mano** (`manualChunks`): con las pantallas cargadas al abrirse (rutas perezosas), Vite arma
  solo los archivos que se comparten y lo pesado de una pantalla (la tabla de MUI X, FilePond, formik y yup) baja solo ahí.
  Medido en un sistema real: con el reparto a mano bajaban 1,171 kB en cada pantalla; sin él, 971 kB, ya con su tabla y su
  formulario nuevos. Asignar un paquete a un archivo fijo le gana a la carga perezosa y lo baja en todas las pantallas.
  Si aun así reparte a mano, Calcita va en su propio archivo (junto con lo demás de `node_modules` arma un círculo con MUI y
  la app truena al abrir: «reading 'isValidElementType'») y lo que solo usan algunas pantallas se queda sin asignar:

```js
const LAZY_ONLY = ['filepond', '/@mui/x-', '/nuqs/', '/formik/', '/yup/', '/@stackcraftmx/calcita/dist/DataTable/',
    '/@stackcraftmx/calcita/dist/table.js', '/@stackcraftmx/calcita/dist/forms'];
if (LAZY_ONLY.some((part) => id.includes(part))) return undefined;   // que siga a la pantalla que lo usa
if (id.includes('@stackcraftmx/calcita')) return 'calcita';
```

```jsx
const hashNavigation = createHashNavigation();       // una vez, fuera de los componentes

document.querySelectorAll('[data-calcita="sales"]').forEach((element) => {
    createRoot(element).render(
        <ThemeProvider theme={legacyTheme}>
            <ToolkitProvider language={element.lang || 'es'} navigation={hashNavigation}>
                <SalesOfTheDay onOpen={() => element.dispatchEvent(new CustomEvent('calcita:open-sales', {bubbles: true}))} />
            </ToolkitProvider>
        </ThemeProvider>,
    );
});
```

## Detrás de un proxy con prefijo

Para publicar la app en una ruta y no en un subdominio (`miempresa.com/ventas/`), el prefijo se da una vez al construir,
`ASSET_URL=/ventas`, la misma línea del `.env` del servidor. El proyecto que arma `calcita new` ya lo trae:

1. `vite.config.js`: `base` con el prefijo; Vite se lo pone a sus archivos y a las rutas de `index.html`;
2. el router con el mismo prefijo (`createBrowserRouter(routes, {basename})`): las pantallas siguen escribiendo sus rutas
   desde la raíz;
3. lo de `public/` y `version.json` con `import.meta.env.BASE_URL` (una dirección escrita desde la raíz se rompe detrás del
   proxy) y el manifiesto con rutas relativas;
4. el servidor: cada dirección bajo el prefijo que no sea un archivo regresa su `index.html`.

```nginx
location /ventas/ {
    try_files $uri $uri/ /ventas/index.html;
}
```

## La petición de la casa

Todo lo que habla con el servidor pasa por un cliente, armado una vez por proyecto con `fetch` del navegador (sin axios):

```js
import {createApiClient} from '@stackcraftmx/calcita';

export const api = createApiClient({
    baseUrl: '/api/v1',
    csrf: {refreshPath: '/auth/csrf-token'},          // Laravel Sanctum: la cookie XSRF-TOKEN y el reintento del 419
    onUnauthenticated: () => navigate('/sign-in'),    // un 401 a media consulta
});

const orders = await api.get('/orders', {params: {page: 2}, signal});
await api.post('/orders', {customerId: 7});
const {blob, fileName} = await api.download('/orders/export', {onDownloadProgress});
```

- Cada petición lleva el idioma vigente (`Accept-Language`): el servidor responde sus mensajes ya traducidos.
- Un error es siempre un `ApiError`: el problema RFC 9457 del servidor con su mensaje ya traducido, su status, su
  `requestId` para soporte y los errores por campo de un 422 (los formularios los ponen en su campo). Sin red es la misma
  forma (status 0); cancelar no es un error.
- Cada respuesta le avisa al aviso de versión nueva qué compilación está publicada (header `X-Frontend-Build`).
- Un Excel que llegó cortado no se entrega.

Si se publica otra versión con la pestaña abierta, la pantalla que no se había abierto pide un archivo que ya no existe.
`withChunkRecovery` (de `/react-router`) recarga una vez y `RouteErrorScreen` dice «Hay una versión nueva» con su botón;
sin router de datos, `recoverFromStaleChunk` en el `.catch()` del import y `StaleBuildBoundary` alrededor de las pantallas.

## La cuenta completa: conectar su backend

Entrar (con el segundo paso), «¿Olvidó su contraseña?», elegir una contraseña nueva, Mi perfil (sus datos, seguridad y
preferencias) y la seguridad de la cuenta (llaves de acceso, app autenticadora, códigos de recuperación, sesiones abiertas y
bitácora) vienen hechos en `@stackcraftmx/calcita/account`. El proyecto **solo escribe el conector**: las llamadas a su
backend. Pide `@simplewebauthn/browser` (las llaves de acceso).

```jsx
import {AccountProvider, ProfileScreen, SignInScreen, createRestAccountConnector} from '@stackcraftmx/calcita/account';

// 1. el conector: si el backend sigue el contrato de abajo, es una línea
const accountConnector = createRestAccountConnector(apiClient);

// 2. el proveedor, por fuera de ToolkitProvider (le pasa la regla de permisos de quien está dentro)
<AccountProvider connector={accountConnector}>
    {(canAccess) => <ToolkitProvider canAccess={canAccess} …>…</ToolkitProvider>}
</AccountProvider>

// 3. las pantallas, en sus rutas
{path: '/sign-in', element: <SignInScreen forgotPasswordPath="/forgot-password" logo={<AppLogo />} />}
{path: '/forgot-password', element: <ForgotPasswordScreen signInPath="/sign-in" />}
{path: '/reset-password', element: <ResetPasswordScreen signInPath="/sign-in" />}   // el enlace del correo: ?token=…
{path: '/profile', element: <ProfileScreen />}
```

`useAccount()` da `{session, refreshSession, signOut}` para la barra y las pantallas propias.

**Sin backend todavía:** `createDemoAccountConnector()` de `@stackcraftmx/calcita/account-demo` (todo en el navegador,
con la verificación en dos pasos funcionando con su teléfono de verdad). Con `toQrImageUrl` sale el QR de la app; el
proyecto que arma `calcita new` usa la demostración mientras no tenga `VITE_API_URL` y el REST en cuanto la tiene (la
demostración ni siquiera viaja en lo construido).

**Si el backend es distinto:** se cambia la ruta en `paths` o solo la función que no coincida; TypeScript (o el editor,
con el JSDoc) avisa si una función no regresa lo que piden las pantallas (`AccountConnector`).

```js
const accountConnector = {
    ...createRestAccountConnector(apiClient, {paths: {session: '/me'}}),
    signIn: async ({email, password, remember}) => {
        const response = await apiClient.post('/login', {username: email, password, remember});
        return {secondStep: response.mfa_required ? {methods: ['totp']} : null};
    },
};
```

El contrato REST (`ACCOUNT_REST_PATHS`; llaves en snake_case, errores RFC 9457 con `errors` por campo):

| Petición | Manda | Responde |
|---|---|---|
| `GET /auth/session` | — | `{user: {id, name, email, subtitle, phone}, roles, abilities, labels}`; 401 si nadie está dentro |
| `POST /auth/sign-in` | `{email, password, remember}` | `{second_step: {methods: ['passkey', 'totp', 'recovery_code']} \| null}` |
| `POST /auth/second-step` | `{method: 'totp' \| 'recovery_code', code}` | 204; 401 con `remaining_attempts`, 423 `account_locked` |
| `GET /auth/second-step/passkey-options` | — | las opciones de WebAuthn para firmar |
| `POST /auth/second-step/passkey` | `{credential}` | 204 |
| `POST /auth/sign-out` | — | 204 |
| `POST /auth/forgot-password` | `{email}` | 204, exista o no el correo |
| `POST /auth/reset-password` | `{token, new_password}` | 204 |
| `PUT /account` | `{name, phone}` | `{message?}` |
| `PUT /account/password` | `{current_password, new_password}` | 204 |
| `GET /account/security` | — | `{is_enabled, enabled_at, passkeys: [{id, name, created_at, last_used_at}], totp: {is_enabled, enabled_at}, recovery_codes_remaining}` |
| `POST /account/security/totp` | — | `{secret, qr_image_url}` |
| `POST /account/security/totp/confirm` | `{code}` | `{security, recovery_codes?}` |
| `DELETE /account/security/totp` | `{password}` | `{security}` |
| `GET /account/security/passkeys/registration-options` | — | las opciones de WebAuthn para crear |
| `POST /account/security/passkeys` | `{name, credential}` | `{security, recovery_codes?}` |
| `DELETE /account/security/passkeys/{id}` | `{password}` | `{security}` |
| `POST /account/security/recovery-codes` | `{password}` | `{security, recovery_codes}` |
| `GET /account/sessions` | — | `[{id, browser, platform, is_mobile, started_at, network, is_current}]` |
| `POST /account/sessions/close-others` | — | `{closed}` |
| `GET /account/activity` | — | `[{id, kind, occurred_at, device, network}]` |

Las opciones y la firma de WebAuthn viajan tal cual: las arma y las revisa la librería del servidor (py_webauthn,
@simplewebauthn/server, web-auth/webauthn-lib). Lo que quita protección pide la contraseña; `recovery_codes` se enseña una
sola vez. `kind` de la bitácora es uno de `ACCOUNT_EVENT_KIND`.

## Seguridad de la cuenta (las piezas sueltas)

Las mismas piezas de la cuenta completa, para armar pantallas propias:
- En `/forms`, `TwoStepVerificationCard`: llaves de acceso, app autenticadora y códigos de recuperación. Lo que quita
  protección pide la contraseña. El proyecto conecta las acciones con su API; la tarjeta no sabe del servidor.
- En `/forms`, `SecondStepForm`: el segundo paso al entrar (llave, código de la app o de recuperación), con los intentos
  que quedan.
- `RecoveryCodesDialog`: los códigos se enseñan una vez y no se cierra sin «Ya los guardé»; se copian o se bajan en .txt.
- `SessionsCard`: dónde está abierta la cuenta y «cerrar la sesión en los demás equipos». `ActivityLog`: la bitácora.
- En `/passkeys`, `createPasskey` y `signWithPasskey`: el navegador pide la huella, el rostro o el PIN.

Contra XSS: los textos del servidor se pintan como texto (nunca `dangerouslySetInnerHTML`), `safeInternalPath` solo deja
seguir direcciones de la app en `?next=`, la sesión va en una cookie HttpOnly (sin tokens en `localStorage`) y el CSRF con
la cookie doble de Sanctum. Los ejemplos lo enseñan en Componentes → Seguridad, y la verificación funciona con su
teléfono de verdad en Mi perfil → Seguridad.

## Entrar, Mi perfil y los permisos (el template)

Lo que piden todos los sistemas, listo para conectar a su API:

- `AuthLayout`: la pantalla de entrar, con el logo, una tarjeta al centro y el idioma y claro u oscuro arriba (con
  vidrio, la tarjeta es de vidrio sobre el lienzo de color).
- En `/forms`, `SignInForm`, `ForgotPasswordForm` y `ChangePasswordForm`. Los errores del servidor salen en su lugar.
  «¿Olvidó su contraseña?» no dice si el correo existe, a propósito. La contraseña nueva trae su lista de reglas, que se
  va palomeando (`DEFAULT_PASSWORD_POLICY`: 12 caracteres, minúscula, mayúscula y número; cada proyecto pone la suya).
- `ProfileHeader`: portada, avatar con iniciales, nombre y perfil. `AppearanceSettings`: tamaño de letra, idioma y claro
  u oscuro, los mismos del engrane del teléfono.
- `PermissionMatrix`: los permisos de un perfil por grupo, con «todos» y cuántos tiene. Cada módulo declara los suyos en
  su `menu.js` y `composePermissionGroups` los junta: no hay lista central.
- `MetricCard` con `trend`: cuánto cambió contra el periodo anterior, en verde si es bueno y en rojo si es malo.

```jsx
<AuthLayout logo={<Logo />} title={t('auth:signIn.title')} description={t('auth:signIn.subtitle')}>
    <SignInForm onSubmit={(values) => api.signIn(values)} forgotPasswordPath="/forgot-password" />
</AuthLayout>

// modules/orders/menu.js
export const permissions = [
    {key: 'orders.view', labelKey: 'orders:permissions.view', descriptionKey: 'orders:permissions.viewDescription'},
    {key: 'orders.cancel', labelKey: 'orders:permissions.cancel'},
];

// la pantalla de perfiles
const groups = composePermissionGroups(import.meta.glob('@/modules/*/menu.js', {eager: true}), t);
<PermissionMatrix groups={groups} value={profile.abilities} onChange={setAbilities} />
```

Los ejemplos lo traen armado: entrar (con «Entrar como…» para los tres perfiles de prueba), «¿olvidó su contraseña?»,
elegir una contraseña nueva, Mi perfil (sus datos, seguridad y preferencias), Perfiles y permisos (al guardar los de su
propio perfil, el menú cambia en ese momento) y un tablero con tarjetas, gráficas y los últimos pedidos.

## Next.js (App Router)

El paquete ya viene marcado para Next: los componentes llevan `'use client'` y lo puro (formatos, `Money`, permisos,
menú, diccionarios) no lleva marca, así que también corre en los componentes de servidor. Lo que se conecta:

```jsx
// app/layout.jsx (servidor)
<html lang="es" suppressHydrationWarning>
    <body>
        <InitColorSchemeScript attribute="class" />            {/* claro u oscuro antes de pintar, sin brinco */}
        <AppRouterCacheProvider>                               {/* @mui/material-nextjs/v16-appRouter */}
            <AppProviders>{children}</AppProviders>             {/* 'use client': tema, ToolkitProvider y AppLayout */}
        </AppRouterCacheProvider>
    </body>
</html>

// AppProviders.jsx ('use client')
<ToolkitProvider navigation={nextNavigation} …>              {/* de @stackcraftmx/calcita/next */}
```

- El servidor calcula con las piezas puras y le pasa TEXTO al cliente (`money.toJSON()`): lo que cruza del servidor al
  navegador tiene que ser JSON.
- Zona y moneda del servidor con `configureToolkit({timeZone, currency})` una vez (son de toda la app; sin eso, en un
  contenedor la zona es UTC). El idioma NO: cambia por persona y vive en el cliente.
- Los `menu.js` se descubren con `require.context` (Next no tiene `import.meta.glob`).
- El «Regresar» de `BackButton` no sabe a dónde regresa (Next no guarda el índice del historial que pone react-router):
  regresa a la última lista anotada o a `fallbackTo`.


## Formularios

Cada campo tiene su vista suelta en la puerta principal (`TextInput`, `SelectInput`, `NumberInput`, `CatalogInput`,
`ColorInput`; sirven sin formulario; `SelectInput` y `CatalogInput` aceptan varias opciones con `multiple`) y su conexión: a formik en `/forms` y a react-hook-form en `/react-hook-form`, con
los mismos nombres. Cambiar de librería es cambiar el import.

```jsx
import {Form, Formik, FormNumberField, FormProblemAlert, FormTextField, SubmitButton, Yup, applyServerProblem} from '@stackcraftmx/calcita/forms';

<Formik initialValues={{name: '', credit_limit: ''}} validationSchema={schema}
        onSubmit={async (values, helpers) => {
            try { await api.save(values); } catch (error) { applyServerProblem(error, {...helpers, values}); }
        }}>
    <Form noValidate>
        <FormProblemAlert />
        <FormTextField name="name" label="Nombre" />
        <FormNumberField name="credit_limit" label="Límite de crédito" prefix="$" />   {/* viaja '50000.00' */}
        <SubmitButton>Guardar</SubmitButton>
    </Form>
</Formik>
```

formik y yup los instala el proyecto (`pnpm add formik yup`); `Formik`, `Form` y `Yup` también se pueden importar de
`@stackcraftmx/calcita/forms`, que es la misma copia. `FormWizard` parte un formulario en pasos, con pasos opcionales (hay
uno para formik y otro para react-hook-form); los ejemplos traen los dos.

Para que el formulario se vea como los de Apple (Ajustes, la hoja «Nuevo evento» de Calendario), los campos van dentro de
una `FormSection`: cada uno se vuelve un renglón, con la etiqueta a la izquierda y el valor a la derecha, sin la caja de
MUI. Son los mismos campos, sin cambiarles nada; las listas llevan su ⌃⌄ y la fecha va en una cápsula. `FormRow` es el
renglón suelto para lo demás (un interruptor, un texto).

```jsx
import {FormRow, FormSection} from '@stackcraftmx/calcita';

<FormSection title="Contacto" footer="Con el correo le avisamos de cada pedido.">
    <FormTextField name="name" label="Nombre" placeholder="Nombre y apellidos" />
    <FormTextField name="email" label="Correo" type="email" />
    <FormRow label="Avisos por correo"><Switch /></FormRow>
</FormSection>
```

Los campos van directo dentro de la `FormSection` (sin Grid ni Stack en medio): la línea entre renglones se dibuja entre
hermanos.

## Subir archivos

Dos zonas para soltar archivos con el mismo uso: la de la puerta principal, con puro MUI (un archivo), y la de
`/filepond` (varios archivos, animaciones, avance por archivo). Cambiar de una a otra es cambiar el import. Las dos solo
eligen; la pantalla sube con `uploadWithProgress` (el avance real de la subida) y sigue la subida con `uploadMachine`.

```jsx
import {FileDropzone, buildUploadActors, uploadMachine, uploadWithProgress} from '@stackcraftmx/calcita';

<FileDropzone value={file} onChange={setFile} accept="excel" maxSize="10 MB" busy={isUploading}
              actions={<Button onClick={() => send({type: 'UPLOAD', input: {file}})}>Importar</Button>} />
```

`accept` acepta nombres (`'excel'`, `['pdf', 'image']`) o lo de siempre del input (`'.xlsx,.xls'`); `maxSize` va en bytes
o con unidades (`'10 MB'`, en base 1000 como el navegador).

## Dinero sin problemas de decimales

En JavaScript `0.1 + 0.2` da `0.30000000000000004`. `Money` guarda los montos en centavos enteros (como el Money de PHP
con bcmath y el de Go con int64), así que las sumas siempre cuadran al centavo:

```js
import {MONEY_ROUNDING, Money} from '@stackcraftmx/calcita/money';

const total = Money.fromString(order.total).plus(Money.fromNumber(order.shipping)); // del API, en texto o número
const withTax = total.times('1.16');                                               // redondea una vez, al centavo
const perPayment = total.dividedBy(3, {rounding: MONEY_ROUNDING.halfEven});        // redondeo bancario
total.format();  // "$1,234.50", en el idioma y la moneda de ToolkitProvider
total.amount();  // "1234.50", lo que se le manda al API
```

Los decimales salen de la moneda (`MXN` 2, `JPY` 0, `KWD` 3) y se pueden cambiar con `{currency, decimals}`. Truena en
vez de perder centavos: un texto que no es número, decimales de más, mezclar monedas o usar `+` y `>` en lugar de
`plus` e `isGreaterThan`.

## Desarrollo del paquete

Se trabaja con Node 22 y pnpm, las dos versiones fijadas en el paquete: `nvm use` toma la de `.nvmrc`, Volta la toma
sola de `package.json`, y Corepack (viene con Node 22) baja la versión de pnpm que dice `packageManager`.

```bash
nvm use
pnpm install
pnpm test        # pruebas sin navegador (node --test)
pnpm run build   # dist/ con un archivo por módulo y sus tipos en dist/types
pnpm run check   # pruebas, build, cada componente pintado con el tema por omisión de MUI, el CLI, un proyecto en TypeScript y los ejemplos
pnpm run examples  # construye el paquete y abre los ejemplos sin backend en http://localhost:5173
```

Los ejemplos ([examples/](examples/README.md)) usan el paquete ya construido, como un proyecto nuevo: tabla de servidor,
formulario, avisos, descargas y Excel, y métricas, con datos inventados en memoria. No viajan a npm.

## Probar sin instalar nada

Con Docker, los ejemplos se construyen y se sirven en una imagen; no hace falta Node ni pnpm:

```bash
docker compose up -d examples   # construye y arranca: http://localhost:8095
docker compose down             # lo apaga
```

Es la versión de producción (archivos construidos, servidos por nginx sin permisos de administrador), no el servidor de
desarrollo. `EXAMPLES_PORT=8100 docker compose up -d examples` cambia el puerto.

### Enseñarlo por internet (túnel de Cloudflare)

`scripts/tunnel.sh` publica los ejemplos con un túnel de Cloudflare. El token va en `tunnel/.cloudflared.token` (una
línea, fuera de git) y la dirección pública y su destino se configuran en el panel de Cloudflare; el destino es el puerto
de Docker (`http://localhost:8095`), no el servidor de desarrollo, que se rompe cada vez que cambian sus dependencias.

```bash
pnpm run tunnel:start    # arranca y dice la dirección pública y a dónde apunta
pnpm run tunnel:status   # ¿corre? y las dos direcciones responden
pnpm run tunnel:stop     # lo apaga (solo el suyo, nunca el cloudflared de otro proyecto)
```

## Licencia

[FSL-1.1-MIT](LICENSE) (Functional Source License): se puede usar, copiar, modificar y poner en producción gratis, en
cualquier proyecto y empresa, también comercial. Lo único que no se permite es ofrecer Calcita (o algo que la sustituya)
como producto o servicio comercial que compita con ella. Dos años después de publicada, cada versión pasa sola a MIT.
