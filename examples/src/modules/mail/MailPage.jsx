// La bandeja tipo correo: InboxLayout, MessageList y MessageView del framework. Carpetas (recibidos, destacados, enviados y
// archivados) con cuántos sin leer, buscar, abrir un mensaje (se marca como leído), destacar, responder, archivar, marcar
// como no leído, borrar y redactar. En el teléfono, una columna a la vez.
//
// Un mensaje trae HTML a propósito («Nota con formato»): se ve como texto, no se ejecuta.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useCallback, useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import {
    BarActionButton, InboxLayout, MessageList, MessageView, PageHeading, TextInput, toastProblem, toastSuccess, useToolkitTranslation,
} from '@stackcraftmx/calcita';

import {ComposeDialog} from '@/modules/mail/ComposeDialog.jsx';
import {
    MAIL_FOLDER, archiveMessage, deleteMessage, loadMessage, loadMessages, markUnread, toggleStar,
} from '@/modules/mail/mailApi.js';

const FOLDER_ICONS = Object.freeze({
    [MAIL_FOLDER.inbox]: InboxOutlinedIcon, [MAIL_FOLDER.starred]: StarBorderRoundedIcon,
    [MAIL_FOLDER.sent]: SendOutlinedIcon, [MAIL_FOLDER.archived]: ArchiveOutlinedIcon,
});

export const MailPage = () => {
    const {t} = useToolkitTranslation('mail');
    const [folder, setFolder] = useState(MAIL_FOLDER.inbox);
    const [search, setSearch] = useState('');
    const [list, setList] = useState({messages: [], unreadCounts: {}});
    const [selectedId, setSelectedId] = useState(null);
    const [openMessage, setOpenMessage] = useState(null);
    const [draft, setDraft] = useState(null);

    const reloadList = useCallback((signal) => loadMessages({folder, search}, signal)
        .then(setList).catch((error) => error.name !== 'AbortError' && toastProblem(error)), [folder, search]);

    useEffect(() => {
        const controller = new AbortController();
        reloadList(controller.signal);
        return () => controller.abort();
    }, [reloadList]);

    const open = async (messageId) => {
        setSelectedId(messageId);
        setOpenMessage(await loadMessage(messageId));
        // abrirlo lo marcó como leído: la lista y los conteos se ponen al día
        reloadList();
    };
    const closeMessage = () => {
        setSelectedId(null);
        setOpenMessage(null);
    };
    const chooseFolder = (nextFolder) => {
        setFolder(nextFolder);
        closeMessage();
    };
    // las acciones sobre el mensaje abierto: hacen lo suyo, avisan y ponen la lista al día
    const act = async (action, message) => {
        try {
            await action();
            if (message) {
                toastSuccess(message);
            }
            closeMessage();
            reloadList();
        } catch (error) {
            toastProblem(error);
        }
    };

    const folders = Object.values(MAIL_FOLDER).map((id) => ({id, label: t(`folders.${id}`), Icon: FOLDER_ICONS[id], unreadCount: list.unreadCounts[id]}));
    const messageActions = openMessage && (
        <>
            <Button size="small" startIcon={<ReplyOutlinedIcon />} onClick={() => setDraft({to: openMessage.from.email, subject: `Re: ${openMessage.subject}`})}>
                {t('actions.reply')}
            </Button>
            <Tooltip title={t('actions.archive')}>
                <IconButton aria-label={t('actions.archive')} onClick={() => act(() => archiveMessage(openMessage.id), t('archived'))}><ArchiveOutlinedIcon /></IconButton>
            </Tooltip>
            <Tooltip title={t('actions.markUnread')}>
                <IconButton aria-label={t('actions.markUnread')} onClick={() => act(() => markUnread(openMessage.id))}><MarkEmailUnreadOutlinedIcon /></IconButton>
            </Tooltip>
            <Tooltip title={t('actions.delete')}>
                <IconButton aria-label={t('actions.delete')} onClick={() => act(async () => toastSuccess((await deleteMessage(openMessage.id)).message))}>
                    <DeleteOutlineOutlinedIcon />
                </IconButton>
            </Tooltip>
        </>
    );

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.description')}
                         // en la barra: ícono con su nombre (BarActionButton), del color del texto como pide la guía de Apple
                         actions={<BarActionButton label={t('actions.compose')} icon={<EditOutlinedIcon />} onClick={() => setDraft({to: '', subject: ''})} />} />
            <InboxLayout folders={folders} selectedFolderId={folder} onSelectFolder={chooseFolder}
                         toolbar={<TextInput label={t('search')} type="search" value={search} onChange={setSearch} helperText="" />}
                         list={<MessageList messages={list.messages} selectedId={selectedId} onSelect={open}
                                            onToggleStar={(messageId) => act(() => toggleStar(list.messages.find((message) => message.id === messageId)))} />}
                         detail={<MessageView message={openMessage} actions={messageActions} />}
                         isDetailOpen={Boolean(openMessage)} onCloseDetail={closeMessage} />
            <ComposeDialog draft={draft} onClose={() => setDraft(null)} onSent={() => {
                setDraft(null);
                reloadList();
            }} />
        </Stack>
    );
};
