// Un proyecto en TypeScript que usa el paquete (JavaScript con sus tipos generados del JSDoc). Solo se compila:
//   npx tsc -p testing/typescriptConsumer/tsconfig.json
import {RecordCard, RecordCardSkeleton, COMPARISON_OPERATOR, FILTER_DRAWER_ANCHOR, FILTER_FIELD_KIND, FilterDrawer, comparisonOf, filterDrawerChipsOf, filterDrawerDefaultsOf, filterDrawerKindsOf, HELP_CLOSE_REASON, HelpButton, HelpCarouselDialog, useHelpCarousel, ICON_BADGE_VARIANT, IconBadge, ROUTE_TABS_MODE, RouteTabs, useActiveRouteTab, dictionaryEntryOf, formatCurrency, labelOf, lookup, problemTitle, reportPublishedBuild, toolkitTextsEs} from '@stackcraftmx/calcita';
import {BUILD_WATCH_ACTION, buildWatchActionOf, publishedBuildIdOf, usePublishedBuildWatch} from '@stackcraftmx/calcita';
import {VALUE_FORMAT, reportSheetOf} from '@stackcraftmx/calcita/excel';
import {reactRouterNavigation} from '@stackcraftmx/calcita/react-router';
import {translateWithI18next} from '@stackcraftmx/calcita/i18next';
import {ServerTable, ServerTableFilterDrawer} from '@stackcraftmx/calcita/table';
import {FormTextField} from '@stackcraftmx/calcita/forms';
import {createCsrfRetryHandler} from '@stackcraftmx/calcita/laravel';
import {MONEY_ROUNDING, Money} from '@stackcraftmx/calcita/money';
import {ApiError, createApiClient, isStaleChunkError, recoverFromStaleChunk, ActivityLog, RecoveryCodesDialog, SessionsCard} from '@stackcraftmx/calcita';
import {RouteErrorScreen, withChunkRecovery} from '@stackcraftmx/calcita/react-router';
import {createPasskey, passkeysSupported, signWithPasskey} from '@stackcraftmx/calcita/passkeys';
import {SecondStepForm, TwoStepVerificationCard, normalizeTotpCode} from '@stackcraftmx/calcita/forms';
import {FileDropzone as PondFileDropzone, createPondServer} from '@stackcraftmx/calcita/filepond';
import {
    AttachmentsInput, CopyButton, FILE_REJECTION, FILE_UPLOAD_STATUS, FileInput, FileUploadInput, transferProgressOf, IMAGE_SHAPE, ImageInput, TemplateDownloadButton, fileAppearanceOf, screenFiles,
    tableRowTextOf, useFilePicker, MaskedInput, INPUT_MASK, rawValueOf, Countdown, useCountdown, countdownPartsOf, PdfViewerDialog, CookieNotice,
    TermsAcceptanceDialog, useCookieConsent,
} from '@stackcraftmx/calcita';
import {FormAttachmentsField, FormFileField, FormImageField, FormMaskedField} from '@stackcraftmx/calcita/forms';
import {FormFileField as HookFormFileField, FormRepeatingFields as HookRepeatingFields} from '@stackcraftmx/calcita/react-hook-form';
import {FormRepeatingFields, listTotalAtMostRule, listTotalOf, orderedInListRule, uniqueInListRule} from '@stackcraftmx/calcita/forms';
import {FormCatalogField as ChoiceCatalogField, FormCheckboxGroupField, FormTransferListField} from '@stackcraftmx/calcita/forms';
import {FormCheckboxGroupField as HookCheckboxGroupField, FormTransferListField as HookTransferListField} from '@stackcraftmx/calcita/react-hook-form';
import {FormTextField as HookFormTextField, SERVER_PROBLEM_ROOT, applyServerProblem as applyToHookForm} from '@stackcraftmx/calcita/react-hook-form';
import {
    CALENDAR_DATE_FORMAT, CALENDAR_MONTH_FORMAT, DateInput, DateTimeInput, FormDateField, FormDateTimeField, FormMonthField, FormTimeField,
    INSTANT_FORMAT, MonthInput, TIME_OF_DAY_FORMAT, TimeInput, timeZoneNameOf,
} from '@stackcraftmx/calcita/date-pickers';
import {nextNavigation} from '@stackcraftmx/calcita/next';
import {
    DateTimeInput as MinimumDateTimeInput, earliestInstantFromNow, instantPlusMinutes, latestInstantOf, minutesAfterRule, minutesFromNowRule, useCurrentMinute,
} from '@stackcraftmx/calcita/date-pickers';
import {FormRichTextField, RICH_TEXT_FEATURE, RichTextEditor, RichTextView, linkUrlOf, normalizedHtmlOf} from '@stackcraftmx/calcita/rich-text';
import {
    CERTIFICATE_STATUS, CfdiSummary, EfirmaFields, RFC_KIND, certificateStatusOf, clabeRule, isValidClabe, isValidCurp, isValidRfc, readCertificate, readCfdi,
    rfcRule, verifyEfirmaKey, EFIRMA_KEY_PROBLEM, EfirmaKeyError,
} from '@stackcraftmx/calcita/mexico';
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
import {DESKTOP_MEDIA_QUERY, PHONE_MEDIA_QUERY} from '@stackcraftmx/calcita';
import {CalendarHeatmap, DEFAULT_HOUR_CYCLE, HOUR_CYCLE} from '@stackcraftmx/calcita';
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
// los cargadores: un archivo, varios (nuevos y ya guardados), una imagen y la plantilla
const pickerRef: {current: {open: () => void} | null} = {current: null};
const uploaders = [
    createElement(FileInput, {label: 'Constancia', value: null, onChange: (file: File | null) => file?.name, accept: ['pdf'], maxSize: '5 MB', template: {href: '/plantilla.pdf'}}),
    // el cargador mini: la subida del proyecto con su avance, lo que se guarda de la respuesta y los eventos
    createElement(FileUploadInput, {
        label: 'Identificación', value: '', onChange: (fileId: string) => fileId.length, accept: ['pdf', 'image'], maxSize: '5 MB',
        upload: async (file: File, {signal, idempotencyKey, onUploadProgress}) => {
            onUploadProgress({loaded: file.size, total: file.size});
            return {file_id: `${idempotencyKey}-${signal.aborted}`};
        },
        idOf: (response: {file_id: string}) => response.file_id,
        download: async (fileId: string) => ({blob: new Blob([fileId]), fileName: 'ine.pdf'}),
        onStatusChange: (status: string) => status === FILE_UPLOAD_STATUS.uploaded,
    }),
    createElement(AttachmentsInput, {value: [{id: 'a1', name: 'contrato.pdf', size: 1000}], onChange: (files) => files.length, maxFiles: 3, showButton: false, pickerRef, onRemove: (file) => file.name}),
    createElement(ImageInput, {label: 'Foto', value: '/foto.jpg', onChange: () => {}, shape: IMAGE_SHAPE.circle, size: 72}),
    createElement(TemplateDownloadButton, {request: async () => ({blob: new Blob(['x']), fileName: 'plantilla.csv'}), format: 'csv', onDownload: () => {}}),
    createElement(FormFileField, {name: 'taxCertificate', label: 'Constancia', accept: 'pdf'}),
    createElement(FormAttachmentsField, {name: 'attachments', maxTotalSize: '10 MB'}),
    createElement(FormImageField, {name: 'photo', label: 'Foto', shape: IMAGE_SHAPE.rounded}),
    createElement(HookFormFileField, {name: 'contract', label: 'Contrato'}),
    // @ts-expect-error la forma es 'circle' o 'rounded'
    createElement(ImageInput, {label: 'Foto', value: null, onChange: () => {}, shape: 'square'}),
];
const screened = screenFiles([{name: 'a.pdf', size: 10}], {maxFiles: 1});
const rejectionReason: string = FILE_REJECTION.count;
const pdfLook = fileAppearanceOf('factura.pdf').color;
const filePickerHook = useFilePicker;
// copiar un renglón para Excel, armado al picar, y saber si el navegador no dejó
// máscara, cuenta regresiva, PDF y avisos legales
const cleanPhone: string = rawValueOf('(555) 123-4567', INPUT_MASK.phone);
const remaining = countdownPartsOf('2026-11-03T00:00:00Z', Date.now()).totalSeconds;
const countdownHook = useCountdown;
const consentHook = useCookieConsent;
const smallPieces = [
    createElement(MaskedInput, {label: 'CLABE', mask: 'clabe', value: '', onChange: (clean: string) => clean.length}),
    createElement(FormMaskedField, {name: 'phone', label: 'Teléfono', mask: INPUT_MASK.phone, placeholder: '555 123 4567'}),
    createElement(Countdown, {until: new Date(), onComplete: () => {}, showSeconds: false}),
    createElement(PdfViewerDialog, {open: true, onClose: () => {}, title: 'Contrato', src: new Blob(['%PDF']), fileName: 'contrato.pdf'}),
    createElement(CookieNotice, {version: '2026-11', onPolicyClick: () => {}, onAccept: ({version}) => version}),
    createElement(TermsAcceptanceDialog, {open: true, version: '2026-11', onAccept: async ({version}) => { void version; }, onDecline: () => {}}),
];
// México: claves con su dígito, reglas de yup, la e.firma y la factura
const isCompany: boolean = isValidRfc('SAT970701NN3', {strict: true}) && isValidCurp('MAPA850101HDFRRN03') && isValidClabe('032180000118359719');
const companyKind: string = RFC_KIND.company;
const yupRules = [rfcRule({strict: true}), clabeRule()].map((rule) => rule.message.key);
const invoice = readCfdi('<cfdi:Comprobante/>');
const invoiceTotal: string | null | undefined = invoice?.total;
const certificateStatus = (certificate: ReturnType<typeof readCertificate>) => certificateStatusOf(certificate) === CERTIFICATE_STATUS.expired;
// el editor con formato: HTML de ida y vuelta, botones a la medida y el editor de Tiptap
const safeLink: string | null = linkUrlOf('calcita.mx');
const emptyHtml: string = normalizedHtmlOf('<p></p>');
const richTextPieces = [
    createElement(RichTextEditor, {
        label: 'Notas', value: '', onChange: (html: string) => html.length, maxLength: 500,
        features: [RICH_TEXT_FEATURE.bold, RICH_TEXT_FEATURE.link], onEditorReady: (editor) => editor.commands.focus(),
    }),
    createElement(RichTextView, {value: '<p>Hola</p>'}),
    createElement(FormRichTextField, {name: 'notes', label: 'Notas', placeholder: 'Escriba aquí'}),
];
// publicar con anticipación: el mínimo que se recorre, el fin desde el inicio y las reglas de yup
const uploadSpeed: number | null = transferProgressOf({loaded: 10, total: 100}, 0).bytesPerSecond;
const publishStart: string = earliestInstantFromNow(5);
const publishEnd: string = instantPlusMinutes(publishStart, 30);
const strictestMinimum: string = latestInstantOf(publishStart, undefined, '');
const startRule = minutesFromNowRule(5);
const endRule = minutesAfterRule('startsAt', 30);
const ruleChecks: boolean[] = [startRule.test(publishStart), endRule.test(publishEnd, {parent: {startsAt: publishStart}})];
const minuteHook: () => number = () => useCurrentMinute(true);
const publishPieces = createElement(MinimumDateTimeInput, {label: 'Empieza', value: publishStart, onChange: (instant: string) => instant.length, minimumMinutesFromNow: 5});
// renglones que se repiten: formik y react-hook-form con lo mismo, y las reglas de listas
const repeatingPieces = [
    createElement(FormRepeatingFields, {
        name: 'tiers', label: 'Precios por volumen', emptyRow: {min_quantity: '', price: ''}, maxRows: 6, columns: {xs: 1, md: 2},
        renderRow: ({nameOf, index}: {nameOf: (field: string) => string, index: number}) => createElement(FormTextField, {name: nameOf('price'), label: `Precio ${index + 1}`}),
        removeBlockedReason: (row: object) => ('id' in row ? 'Ya tiene pedidos' : null),
        confirmRemove: (row: object) => 'id' in row,
        onRemove: (row: object, index: number) => index,
    }),
    createElement(HookRepeatingFields, {name: 'contacts', emptyRow: {email: ''}, renderRow: () => null}),
];
const listRules = [uniqueInListRule('tiers', 'min_quantity'), orderedInListRule('tiers', 'min_quantity', {ascending: true, displayOf: (text: string) => `${text} pzas`})];
const splitRule = listTotalAtMostRule('amount', (values: {credit_limit?: string}) => values.credit_limit ?? null, {currency: 'MXN'});
const splitTotal: string = listTotalOf([{amount: '10.50'}], 'amount', {currency: 'MXN'}).format();
// elegir varios: casillas, transferencia, y «Elegir todos» con casillas y «+N» en el catálogo
const choicePieces = [
    createElement(FormCheckboxGroupField, {name: 'channels', label: 'Avisos por', selectAll: true, row: true, options: [{value: 'email', label: 'Correo', disabled: false}]}),
    createElement(FormTransferListField, {name: 'branches', label: 'Sucursales', options: [{value: 'a', label: 'Centro'}], availableTitle: 'Todas', searchable: true, listHeight: 200}),
    createElement(HookCheckboxGroupField, {name: 'channels', label: 'Avisos', options: []}),
    createElement(HookTransferListField, {name: 'branches', options: []}),
    createElement(ChoiceCatalogField, {name: 'states', label: 'Estados', options: [{code: 'NL', label: 'Nuevo León'}], multiple: true, selectAll: true, checkboxes: true, limitTags: 3}),
];
// la insignia: suelta, con su estilo, y desde un diccionario con ícono
const badgeEntry = dictionaryEntryOf('insured', 'perks.insured', 'success', {icon: () => null});
const badgePieces = [
    createElement(IconBadge, {label: 'Envío asegurado', tone: 'success', variant: ICON_BADGE_VARIANT.soft, size: 'medium', tooltip: 'Cubre hasta $50,000'}),
    createElement(IconBadge, {dictionary: {insured: badgeEntry}, value: 'insured', variant: 'plain'}),
];
// pestañas por ruta y por consulta, con permiso, conteo y la activa para pintar su panel
const routeTabs = [{to: '/customers/12', label: 'Resumen', exact: true}, {to: '/customers/12/payments', label: 'Pagos', badge: 3, access: {ability: 'payments.view'}}];
const routeTabPieces = [
    createElement(RouteTabs, {ariaLabel: 'Secciones del cliente', tabs: routeTabs, onChange: (tab: object) => tab}),
    createElement(RouteTabs, {ariaLabel: 'Detalle', mode: ROUTE_TABS_MODE.query, paramName: 'section', tabs: [{value: 'summary', label: 'Resumen'}]}),
];
const activeTabHook: () => string | null = () => useActiveRouteTab(routeTabs);
// la ayuda en carrusel: cuándo sale, el botón y la ventana con sus avisos
const helpHook = () => useHelpCarousel({helpKey: 'tasks', version: '2', seen: false});
const helpPieces = [
    createElement(HelpButton, {onClick: () => undefined, size: 'small'}),
    createElement(HelpCarouselDialog, {
        open: true, title: 'Cómo usar el tablero', steps: [{title: 'Arrastre', content: 'Mueva las tarjetas', image: '/ayuda/1.png', imageAlt: 'Una tarjeta'}],
        onClose: (reason: string, {dontShowAgain}: {dontShowAgain: boolean}) => reason === HELP_CLOSE_REASON.finished || dontShowAgain,
        onStepChange: (index: number) => index,
    }),
];
// el cajón de búsqueda: sus campos, sus defaults y tipos para la tabla, sus chips y el botón conectado a la tabla
const drawerFields = [
    {name: 'total', label: 'Total', kind: FILTER_FIELD_KIND.comparison, prefix: '$', operators: [COMPARISON_OPERATOR.greaterOrEqual]},
    {name: 'created', label: 'Fecha', kind: FILTER_FIELD_KIND.dateRange, keys: {from: 'created_from', to: 'created_to'}},
];
const drawerSetup = {defaults: filterDrawerDefaultsOf(drawerFields), kinds: filterDrawerKindsOf(drawerFields), chips: filterDrawerChipsOf(drawerFields, {t: (key: string) => key})};
const parsedComparison = comparisonOf('gte:500');
const drawerPieces = [
    createElement(FilterDrawer, {open: true, onClose: () => undefined, fields: drawerFields, values: {}, onApply: (values: Record<string, unknown>) => values, anchor: FILTER_DRAWER_ANCHOR.left, width: 420}),
    createElement(ServerTableFilterDrawer, {fields: drawerFields, anchor: 'right', title: 'Buscar pedidos'}),
];
// la tarjeta de un registro: identidad, grupos de datos, dato principal, acciones y detalle desplegable; y su esqueleto
const recordCardPieces = [
    createElement(RecordCard, {
        title: 'Ana López', eyebrow: 'P-1203', subtitle: 'Silla de oficina × 2', avatar: 'Ana López', onOpen: () => undefined, openLabel: 'Abrir el pedido P-1203',
        actions: [{key: 'copy', label: 'Copiar', onClick: () => undefined}],
        groups: [{title: 'Importe', facts: [{label: 'Total', value: '$116.00', emphasis: true}]}],
        highlight: {label: 'Total', value: '$116.00', caption: 'Con IVA'}, details: 'Historial', onDetailsToggle: (isOpen: boolean) => isOpen,
        trailing: 'Entregado', columns: '1fr 1fr auto auto',
    }),
    createElement(RecordCardSkeleton, {groups: 2, factsPerGroup: 3, withAvatar: false}),
];
const keyCheck = (certificateBytes: ArrayBuffer, keyBytes: ArrayBuffer) => verifyEfirmaKey({certificateBytes, keyBytes, password: ''})
    .catch((error: unknown) => error instanceof EfirmaKeyError && error.reason === EFIRMA_KEY_PROBLEM.wrongPassword);
