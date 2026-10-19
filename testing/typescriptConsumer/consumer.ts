// Un proyecto en TypeScript que usa el paquete (JavaScript con sus tipos generados del JSDoc). Solo se compila:
//   npx tsc -p testing/typescriptConsumer/tsconfig.json
import {dictionaryEntryOf, formatCurrency, labelOf, lookup, problemTitle, reportPublishedBuild, toolkitTextsEs} from '@stackcraftmx/calcita';
import {BUILD_WATCH_ACTION, buildWatchActionOf, publishedBuildIdOf, usePublishedBuildWatch} from '@stackcraftmx/calcita';
import {VALUE_FORMAT, reportSheetOf} from '@stackcraftmx/calcita/excel';
import {reactRouterNavigation} from '@stackcraftmx/calcita/react-router';
import {translateWithI18next} from '@stackcraftmx/calcita/i18next';
import {ServerTable} from '@stackcraftmx/calcita/table';
import {FormTextField} from '@stackcraftmx/calcita/forms';
import {createCsrfRetryHandler} from '@stackcraftmx/calcita/laravel';
import {MONEY_ROUNDING, Money} from '@stackcraftmx/calcita/money';
import {ApiError, createApiClient, isStaleChunkError, recoverFromStaleChunk, ActivityLog, RecoveryCodesDialog, SessionsCard} from '@stackcraftmx/calcita';
import {RouteErrorScreen, withChunkRecovery} from '@stackcraftmx/calcita/react-router';
import {createPasskey, passkeysSupported, signWithPasskey} from '@stackcraftmx/calcita/passkeys';
import {SecondStepForm, TwoStepVerificationCard, normalizeTotpCode} from '@stackcraftmx/calcita/forms';
import {FileDropzone as PondFileDropzone, createPondServer} from '@stackcraftmx/calcita/filepond';
import {FormTextField as HookFormTextField, SERVER_PROBLEM_ROOT, applyServerProblem as applyToHookForm} from '@stackcraftmx/calcita/react-hook-form';
import {CALENDAR_DATE_FORMAT, DateInput, FormDateField} from '@stackcraftmx/calcita/date-pickers';
import {nextNavigation} from '@stackcraftmx/calcita/next';
import {MapView, OPEN_STREET_MAP_TILES, boundsOfMarkers} from '@stackcraftmx/calcita/maps';
import {CALENDAR_VIEW, EventCalendar} from '@stackcraftmx/calcita/calendar';
import {KanbanBoard, isOverLimit, moveCard} from '@stackcraftmx/calcita/kanban';
import {InboxLayout, MessageList, MessageView, createAccessChecker, useConfirmAction} from '@stackcraftmx/calcita';
import {facetColumn, textColumn} from '@stackcraftmx/calcita/table';
import {createElement} from 'react';
import {FormNumberField, FormSelectField, SubmitButton, applyServerProblem} from '@stackcraftmx/calcita/forms';
import {FormTextField as HookTextField} from '@stackcraftmx/calcita/react-hook-form';
import {AccountProvider, ProfileScreen, SignInScreen, createRestAccountConnector, missingConnectorFunctionsOf} from '@stackcraftmx/calcita/account';
import type {AccountConnector, AccountSession} from '@stackcraftmx/calcita/account';
import {createDemoAccountConnector, totpCodeAt} from '@stackcraftmx/calcita/account-demo';
import {
    AppLayout, AuthLayout, DEFAULT_PASSWORD_POLICY, FormRow, FormSection, GLASS_INSET_PIXELS, GlassPanel, MENU_POSITION, PageHeading, PermissionMatrix, ProfileHeader, STACKCRAFT, TREND_DIRECTION,
    composeMenu, composePermissionGroups, createToolkitTheme, glassStylesOf, isGlassTheme, isPasswordAccepted, materialStylesOf, menuBreadcrumbsOf,
    withPermissionGroup, TOP_BAR, MINIMAL_TONES, FIELD_TONES, CSS_TOKENS, cssTokenOf, cssTokenDeclarationsOf, isAndroidDevice, BarActions, BarCapsule, BarActionButton, BAR_ACTIONS_PLACEMENT,
    useBarActionsPlacement, useCloseBarActionsMenu,
} from '@stackcraftmx/calcita';
import {ChangePasswordForm, ForgotPasswordForm, SignInForm} from '@stackcraftmx/calcita/forms';
import {Formik, FormWizard, Yup} from '@stackcraftmx/calcita/forms';
// lo de la 0.25: sistemas que ya existen, el proveedor más cercano, eventos hacia afuera y textos propios
import {
    ActionsMenu, BarSearch, CHART_VIEW, CollapsibleSection, ColorSchemeToggle, ComponentTexts, ToolkitProvider, createBrowserNavigation,
    createHashNavigation, formattersOf, useFormatters,
} from '@stackcraftmx/calcita';
import {LineChart} from '@stackcraftmx/calcita/charts';
import {addLogSink, apiErrorOf, menuItemsWithIconsOf} from '@stackcraftmx/calcita';
import {EventDetails, reminderOf} from '@stackcraftmx/calcita/calendar';

