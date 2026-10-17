// Ejemplo de subir archivos: la zona de MUI importando un Excel, la de FilePond con varios adjuntos en un envío, y la de
// FilePond subiendo cada adjunto con su barra. Cada sección vive en su archivo.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {AttachmentsSection} from '@/modules/uploads/AttachmentsSection.jsx';
import {ExcelImportSection} from '@/modules/uploads/ExcelImportSection.jsx';
import {PondServerSection} from '@/modules/uploads/PondServerSection.jsx';

export const UploadsPage = () => {
    const {t} = useToolkitTranslation('uploads');

    return (
        <>
            <PageHeading title={t('page.title')} description={t('page.subtitle')} />
            <Stack spacing={2}>
                <ExcelImportSection />
                <AttachmentsSection />
                <PondServerSection />
            </Stack>
        </>
    );
};
