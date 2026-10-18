// Hecho en Calcita · subir archivos: FileDropzone revisa tipo y peso antes de subir y uploadWithProgress lo manda con
// su avance.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import UploadDemo from '@/modules/catalog/demos/upload/UploadDemo.tsx';

const loadDemo = () => import('@/modules/catalog/demos/upload/UploadDemo.tsx?demo-source');
const loadApi = () => import('@/modules/catalog/demos/upload/UploadToApi.ts?demo-source');

export const FileUploadsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('uploads.title')} description={t('uploads.description')} />
            <DemoSection title={t('uploads.demo.title')} description={t('uploads.demo.description')}
                         Demo={UploadDemo} loadSource={loadDemo} />
            <CodeSection title={t('uploads.api.title')} description={t('uploads.api.description')}
                         loadSource={loadApi} />
        </Stack>
    );
};
