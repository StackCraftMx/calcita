// Hecho en Calcita · confirmar y avisar: la confirmación antes de lo que no se deshace (useConfirmAction + ConfirmDialog)
// y los avisos (toasts), con los errores del servidor en palabras de la persona.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import ConfirmWithServer from '@/modules/catalog/demos/confirm/ConfirmWithServer.tsx';
import ToastKinds from '@/modules/catalog/demos/confirm/ToastKinds.tsx';

const loadConfirm = () => import('@/modules/catalog/demos/confirm/ConfirmWithServer.tsx?demo-source');
const loadToasts = () => import('@/modules/catalog/demos/confirm/ToastKinds.tsx?demo-source');

export const ConfirmAndNotifyPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('confirmAndNotify.title')} description={t('confirmAndNotify.description')} />
            <DemoSection title={t('confirmAndNotify.confirm.title')} description={t('confirmAndNotify.confirm.description')}
                         Demo={ConfirmWithServer} loadSource={loadConfirm} />
            <DemoSection title={t('confirmAndNotify.toasts.title')} description={t('confirmAndNotify.toasts.description')}
                         Demo={ToastKinds} loadSource={loadToasts} />
        </Stack>
    );
};
