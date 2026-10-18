// Hecho en Calcita · errores y registro: las páginas de error, el registro sin datos personales y el aviso de versión
// nueva.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import ErrorPages from '@/modules/catalog/demos/errors/ErrorPages.tsx';

const loadPages = () => import('@/modules/catalog/demos/errors/ErrorPages.tsx?demo-source');
const loadLogs = () => import('@/modules/catalog/demos/errors/LoggerAndBuild.ts?demo-source');

export const ErrorsAndLogsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('errorsAndLogs.title')} description={t('errorsAndLogs.description')} />
            <DemoSection title={t('errorsAndLogs.pages.title')} description={t('errorsAndLogs.pages.description')}
                         Demo={ErrorPages} loadSource={loadPages} />
            <CodeSection title={t('errorsAndLogs.logs.title')} description={t('errorsAndLogs.logs.description')}
                         loadSource={loadLogs} />
        </Stack>
    );
};
