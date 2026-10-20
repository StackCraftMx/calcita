// La lectura de un mensaje o de una conversación completa: el asunto con sus etiquetas y, debajo, cada mensaje de la
// conversación (los anteriores encogidos en un renglón con quién y cuándo, como Gmail; al picarlos se abren). De cada uno:
// quién lo manda (con su correo), para quién y con copia a quién, la fecha completa, sus archivos y el texto. Arriba, las
// acciones que quiera el proyecto (responder, archivar, posponer, borrar); abajo, lo que quiera poner (una respuesta rápida).
//
// El texto se pinta como TEXTO, con sus saltos de renglón: nunca como HTML (un correo con HTML adentro sería un XSS). Si un
// proyecto necesita HTML, lo pinta con renderBody y es SU responsabilidad limpiarlo antes (DOMPurify o su backend).
//
// Todo hacia afuera: onAttachmentClick al picar un archivo (descargarlo, verlo), onExpand al abrir un mensaje anterior (para
// marcarlo como leído), renderBody, footer y texts.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaMessageView con defaultProps y
// styleOverrides de sus partes: header, headerText, recipients, body, empty, labels, attachments, divider, collapsed,
// collapsedAvatar, collapsedText, collapsedSender, collapsedDate.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';

import {initialsOf} from '@/appShell/menuItemText.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {inboxDateOf} from '@/inbox/inboxDates.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {tagOf} from '@/ui/labels/tagOf.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaMessageView)
const THEME_NAME = 'CalcitaMessageView';
const MessageHeaderPart = piecePart(THEME_NAME, 'Header', Stack);
const MessageHeaderText = piecePart(THEME_NAME, 'HeaderText', Box);
const MessageRecipients = piecePart(THEME_NAME, 'Recipients', Stack);
const MessageBodyPart = piecePart(THEME_NAME, 'Body', Typography);
const MessageEmpty = piecePart(THEME_NAME, 'Empty', Typography);
const MessageLabels = piecePart(THEME_NAME, 'Labels', Stack);
const MessageAttachments = piecePart(THEME_NAME, 'Attachments', Stack);
const MessageDivider = piecePart(THEME_NAME, 'Divider', Divider);
const MessageCollapsed = piecePart(THEME_NAME, 'Collapsed', ButtonBase);
const MessageCollapsedAvatar = piecePart(THEME_NAME, 'CollapsedAvatar', Avatar);
const MessageCollapsedText = piecePart(THEME_NAME, 'CollapsedText', Box);
const MessageCollapsedSender = piecePart(THEME_NAME, 'CollapsedSender', Typography);
const MessageCollapsedDate = piecePart(THEME_NAME, 'CollapsedDate', Typography);

const PREVIEW_LENGTH = 90;

/** Quién manda, para quién, con copia a quién y cuándo. */
function MessageHeader({entry, t}) {
    const {formatDateTime} = useFormatters();
    return (
        <MessageHeaderPart direction="row" spacing={1.5} ownSx={{alignItems: 'center'}}>
            <Avatar>{initialsOf(entry.from.name)}</Avatar>
            <MessageHeaderText ownSx={{minWidth: 0, flex: 1}}>
                <Typography variant="subtitle2" component="p" noWrap>
                    {entry.from.name} <Typography component="span" variant="body2" color="text.secondary">&lt;{entry.from.email}&gt;</Typography>
                </Typography>
                {entry.to?.length > 0 && <Typography variant="caption" color="text.secondary" component="p">{t('to', {to: entry.to.join(', ')})}</Typography>}
                {entry.cc?.length > 0 && <Typography variant="caption" color="text.secondary" component="p">{t('cc', {cc: entry.cc.join(', ')})}</Typography>}
                {/* la fecha debajo y no a la derecha: en el teléfono apretaba el «Para» a dos renglones */}
                <Typography variant="caption" color="text.secondary" component="p">{formatDateTime(entry.receivedAt)}</Typography>
            </MessageHeaderText>
        </MessageHeaderPart>
    );
}