const mexicoPieces = [
    invoice && createElement(CfdiSummary, {cfdi: invoice, expectedReceiverRfc: 'AAA010101AAA', showConcepts: false}),
    createElement(EfirmaFields, {
        onChange: (value) => value.password.length, expectedRfc: 'AAA010101AAA',
        onVerifyKey: async ({certificate, password}) => { void certificate.rfc; void password; },
    }),
];
const copyRow = createElement(CopyButton, {label: 'Copiar', value: () => tableRowTextOf(['P-1', 2, null]), onCopyFailed: (error: unknown) => error});
// fecha con hora, hora y mes: cada uno con su valor en texto y sus límites con la misma forma
const travelFormats: string[] = [CALENDAR_MONTH_FORMAT, INSTANT_FORMAT, TIME_OF_DAY_FORMAT];
const zoneName: string = timeZoneNameOf('America/Mexico_City', 'es-MX');
const pickerFields = [
    createElement(DateTimeInput, {label: 'Posponer hasta', value: '', onChange: (instant: string) => instant.length, disablePast: true, minutesStep: 15, timeZone: 'America/Tijuana', pickerProps: {closeOnSelect: false}}),
    createElement(TimeInput, {label: 'Hora', value: '09:00', onChange: () => {}, minTime: '08:00', maxTime: '18:00'}),
    createElement(MonthInput, {label: 'Mes', value: '2026-11', onChange: () => {}, maxMonth: '2026-12', disableFuture: true}),
    createElement(FormDateTimeField, {name: 'snoozedUntil', label: 'Posponer hasta', showTimeZone: false}),
    createElement(FormTimeField, {name: 'startTime', label: 'Hora de inicio', minutesStep: 30}),
    createElement(FormMonthField, {name: 'month', label: 'Mes'}),
    // @ts-expect-error minutesStep es un número, no un texto
    createElement(TimeInput, {label: 'Hora', value: '', onChange: () => {}, minutesStep: '30'}),
];
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
// el logo ancho con una imagen para cada modo: el de color en claro y el blanco en oscuro
const pairedWordmarkLayout = createElement(AppLayout, {
    wordmark: {light: createElement('img', {src: '/logo-color.svg', alt: ''}), dark: createElement('img', {src: '/logo-blanco.svg', alt: ''})},
    children: null,
});
// un ajuste del marco solo en escritorio, con la misma regla que usa el marco
const desktopOnlyTheme = createToolkitTheme({components: {CalcitaAppLayout: {styleOverrides: {toolbar: {[DESKTOP_MEDIA_QUERY]: {paddingLeft: 0}}}}}});
const phoneRule: string = PHONE_MEDIA_QUERY;
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

