// La bandeja (InboxLayout, MessageList y MessageView): carpetas y etiquetas con cuántos sin leer, la lista y la lectura de la
// conversación completa (los mensajes anteriores encogidos). Elegir varias con su monograma y hacerles algo
// (SelectionActions), el «⋯» de cada una y los archivos que se pican: todo sale hacia afuera, la bandeja no guarda nada. En el
// teléfono se ve una columna a la vez. El texto del mensaje se pinta como texto: un HTML que llegue no se ejecuta.
import {useState} from 'react';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import {InboxLayout, MessageList, MessageView, SelectionActions, toastInfo} from '@stackcraftmx/calcita';

const HOUR = 60 * 60 * 1000;
const LUIS = {name: 'Luis Herrera', email: 'luis.herrera@ejemplo.com'};
const ANA = {name: 'Ana Martínez', email: 'ana.martinez@ejemplo.com'};

// 1. Los mensajes: lo que traigan de más (etiquetas, conversación, archivos) lo pinta la bandeja
type Message = {
    id: string, from: {name: string, email: string}, to?: string[], subject: string, preview: string, body: string, receivedAt: string,
    isUnread?: boolean, isStarred?: boolean, hasAttachments?: boolean, archived?: boolean, threadCount?: number,
    labels?: Array<string | {label: string, color?: string}>, attachments?: Array<{name: string, size?: string}>,
    thread?: Array<{id: string, from: {name: string, email: string}, receivedAt: string, body: string}>,
};

const START: Message[] = [
    {
        id: 'm1', from: LUIS, to: [ANA.email], subject: 'Entrega de sillas para el lunes', preview: 'Perfecto. ¿Las suben al tercer piso?',
        body: 'Perfecto. ¿Las suben al tercer piso?', receivedAt: new Date(Date.now() - HOUR).toISOString(), isUnread: true, threadCount: 2,
        labels: [{label: 'Urgente', color: 'error'}],
        thread: [{id: 'm1-a', from: ANA, receivedAt: new Date(Date.now() - 3 * HOUR).toISOString(), body: 'Hola, Luis. Salen el lunes temprano.'}],
    },
    {
        id: 'm2', from: {name: 'Mónica Vega', email: 'monica.vega@ejemplo.com'}, subject: 'Cotización de la remodelación',
        preview: 'Le mando la cotización de San Pedro.', body: 'Le mando la cotización de San Pedro.', receivedAt: new Date(Date.now() - 5 * HOUR).toISOString(),
        isStarred: true, hasAttachments: true, labels: ['Proveedores'], attachments: [{name: 'cotizacion.pdf', size: '284 kB'}],
    },
];

const MailInbox = () => {
    const [messages, setMessages] = useState<Message[]>(START);
    const [folderId, setFolderId] = useState('inbox');
    const [openId, setOpenId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const visible = messages.filter((message) => (folderId === 'starred' ? message.isStarred && !message.archived : Boolean(message.archived) === (folderId === 'archived')));
    const openMessage = messages.find((message) => message.id === openId) ?? null;
    const unread = messages.filter((message) => message.isUnread && !message.archived).length;
    const change = (ids: string[], changes: Partial<Message>) => setMessages((current) => current.map((message) => (ids.includes(message.id) ? {...message, ...changes} : message)));

    return (
        <InboxLayout
            // 2. carpetas y etiquetas (con su punto de color)
            folders={[
                {id: 'inbox', label: 'Recibidos', Icon: InboxOutlinedIcon, unreadCount: unread},
                {id: 'starred', label: 'Destacados', Icon: StarBorderRoundedIcon},
                {id: 'archived', label: 'Archivados', Icon: ArchiveOutlinedIcon},
            ]}
            labels={[{id: 'urgent', label: 'Urgente', color: 'error'}]}
            selectedFolderId={folderId}
            onSelectFolder={(nextFolderId) => {
                setFolderId(nextFolderId);
                setSelectedIds([]);
            }}
            // 3. arriba de la lista: las acciones de lo elegido
            toolbar={selectedIds.length > 0 && (
                <SelectionActions countText={`${selectedIds.length} elegidas`} onClear={() => setSelectedIds([])} actions={[
                    {key: 'archive', label: 'Archivar', icon: <ArchiveOutlinedIcon />, onClick: () => {
                        change(selectedIds, {archived: true});
                        setSelectedIds([]);
                    }},
                ]} />
            )}
            list={(
                <MessageList messages={visible} selectedId={openId}
                             // 4. abrir: se marca como leído
                             onSelect={(messageId) => {
                                 setOpenId(messageId);
                                 change([messageId], {isUnread: false});
                             }}
                             onToggleStar={(messageId) => change([messageId], {isStarred: !messages.find((message) => message.id === messageId)?.isStarred})}
                             // 5. elegir varias: el monograma es la casilla
                             selectedIds={selectedIds} onSelectionChange={setSelectedIds}
                             // 6. el «⋯» de cada mensaje
                             messageActions={(message) => [
                                 {key: 'unread', label: 'Marcar como no leído', icon: <MarkEmailUnreadOutlinedIcon fontSize="small" />, onClick: () => change([message.id], {isUnread: true})},
                             ]} />
            )}
            detail={(
                <MessageView message={openMessage}
                             // 7. picar un archivo: descargarlo con su API
                             onAttachmentClick={(attachment) => toastInfo(`Aquí se descargaría ${attachment.name}`)} />
            )}
            isDetailOpen={Boolean(openMessage)} onCloseDetail={() => setOpenId(null)} />
    );
};

export default MailInbox;