const amount: string = formatCurrency(1234.5);
const title: string = problemTitle(null, 503);
const status = dictionaryEntryOf('paid', 'orderStatus.paid', 'success');
const label: string = labelOf(lookup({paid: status}, 'paid'), (key: string) => key);
const sheet = reportSheetOf({
    conceptLabel: 'Concepto', periodLabels: ['Enero'], dataLabels: {section: 'Sección', period: 'Periodo'},
    sections: [{label: 'Pedidos', rows: [{label: 'Recibidos', format: VALUE_FORMAT.count, values: [3]}]}],
});
const headerLength: number = sheet.header.length;
const cancelText: string = toolkitTextsEs.common.actions.cancel;
reportPublishedBuild('build-b', 'build-a');
// la app se entera sola de otra versión: recarga si estuvo fuera 15 minutos, si no el aviso
const watchAction: string = buildWatchActionOf({runningBuildId: 'a', publishedBuildId: 'b', hiddenMilliseconds: 0, reloadAfterHiddenMilliseconds: null});
const isNotice: boolean = watchAction === BUILD_WATCH_ACTION.notice;
const fileBuildId: string | null = publishedBuildIdOf({buildId: 'b'});
const watchBuilds = (): void => usePublishedBuildWatch({url: '/version.json', buildId: 'build-a', checkEveryMinutes: 10, reloadAfterHiddenMinutes: null});
const attachmentsServer = createPondServer({url: '/api/adjuntos', headers: {Authorization: 'Bearer prueba'}});
const installment: Money = Money.fromString('10.00', {currency: 'MXN'}).dividedBy(3, {rounding: MONEY_ROUNDING.halfEven});
const installmentText: string = installment.format();
// @ts-expect-error un monto se suma con otro Money, no con un número
Money.zero().plus(5);

// los tipos son de verdad, no any: un error de tipo se detecta
// @ts-expect-error el formato tiene que ser texto, no un número
const wrongFormat: number = VALUE_FORMAT.count;

