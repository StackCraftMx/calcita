// La lectura de un mensaje: el asunto, quién lo manda (con su correo), para quién, la fecha completa, sus archivos y el
// texto. Arriba, las acciones que quiera el proyecto (responder, archivar, marcar como no leído, borrar).
//
// El texto se pinta como TEXTO, con sus saltos de renglón: nunca como HTML (un correo con HTML adentro sería un XSS).
//
// Genérico del paquete: function (regla de la casa).
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';

import {initialsOf} from '@/appShell/menuItemText.js';
import {formatDateTime} from '@/formatting.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/**
 * @param {object} props
 * @param {{subject: string, from: {name: string, email: string}, to?: string[], receivedAt: string, body: string, attachments?: Array<{name: string, size?: string}>}|null} props.message
 *     null: todavía no se elige ninguno
 * @param {import('react').ReactNode} [props.actions] los botones de arriba
 */
export default function MessageView({message, actions}) {
    const {t} = useToolkitTranslation('inbox');

    if (!message) {
        return <Typography variant="body2" color="text.secondary" sx={{p: 4, textAlign: 'center'}}>{t('noMessageSelected')}</Typography>;
    }

    return (
        <Stack spacing={2} component="article" aria-label={message.subject}>
            {actions && <Stack direction="row" spacing={0.5} useFlexGap sx={{flexWrap: 'wrap'}}>{actions}</Stack>}
            <Typography variant="h5" component="h2">{message.subject}</Typography>
            <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
                <Avatar>{initialsOf(message.from.name)}</Avatar>
                <Box sx={{minWidth: 0, flex: 1}}>
                    <Typography variant="subtitle2" component="p" noWrap>
                        {message.from.name} <Typography component="span" variant="body2" color="text.secondary">&lt;{message.from.email}&gt;</Typography>
                    </Typography>
                    {message.to?.length > 0 && <Typography variant="caption" color="text.secondary" component="p">{t('to', {to: message.to.join(', ')})}</Typography>}
                    {/* la fecha debajo y no a la derecha: en el teléfono apretaba el «Para» a dos renglones */}
                    <Typography variant="caption" color="text.secondary" component="p">{formatDateTime(message.receivedAt)}</Typography>
                </Box>
            </Stack>
            {message.attachments?.length > 0 && (
                <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}} aria-label={t('attachments')}>
                    {message.attachments.map((attachment) => (
                        <Chip key={attachment.name} icon={<AttachFileRoundedIcon />} variant="outlined"
                              label={attachment.size ? `${attachment.name} · ${attachment.size}` : attachment.name} />
                    ))}
                </Stack>
            )}
            <Divider />
            <Typography variant="body1" component="div" sx={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>{message.body}</Typography>
        </Stack>
    );
}
