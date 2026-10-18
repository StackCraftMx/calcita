// Hecho en Calcita · permisos: createAccessChecker (por permisos, por rol y por datos del registro), PermissionMatrix, y la
// misma regla en el menú, las rutas y los botones (Can, useCan, RequireAccess). Cada sección dice para qué sirve en una
// línea, enseña el código mínimo y trae su tabla «Cómo se extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import AccessRulesDemo from '@/modules/catalog/demos/permissions/AccessRulesDemo.tsx';

const loadDemo = () => import('@/modules/catalog/demos/permissions/AccessRulesDemo.tsx?demo-source');
const loadScreens = () => import('@/modules/catalog/demos/permissions/AccessInScreens.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (permissions.<sección>.extend.<id>)
const RULES_EXTENSIONS = [
    {id: 'ability', option: 'ability', example: "{ability: 'orders.view'}"},
    {id: 'anyOf', option: 'anyOf', example: "{anyOf: ['orders.view', 'orders.admin']}"},
    {id: 'allOf', option: 'allOf', example: "{allOf: ['orders.view', 'reports.view']}"},
    {id: 'role', option: 'role · anyRole', example: "{anyRole: ['admin', 'supervisor']}"},
    {id: 'policy', option: 'policy · policies', example: "createAccessChecker({policies: {ownsOrder: ({user, order}) => …}})  ·  {policy: 'ownsOrder'}"},
    {id: 'check', option: 'check', example: '{check: ({user}) => user.branchId === order.branchId}'},
    {id: 'context', option: 'context', example: 'createAccessChecker({context: {user, branch}})'},
    {id: 'noAccess', option: '(sin regla)', example: 'canAccess(undefined)  // true con sesión'},
    {id: 'matrix', option: '<PermissionMatrix>', example: '<PermissionMatrix groups={groups} value={granted} onChange={setGranted} />'},
    {id: 'readOnly', option: 'readOnly', example: '<PermissionMatrix readOnly … />'},
    {id: 'groups', option: 'composePermissionGroups', example: 'composePermissionGroups(MENU_MODULES, t)'},
];
const SCREENS_EXTENSIONS = [
    {id: 'menuAccess', option: 'access (menu.js)', example: "export const access = {ability: 'orders.view'};"},
    {id: 'permissions', option: 'permissions (menu.js)', example: "export const permissions = [{key: 'orders.cancel', labelKey: '…'}];"},
    {id: 'can', option: '<Can access>', example: "<Can access={{ability: 'orders.cancel'}}>…</Can>"},
    {id: 'canFallback', option: 'fallback', example: '<Can access={…} fallback={<RequestAccessHint />}>'},
    {id: 'useCan', option: 'useCan(access)', example: "const canExport = useCan({ability: 'orders.export'});"},
    {id: 'requireAccess', option: '<RequireAccess access>', example: "<RequireAccess access={{ability: 'reports.view'}}>…</RequireAccess>"},
    {id: 'requireFallback', option: 'fallback', example: '<RequireAccess access={…} fallback={<UpgradePlanCard />}>'},
    {id: 'checker', option: 'useAccessChecker()', example: 'const canAccess = useAccessChecker();'},
];

export const PermissionsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `permissions.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('permissions.title')} description={t('permissions.description')} />
            <DemoSection title={t('permissions.demo.title')} description={t('permissions.demo.description')}
                         extensions={rowsOf('demo', RULES_EXTENSIONS)} Demo={AccessRulesDemo} loadSource={loadDemo} />
            <CodeSection title={t('permissions.screens.title')} description={t('permissions.screens.description')}
                         extensions={rowsOf('screens', SCREENS_EXTENSIONS)} loadSource={loadScreens} />
        </Stack>
    );
};
