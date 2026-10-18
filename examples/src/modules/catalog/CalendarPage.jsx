// Hecho en Calcita · el calendario (EventCalendar de /calendar): el ejemplo vivo y su código en JS y TS (para copiar).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import DeliveryCalendar from '@/modules/catalog/demos/calendar/DeliveryCalendar.tsx';

const loadSource = () => import('@/modules/catalog/demos/calendar/DeliveryCalendar.tsx?demo-source');

export const CalendarPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('calendar.title')} description={t('calendar.description')} />
            <DemoSection title={t('calendar.demo.title')} description={t('calendar.demo.description')} Demo={DeliveryCalendar} loadSource={loadSource} />
        </Stack>
    );
};