const dateFormat: string = CALENDAR_DATE_FORMAT;
const serverProblemRoot: string = SERVER_PROBLEM_ROOT;
const emailSchema = Yup.string().email();
const toolkitTheme = createToolkitTheme({glass: true});
const surfacesTheme = createToolkitTheme({glass: {opacity: 0.7, surfaces: true}});
const capsulesTheme = createToolkitTheme({look: 'minimal', bar: TOP_BAR.band});
// el minimalista con los tonos de la marca: solo lo que se pasa, lo demás el gris de Apple
const brandMinimalTheme = createToolkitTheme({look: 'minimal', minimalTones: {light: {default: '#EEF4FF', fill: '#DCE6F5'}, dark: {floating: '#243047'}}});
const appleFloating: string = MINIMAL_TONES.dark.floating;
// los campos del proyecto: blancos con borde en claro, esquinas de 8 px; lo demás como lo trae el estilo
const brandFieldsTheme = createToolkitTheme({glass: true, fields: {radius: 8, light: {fill: '#FFFFFF', hoverFill: '#FFFFFF', border: '#C4CDD5'}}});
const appleFieldFill: string = FIELD_TONES.light.fill;
// las piezas de Calcita desde el tema, como las de MUI: estilos de sus partes y props por omisión
// las variables CSS desde el tema: un número va en px; la lista y el valor para un estilo propio
const tokensTheme = createToolkitTheme({cssTokens: {panelRadius: 6, menuRadius: '0.5rem', glassBlur: 12}});
const panelRadiusValue: string = cssTokenOf('panelRadius');
const rootTokens: Record<string, string> = cssTokenDeclarationsOf({fieldRadius: 4});
const tokenNames: string[] = Object.values(CSS_TOKENS).map((token) => token.variable);
const piecesTheme = createToolkitTheme({components: {CalcitaStatusChip: {defaultProps: {variant: 'chip'}}, CalcitaFormSection: {styleOverrides: {card: {borderRadius: 4}}}}});
// las cápsulas de una pantalla en la barra y una cápsula suelta
const screenCapsules = [
    createElement(BarActions, {label: 'Acciones de pedidos', order: 2, sx: {gap: 1}, children: createElement(SubmitButton, {children: 'Agregar'})}),
    createElement(BarActions, {label: 'Buscar', bare: true, inlineSx: {width: '100%'}, children: null}),
    createElement(BarCapsule, {'aria-label': 'Zoom', children: null}),
    createElement(BarActionButton, {label: 'Agregar sucursal', icon: null, onClick: () => {}, color: 'inherit'}),
];
// algo propio dentro de BarActions sabe si quedó en una cápsula (solo ícono) o en el «⋯» del teléfono, y cómo cerrarlo
const isInCapsule = (): boolean => useBarActionsPlacement() === BAR_ACTIONS_PLACEMENT.capsule;
const isInMoreMenu = (): boolean => useBarActionsPlacement() === BAR_ACTIONS_PLACEMENT.menu;
const readCloseMoreMenu: () => () => void = useCloseBarActionsMenu;
const startsMinimal: boolean = isAndroidDevice({userAgent: 'Mozilla/5.0 (Linux; Android 14)'});
// @ts-expect-error la barra es 'capsules' o 'band', no otro texto
createToolkitTheme({bar: 'capsulas'});
const hasGlass: boolean = isGlassTheme(surfacesTheme);
const floatingStyles: object = glassStylesOf(surfacesTheme);
const contentStyles: object = materialStylesOf(surfacesTheme);
const floatingInset: number = GLASS_INSET_PIXELS;
const formParts = [FormSection, FormRow];
const passwordAccepted: boolean = isPasswordAccepted('Ejemplo-de-prueba-7', {...DEFAULT_PASSWORD_POLICY, symbol: true});
const permissionGroups = composePermissionGroups([], (key: string) => key);
const grantedAfterGroup: string[] = withPermissionGroup(['orders.view'], {permissions: [{key: 'orders.cancel'}]}, true);
const trendUp: string = TREND_DIRECTION.up;
const forge: string = STACKCRAFT.forge;
const menuItems = composeMenu([{order: 1, buildMenuItem: () => ({to: '/', label: 'Inicio'})}]);
const crumbs: object[] = menuBreadcrumbsOf(menuItems, '/');
const topMenu: string = MENU_POSITION.top;

// la petición de la casa: cada método acepta lo de la petición como opcional y truena con ApiError
const api = createApiClient({baseUrl: '/api/v1', csrf: {refreshPath: '/auth/csrf-token'}});
const ordersRequest: Promise<unknown> = api.get('/orders', {params: {page: 1}});
const savedRequest: Promise<unknown> = api.post('/orders', {customerId: 7});
const downloadRequest: Promise<{blob: Blob, fileName: string}> = api.download('/orders/export', {onDownloadProgress: ({loaded}) => loaded});
const apiError = new ApiError({status: 422, problem: {detail: 'Revise los datos'}});
const isValidation: boolean = apiError.isValidation;
const staleChunk: boolean = isStaleChunkError(new Error('x'));
const lazyRoutes = withChunkRecovery([{path: '/', lazy: async () => ({Component: () => null})}]);
const passkeyParts = [createPasskey, signWithPasskey, passkeysSupported, recoverFromStaleChunk];
const securityParts = [ActivityLog, RecoveryCodesDialog, SessionsCard, SecondStepForm, TwoStepVerificationCard, RouteErrorScreen];
const cleanCode: string = normalizeTotpCode('123 456');

