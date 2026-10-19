// La lista de mensajes de una bandeja tipo correo: quién lo manda (y cuántos mensajes trae la conversación), el asunto con sus
// etiquetas, el principio del texto, la fecha corta, la estrella y el clip si trae archivos. Los no leídos van en negritas con
// su punto.
//
// Lo de un producto, todo hacia afuera (la lista no guarda nada ni llama a ningún servidor):
//   - elegir varios: con onSelectionChange el monograma de cada mensaje se vuelve su casilla (como Gmail en el teléfono) y la
//     pantalla pone las acciones de lo elegido (SelectionActions: archivar, borrar, marcar como leído…);
//   - «⋯» de cada mensaje con las acciones que dé la pantalla (messageActions);
//   - renderMessage para pintar lo de adentro de cada renglón a su manera, y texts para cualquier texto.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaMessageList con defaultProps y
// styleOverrides de sus partes: empty, selectedAvatar, item, actions, starButton, itemButton, avatarSlot, avatarButton,
// avatar, body, text, topRow, unreadDot, sender, threadCount, date, subject, labels.
//
// Genérico del paquete: function (regla de la casa).
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

import {initialsOf} from '@/appShell/menuItemText.js';
import {inboxDateOf} from '@/inbox/inboxDates.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {tagOf} from '@/ui/labels/tagOf.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import ActionsMenu from '@/ui/actions/ActionsMenu.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaMessageList)
const THEME_NAME = 'CalcitaMessageList';
const MessagesEmpty = piecePart(THEME_NAME, 'Empty', Typography);
const MessagesSelectedAvatar = piecePart(THEME_NAME, 'SelectedAvatar', Avatar);
const MessagesItem = piecePart(THEME_NAME, 'Item', ListItem);
const MessagesActions = piecePart(THEME_NAME, 'Actions', Stack);
const MessagesStarButton = piecePart(THEME_NAME, 'StarButton', IconButton);
const MessagesItemButton = piecePart(THEME_NAME, 'ItemButton', ListItemButton);
const MessagesAvatarSlot = piecePart(THEME_NAME, 'AvatarSlot', ListItemAvatar);
const MessagesAvatarButton = piecePart(THEME_NAME, 'AvatarButton', ButtonBase);
const MessagesAvatar = piecePart(THEME_NAME, 'Avatar', Avatar);
const MessagesBody = piecePart(THEME_NAME, 'Body', Box);
const MessagesText = piecePart(THEME_NAME, 'Text', Box);
const MessagesTopRow = piecePart(THEME_NAME, 'TopRow', Stack);
const MessagesUnreadDot = piecePart(THEME_NAME, 'UnreadDot', Box);
const MessagesSender = piecePart(THEME_NAME, 'Sender', Typography);
const MessagesThreadCount = piecePart(THEME_NAME, 'ThreadCount', Typography);
const MessagesDate = piecePart(THEME_NAME, 'Date', Typography);
const MessagesSubject = piecePart(THEME_NAME, 'Subject', Typography);
const MessagesLabels = piecePart(THEME_NAME, 'Labels', Stack);

const UNREAD_DOT_PIXELS = 8;
const AVATAR_PIXELS = 40;

/**
 * @param {object} props
 * @param {Array<{id: string, from: {name: string, email: string}, subject: string, preview: string, receivedAt: string, isUnread?: boolean, isStarred?: boolean, hasAttachments?: boolean, threadCount?: number, labels?: Array<string|{label: string, color?: string}>} & Record<string, any>>} props.messages
 *     cada mensaje puede traer sus campos propios (llegan a renderMessage y a messageActions tal cual). threadCount: cuántos
 *     mensajes trae la conversación (con 2 o más se pinta «(3)»); labels: texto o {label, color} del tema
 * @param {string|null} [props.selectedId] el mensaje abierto
 * @param {(messageId: string) => void} props.onSelect abrir un mensaje
 * @param {(messageId: string) => void} [props.onToggleStar]
 * @param {string[]} [props.selectedIds] los elegidos para una acción en grupo
 * @param {(messageIds: string[]) => void} [props.onSelectionChange] con él, cada mensaje se puede elegir picando su monograma
 * @param {(message: any) => Array<{key: string, label: string, icon?: import('react').ReactNode, color?: string, disabled?: boolean, onClick: () => void}>} [props.messageActions]
 *     las acciones del «⋯» de cada mensaje (archivar, posponer, mover…); sin ellas no hay «⋯»
 * @param {(message: any) => import('react').ReactNode} [props.renderMessage] lo de adentro de cada renglón, a su manera
 * @param {string} [props.emptyText] ya traducido; por omisión el del paquete
 * @param {object} [props.texts] los textos que cambian, con la forma de `inbox` en los textos del paquete
 */
