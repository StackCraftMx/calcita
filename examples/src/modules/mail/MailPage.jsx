// La bandeja tipo Gmail: InboxLayout, MessageList y MessageView del framework con todo lo de afuera puesto por la pantalla.
//   - carpetas (recibidos, destacados, pospuestos, enviados, borradores, archivados, spam, papelera) y etiquetas de color,
//     con cuántos sin leer; buscar arriba en la barra; páginas de 15 («1–15 de 34»);
//   - elegir varias (el monograma es la casilla, o «todas» de la página) y hacerles lo de su carpeta: archivar, marcar como
//     leídas, posponer, spam, borrar… (SelectionActions); lo mismo en el «⋯» de cada una;
//   - la conversación completa (los mensajes anteriores encogidos), con responder, responder a todos, reenviar, etiquetas,
//     posponer, imprimir; abrirla la marca como leída;
//   - redactar con Cc y Cco, archivos, borradores al cerrar y «Deshacer» unos segundos después de mandar; archivar, borrar y
//     lo demás también se deshacen desde su aviso;
//   - atajos de teclado de Gmail (c, /, j, k, e, #, r, a, f, u, ?).
// Nada guarda la bandeja: cada acción llama a mailApi.js y vuelve a pedir la lista. Un mensaje trae HTML a propósito («Nota
// con formato»): se ve como texto, no se ejecuta.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useCallback, useEffect, useRef, useState} from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ForwardOutlinedIcon from '@mui/icons-material/ForwardOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReplyAllOutlinedIcon from '@mui/icons-material/ReplyAllOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SnoozeOutlinedIcon from '@mui/icons-material/SnoozeOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import {
    ActionsMenu, BarActionButton, BarSearch, ConfirmDialog, InboxLayout, MessageList, MessageView, PageHeading, SelectionActions, formatDateTime,
    formatNumber, toastInfo, toastProblem, toastSuccess, useConfirmAction, useToolkitTranslation,
} from '@stackcraftmx/calcita';

import {ComposeDialog} from '@/modules/mail/ComposeDialog.jsx';
import {
    MAIL_FOLDER, MAIL_LABELS, MAIL_ME, changeConversations, deleteConversations, emptyTrash, loadConversation, loadConversations,
    restoreConversations, undoSend,
} from '@/modules/mail/mailApi.js';
import {COMPOSE_MODE, MAIL_ACTION, actionsOfFolder, draftForReplyOf, snoozeOptionsOf} from '@/modules/mail/mailRules.js';
import {MAIL_SHORTCUTS, useMailShortcuts} from '@/modules/mail/useMailShortcuts.js';

const FOLDER_ICONS = Object.freeze({
    [MAIL_FOLDER.inbox]: InboxOutlinedIcon, [MAIL_FOLDER.starred]: StarBorderRoundedIcon, [MAIL_FOLDER.snoozed]: SnoozeOutlinedIcon,
    [MAIL_FOLDER.sent]: SendOutlinedIcon, [MAIL_FOLDER.drafts]: InsertDriveFileOutlinedIcon, [MAIL_FOLDER.archived]: ArchiveOutlinedIcon,
    [MAIL_FOLDER.spam]: ReportGmailerrorredOutlinedIcon, [MAIL_FOLDER.trash]: DeleteOutlineOutlinedIcon,
});
// el ícono y el color de cada acción (el rojo es para lo que borra)
const ACTION_LOOK = Object.freeze({
    [MAIL_ACTION.archive]: {Icon: ArchiveOutlinedIcon}, [MAIL_ACTION.moveToInbox]: {Icon: InboxOutlinedIcon},
    [MAIL_ACTION.markRead]: {Icon: MarkEmailReadOutlinedIcon}, [MAIL_ACTION.markUnread]: {Icon: MarkEmailUnreadOutlinedIcon},
    [MAIL_ACTION.snooze]: {Icon: SnoozeOutlinedIcon}, [MAIL_ACTION.unsnooze]: {Icon: InboxOutlinedIcon},
    [MAIL_ACTION.spam]: {Icon: ReportGmailerrorredOutlinedIcon}, [MAIL_ACTION.notSpam]: {Icon: InboxOutlinedIcon},
    [MAIL_ACTION.restore]: {Icon: RestoreFromTrashOutlinedIcon}, [MAIL_ACTION.delete]: {Icon: DeleteOutlineOutlinedIcon, color: 'error'},
    [MAIL_ACTION.deleteForever]: {Icon: DeleteForeverOutlinedIcon, color: 'error'},
});
// lo que cambia cada acción (las de borrar y posponer van aparte)
const ACTION_CHANGES = Object.freeze({
    [MAIL_ACTION.archive]: {folder: MAIL_FOLDER.archived}, [MAIL_ACTION.moveToInbox]: {folder: MAIL_FOLDER.inbox},
    [MAIL_ACTION.unsnooze]: {folder: MAIL_FOLDER.inbox}, [MAIL_ACTION.notSpam]: {folder: MAIL_FOLDER.inbox},
    [MAIL_ACTION.restore]: {folder: MAIL_FOLDER.inbox}, [MAIL_ACTION.spam]: {folder: MAIL_FOLDER.spam},
    [MAIL_ACTION.markRead]: {isUnread: false}, [MAIL_ACTION.markUnread]: {isUnread: true},
});
// cuánto se ve el aviso con «Deshacer» (lo que el servidor deja deshacer un envío)
const UNDO_TOAST_MILLISECONDS = 10_000;