// lo de la 0.32: la hora de 12 horas con a.m. y p.m., y el calendario sin fechas (el último año hasta hoy)
const twelveHourIsland = createElement(ToolkitProvider, {hourCycle: HOUR_CYCLE.twelveHours, children: 'isla'});
const defaultHourCycle: 'h23' | 'h12' = DEFAULT_HOUR_CYCLE;
const lastYearHeatmap = createElement(CalendarHeatmap, {days: [], ariaLabel: 'Actividad', valueLabel: 'Pedidos'});
// @ts-expect-error la hora es 'h23' o 'h12'
const wrongHourCycle = createElement(ToolkitProvider, {hourCycle: 'h24', children: 'isla'});

// lo de la 0.47.1: el sx de la pantalla como lista, y la tabla con renglones que crecen y gridSx que se combina
import {sxListOf} from '@stackcraftmx/calcita';
const screenSx = sxListOf({p: 2});
const noScreenSx = sxListOf(undefined);
const tallRowsTable = createElement(ServerTable, {
    queryKey: 'tall', fetchPage: async () => ({rows: [], total: 0}), columns: [], ariaLabel: 'Renglones altos',
    getRowHeight: () => 'auto' as const, gridSx: [{'& .MuiDataGrid-cell': {alignItems: 'flex-start'}}],
});

