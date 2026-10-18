// La lista de mensajes de una bandeja tipo correo: quién lo manda, el asunto y el principio del texto, la fecha corta, la
// estrella y el clip si trae archivos. Los no leídos van en negritas con su punto.
//
// Genérico del paquete: function (regla de la casa).
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

import {initialsOf} from '@/appShell/menuItemText.js';
import {inboxDateOf} from '@/inbox/inboxDates.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

const UNREAD_DOT_PIXELS = 8;

/**
 * @param {object} props
 * @param {Array<{id: string, from: {name: string, email: string}, subject: string, preview: string, receivedAt: string, isUnread?: boolean, isStarred?: boolean, hasAttachments?: boolean}>} props.messages
 * @param {string|null} [props.selectedId]
 * @param {(messageId: string) => void} props.onSelect
 * @param {(messageId: string) => void} [props.onToggleStar]
 * @param {string} [props.emptyText] ya traducido; por omisión el del paquete
 */
export default function MessageList({messages, selectedId = null, onSelect, onToggleStar, emptyText}) {
    const {t} = useToolkitTranslation('inbox');

    if (messages.length === 0) {
        return <Typography variant="body2" color="text.secondary" sx={{p: 3, textAlign: 'center'}}>{emptyText ?? t('empty')}</Typography>;
    }

    return (
        <List disablePadding aria-label={t('listLabel')}>
            {messages.map((message) => {
                const weight = message.isUnread ? 700 : 400;
                return (
                    <ListItem key={message.id} disablePadding secondaryAction={onToggleStar && (
                        <IconButton edge="end" size="small" onClick={() => onToggleStar(message.id)} aria-pressed={Boolean(message.isStarred)}
                                    aria-label={message.isStarred ? t('unstar') : t('star')} sx={{color: message.isStarred ? 'warning.main' : 'text.secondary'}}>
                            {message.isStarred ? <StarRoundedIcon fontSize="small" /> : <StarBorderRoundedIcon fontSize="small" />}
                        </IconButton>
                    )}>
                        <ListItemButton selected={message.id === selectedId} onClick={() => onSelect(message.id)} alignItems="flex-start"
                                        sx={{borderRadius: 2, pr: 6}}>
                            <ListItemAvatar sx={{mt: 0.5}}><Avatar>{initialsOf(message.from.name)}</Avatar></ListItemAvatar>
                            <Box sx={{minWidth: 0, flex: 1}}>
                                <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                                    {message.isUnread && (
                                        <Box component="span" aria-label={t('unread')} sx={{width: UNREAD_DOT_PIXELS, height: UNREAD_DOT_PIXELS, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0}} />
                                    )}
                                    <Typography variant="body2" noWrap sx={{fontWeight: weight, flex: 1}}>{message.from.name}</Typography>
                                    {message.hasAttachments && <AttachFileRoundedIcon fontSize="inherit" color="action" aria-label={t('attachments')} />}
                                    <Typography variant="caption" color="text.secondary" sx={{flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>
                                        {inboxDateOf(message.receivedAt)}
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" noWrap sx={{fontWeight: weight}}>{message.subject}</Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>{message.preview}</Typography>
                            </Box>
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
}
