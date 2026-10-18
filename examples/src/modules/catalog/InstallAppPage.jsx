// Hecho en Calcita · instalar la app (PWA, sin modo sin conexión): el renglón del menú de la cuenta, la invitación y
// lo que lleva el proyecto.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import InstallDemo from '@/modules/catalog/demos/pwa/InstallDemo.tsx';

const loadSetting = () => import('@/modules/catalog/demos/pwa/InstallDemo.tsx?demo-source');
const loadSetup = () => import('@/modules/catalog/demos/pwa/InstallSetup.tsx?demo-source');

export const InstallAppPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('installApp.title')} description={t('installApp.description')} />
            <DemoSection title={t('installApp.setting.title')} description={t('installApp.setting.description')}
                         Demo={InstallDemo} loadSource={loadSetting} />
            <CodeSection title={t('installApp.setup.title')} description={t('installApp.setup.description')}
                         loadSource={loadSetup} />
        </Stack>
    );
};