// lo de la 0.48: menú con destinos, pestañas que reemplazan, varias columnas fijas, textos que faltan, texto con marcas y
// mensajes de validación propios
import {MarkedText, ToolkitProvider as Provider048, parseMarkedText, translateValidationMessage, useValidationText, createBrowserNavigation as browserNavigation048} from '@stackcraftmx/calcita';
import {percentRule, sameAsFieldRule} from '@stackcraftmx/calcita/forms';
import {percentRule as hookPercentRule} from '@stackcraftmx/calcita/react-hook-form';
import {isValidPostalCode, postalCodeRule} from '@stackcraftmx/calcita/mexico';
const menuWithDestination = createElement(ActionsMenu, {label: 'Acciones', actions: [
    {key: 'open', label: 'Abrir', to: '/orders/1'},
    {key: 'log', label: 'Anotar', onClick: (event) => event.metaKey},
]});
const replacingTabs = createElement(RouteTabs, {ariaLabel: 'Secciones', mode: ROUTE_TABS_MODE.query, replace: false, tabs: [{value: 'a', label: 'A'}]});
const twoFixedColumns = createElement(ServerTable, {
    queryKey: 'fixed', fetchPage: async () => ({rows: [], total: 0}), columns: [], ariaLabel: 'Fijas', fixedColumn: ['actions', 'company'],
});
const missingTexts: string[] = [];
const legacyProvider = createElement(Provider048, {
    onMissingText: ({namespace, key, language}) => { missingTexts.push(`${language}:${namespace}:${key}`); },
    readValidationMessage: (error: unknown) => (typeof error === 'object' && error !== null && 'codigo' in error ? {key: 'legado:requerido'} : undefined),
    children: 'isla',
});
const headline = createElement(MarkedText, {text: 'Con <highlight>todo</highlight>', marks: {highlight: createElement('strong'), em: 'em', tip: (children) => children}});
const markedPieces = parseMarkedText('Con <highlight>todo</highlight>', ['highlight']);
const readMessage: string | undefined = translateValidationMessage((key) => key, {msg: 'legado:requerido'}, {label: 'RFC', messages: {required: 'Escriba el RFC'}, fieldName: 'rfc'});
const validationHook = useValidationText;
const fieldRules = [sameAsFieldRule('password', {otherLabel: 'la contraseña'}), percentRule({max: 30}), hookPercentRule(), postalCodeRule()].map((rule) => rule.message.key);
const postalOk: boolean = isValidPostalCode('06600');
const replaceNavigation = browserNavigation048().useNavigate()('/pedidos', {replace: true});
// @ts-expect-error fixedColumn es un campo o una lista de campos
const wrongFixed = createElement(ServerTable, {queryKey: 'x', fetchPage: async () => ({rows: [], total: 0}), columns: [], ariaLabel: 'x', fixedColumn: 3});