// mapa, calendario, kanban y bandeja
const tilesUrl: string = OPEN_STREET_MAP_TILES.url;
const markerBounds = boundsOfMarkers([{position: [20.67, -103.35]}]);
const monthView: string = CALENDAR_VIEW.month;
const movedCards = moveCard([{id: 'c1', columnId: 'todo'}], {cardId: 'c1', toColumnId: 'doing', toIndex: 0});
const columnFull: boolean = isOverLimit({limit: 3}, 4);
const workspaceParts = [MapView, EventCalendar, KanbanBoard, InboxLayout, MessageList, MessageView];

// la cuenta: el conector REST con una función cambiada, y el de demostración
const accountConnector: AccountConnector = {
    ...createRestAccountConnector(api),
    signIn: async () => ({secondStep: {methods: ['totp']}}),
};
const demoConnector: AccountConnector = createDemoAccountConnector({toQrImageUrl: async (url: string) => url});
const noSession: Promise<AccountSession | null> = demoConnector.loadSession();
const missingNames: string[] = missingConnectorFunctionsOf(accountConnector);
const demoCode: Promise<string> = totpCodeAt('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
const accountParts = [AccountProvider, ProfileScreen, SignInScreen];

// las funciones del proyecto con SUS tipos: el paquete no debe pedir `object` donde el proyecto tiene su forma
interface Order {
    id: number;
    status: string;
}
const checker = createAccessChecker({policies: {canCancel: (context: {order: Order}) => context.order.status === 'paid'}, context: {}});
const cancelAction = () => useConfirmAction({
    run: async ({subject}: {subject: Order}) => ({message: `cancelado ${subject.id}`}),
    onDone: (response: {message: string}) => response.message,
});
const typedColumns = [
    textColumn({field: 'number', label: 'Folio', width: 120, valueFormatter: (value: string) => value.toUpperCase()}),
    facetColumn({field: 'status', label: 'Estado', flex: 1, renderOption: (value: string) => value}),
];
// los campos de formulario aceptan lo de su campo de la casa (y TextInput lo de TextField de MUI)
const formFields = [
    createElement(FormNumberField, {name: 'creditLimit', label: 'Límite', prefix: '$', decimals: 2}),
    createElement(FormSelectField, {name: 'type', label: 'Tipo', options: [{value: 'retail', label: 'Menudeo'}]}),
    createElement(HookTextField, {name: 'notes', label: 'Notas', multiline: true, minRows: 3, autoComplete: 'off'}),
    createElement(SubmitButton, {sx: {alignSelf: 'flex-start'}, fullWidth: true, children: 'Guardar'}),
];
// el error de un catch llega como unknown
const applyCaught = (caught: unknown) => applyServerProblem(caught, {setFieldError: () => {}, setStatus: () => {}, values: {}});
// @ts-expect-error una función del contrato con otra forma: signIn regresa {secondStep}
const wrongConnector: AccountConnector = {...accountConnector, signIn: async () => 'adentro'};

// sin router: con # en la dirección o con prefijo; las dos con la forma de reactRouterNavigation
const legacyNavigations = [createHashNavigation(), createBrowserNavigation({basePath: '/portal'})];
const legacyIsland = createElement(ToolkitProvider, {language: 'en', navigation: legacyNavigations[0], children: 'isla'});
// los formatos de una configuración propia y los del proveedor más cercano
const englishDate: string = formattersOf(() => ({language: 'en', timeZone: 'UTC', currency: 'USD'})).formatDate('2026-10-17');
const formattersHook = () => useFormatters().formatCurrency(10);
// eventos hacia afuera con sus tipos
const salesChart = createElement(LineChart, {
    data: [], series: [{key: 'sales', label: 'Ventas'}], periodLabel: 'Mes', ariaLabel: 'Ventas', emptyLabel: 'Sin datos',
    defaultView: CHART_VIEW.table, onViewChange: (view: 'chart'|'table') => view,
});
const layoutEvents = createElement(AppLayout, {
    onMenuCollapse: (collapsed: boolean) => collapsed, onMobileTabsChange: (keys: string[]|null) => keys, texts: {drawer: {open: 'Abrir'}},
    children: 'contenido',
});
const sectionToggle = createElement(CollapsibleSection, {collapsedTitle: 'Ver', expandedTitle: 'Ocultar', onExpandedChange: (isOpen: boolean) => isOpen, children: 'x'});
// OJO: con todas sus props opcionales, createElement no deduce el tipo (lo toma por un elemento sin props): se revisan directo
const schemeToggle: Parameters<typeof ColorSchemeToggle>[0] = {onChange: (mode) => mode, texts: {}};
const barSearch = createElement(BarSearch, {value: '', onChange: (text: string) => text, placeholder: 'Buscar'});
const rowMenu = createElement(ActionsMenu, {label: 'Acciones', actions: [{key: 'edit', label: 'Editar', onClick: () => {}}]});
const eventDetails = createElement(EventDetails, {event: {title: 'Visita', start: '2026-10-20T16:00:00Z', reminderMinutes: 30}});
const reminder = reminderOf(90);
const ownTexts = createElement(ComponentTexts, {namespace: 'table', texts: {count: {records_other: '{{total}} pedidos'}}, children: 'x'});
// lo de la 0.26: el logo ancho, ligas a otro sistema e íconos ya pintados, salidas del registro y el error de una subida
const wideBrand = createElement(AppLayout, {
    wordmark: createElement('img', {src: '/marca.svg', alt: ''}), brandName: 'Mi sistema', children: 'contenido',
    menuItems: [{href: 'https://sistema-anterior/inicio', label: 'Sistema anterior', icon: createElement('span', null, '◆')}],
    accountMenuItems: [{label: 'Regresar al sistema', href: 'https://sistema-anterior/inicio'}],
});
const removeSink = addLogSink((entry) => entry.level === 'error' && entry.namespace.length > 0);
const uploadError = async (response: Response) => (await apiErrorOf(response)).isUnauthenticated;
const withIcons = menuItemsWithIconsOf([{to: '/inicio', label: 'Inicio', icon: 'x'}]);
// @ts-expect-error la vista de una gráfica es 'chart' o 'table'
const wrongView = createElement(LineChart, {data: [], series: [], periodLabel: '', ariaLabel: '', emptyLabel: '', defaultView: 'pie'});

export {wideBrand, removeSink, uploadError, withIcons, legacyIsland, englishDate, formattersHook, salesChart, layoutEvents, sectionToggle, schemeToggle, barSearch, rowMenu, eventDetails,
    reminder, ownTexts, wrongView, watchAction, isNotice, fileBuildId, watchBuilds, screenCapsules, isInCapsule, isInMoreMenu, readCloseMoreMenu, capsulesTheme, brandMinimalTheme, appleFloating, brandFieldsTheme, appleFieldFill, tokensTheme, panelRadiusValue, rootTokens, tokenNames, piecesTheme, startsMinimal, formFields, applyCaught, checker, cancelAction, typedColumns, noSession, missingNames, demoCode, accountParts, wrongConnector, tilesUrl, markerBounds, monthView, movedCards, columnFull, workspaceParts, ordersRequest, savedRequest, downloadRequest, isValidation, staleChunk, lazyRoutes, passkeyParts, securityParts, cleanCode, toolkitTheme, hasGlass, floatingStyles, contentStyles, floatingInset, formParts, GlassPanel, passwordAccepted, permissionGroups, grantedAfterGroup, trendUp, AuthLayout, PermissionMatrix,
    ProfileHeader, SignInForm, ForgotPasswordForm, ChangePasswordForm, forge, crumbs, topMenu, nextNavigation, AppLayout, PageHeading, dateFormat, serverProblemRoot, emailSchema, HookFormTextField, applyToHookForm, DateInput, FormDateField, Formik, FormWizard, attachmentsServer, PondFileDropzone, amount, title, label, headerLength, cancelText, installmentText, wrongFormat, reactRouterNavigation, translateWithI18next, ServerTable, FormTextField, createCsrfRetryHandler};
