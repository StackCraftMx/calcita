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
import {FileDropzone as PondFileDropzone, createPondServer} from '@stackcraftmx/calcita/filepond';
import {FormTextField as HookFormTextField, SERVER_PROBLEM_ROOT, applyServerProblem as applyToHookForm} from '@stackcraftmx/calcita/react-hook-form';
import {CALENDAR_DATE_FORMAT, DateInput, FormDateField} from '@stackcraftmx/calcita/date-pickers';
import {nextNavigation} from '@stackcraftmx/calcita/next';
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

export {toolkitTheme, hasGlass, floatingStyles, contentStyles, floatingInset, formParts, GlassPanel, passwordAccepted, permissionGroups, grantedAfterGroup, trendUp, AuthLayout, PermissionMatrix,
    ProfileHeader, SignInForm, ForgotPasswordForm, ChangePasswordForm, forge, crumbs, topMenu, nextNavigation, AppLayout, PageHeading, dateFormat, serverProblemRoot, emailSchema, HookFormTextField, applyToHookForm, DateInput, FormDateField, Formik, FormWizard, attachmentsServer, PondFileDropzone, amount, title, label, headerLength, cancelText, installmentText, wrongFormat, reactRouterNavigation, translateWithI18next, ServerTable, FormTextField, createCsrfRetryHandler};