// lo de la 0.49: columnas listas, la vista de tarjetas y su estado
import {ACTIONS_COLUMN_FIELD, StackedCell, TABLE_VIEW, actionsColumn, stackedColumn, statusColumn, statusColumnWidthOf, useTableView} from '@stackcraftmx/calcita/table';
import type {StackedEntry} from '@stackcraftmx/calcita/table';
const readyColumns = [
    actionsColumn({label: 'Acciones', actionsOf: () => [{key: 'open', label: 'Abrir', to: '/clientes/1'}], labelOf: (row: {name: string}) => `Acciones de ${row.name}`}),
    stackedColumn({field: 'name', label: 'Empresa', entries: (row: {name: string, rfc: string}) => [row.name, row.rfc], flex: 1}),
    stackedColumn({field: 'created_at', label: 'Fechas', entries: (row: {created_at: string}, value: string) => [{label: 'Alta', value, note: 'nuevo'}, row.created_at]}),
    statusColumn({field: 'status', label: 'Estado', dictionary: {}, t: (key: string) => key, variant: 'chip', filter: false}),
];
const cardsTable = createElement(ServerTable, {
    queryKey: 'clientes', fetchPage: async () => ({rows: [], total: 0}), columns: readyColumns, ariaLabel: 'Clientes',
    fixedColumn: [ACTIONS_COLUMN_FIELD, 'name'], renderCard: (row: {name: string}) => row.name, defaultView: TABLE_VIEW.cards,
    onViewChange: (nextView: 'table' | 'cards') => nextView === 'cards',
});
const statusWidth: number = statusColumnWidthOf(['Estado', 'Registro aprobado']);
const stackedEntries: StackedEntry[] = ['Acme', {label: 'RFC', value: 'ACM010101AB1'}, null];
const stackedCell = createElement(StackedCell, {entries: stackedEntries});
// @ts-expect-error entries es una función del renglón, no la lista
const wrongStacked = stackedColumn({field: 'name', label: 'Empresa', entries: ['Acme']});
const viewHook = useTableView;
// @ts-expect-error la vista es 'table' o 'cards'
const wrongView049 = createElement(ServerTable, {queryKey: 'x', fetchPage: async () => ({rows: [], total: 0}), columns: [], ariaLabel: 'x', defaultView: 'grid'});

