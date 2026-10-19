// La bitácora de la cuenta: lo último que pasó (entró, contraseña equivocada, cambió su contraseña, activó la verificación,
// agregó una llave…), con la hora, el equipo y la red a medias. Para que la persona reconozca lo que no fue ella.
//
// Cada evento llega con su tipo (kind) y el texto sale de los textos del paquete (security:activity.kinds.<kind>); un tipo
// propio del proyecto trae su texto en description.
//
//   <ActivityLog events={events} />
//
// Genérico del paquete: function (regla de la casa).
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined';
import PhonelinkLockOutlinedIcon from '@mui/icons-material/PhonelinkLockOutlined';
import PhonelinkEraseOutlinedIcon from '@mui/icons-material/PhonelinkEraseOutlined';
import SyncLockOutlinedIcon from '@mui/icons-material/SyncLockOutlined';

import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import SectionCard from '@/ui/layout/SectionCard.jsx';

/** Los tipos de evento que el paquete conoce, con su texto en security:activity.kinds. */
export const ACCOUNT_EVENT_KIND = Object.freeze({
    signedIn: 'signedIn',
    signInFailed: 'signInFailed',
    signedOut: 'signedOut',
    passwordChanged: 'passwordChanged',
    twoStepEnabled: 'twoStepEnabled',
    twoStepDisabled: 'twoStepDisabled',
    passkeyAdded: 'passkeyAdded',
    passkeyRemoved: 'passkeyRemoved',
    recoveryCodesGenerated: 'recoveryCodesGenerated',
    recoveryCodeUsed: 'recoveryCodeUsed',
    sessionsClosed: 'sessionsClosed',
});

// el ícono de cada tipo, y en rojo lo que pide atención (un intento con contraseña equivocada, quitar protección)
const EVENT_LOOK = Object.freeze({
    [ACCOUNT_EVENT_KIND.signedIn]: {Icon: LoginOutlinedIcon},
    [ACCOUNT_EVENT_KIND.signInFailed]: {Icon: CancelOutlinedIcon, color: 'error'},
    [ACCOUNT_EVENT_KIND.signedOut]: {Icon: LogoutOutlinedIcon},
    [ACCOUNT_EVENT_KIND.passwordChanged]: {Icon: PasswordOutlinedIcon},
    [ACCOUNT_EVENT_KIND.twoStepEnabled]: {Icon: PhonelinkLockOutlinedIcon, color: 'success'},
    [ACCOUNT_EVENT_KIND.twoStepDisabled]: {Icon: PhonelinkEraseOutlinedIcon, color: 'warning'},
    [ACCOUNT_EVENT_KIND.passkeyAdded]: {Icon: FingerprintOutlinedIcon, color: 'success'},
    [ACCOUNT_EVENT_KIND.passkeyRemoved]: {Icon: FingerprintOutlinedIcon, color: 'warning'},
    [ACCOUNT_EVENT_KIND.recoveryCodesGenerated]: {Icon: KeyOutlinedIcon},
    [ACCOUNT_EVENT_KIND.recoveryCodeUsed]: {Icon: KeyOutlinedIcon, color: 'warning'},
    [ACCOUNT_EVENT_KIND.sessionsClosed]: {Icon: SyncLockOutlinedIcon},
});
const DEFAULT_LOOK = Object.freeze({Icon: EventNoteOutlinedIcon});
const LOADING_HEIGHT_PIXELS = 160;

/**
 * @param {object} props
 * @param {Array<{id: string, kind: string, occurredAt: string, device?: string|null, network?: string|null, description?: string}>|null} props.events
 *     del más nuevo al más viejo; null mientras llegan
 * @param {string|null} [props.error] ya traducido si no se pudieron traer
 * @param {object} [props.texts] los textos que cambian, con la forma de `security` en los textos del paquete
 */
export default function ActivityLog({events, error = null, texts}) {
    const {t} = useToolkitTranslation('security', texts);
    const {formatDateTime} = useFormatters();

    return (
        <SectionCard title={t('activity.title')}>
            <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">{t('activity.description')}</Typography>
                {error && <Alert severity="error">{error}</Alert>}
                {!events && !error && <Skeleton variant="rounded" height={LOADING_HEIGHT_PIXELS} />}
                {events?.length === 0 && <Typography variant="body2" color="text.secondary">{t('activity.empty')}</Typography>}
                {events?.length > 0 && (
                    <List dense disablePadding>
                        {events.map((event) => {
                            const look = EVENT_LOOK[event.kind] ?? DEFAULT_LOOK;
                            const where = event.device && event.network ? ` · ${t('activity.from', {device: event.device, network: event.network})}` : '';
                            return (
                                <ListItem key={event.id} disableGutters>
                                    <ListItemIcon sx={{minWidth: 36}}><look.Icon fontSize="small" color={look.color ?? 'action'} /></ListItemIcon>
                                    <ListItemText primary={event.description ?? t(`activity.kinds.${event.kind}`)}
                                                  secondary={`${formatDateTime(event.occurredAt)}${where}`} />
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Stack>
        </SectionCard>
    );
}
