// Hecho en Calcita · reportes en Excel y CSV: la misma hoja (reportSheetOf de /excel) se pinta en pantalla y se baja
// en Excel (con sus dos hojas, Resumen y Datos) o en CSV, desde DownloadMenu.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import ReportDownloadDemo from '@/modules/catalog/demos/excel/ReportDownloadDemo.tsx';

const loadDemo = () => import('@/modules/catalog/demos/excel/ReportDownloadDemo.tsx?demo-source');

export const ExcelReportsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('excelReports.title')} description={t('excelReports.description')} />
            <DemoSection title={t('excelReports.demo.title')} description={t('excelReports.demo.description')}
                         Demo={ReportDownloadDemo} loadSource={loadDemo} />
        </Stack>
    );
};