export {readyColumns, cardsTable, statusWidth, viewHook, wrongView049, menuWithDestination, replacingTabs, twoFixedColumns, legacyProvider, headline, markedPieces, readMessage, validationHook, fieldRules, postalOk, replaceNavigation, wrongFixed, screenSx, noScreenSx, tallRowsTable, twelveHourIsland, defaultHourCycle, lastYearHeatmap, wrongHourCycle, wideBrand, removeSink, uploadError, withIcons, legacyIsland, englishDate, formattersHook, salesChart, layoutEvents, sectionToggle, schemeToggle, barSearch, rowMenu, eventDetails,
    reminder, ownTexts, wrongView, watchAction, isNotice, fileBuildId, watchBuilds, screenCapsules, isInCapsule, isInMoreMenu, readCloseMoreMenu, capsulesTheme, brandMinimalTheme, appleFloating, brandFieldsTheme, appleFieldFill, tokensTheme, panelRadiusValue, rootTokens, tokenNames, pairedWordmarkLayout, desktopOnlyTheme, phoneRule, piecesTheme, startsMinimal, formFields, applyCaught, checker, cancelAction, typedColumns, noSession, missingNames, demoCode, accountParts, wrongConnector, tilesUrl, markerBounds, monthView, movedCards, columnFull, workspaceParts, ordersRequest, savedRequest, downloadRequest, isValidation, staleChunk, lazyRoutes, passkeyParts, securityParts, cleanCode, toolkitTheme, hasGlass, floatingStyles, contentStyles, floatingInset, formParts, GlassPanel, passwordAccepted, permissionGroups, grantedAfterGroup, trendUp, AuthLayout, PermissionMatrix,
    ProfileHeader, SignInForm, ForgotPasswordForm, ChangePasswordForm, forge, crumbs, topMenu, nextNavigation, AppLayout, PageHeading, dateFormat, travelFormats, zoneName, pickerFields, uploaders, screened, rejectionReason, pdfLook, filePickerHook, copyRow, cleanPhone, remaining, countdownHook, consentHook, smallPieces, isCompany, companyKind, yupRules, invoiceTotal, certificateStatus, mexicoPieces, keyCheck, recordCardPieces, drawerSetup, parsedComparison, drawerPieces, choicePieces, badgePieces, routeTabPieces, activeTabHook, helpHook, helpPieces, repeatingPieces, listRules, splitRule, splitTotal, strictestMinimum, uploadSpeed, ruleChecks, minuteHook, publishPieces, publishEnd, safeLink, emptyHtml, richTextPieces, serverProblemRoot, emailSchema, HookFormTextField, applyToHookForm, DateInput, FormDateField, Formik, FormWizard, attachmentsServer, PondFileDropzone, amount, title, label, headerLength, cancelText, installmentText, wrongFormat, reactRouterNavigation, translateWithI18next, ServerTable, FormTextField, createCsrfRetryHandler};
