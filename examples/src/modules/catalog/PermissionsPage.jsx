// Hecho en Calcita · permisos: createAccessChecker (RBAC y ABAC), PermissionMatrix, y la misma regla en el menú, las
// rutas y los botones (Can, useCan, RequireAccess).
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import AccessRulesDemo from '@/modules/catalog/demos/permissions/AccessRulesDemo.tsx';

const loadDemo = () => import('@/modules/catalog/demos/permissions/AccessRulesDemo.tsx?demo-source');
const loadScreens = () => import('@/modules/catalog/demos/permissions/AccessInScreens.tsx?demo-source');

export const PermissionsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('permissions.title')} description={t('permissions.description')} />
            <DemoSection title={t('permissions.demo.title')} description={t('permissions.demo.description')}
                         Demo={AccessRulesDemo} loadSource={loadDemo} />
            <CodeSection title={t('permissions.screens.title')} description={t('permissions.screens.description')}
                         loadSource={loadScreens} />
        </Stack>
    );
};