export default function MessageList(props) {
    // lo que el proyecto puso en su tema (components.CalcitaMessageList.defaultProps) y encima lo que llega aquí
    const {
    messages, selectedId = null, onSelect, onToggleStar, selectedIds = [], onSelectionChange, messageActions, renderMessage, emptyText, texts,
} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('inbox', texts);
    const formatters = useFormatters();

    if (messages.length === 0) {
        return <MessagesEmpty variant="body2" color="text.secondary" ownSx={{p: 3, textAlign: 'center'}}>{emptyText ?? t('empty')}</MessagesEmpty>;
    }

    const toggleSelected = (messageId, isChecked) => {
        onSelectionChange(isChecked ? [...selectedIds, messageId] : selectedIds.filter((id) => id !== messageId));
    };

    return (
        <List disablePadding aria-label={t('listLabel')}>
            {messages.map((message) => {
                const weight = message.isUnread ? 700 : 400;
                const isChecked = selectedIds.includes(message.id);
                const avatar = <MessagesSelectedAvatar ownSx={{width: AVATAR_PIXELS, height: AVATAR_PIXELS}}>{initialsOf(message.from.name)}</MessagesSelectedAvatar>;
                return (
                    <MessagesItem key={message.id} disablePadding secondaryAction={(onToggleStar || messageActions) && (
                        <MessagesActions direction="row" ownSx={{alignItems: 'center'}}>
                            {onToggleStar && (
                                <MessagesStarButton size="small" onClick={() => onToggleStar(message.id)} aria-pressed={Boolean(message.isStarred)}
                                            aria-label={message.isStarred ? t('unstar') : t('star')} ownSx={{color: message.isStarred ? 'warning.main' : 'text.secondary'}}>
                                    {message.isStarred ? <StarRoundedIcon fontSize="small" /> : <StarBorderRoundedIcon fontSize="small" />}
                                </MessagesStarButton>
                            )}
                            {messageActions && <ActionsMenu label={t('messageActions', {subject: message.subject})} actions={messageActions(message)} />}
                        </MessagesActions>
                    )} ownSx={{'& .MuiListItemSecondaryAction-root': {right: 4}}}>
                        <MessagesItemButton selected={message.id === selectedId || isChecked} onClick={() => onSelect(message.id)} alignItems="flex-start"
                                        ownSx={{borderRadius: 2, pr: onToggleStar && messageActions ? 10 : 6}}>
                            <MessagesAvatarSlot ownSx={{mt: 0.5}}>
                                {/* elegir: el monograma es la casilla (el clic no abre el mensaje). Un botón con papel de casilla y
                                    no el Checkbox de MUI: el tema le pinta a la casilla marcada un cuadro blanco detrás de su dibujo
                                    y la palomita salía como un cuadro */}
                                {onSelectionChange ? (
                                    <MessagesAvatarButton role="checkbox" aria-checked={isChecked} aria-label={t('select', {subject: message.subject})}
                                                ownSx={{borderRadius: '50%'}}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    toggleSelected(message.id, !isChecked);
                                                }}>
                                        {isChecked ? (
                                            <MessagesAvatar ownSx={{width: AVATAR_PIXELS, height: AVATAR_PIXELS, bgcolor: 'primary.main', color: 'primary.contrastText'}}>
                                                <CheckRoundedIcon />
                                            </MessagesAvatar>
                                        ) : avatar}
                                    </MessagesAvatarButton>
                                ) : avatar}
                            </MessagesAvatarSlot>
                            {renderMessage ? <MessagesBody ownSx={{minWidth: 0, flex: 1}}>{renderMessage(message)}</MessagesBody> : (
                                <MessagesText ownSx={{minWidth: 0, flex: 1}}>
                                    <MessagesTopRow direction="row" spacing={1} ownSx={{alignItems: 'center'}}>
                                        {message.isUnread && (
                                            <MessagesUnreadDot component="span" aria-label={t('unread')} ownSx={{width: UNREAD_DOT_PIXELS, height: UNREAD_DOT_PIXELS, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0}} />
                                        )}
                                        <MessagesSender variant="body2" noWrap ownSx={{fontWeight: weight, flex: 1}}>
                                            {message.from.name}
                                            {message.threadCount > 1 && (
                                                <MessagesThreadCount component="span" variant="caption" color="text.secondary" ownSx={{ml: 0.5}} aria-label={t('threadCount', {count: message.threadCount})}>
                                                    ({message.threadCount})
                                                </MessagesThreadCount>
                                            )}
                                        </MessagesSender>
                                        {message.hasAttachments && <AttachFileRoundedIcon fontSize="inherit" color="action" aria-label={t('attachments')} />}
                                        <MessagesDate variant="caption" color="text.secondary" ownSx={{flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>
                                            {inboxDateOf(message.receivedAt, new Date(), formatters)}
                                        </MessagesDate>
                                    </MessagesTopRow>
                                    <MessagesSubject variant="body2" noWrap ownSx={{fontWeight: weight}}>{message.subject}</MessagesSubject>
                                    <Typography variant="body2" color="text.secondary" noWrap>{message.preview}</Typography>
                                    {message.labels?.length > 0 && (
                                        <MessagesLabels direction="row" spacing={0.5} useFlexGap ownSx={{flexWrap: 'wrap', mt: 0.5}}>
                                            {message.labels.map((rawLabel) => {
                                                const label = tagOf(rawLabel);
                                                return <Chip key={label.label} size="small" variant="outlined" color={label.color} label={label.label} />;
                                            })}
                                        </MessagesLabels>
                                    )}
                                </MessagesText>
                            )}
                        </MessagesItemButton>
                    </MessagesItem>
                );
            })}
        </List>
    );
}
