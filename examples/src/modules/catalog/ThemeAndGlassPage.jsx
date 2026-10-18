// Hecho en Calcita · el tema y el vidrio: createToolkitTheme (claro y oscuro, vidrio líquido o minimalista, colores
// propios) y la apariencia que elige cada persona.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import AppearanceDemo from '@/modules/catalog/demos/theme/AppearanceDemo.tsx';

const loadAppearance = () => import('@/modules/catalog/demos/theme/AppearanceDemo.tsx?demo-source');
const loadSetup = () => import('@/modules/catalog/demos/theme/ThemeSetup.ts?demo-source');

export const ThemeAndGlassPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('themeAndGlass.title')} description={t('themeAndGlass.description')} />
            <DemoSection title={t('themeAndGlass.appearance.title')} description={t('themeAndGlass.appearance.description')}
                         Demo={AppearanceDemo} loadSource={loadAppearance} />
            <CodeSection title={t('themeAndGlass.setup.title')} description={t('themeAndGlass.setup.description')}
                         loadSource={loadSetup} />
        </Stack>
    );
};
