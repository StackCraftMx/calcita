// El detalle de una cita, para la ventana que se abre al picarla en el calendario: su título con el color de su tipo,
// cuándo (el día y las horas), dónde, la liga de la reunión con «Unirse», los invitados con su respuesta, el recordatorio y
// las notas. Pinta lo que la cita traiga; lo que no trae no ocupa lugar.
//
//   <EventDetails event={{title: 'Junta de cierre', start: '2026-10-20T10:00', end: '2026-10-20T11:00', location: 'Sala 2',
//                         meetingUrl: 'https://meet.example.com/abc', attendees: [{id: 'ana', name: 'Ana', response: 'accepted'}],
//                         reminderMinutes: 15}}
//                 actions={<Button onClick={edit}>Editar</Button>} />
//
// No llama a ningún servidor ni abre la reunión por su cuenta: «Unirse» es una liga (solo http o https) y lo demás lo pone la
// pantalla en actions. Sus textos se cambian con texts (la forma de `calendar` en los textos del paquete).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaEventDetails con defaultProps y
// styleOverrides de sus partes: row, rowContent, titleRow, toneDot, linkRow, link, guestsTitle, guest, guestAvatar,
// guestName, notes, actions.
//
// Genérico del paquete: function (regla de la casa).
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';

import {initialsOf} from '@/appShell/menuItemText.js';
import {REMINDER_UNIT, isOpenableMeetingUrl, reminderOf} from '@/calendar/calendarEvents.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaEventDetails)
const THEME_NAME = 'CalcitaEventDetails';
const EventRow = piecePart(THEME_NAME, 'Row', Stack);
const EventRowContent = piecePart(THEME_NAME, 'RowContent', Box);
const EventTitleRow = piecePart(THEME_NAME, 'TitleRow', Stack);
const EventToneDot = piecePart(THEME_NAME, 'ToneDot', Box);
const EventLinkRow = piecePart(THEME_NAME, 'LinkRow', Stack);
const EventLink = piecePart(THEME_NAME, 'Link', Typography);
const EventGuestsTitle = piecePart(THEME_NAME, 'GuestsTitle', Typography);
const EventGuest = piecePart(THEME_NAME, 'Guest', Stack);
const EventGuestAvatar = piecePart(THEME_NAME, 'GuestAvatar', Avatar);
const EventGuestName = piecePart(THEME_NAME, 'GuestName', Typography);
const EventNotes = piecePart(THEME_NAME, 'Notes', Typography);
const EventActions = piecePart(THEME_NAME, 'Actions', Stack);

/** Las respuestas de un invitado. */
export const ATTENDEE_RESPONSE = Object.freeze({accepted: 'accepted', declined: 'declined', pending: 'pending'});
// el color de cada respuesta (el color es información: verde va, rojo no va, gris no ha contestado)
const RESPONSE_COLOR = Object.freeze({
    [ATTENDEE_RESPONSE.accepted]: 'success', [ATTENDEE_RESPONSE.declined]: 'error', [ATTENDEE_RESPONSE.pending]: 'default',
});
// un día completo viene sin hora («2026-10-20»)
const WHOLE_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ICON_SIZE = 20;

/** Un renglón del detalle: su ícono a la izquierda y lo de adentro. */
function DetailRow({Icon, label, children}) {
    return (
        <EventRow direction="row" spacing={1.5} ownSx={{alignItems: 'flex-start'}} aria-label={label} role="group">
            <Icon sx={{fontSize: ICON_SIZE, color: 'text.secondary', mt: 0.25}} aria-hidden="true" />
            <EventRowContent ownSx={{minWidth: 0, flexGrow: 1}}>{children}</EventRowContent>
        </EventRow>
    );
}

/**
 * @param {object} props
 * @param {{title: string, start: string, end?: string|null, allDay?: boolean, tone?: string, location?: string, meetingUrl?: string, attendees?: Array<{id: string, name: string, email?: string, response?: 'accepted'|'declined'|'pending'}>, reminderMinutes?: number|null, description?: string}} props.event
 *     start y end como texto ISO (o AAAA-MM-DD un día completo); tone: el color de su tipo
 * @param {import('react').ReactNode} [props.actions] botones de la pantalla (editar, borrar, responder…)
 * @param {string} [props.titleId] el id del título: la ventana que lo contiene se nombra con él (aria-labelledby)
 * @param {object} [props.texts] los textos que cambian, con la forma de `calendar` en los textos del paquete
 */
