// Un proyecto en TypeScript que usa el paquete (JavaScript con sus tipos generados del JSDoc). Solo se compila:
//   npx tsc -p testing/typescriptConsumer/tsconfig.json
import {dictionaryEntryOf, formatCurrency, labelOf, lookup, problemTitle, reportPublishedBuild, toolkitTextsEs} from '@stackcraftmx/calcita';
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
    withPermissionGroup,
} from '@stackcraftmx/calcita';
import {ChangePasswordForm, ForgotPasswordForm, SignInForm} from '@stackcraftmx/calcita/forms';
import {Formik, FormWizard, Yup} from '@stackcraftmx/calcita/forms';

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

export {formFields, applyCaught, checker, cancelAction, typedColumns, noSession, missingNames, demoCode, accountParts, wrongConnector, tilesUrl, markerBounds, monthView, movedCards, columnFull, workspaceParts, ordersRequest, savedRequest, downloadRequest, isValidation, staleChunk, lazyRoutes, passkeyParts, securityParts, cleanCode, toolkitTheme, hasGlass, floatingStyles, contentStyles, floatingInset, formParts, GlassPanel, passwordAccepted, permissionGroups, grantedAfterGroup, trendUp, AuthLayout, PermissionMatrix,
    ProfileHeader, SignInForm, ForgotPasswordForm, ChangePasswordForm, forge, crumbs, topMenu, nextNavigation, AppLayout, PageHeading, dateFormat, serverProblemRoot, emailSchema, HookFormTextField, applyToHookForm, DateInput, FormDateField, Formik, FormWizard, attachmentsServer, PondFileDropzone, amount, title, label, headerLength, cancelText, installmentText, wrongFormat, reactRouterNavigation, translateWithI18next, ServerTable, FormTextField, createCsrfRetryHandler};
