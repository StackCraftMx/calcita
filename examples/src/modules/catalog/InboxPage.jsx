// Hecho en Calcita · la bandeja tipo correo (InboxLayout, MessageList y MessageView): el ejemplo vivo y su código en JS y
// TS (para copiar).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import MailInbox from '@/modules/catalog/demos/inbox/MailInbox.tsx';

const loadSource = () => import('@/modules/catalog/demos/inbox/MailInbox.tsx?demo-source');

export const InboxPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('inbox.title')} description={t('inbox.description')} />
            <DemoSection title={t('inbox.demo.title')} description={t('inbox.demo.description')} Demo={MailInbox} loadSource={loadSource} />
        </Stack>
    );
};