export default function EventDetails(props) {
    // lo que el proyecto puso en su tema (components.CalcitaEventDetails.defaultProps) y encima lo que llega aquí
    const {event, actions, titleId, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('calendar', texts);
    const {formatDate, formatTime} = useFormatters();
    const isWholeDay = event.allDay || WHOLE_DAY_PATTERN.test(event.start);
    let when = formatDate(event.start);
    if (!isWholeDay) {
        when = t('details.timeRange', {date: formatDate(event.start), start: formatTime(event.start), end: event.end ? formatTime(event.end) : ''});
    }
    const reminder = reminderOf(event.reminderMinutes);
    const canJoin = isOpenableMeetingUrl(event.meetingUrl);

    return (
        <Stack spacing={2}>
            <EventTitleRow direction="row" spacing={1.5} ownSx={{alignItems: 'center'}}>
                <EventToneDot aria-hidden="true" ownSx={{width: 12, height: 12, borderRadius: '4px', flexShrink: 0, bgcolor: `${event.tone ?? 'primary'}.main`}} />
                <Typography id={titleId} variant="h6" component="h2">{event.title}</Typography>
            </EventTitleRow>
            <DetailRow Icon={AccessTimeRoundedIcon} label={t('details.when')}>
                <Typography variant="body2">{isWholeDay ? t('details.allDay', {date: when}) : when}</Typography>
            </DetailRow>
            {event.location && (
                <DetailRow Icon={PlaceOutlinedIcon} label={t('details.location')}>
                    <Typography variant="body2">{event.location}</Typography>
                </DetailRow>
            )}
            {event.meetingUrl && (
                <DetailRow Icon={VideocamOutlinedIcon} label={t('details.meeting')}>
                    <EventLinkRow direction="row" spacing={1} ownSx={{alignItems: 'center', flexWrap: 'wrap'}} useFlexGap>
                        {canJoin && (
                            <Button variant="contained" size="small" href={event.meetingUrl} target="_blank" rel="noreferrer">{t('details.join')}</Button>
                        )}
                        <EventLink variant="caption" color="text.secondary" ownSx={{wordBreak: 'break-all'}}>{event.meetingUrl}</EventLink>
                    </EventLinkRow>
                </DetailRow>
            )}
            {event.attendees?.length > 0 && (
                <DetailRow Icon={PeopleOutlineRoundedIcon} label={t('details.attendees')}>
                    <EventGuestsTitle variant="body2" ownSx={{mb: 0.75}}>{t('details.attendeesCount', {count: event.attendees.length})}</EventGuestsTitle>
                    <Stack spacing={0.75}>
                        {event.attendees.map((attendee) => {
                            const response = attendee.response ?? ATTENDEE_RESPONSE.pending;
                            return (
                                <EventGuest key={attendee.id} direction="row" spacing={1} ownSx={{alignItems: 'center'}}>
                                    <EventGuestAvatar ownSx={{width: 24, height: 24, fontSize: 11}}>{initialsOf(attendee.name)}</EventGuestAvatar>
                                    <EventGuestName variant="body2" ownSx={{flexGrow: 1, minWidth: 0}} noWrap>{attendee.name}</EventGuestName>
                                    <Chip size="small" variant="outlined" color={RESPONSE_COLOR[response] ?? 'default'} label={t(`details.response.${response}`)} />
                                </EventGuest>
                            );
                        })}
                    </Stack>
                </DetailRow>
            )}
            {reminder.unit !== REMINDER_UNIT.none && (
                <DetailRow Icon={NotificationsNoneRoundedIcon} label={t('details.reminder')}>
                    <Typography variant="body2">{t(`details.reminderUnit.${reminder.unit}`, {count: reminder.count})}</Typography>
                </DetailRow>
            )}
            {event.description && (
                <DetailRow Icon={NotesRoundedIcon} label={t('details.notes')}>
                    <EventNotes variant="body2" ownSx={{whiteSpace: 'pre-wrap'}}>{event.description}</EventNotes>
                </DetailRow>
            )}
            {actions && <EventActions direction="row" spacing={1} useFlexGap ownSx={{justifyContent: 'flex-end', flexWrap: 'wrap'}}>{actions}</EventActions>}
        </Stack>
    );
}
