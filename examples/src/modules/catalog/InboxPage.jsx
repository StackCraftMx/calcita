// Hecho en Calcita · la bandeja tipo correo (InboxLayout, MessageList y MessageView): el ejemplo vivo y su código en JS y
// TS (para copiar).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import MailInbox from '@/modules/catalog/demos/inbox/MailInbox.tsx';

const loadSource = () => import('@/modules/catalog/demos/inbox/MailInbox.tsx?demo-source');

// «Cómo se extiende»: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts (inbox.demo.extend.<id>)
const INBOX_EXTENSIONS = [
    {id: 'folders', option: 'InboxLayout folders', example: "folders={[{id: 'inbox', label: 'Recibidos', Icon: InboxIcon, unreadCount: 3}]}"},
    {id: 'selectedFolder', option: 'selectedFolderId · onSelectFolder', example: 'selectedFolderId={folderId} onSelectFolder={setFolderId}'},
    {id: 'toolbar', option: 'toolbar', example: 'toolbar={<Button startIcon={<EditIcon />}>Redactar</Button>}'},
    {id: 'messages', option: 'MessageList messages', example: "{id: 'm1', from: {name: 'Ana', email: 'ana@…'}, subject: '…', preview: '…', receivedAt, isUnread: true}"},
    {id: 'onToggleStar', option: 'onToggleStar', example: 'onToggleStar={(messageId) => mailApi.toggleStar(messageId)}'},
    {id: 'emptyText', option: 'emptyText', example: 'emptyText="No hay solicitudes pendientes."'},
    {id: 'message', option: 'MessageView message', example: '<MessageView message={selectedMessage} />'},
    {id: 'actions', option: 'actions', example: 'actions={<Button>Responder</Button>}'},
    {id: 'phone', option: 'isDetailOpen · onCloseDetail', example: 'isDetailOpen={Boolean(messageId)} onCloseDetail={() => setMessageId(null)}'},
    {id: 'labels', option: 'InboxLayout labels', example: "labels={[{id: 'urgent', label: 'Urgente', color: 'error', unreadCount: 2}]}"},
    {id: 'foldersHeader', option: 'InboxLayout foldersHeader', example: 'foldersHeader={<Button variant="contained" fullWidth>Redactar</Button>}'},
    {id: 'selection', option: 'MessageList selectedIds · onSelectionChange', example: 'selectedIds={selectedIds} onSelectionChange={setSelectedIds}'},
    {id: 'messageActions', option: 'MessageList messageActions', example: "messageActions={(message) => [{key: 'archive', label: 'Archivar', onClick: () => archive(message.id)}]}"},
    {id: 'messageFields', option: 'messages[].labels · threadCount', example: "{…, labels: [{label: 'Clientes', color: 'info'}], threadCount: 3}"},
    {id: 'renderMessage', option: 'MessageList renderMessage', example: 'renderMessage={(message) => <TicketRow ticket={message} />}'},
    {id: 'thread', option: 'MessageView message.thread · cc · labels', example: "message={{…, cc: ['bruno@…'], thread: [{id, from, receivedAt, body}]}}"},
    {id: 'onAttachmentClick', option: 'MessageView onAttachmentClick', example: 'onAttachmentClick={(attachment) => filesApi.download(attachment.id)}'},
    {id: 'onExpand', option: 'MessageView onExpand', example: 'onExpand={(threadMessageId) => mailApi.markRead(threadMessageId)}'},
    {id: 'renderBody', option: 'MessageView renderBody', example: 'renderBody={(message) => <SafeHtml html={DOMPurify.sanitize(message.html)} />}'},
    {id: 'footer', option: 'MessageView footer', example: 'footer={<QuickReply conversationId={message.id} />}'},
    {id: 'texts', option: 'texts', example: "texts={{empty: 'Sin solicitudes', labels: 'Categorías'}}"},
];

export const InboxPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('inbox.title')} description={t('inbox.description')} />
            <DemoSection title={t('inbox.demo.title')} description={t('inbox.demo.description')}
                         extensions={extensionRowsOf(t, 'inbox.demo', INBOX_EXTENSIONS)} Demo={MailInbox} loadSource={loadSource} />
        </Stack>
    );
};