export const MailPage = () => {
    const {t} = useToolkitTranslation('mail');
    const [folder, setFolder] = useState(MAIL_FOLDER.inbox);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [list, setList] = useState({conversations: [], total: 0, pageSize: 15, unreadCounts: {}});
    const [selectedIds, setSelectedIds] = useState([]);
    const [openConversation, setOpenConversation] = useState(null);
    const [draft, setDraft] = useState(null);
    // las conversaciones que se van a posponer (abre la ventana de hasta cuándo)
    const [snoozing, setSnoozing] = useState(null);
    const [labelsAnchor, setLabelsAnchor] = useState(null);
    const [showsShortcuts, setShowsShortcuts] = useState(false);
    const searchInput = useRef(null);

    const reload = useCallback((signal) => loadConversations({folder, search, page}, signal)
        .then(setList).catch((error) => error.name !== 'AbortError' && toastProblem(error)), [folder, search, page]);

    useEffect(() => {
        const controller = new AbortController();
        reload(controller.signal);
        return () => controller.abort();
    }, [reload]);
    // otra carpeta, otra búsqueda u otra página: lo elegido ya no se ve, se suelta (como la tabla)
    useEffect(() => setSelectedIds([]), [folder, search, page]);

    const labelOf = (labelId) => ({label: t(`labels.${labelId}`), color: MAIL_LABELS.find((label) => label.id === labelId)?.color});
    const labelsOf = (conversation) => [
        ...(conversation.snoozedUntil ? [{label: t('snoozedUntil', {date: formatDateTime(conversation.snoozedUntil)}), color: 'warning'}] : []),
        ...conversation.labelIds.map(labelOf),
    ];

    const closeConversation = () => setOpenConversation(null);
    const open = async (conversationId) => {
        // un borrador se abre para seguir escribiéndolo
        if (folder === MAIL_FOLDER.drafts) {
            const saved = await loadConversation(conversationId);
            setDraft({mode: COMPOSE_MODE.new, draftId: saved.id, to: saved.to.join(', '), cc: saved.cc.join(', '), bcc: (saved.bcc ?? []).join(', '), subject: saved.subject, body: saved.body});
            return;
        }
        try {
            setOpenConversation(await loadConversation(conversationId));
            // abrirla la marcó como leída: la lista y los conteos se ponen al día
            reload();
        } catch (error) {
            toastProblem(error);
        }
    };
    const chooseFolder = (nextFolder) => {
        setFolder(nextFolder);
        setPage(1);
        closeConversation();
    };

    // cambia, avisa con «Deshacer» (regresa cada una a como estaba) y pone todo al día
    const changeWithUndo = async (conversationIds, changes, doneText) => {
        try {
            const before = await changeConversations(conversationIds, changes);
            toastSuccess(doneText, {
                duration: UNDO_TOAST_MILLISECONDS,
                action: {
                    label: t('undo'),
                    onClick: () => restoreConversations(before).then(() => {
                        toastSuccess(t('undone'));
                        reload();
                    }).catch(toastProblem),
                },
            });
            setSelectedIds([]);
            if (openConversation && conversationIds.includes(openConversation.id) && 'folder' in changes) {
                closeConversation();
            }
            reload();
        } catch (error) {
            toastProblem(error);
        }
    };
    // borrar: a la papelera (se deshace) o, desde la papelera y spam, para siempre (con confirmación antes)
    const deleteForeverAction = useConfirmAction({
        run: ({subject}) => deleteConversations(subject.ids),
        onDone: (response) => {
            toastSuccess(t('deletedForever', {count: response.deleted_forever}));
            setSelectedIds([]);
            closeConversation();
            reload();
        },
    });
    const emptyTrashAction = useConfirmAction({
        run: () => emptyTrash(),
        onDone: (response) => {
            toastSuccess(t('deletedForever', {count: response.deleted_forever}));
            closeConversation();
            reload();
        },
    });
    const moveToTrash = async (conversationIds) => {
        try {
            const response = await deleteConversations(conversationIds);
            toastSuccess(t('movedToTrash', {count: response.moved_to_trash}), {
                duration: UNDO_TOAST_MILLISECONDS,
                action: {label: t('undo'), onClick: () => restoreConversations(response.before).then(() => reload()).catch(toastProblem)},
            });
            setSelectedIds([]);
            closeConversation();
            reload();
        } catch (error) {
            toastProblem(error);
        }
    };

    /** Hace una acción de MAIL_ACTION sobre esas conversaciones; posponer pregunta hasta cuándo. */
    const runAction = (action, conversationIds) => {
        const count = conversationIds.length;
        if (action === MAIL_ACTION.snooze) {
            setSnoozing(conversationIds);
            return;
        }
        if (action === MAIL_ACTION.deleteForever) {
            deleteForeverAction.open({ids: conversationIds});
            return;
        }
        if (action === MAIL_ACTION.delete) {
            moveToTrash(conversationIds);
            return;
        }
        changeWithUndo(conversationIds, ACTION_CHANGES[action], t(`done.${action}`, {count}));
    };

    const folderActions = actionsOfFolder(folder, MAIL_FOLDER);
    const actionItemsFor = (conversationIds) => folderActions.map((action) => {
        const {Icon, color} = ACTION_LOOK[action];
        return {key: action, label: t(`actions.${action}`), color, icon: <Icon fontSize="small" />, onClick: () => runAction(action, conversationIds)};
    });

    // responder, responder a todos y reenviar el último mensaje de la conversación abierta
    const replyTo = (mode) => {
        if (!openConversation) {
            return;
        }
        const quoteHeaderOf = (message) => (mode === COMPOSE_MODE.forward
            ? t('compose.forwardHeader', {name: message.from.name, email: message.from.email, date: formatDateTime(message.receivedAt), subject: openConversation.subject, to: (message.to ?? []).join(', ')})
            : t('compose.quoteHeader', {name: message.from.name, email: message.from.email, date: formatDateTime(message.receivedAt)}));
        setDraft(draftForReplyOf(mode, {...openConversation, id: openConversation.id}, MAIL_ME.email, quoteHeaderOf));
    };
    const afterSent = (sent, values) => {
        setDraft(null);
        toastSuccess(sent.message, {
            duration: UNDO_TOAST_MILLISECONDS,
            action: {
                label: t('undo'),
                // deshacer: el mensaje no sale y la ventana regresa con lo escrito
                onClick: () => undoSend(sent).then((response) => {
                    toastSuccess(response.message);
                    setDraft({...values, draftId: undefined, isRestored: true});
                    reload();
                }).catch(toastProblem),
            },
        });
        reload();
        if (openConversation && sent.conversation_id === openConversation.id) {
            open(openConversation.id);
        }
    };

    // la lista: la de la página, con sus etiquetas
    const messages = list.conversations.map((conversation) => ({...conversation, labels: labelsOf(conversation)}));
    const openIndex = openConversation ? messages.findIndex((message) => message.id === openConversation.id) : -1;
    const pageIds = messages.map((message) => message.id);
    const isWholePageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    const firstShown = list.total === 0 ? 0 : (page - 1) * list.pageSize + 1;
    const lastShown = Math.min(page * list.pageSize, list.total);
    const lastPage = Math.max(1, Math.ceil(list.total / list.pageSize));
    const isLabel = MAIL_LABELS.some((label) => label.id === folder);

    useMailShortcuts({
        compose: () => setDraft({mode: COMPOSE_MODE.new}),
        search: () => searchInput.current?.focus(),
        next: () => messages[openIndex + 1] && open(messages[openIndex + 1].id),
        previous: () => openIndex > 0 && open(messages[openIndex - 1].id),
        archive: () => openConversation && folderActions.includes(MAIL_ACTION.archive) && runAction(MAIL_ACTION.archive, [openConversation.id]),
        delete: () => openConversation && runAction(folderActions.includes(MAIL_ACTION.delete) ? MAIL_ACTION.delete : MAIL_ACTION.deleteForever, [openConversation.id]),
        reply: () => replyTo(COMPOSE_MODE.reply),
        replyAll: () => replyTo(COMPOSE_MODE.replyAll),
        forward: () => replyTo(COMPOSE_MODE.forward),
        back: closeConversation,
        help: () => setShowsShortcuts(true),
    });

    const folders = Object.values(MAIL_FOLDER).map((id) => ({id, label: t(`folders.${id}`), Icon: FOLDER_ICONS[id], unreadCount: list.unreadCounts[id]}));
    const labels = MAIL_LABELS.map(({id, color}) => ({id, label: t(`labels.${id}`), color, unreadCount: list.unreadCounts[id]}));

    const toolbar = (
        <Stack spacing={1}>
            <Stack direction="row" spacing={0.5} sx={{alignItems: 'center'}}>
                <Tooltip title={isWholePageSelected ? t('list.selectNone') : t('list.selectPage')}>
                    <Checkbox checked={isWholePageSelected} indeterminate={selectedIds.length > 0 && !isWholePageSelected} disabled={pageIds.length === 0}
                              onChange={() => setSelectedIds(isWholePageSelected ? [] : pageIds)}
                              slotProps={{input: {'aria-label': isWholePageSelected ? t('list.selectNone') : t('list.selectPage')}}} />
                </Tooltip>
                <Tooltip title={t('list.refresh')}>
                    <IconButton aria-label={t('list.refresh')} onClick={() => reload()}><RefreshRoundedIcon /></IconButton>
                </Tooltip>
                {folder === MAIL_FOLDER.trash && list.total > 0 && (
                    <Button size="small" color="error" onClick={() => emptyTrashAction.open({})}>{t('list.emptyTrash')}</Button>
                )}
                {/* los atajos solo en escritorio: en el teléfono no hay teclado */}
                <Tooltip title={t('actions.shortcuts')}>
                    <IconButton aria-label={t('actions.shortcuts')} onClick={() => setShowsShortcuts(true)} sx={{display: {xs: 'none', md: 'inline-flex'}}}>
                        <KeyboardOutlinedIcon />
                    </IconButton>
                </Tooltip>
                <Typography variant="caption" color="text.secondary" sx={{ml: 'auto', fontVariantNumeric: 'tabular-nums'}}>
                    {t('list.range', {first: formatNumber(firstShown), last: formatNumber(lastShown), total: formatNumber(list.total)})}
                </Typography>
                <Tooltip title={t('list.previousPage')}>
                    <span><IconButton aria-label={t('list.previousPage')} disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeftRoundedIcon /></IconButton></span>
                </Tooltip>
                <Tooltip title={t('list.nextPage')}>
                    <span><IconButton aria-label={t('list.nextPage')} disabled={page >= lastPage} onClick={() => setPage(page + 1)}><ChevronRightRoundedIcon /></IconButton></span>
                </Tooltip>
            </Stack>
            {selectedIds.length > 0 && (
                <SelectionActions countText={t('list.selected', {count: selectedIds.length})} onClear={() => setSelectedIds([])}
                                  actions={actionItemsFor(selectedIds)} />
            )}
        </Stack>
    );

    const conversationActions = openConversation && (
        <>
            <Button size="small" startIcon={<ReplyOutlinedIcon />} onClick={() => replyTo(COMPOSE_MODE.reply)}>{t('actions.reply')}</Button>
            {folderActions.map((action) => {
                const {Icon, color} = ACTION_LOOK[action];
                // en la conversación abierta, «marcar como leída» sobra (ya se leyó)
                if (action === MAIL_ACTION.markRead) {
                    return null;
                }
                return (
                    <Tooltip key={action} title={t(`actions.${action}`)}>
                        <IconButton aria-label={t(`actions.${action}`)} color={color ?? 'default'}
                                    onClick={() => runAction(action, [openConversation.id])}>
                            <Icon />
                        </IconButton>
                    </Tooltip>
                );
            })}
            <Tooltip title={t('actions.labels')}>
                <IconButton aria-label={t('actions.labels')} aria-haspopup="menu" onClick={(event) => setLabelsAnchor(event.currentTarget)}><LabelOutlinedIcon /></IconButton>
            </Tooltip>
            <ActionsMenu label={t('actions.more')} size="medium" actions={[
                {key: 'replyAll', label: t('actions.replyAll'), icon: <ReplyAllOutlinedIcon fontSize="small" />, onClick: () => replyTo(COMPOSE_MODE.replyAll)},
                {key: 'forward', label: t('actions.forward'), icon: <ForwardOutlinedIcon fontSize="small" />, onClick: () => replyTo(COMPOSE_MODE.forward)},
                {key: 'print', label: t('actions.print'), icon: <PrintOutlinedIcon fontSize="small" />, onClick: () => window.print()},
            ]} />
        </>
    );

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.description')}
                         // en la barra: ícono con su nombre (BarActionButton), del color del texto como pide la guía de Apple
                         actions={<BarActionButton label={t('actions.compose')} icon={<EditOutlinedIcon />} onClick={() => setDraft({mode: COMPOSE_MODE.new})} />} />
            <BarSearch value={search} inputRef={searchInput} placeholder={t('search')}
                       onChange={(text) => {
                           setSearch(text);
                           setPage(1);
                       }} />
            <InboxLayout folders={folders} labels={labels} selectedFolderId={folder} onSelectFolder={chooseFolder} toolbar={toolbar}
                         list={(
                             <MessageList messages={messages} selectedId={openConversation?.id ?? null} onSelect={open}
                                          emptyText={search ? t('list.noResults') : t(isLabel ? 'list.empty.label' : `list.empty.${folder}`)}
                                          selectedIds={selectedIds} onSelectionChange={setSelectedIds}
                                          onToggleStar={(conversationId) => changeConversations([conversationId], {isStarred: !messages.find((message) => message.id === conversationId).isStarred})
                                              .then(() => reload()).catch(toastProblem)}
                                          messageActions={(message) => actionItemsFor([message.id])} />
                         )}
                         detail={(
                             <MessageView message={openConversation && {...openConversation, labels: labelsOf(openConversation)}} actions={conversationActions}
                                          onAttachmentClick={(attachment) => toastInfo(t('attachmentSimulated', {name: attachment.name}))}
                                          footer={openConversation && (
                                              <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap', pt: 1}}>
                                                  <Button variant="outlined" startIcon={<ReplyOutlinedIcon />} onClick={() => replyTo(COMPOSE_MODE.reply)}>{t('actions.reply')}</Button>
                                                  <Button variant="outlined" startIcon={<ReplyAllOutlinedIcon />} onClick={() => replyTo(COMPOSE_MODE.replyAll)}>{t('actions.replyAll')}</Button>
                                                  <Button variant="outlined" startIcon={<ForwardOutlinedIcon />} onClick={() => replyTo(COMPOSE_MODE.forward)}>{t('actions.forward')}</Button>
                                              </Stack>
                                          )} />
                         )}
                         isDetailOpen={Boolean(openConversation)} onCloseDetail={closeConversation} />

            {/* posponer: hasta cuándo (más tarde hoy solo si aún es temprano). Ventana y no menú: se abre igual desde el «⋯», desde
                lo elegido o desde la conversación, también en el teléfono */}
            <Dialog open={Boolean(snoozing)} onClose={() => setSnoozing(null)} maxWidth="xs" fullWidth aria-labelledby="mail-snooze-title">
                <DialogTitle id="mail-snooze-title">{t('snooze.title')}</DialogTitle>
                <List>
                    {snoozing && snoozeOptionsOf(new Date()).map((option) => (
                        <ListItemButton key={option.key} onClick={() => {
                            changeWithUndo(snoozing, {snoozedUntil: option.until}, t('done.snooze', {count: snoozing.length, date: formatDateTime(option.until)}));
                            setSnoozing(null);
                        }}>
                            <ListItemIcon><SnoozeOutlinedIcon /></ListItemIcon>
                            <ListItemText primary={t(`snooze.${option.key}`)} secondary={formatDateTime(option.until)} />
                        </ListItemButton>
                    ))}
                </List>
            </Dialog>
            {/* etiquetas de la conversación abierta: cada una se pone o se quita */}
            <Menu anchorEl={labelsAnchor} open={Boolean(labelsAnchor && openConversation)} onClose={() => setLabelsAnchor(null)}>
                {openConversation && MAIL_LABELS.map(({id}) => {
                    const hasLabel = openConversation.labelIds.includes(id);
                    return (
                        <MenuItem key={id} onClick={async () => {
                            const labelIds = hasLabel ? openConversation.labelIds.filter((labelId) => labelId !== id) : [...openConversation.labelIds, id];
                            await changeConversations([openConversation.id], {labelIds});
                            setOpenConversation((current) => ({...current, labelIds}));
                            reload();
                        }}>
                            <ListItemIcon><Checkbox edge="start" size="small" checked={hasLabel} tabIndex={-1} disableRipple sx={{p: 0}} /></ListItemIcon>
                            <ListItemText primary={t(`labels.${id}`)} />
                        </MenuItem>
                    );
                })}
            </Menu>

            {/* la ventana se rehace con cada borrador nuevo (key): así no se queda con lo del anterior */}
            <ComposeDialog key={draft ? `${draft.mode}-${draft.draftId ?? draft.conversationId ?? 'new'}-${draft.subject ?? ''}` : 'closed'} draft={draft}
                           onClose={() => setDraft(null)} onSent={afterSent} onDraftChange={() => reload()} />
            <ConfirmDialog {...deleteForeverAction.dialogProps} tone="error" title={t('confirmDeleteForever.title', {count: deleteForeverAction.subject?.ids.length ?? 0})}
                           description={t('confirmDeleteForever.description')} confirmLabel={t('actions.deleteForever')} cancelLabel={t('common:actions.cancel')} />
            <ConfirmDialog {...emptyTrashAction.dialogProps} tone="error" title={t('confirmEmptyTrash.title')}
                           description={t('confirmEmptyTrash.description')} confirmLabel={t('list.emptyTrash')} cancelLabel={t('common:actions.cancel')} />
            <Dialog open={showsShortcuts} onClose={() => setShowsShortcuts(false)} maxWidth="xs" fullWidth aria-labelledby="mail-shortcuts-title">
                <DialogTitle id="mail-shortcuts-title">{t('shortcuts.title')}</DialogTitle>
                <DialogContent>
                    <Table size="small">
                        <TableBody>
                            {MAIL_SHORTCUTS.map((shortcut) => (
                                <TableRow key={shortcut.key}>
                                    <TableCell sx={{width: 56}}><Typography component="kbd" sx={{fontFamily: 'monospace', fontWeight: 700}}>{shortcut.key}</Typography></TableCell>
                                    <TableCell>{t(`shortcuts.${shortcut.action}`)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setShowsShortcuts(false)}>{t('shortcuts.close')}</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};
