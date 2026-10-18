// Catálogo · avisos y progreso: Alert en sus variantes y tipos, con título, acción o para cerrar; los avisos que flotan
// (toast del framework y Snackbar de MUI); el progreso (barra y círculo), el esqueleto mientras carga, el fondo que bloquea
// (Backdrop) y ModalWaiting del framework.
//
// Con el vidrio del tema (HIG de Apple): el aviso dentro del contenido lleva material teñido de su tipo («status
// indicators» es uno de los usos de color que Apple permite en el vidrio), y siempre con su ícono, para no comunicar solo
// con color; los avisos que flotan son de vidrio.
//
// Cada sección pinta su ejemplo de demos/feedback y lo enseña con «Ver código» (DemoSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import AlertExtras from '@/modules/catalog/demos/feedback/AlertExtras.tsx';
import AlertsFilled from '@/modules/catalog/demos/feedback/AlertsFilled.tsx';
import AlertsOutlined from '@/modules/catalog/demos/feedback/AlertsOutlined.tsx';
import AlertsStandard from '@/modules/catalog/demos/feedback/AlertsStandard.tsx';
import BlockingWaits from '@/modules/catalog/demos/feedback/BlockingWaits.tsx';
import FloatingNotices from '@/modules/catalog/demos/feedback/FloatingNotices.tsx';
import LoadingSkeleton from '@/modules/catalog/demos/feedback/LoadingSkeleton.tsx';
import ProgressIndicators from '@/modules/catalog/demos/feedback/ProgressIndicators.tsx';

export const AlertsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('feedback.title')} description={t('feedback.description')} />

            <DemoSection title={t('feedback.alerts.standard.title')} description={t('feedback.alerts.standard.description')}
                         Demo={AlertsStandard} loadSource={() => import('@/modules/catalog/demos/feedback/AlertsStandard.tsx?demo-source')} />
            <DemoSection title={t('feedback.alerts.outlined.title')} description={t('feedback.alerts.outlined.description')}
                         Demo={AlertsOutlined} loadSource={() => import('@/modules/catalog/demos/feedback/AlertsOutlined.tsx?demo-source')} />
            <DemoSection title={t('feedback.alerts.filled.title')} description={t('feedback.alerts.filled.description')}
                         Demo={AlertsFilled} loadSource={() => import('@/modules/catalog/demos/feedback/AlertsFilled.tsx?demo-source')} />
            <DemoSection title={t('feedback.alerts.extras.title')} description={t('feedback.alerts.extras.description')}
                         Demo={AlertExtras} loadSource={() => import('@/modules/catalog/demos/feedback/AlertExtras.tsx?demo-source')} />
            <DemoSection title={t('feedback.toasts.title')} description={t('feedback.toasts.description')}
                         Demo={FloatingNotices} loadSource={() => import('@/modules/catalog/demos/feedback/FloatingNotices.tsx?demo-source')} />
            <DemoSection title={t('feedback.progress.title')} description={t('feedback.progress.description')}
                         Demo={ProgressIndicators} loadSource={() => import('@/modules/catalog/demos/feedback/ProgressIndicators.tsx?demo-source')} />
            <DemoSection title={t('feedback.skeleton.title')} description={t('feedback.skeleton.description')}
                         Demo={LoadingSkeleton} loadSource={() => import('@/modules/catalog/demos/feedback/LoadingSkeleton.tsx?demo-source')} />
            <DemoSection title={t('feedback.blocking.title')} description={t('feedback.blocking.description')}
                         Demo={BlockingWaits} loadSource={() => import('@/modules/catalog/demos/feedback/BlockingWaits.tsx?demo-source')} />
        </Stack>
    );
};
