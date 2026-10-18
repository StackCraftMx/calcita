// Prueba de humo del paquete YA CONSTRUIDO (dist/), como lo usaría un proyecto nuevo: el tema por omisión de MUI
// (createTheme() sin variables CSS; los casos que lo dicen, con createToolkitTheme), sin router (la navegación del
// navegador) y sin i18next (los textos del paquete).
// Pinta cada componente en el servidor (react-dom/server) y avisa cuál truena. Se corre después de npm run build:
//   node testing/smokeRender.js
import {createElement as h} from 'react';
import {renderToString} from 'react-dom/server';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import {NuqsTestingAdapter} from 'nuqs/adapters/testing';

import {
    BackButton, CalendarHeatmap, ColorSchemeToggle, ConfirmDialog, DocumentTitle, DownloadMenu, LanguageToggle, MetricCard, ModalWaiting,
    AppLayout, CatalogInput, ColorInput, FileDropzone, FontSizeToggle, MENU_POSITION, RequireAccess, NewBuildNotice, NumberInput, PageHeader, PageHeading,
    AppearanceSettings, AuthLayout, FormSection, GlassLensFilter, GlassPanel, PasswordChecklist, PermissionMatrix, ProfileHeader, QuickFilters, SecretField, SectionCard, StatusChip, Tag,
    TREND_DIRECTION, TextInput, ToolkitProvider, createToolkitTheme, dictionaryEntryOf, formatCurrency, formatDate,
    ActivityLog, ERROR_PAGE_KIND, ErrorPage, SessionsCard, StaleBuildBoundary, InboxLayout, MessageList, MessageView,
} from '@stackcraftmx/calcita';
import {ServerTable, textColumn} from '@stackcraftmx/calcita/table';
// formik viene con el paquete: Formik se importa de él, como lo haría un proyecto
import {
    ChangePasswordForm, ForgotPasswordForm, FormTextField, FormWizard, Formik, SecondStepForm, SignInForm, TwoStepVerificationCard,
} from '@stackcraftmx/calcita/forms';
import {BarList, ColumnChart} from '@stackcraftmx/calcita/charts';
import {GroupedTimeline} from '@stackcraftmx/calcita/timeline';
import {EventCalendar} from '@stackcraftmx/calcita/calendar';
import {KanbanBoard} from '@stackcraftmx/calcita/kanban';
import {AccountProvider, ProfileScreen, ResetPasswordScreen, SignInScreen} from '@stackcraftmx/calcita/account';
import {createDemoAccountConnector} from '@stackcraftmx/calcita/account-demo';
// MapView (/maps) no entra: Leaflet usa window al cargarse; en el servidor se carga aparte (en Next, con ssr: false)

