// La bandeja (InboxLayout, MessageList y MessageView): carpetas con cuántos sin leer, la lista y la lectura. En el teléfono
// se ve una columna a la vez, con «Regresar». El texto del mensaje se pinta como texto: un HTML que llegue no se ejecuta.
import {useState} from 'react';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import {InboxLayout, MessageList, MessageView} from '@stackcraftmx/calcita';

const HOUR = 60 * 60 * 1000;
const MESSAGES = [
    {
        id: 'm1', from: {name: 'Luis Herrera', email: 'luis.herrera@ejemplo.com'}, subject: 'Entrega de sillas para el lunes',
        preview: '¿Me confirma si las 12 sillas salen el lunes?', body: 'Hola:\n\n¿Me confirma si las 12 sillas salen el lunes?\n\nGracias,\nLuis',
        receivedAt: new Date(Date.now() - HOUR).toISOString(), isUnread: true,
    },
    {
        id: 'm2', from: {name: 'Mónica Vega', email: 'monica.vega@ejemplo.com'}, subject: 'Cotización de la remodelación',
        preview: 'Le mando la cotización de San Pedro.', body: 'Le mando la cotización de San Pedro.', receivedAt: new Date(Date.now() - 5 * HOUR).toISOString(),
        isStarred: true, hasAttachments: true,
    },
];
const FOLDERS = [
    {id: 'inbox', label: 'Recibidos', Icon: InboxOutlinedIcon, unreadCount: 1},
    {id: 'starred', label: 'Destacados', Icon: StarBorderRoundedIcon},
];

const MailInbox = () => {
    const [folderId, setFolderId] = useState('inbox');
    const [openId, setOpenId] = useState<string | null>(null);
    const messages = folderId === 'starred' ? MESSAGES.filter((message) => message.isStarred) : MESSAGES;
    const openMessage = MESSAGES.find((message) => message.id === openId) ?? null;

    return (
        <InboxLayout folders={FOLDERS} selectedFolderId={folderId} onSelectFolder={setFolderId}
                     list={<MessageList messages={messages} selectedId={openId} onSelect={setOpenId} />}
                     detail={<MessageView message={openMessage} />}
                     isDetailOpen={Boolean(openMessage)} onCloseDetail={() => setOpenId(null)} />
    );
};

export default MailInbox;