/** Un mensaje abierto: su encabezado, sus archivos y su texto. */
function MessageBody({entry, t, onAttachmentClick, renderBody}) {
    return (
        <Stack spacing={2}>
            <MessageHeader entry={entry} t={t} />
            {entry.attachments?.length > 0 && (
                <MessageRecipients direction="row" spacing={1} useFlexGap ownSx={{flexWrap: 'wrap'}} aria-label={t('attachments')} role="group">
                    {entry.attachments.map((attachment) => (
                        <Chip key={attachment.name} icon={<AttachFileRoundedIcon />} variant="outlined"
                              label={attachment.size ? `${attachment.name} · ${attachment.size}` : attachment.name}
                              {...(onAttachmentClick && {onClick: () => onAttachmentClick(attachment, entry), 'aria-label': t('openAttachment', {name: attachment.name})})} />
                    ))}
                </MessageRecipients>
            )}
            {renderBody ? renderBody(entry) : (
                <MessageBodyPart variant="body1" component="div" ownSx={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>{entry.body}</MessageBodyPart>
            )}
        </Stack>
    );
}

/**
 * @param {object} props
 * @param {{id?: string, subject: string, from: {name: string, email: string}, to?: string[], cc?: string[], receivedAt: string, body: string, attachments?: Array<{name: string, size?: string} & Record<string, any>>, labels?: Array<string|{label: string, color?: string}>, thread?: Array<{id: string, from: {name: string, email: string}, to?: string[], cc?: string[], receivedAt: string, body: string, attachments?: Array<{name: string, size?: string}>}>}|null} props.message
 *     el mensaje más nuevo de la conversación; thread: los anteriores, del más viejo al más nuevo (encogidos). null: todavía
 *     no se elige ninguno
 * @param {import('react').ReactNode} [props.actions] los botones de arriba
 * @param {import('react').ReactNode} [props.footer] lo de abajo (una respuesta rápida, firmas…)
 * @param {(attachment: any, message: any) => void} [props.onAttachmentClick] al picar un archivo; sin él los archivos solo se ven
 * @param {(threadMessageId: string) => void} [props.onExpand] al abrir un mensaje anterior de la conversación
 * @param {(message: any) => import('react').ReactNode} [props.renderBody] el texto a su manera (HTML ya limpio por el proyecto)
 * @param {object} [props.texts] los textos que cambian, con la forma de `inbox` en los textos del paquete
 */
export default function MessageView(props) {
    // lo que el proyecto puso en su tema (components.CalcitaMessageView.defaultProps) y encima lo que llega aquí
    const {message, actions, footer, onAttachmentClick, onExpand, renderBody, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('inbox', texts);
    const formatters = useFormatters();
    // los mensajes anteriores que la persona abrió (empiezan encogidos), de qué conversación: al cambiar de mensaje se olvidan
    const [expanded, setExpanded] = useState({messageId: null, ids: []});

    if (!message) {
        return <MessageEmpty variant="body2" color="text.secondary" ownSx={{p: 4, textAlign: 'center'}}>{t('noMessageSelected')}</MessageEmpty>;
    }

    const expandedIds = expanded.messageId === message.id ? expanded.ids : [];
    const expand = (threadMessageId) => {
        setExpanded({messageId: message.id, ids: [...expandedIds, threadMessageId]});
        onExpand?.(threadMessageId);
    };

    return (
        <Stack spacing={2} component="article" aria-label={message.subject}>
            {actions && <MessageLabels direction="row" spacing={0.5} useFlexGap ownSx={{flexWrap: 'wrap', alignItems: 'center'}}>{actions}</MessageLabels>}
            <Box>
                <Typography variant="h5" component="h2">{message.subject}</Typography>
                {message.labels?.length > 0 && (
                    <MessageAttachments direction="row" spacing={0.5} useFlexGap ownSx={{flexWrap: 'wrap', mt: 1}}>
                        {message.labels.map((rawLabel) => {
                            const label = tagOf(rawLabel);
                            return <Chip key={label.label} size="small" variant="outlined" color={label.color} label={label.label} />;
                        })}
                    </MessageAttachments>
                )}
            </Box>
            {message.thread?.length > 0 && (
                <Typography variant="caption" color="text.secondary">{t('threadCount', {count: message.thread.length + 1})}</Typography>
            )}
            {/* los anteriores: encogidos en un renglón; abiertos, completos y con su línea abajo */}
            {message.thread?.map((entry) => (expandedIds.includes(entry.id) ? (
                <Box key={entry.id}>
                    <MessageBody entry={entry} t={t} onAttachmentClick={onAttachmentClick} renderBody={renderBody} />
                    <MessageDivider ownSx={{mt: 2}} />
                </Box>
            ) : (
                <MessageCollapsed key={entry.id} onClick={() => expand(entry.id)} aria-label={t('expandMessage', {name: entry.from.name, date: inboxDateOf(entry.receivedAt, new Date(), formatters)})}
                            ownSx={{justifyContent: 'flex-start', textAlign: 'left', borderRadius: 2, p: 1, mx: -1, gap: 1.5, '&:hover': {bgcolor: 'action.hover'}}}>
                    <MessageCollapsedAvatar ownSx={{width: 32, height: 32, fontSize: 13}}>{initialsOf(entry.from.name)}</MessageCollapsedAvatar>
                    <MessageCollapsedText ownSx={{minWidth: 0, flex: 1}}>
                        <MessageCollapsedSender variant="body2" ownSx={{fontWeight: 600}} noWrap>{entry.from.name}</MessageCollapsedSender>
                        <Typography variant="body2" color="text.secondary" noWrap>{entry.body.replace(/\s+/g, ' ').slice(0, PREVIEW_LENGTH)}</Typography>
                    </MessageCollapsedText>
                    <MessageCollapsedDate variant="caption" color="text.secondary" ownSx={{flexShrink: 0}}>{inboxDateOf(entry.receivedAt, new Date(), formatters)}</MessageCollapsedDate>
                </MessageCollapsed>
            )))}
            {message.thread?.length > 0 && <Divider />}
            <MessageBody entry={message} t={t} onAttachmentClick={onAttachmentClick} renderBody={renderBody} />
            {footer}
        </Stack>
    );
}