const ORDER_STATUS = Object.freeze({pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning')});
// un menú con secciones y un submenú, como lo regresa composeMenu
const MENU_ITEMS = [
    {to: '/', label: 'Inicio'},
    {to: '/pedidos', label: 'Pedidos', section: 'Operación', badge: 3},
    {label: 'Catálogos', section: 'Operación', children: [{to: '/catalogos/productos', label: 'Productos'}]},
];
const TOOLKIT_THEME_WITH_GLASS = createToolkitTheme({glass: true});
const TOOLKIT_THEME_WITH_GLASS_SURFACES = createToolkitTheme({glass: {opacity: 0.7, surfaces: true}});
const INBOX_MESSAGE = {
    id: 'm1', from: {name: 'Luis Herrera', email: 'luis@ejemplo.com'}, subject: 'Entrega del lunes', preview: 'Hola',
    receivedAt: '2026-10-17T15:00:00Z', isUnread: true, isStarred: false, hasAttachments: false, to: ['ana@ejemplo.com'],
    body: 'Texto con <b>etiquetas</b>', attachments: [],
};
// la cuenta con el conector de demostración y la sesión ya conocida (en el servidor no corre la primera carga)
const DEMO_CONNECTOR = createDemoAccountConnector({delayMilliseconds: 0, labels: ['Administración']});
const DEMO_SESSION = {user: {id: 'u1', name: 'Ana Martínez Ruiz', email: 'ana@ejemplo.com'}, roles: [], abilities: [], labels: ['Administración']};
const withAccount = (session, screen) => h(AccountProvider, {connector: DEMO_CONNECTOR, initialSession: session}, () => screen);
const PROJECT_TEXTS = {es: {dictionaries: {orderStatus: {pending: {label: 'Pendiente', tooltip: 'Esperando pago'}}}}};

// cada caso: su nombre, el componente y un texto que debe salir en lo pintado
const CASES = [
    ['PageHeader', h(PageHeader, {title: 'Pedidos del mes', eyebrow: 'VENTAS', subtitle: 'Todos los pedidos'}), 'Pedidos del mes'],
    ['MetricCard con enlace', h(MetricCard, {label: 'Pedidos', value: '1,200', caption: 'este mes', to: '/pedidos'}), 'href="/pedidos"'],
    ['QuickFilters con contador', h(QuickFilters, {value: 'pending', onChange: () => {}, ariaLabel: 'Estado', options: [{value: '', label: 'Todos', count: 20}, {value: 'pending', label: 'Pendientes', count: 12}]}), 'Pendientes'],
    ['StatusChip con texto del proyecto', h(StatusChip, {dictionary: ORDER_STATUS, value: 'pending'}), 'Pendiente'],
    ['StatusChip con valor nuevo', h(StatusChip, {dictionary: ORDER_STATUS, value: 'shipped'}), 'shipped'],
    ['Tag', h(Tag, {label: 'Nuevo'}), 'Nuevo'],
    ['BackButton sin router', h(BackButton, {fallbackTo: '/pedidos'}), 'Regresar'],
    ['DownloadMenu', h(DownloadMenu, {formats: ['xlsx', 'csv'], download: async () => ({blob: new Blob(), fileName: 'a.xlsx'})}), 'Descargar'],
    // el diálogo y la espera van en un portal de MUI, que no se pinta en el servidor: basta con que no truenen
    ['ConfirmDialog abierto', h(ConfirmDialog, {open: true, title: '¿Cancelar el pedido 15?', onConfirm: () => {}, onClose: () => {}}), ''],
    ['ModalWaiting', h(ModalWaiting, {open: true}), ''],
    ['CalendarHeatmap', h(CalendarHeatmap, {startsOn: '2027-01-04', endsOn: '2027-01-31', days: [{date: '2027-01-05', value: 3}], ariaLabel: 'Actividad', valueLabel: 'Pedidos', describeValue: (value) => `${value} pedidos`}), 'Actividad'],
    ['LanguageToggle', h(LanguageToggle), 'EN'],
    ['ColorSchemeToggle', h(ColorSchemeToggle), ''],
    // en el servidor no hay pestaña que comparar: no pinta nada, pero no debe tronar (useSyncExternalStore pide su versión del servidor)
    ['NewBuildNotice', h(NewBuildNotice), ''],
    // sin canAccess del proyecto, lo que tiene regla no se ve: sale la página de «sin permiso»
    ['RequireAccess sin permiso', h(RequireAccess, {access: {ability: 'users.admin'}}, 'pantalla secreta'), 'No tiene permiso para ver esta pantalla'],
    ['AppLayout lateral con secciones y submenú', h(AppLayout, {brandName: 'Mi app', menuItems: MENU_ITEMS, user: {name: 'Ana López'}}, 'contenido'), 'Operación'],
    ['AppLayout con el menú arriba', h(AppLayout, {brandName: 'Mi app', menuItems: MENU_ITEMS, menuPosition: MENU_POSITION.top}, 'contenido'), 'Catálogos'],
    ['PageHeading con migas y botones', h(AppLayout, {menuItems: MENU_ITEMS}, h(PageHeading, {
        title: 'Productos', description: 'Todo el catálogo', breadcrumbs: [{label: 'Inicio', to: '/'}, {label: 'Catálogos'}, {label: 'Productos'}], actions: 'Nuevo',
    })), 'Todo el catálogo'],
    ['FontSizeToggle (antes de montar reserva su lugar)', h(FontSizeToggle), ''],
    ['createToolkitTheme con vidrio líquido', h(AppLayout, {brandName: 'Mi app', menuItems: MENU_ITEMS}, 'contenido'), 'blur(20px)', TOOLKIT_THEME_WITH_GLASS],
    // sin vidrio en el tema, GlassPanel es una tarjeta con sombra; con vidrio, desenfoca
    ['GlassPanel sin vidrio', h(GlassPanel, null, 'controles del mapa'), 'controles del mapa'],
    ['GlassPanel con vidrio', h(GlassPanel, null, 'controles del mapa'), 'blur(20px)', TOOLKIT_THEME_WITH_GLASS],
    // el lente: los dos filtros SVG van en la página solo con el vidrio en el tema
    ['GlassLensFilter con vidrio', h(GlassLensFilter), 'toolkit-glass-lens-panel', TOOLKIT_THEME_WITH_GLASS],
    // el formulario de Apple: dentro de una FormSection el campo es un renglón (etiqueta a la izquierda)
    ['FormSection con un campo como renglón', h(FormSection, {title: 'Contacto'}, h(TextInput, {label: 'Nombre', value: '', onChange: () => {}})), 'calcita-form-row'],
    // el contenido lleva material (más transparente que el vidrio: 0.7 - 0.15), no el vidrio de los controles
    ['SectionCard con glass.surfaces y opacidad 0.7', h(SectionCard, {title: 'Resumen'}, 'texto'), '55%, transparent)', TOOLKIT_THEME_WITH_GLASS_SURFACES],
    // el template: entrar, perfil y permisos
    ['AuthLayout con iniciar sesión', h(AuthLayout, {title: 'Iniciar sesión', brandName: 'Mi app'}, h(SignInForm, {onSubmit: async () => {}, forgotPasswordPath: '/olvide'})),
        '¿Olvidó su contraseña?'],
    ['ForgotPasswordForm', h(ForgotPasswordForm, {onSubmit: async () => {}, signInPath: '/entrar'}), 'Enviar el enlace'],
    ['ChangePasswordForm con su lista de reglas', h(ChangePasswordForm, {onSubmit: async () => {}}), 'Al menos 12 caracteres'],
    ['PasswordChecklist con una regla cumplida', h(PasswordChecklist, {password: 'abc', policy: {minLength: 8, lowercase: true}}), 'data-met="true"'],
    ['ProfileHeader con iniciales y perfil', h(ProfileHeader, {name: 'Ana López', email: 'ana@ejemplo.com', chips: ['Supervisor']}), '>AL<'],
    ['PermissionMatrix con un grupo a medias', h(PermissionMatrix, {
        groups: [{key: 'pedidos', label: 'Pedidos', permissions: [{key: 'orders.view', label: 'Ver pedidos'}, {key: 'orders.cancel', label: 'Cancelar pedidos'}]}],
        value: ['orders.view'], onChange: () => {},
    }), '1 de 2'],
    ['MetricCard con tendencia', h(MetricCard, {label: 'Vendido', value: '$1,200.00', trend: {label: '+12.0 %', direction: TREND_DIRECTION.up}}), 'Subió +12.0 %'],
    // el modo de color se conoce hasta montar: en el servidor salen la letra y el idioma
    ['AppearanceSettings', h(AppearanceSettings), 'Tamaño de letra'],
    ['NumberInput con miles y decimales', h(NumberInput, {label: 'Importe', value: '2850000.5', onChange: () => {}}), '2,850,000.50'],
    ['CatalogInput con la opción elegida', h(CatalogInput, {label: 'Estado', value: 'JAL', onChange: () => {}, options: [{code: 'JAL', label: 'Jalisco'}]}), 'Jalisco (JAL)'],
    ['ColorInput con su contraste', h(ColorInput, {label: 'Color', value: '#1976D2', onChange: () => {}}), 'Contraste sobre blanco'],
    ['SecretField tapado', h(SecretField, {label: 'Clave', value: 'secreto-123'}), 'type="password"'],
    ['FileDropzone de MUI con límite', h(FileDropzone, {value: null, onChange: () => {}, accept: 'excel', maxSize: '2 MB'}), 'Hasta 2 MB por archivo'],
    ['DocumentTitle con nombre de la app', h(DocumentTitle, {title: 'Pedidos'}), 'Pedidos | Tienda'],
    // sin texto que buscar: la tabla de MUI no pinta sus encabezados en el servidor (solo se revisa que no truene)
    ['ServerTable', h(NuqsTestingAdapter, null, h(ServerTable, {
        fetchPage: async () => ({rows: [], total: 0}), queryKey: 'pedidos', columns: [textColumn({field: 'name', label: 'Nombre'})], ariaLabel: 'Pedidos',
    })), ''],
    ['FormTextField', h(Formik, {initialValues: {email: ''}, onSubmit: () => {}}, () => h(FormTextField, {name: 'email', label: 'Correo'})), 'Correo'],
    ['FormWizard con un paso opcional', h(Formik, {initialValues: {email: ''}, onSubmit: () => {}}, () => h(FormWizard, {
        submitLabel: 'Enviar', steps: [{key: 'a', label: 'Datos', fields: ['email'], content: h(FormTextField, {name: 'email', label: 'Correo'})}, {key: 'b', label: 'Extra', optional: true, content: 'nada'}],
    })), 'Opcional'],
    ['BarList', h(BarList, {items: [{key: 'a', label: 'Producto A', value: 3}], emptyLabel: 'Sin datos'}), ''],
    ['ColumnChart', h(ColumnChart, {data: [{key: 'ene', value: 3, label: 'ene'}], periodLabel: 'Mes', valueLabel: 'Pedidos', ariaLabel: 'Pedidos por mes', emptyLabel: 'Sin datos'}), ''],
    ['ErrorPage de versión nueva', h(ErrorPage, {kind: ERROR_PAGE_KIND.newVersion, onRetry: () => {}}), 'Hay una versión nueva'],
    ['StaleBuildBoundary sin error', h(StaleBuildBoundary, {resetKey: '/'}, 'la pantalla'), 'la pantalla'],
    ['SessionsCard con este equipo y otro', h(SessionsCard, {
        sessions: [
            {id: 's1', browser: 'Chrome', platform: 'macOS', startedAt: '2026-10-17T15:00:00Z', network: '187.190.x.x', isCurrent: true},
            {id: 's2', browser: 'Safari', platform: 'iOS', isMobile: true, startedAt: '2026-10-16T09:30:00Z'},
        ],
        onCloseOthers: async () => 1,
    }), 'Este equipo'],
    ['ActivityLog', h(ActivityLog, {events: [{id: 'e1', kind: 'signInFailed', occurredAt: '2026-10-17T15:00:00Z', device: 'Chrome en macOS', network: '187.190.x.x'}]}),
        'Intento de entrar con contraseña equivocada'],
    ['TwoStepVerificationCard activa', h(TwoStepVerificationCard, {
        security: {isEnabled: true, enabledAt: '2026-10-01T10:00:00Z', passkeys: [{id: 'p1', name: 'MacBook', createdAt: '2026-10-01T10:00:00Z'}],
            totp: {isEnabled: true, enabledAt: '2026-10-01T10:00:00Z'}, recoveryCodesRemaining: 2},
        onSecurityChange: () => {}, canUsePasskeys: true, actions: {},
    }), 'Le quedan 2 códigos sin usar.'],
    ['SecondStepForm con app y recuperación', h(SecondStepForm, {methods: ['totp', 'recoveryCode'], onSubmitCode: async () => {}, onCancel: () => {}}),
        'Código de su app autenticadora'],
    ['KanbanBoard con tope', h(KanbanBoard, {
        columns: [{id: 'todo', title: 'Por hacer'}, {id: 'doing', title: 'En proceso', limit: 1}],
        cards: [{id: 'c1', columnId: 'doing', title: 'Cerrar el mes'}, {id: 'c2', columnId: 'doing', title: 'Capacitar'}],
        onMove: () => {}, ariaLabel: 'Tablero',
    }), '2 / 1'],
    ['EventCalendar', h(EventCalendar, {events: [], ariaLabel: 'Calendario'}), 'Calendario'],
    ['MessageList', h(MessageList, {messages: [INBOX_MESSAGE], onSelect: () => {}}), 'Entrega del lunes'],
    // el texto del mensaje se pinta como texto: las etiquetas salen escapadas
    ['MessageView con HTML en el texto', h(MessageView, {message: INBOX_MESSAGE}), '&lt;b&gt;etiquetas&lt;/b&gt;'],
    ['InboxLayout', h(InboxLayout, {
        folders: [{id: 'inbox', label: 'Recibidos', unreadCount: 2}], selectedFolderId: 'inbox', onSelectFolder: () => {},
        list: 'la lista', detail: null, isDetailOpen: false, onCloseDetail: () => {},
    }), 'Recibidos'],
    ['SignInScreen sin sesión', withAccount(null, h(SignInScreen, {forgotPasswordPath: '/forgot-password'})), '¿Olvidó su contraseña?'],
    ['ResetPasswordScreen sin clave en la dirección', withAccount(null, h(ResetPasswordScreen, {signInPath: '/sign-in'})), 'Este enlace no sirve'],
    ['ProfileScreen con sesión', withAccount(DEMO_SESSION, h(ProfileScreen)), 'Sus datos'],
    ['GroupedTimeline', h(GroupedTimeline, {groups: [{key: 'g', title: 'Intento 1', items: [{key: 'e', title: 'Pedido creado', timestamp: '5 ene 2027 · 10:00'}]}]}), 'Pedido creado'],
];

const defaultTheme = createTheme();
let failures = 0;
for (const [name, element, expectedText, caseTheme = defaultTheme] of CASES) {
    try {
        const html = renderToString(h(ThemeProvider, {theme: caseTheme}, h(ToolkitProvider, {appName: 'Tienda', texts: PROJECT_TEXTS, timeZone: 'America/Mexico_City'}, element)));
        if (expectedText && !html.includes(expectedText)) {
            failures += 1;
            console.log(`FALLA  ${name}: no sale «${expectedText}»`);
            continue;
        }
        console.log(`OK     ${name}`);
    } catch (error) {
        failures += 1;
        console.log(`TRUENA ${name}: ${error.message.split('\n')[0]}`);
    }
}

// los formatos sin componente usan la configuración del último proveedor: zona de México y pesos
console.log(`OK     formatos: ${formatDate('2027-01-05T18:00:00Z')} · ${formatCurrency(1234.5)}`);
process.exitCode = failures === 0 ? 0 : 1;
console.log(failures === 0 ? 'todo pinta' : `${failures} con problema`);
