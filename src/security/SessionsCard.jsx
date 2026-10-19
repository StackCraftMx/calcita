// «Mis sesiones»: los equipos donde la cuenta sigue abierta (este, marcado) y «Cerrar la sesión en los demás equipos».
//
// No pide la contraseña: cerrar sesiones no da acceso a nada, solo lo quita. Nunca se pinta la IP completa ni el user
// agent: el servidor manda el navegador, el sistema y la red a medias (p. ej. «187.190.x.x»), que bastan para reconocer
// un equipo sin exponer datos.
//
//   <SessionsCard sessions={sessions} onCloseOthers={async () => (await api.post('/sessions/close-others')).closed} />
//
// Genérico del paquete: function (regla de la casa).
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';

import ConfirmDialog from '@/feedback/ConfirmDialog.jsx';
import {toastSuccess} from '@/feedback/toast.jsx';
import {useConfirmAction} from '@/feedback/useConfirmAction.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Tag from '@/ui/labels/Tag.jsx';
import SectionCard from '@/ui/layout/SectionCard.jsx';
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';

const LOADING_HEIGHT_PIXELS = 96;

/**
 * Un renglón: el equipo (navegador en sistema), desde cuándo y su red a medias.
 *
 * @param {{session: object}} props
 */
function SessionRow({session}) {
    const {t} = useToolkitTranslation('security');
    const {formatDateTime} = useFormatters();
    const DeviceIcon = session.isMobile ? PhoneIphoneOutlinedIcon : ComputerOutlinedIcon;
    const device = t('sessions.device', {
        browser: session.browser ?? t('sessions.otherBrowser'), platform: session.platform ?? t('sessions.otherPlatform'),
    });
    const details = [t('sessions.since', {date: formatDateTime(session.startedAt)})];
    if (session.network) {
        details.push(t('sessions.network', {network: session.network}));
    }

    return (
        <ListItem disableGutters alignItems="flex-start" sx={{gap: 1}}>
            <ListItemIcon sx={{minWidth: 36, mt: 0.5}}><DeviceIcon /></ListItemIcon>
            <ListItemText primary={(
                <Stack direction="row" spacing={1} useFlexGap sx={{alignItems: 'center', flexWrap: 'wrap'}}>
                    <span>{device}</span>
                    {session.isCurrent && <Tag label={t('sessions.current')} color="success" />}
                </Stack>
            )} secondary={details.join(' · ')} slotProps={{primary: {sx: {fontWeight: 600}}}} />
        </ListItem>
    );
}

/**
 * @param {object} props
 * @param {Array<{id: string, browser?: string|null, platform?: string|null, isMobile?: boolean, startedAt: string, network?: string|null, isCurrent?: boolean}>|null} props.sessions
 *     null mientras llegan
 * @param {string|null} [props.error] ya traducido (ApiError.message) si no se pudieron traer
 * @param {() => Promise<number>} props.onCloseOthers cierra las demás; regresa cuántas cerró
 * @param {() => void} [props.onClosed] p. ej. volver a pedir la lista
 * @param {object} [props.texts] los textos que cambian, con la forma de `security` en los textos del paquete
 */
export default function SessionsCard({sessions, error = null, onCloseOthers, onClosed, texts}) {
    const {t} = useToolkitTranslation('security', texts);
    const othersCount = (sessions ?? []).filter((session) => !session.isCurrent).length;
    const confirmation = useConfirmAction({
        run: () => onCloseOthers(),
        onDone: (closedCount) => {
            toastSuccess(closedCount ? t('sessions.closed', {count: closedCount}) : t('sessions.noneClosed'));
            onClosed?.();
        },
    });

    return (
        <ComponentTexts namespace="security" texts={texts}>
            <SectionCard title={t('sessions.title')}>
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">{t('sessions.description')}</Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    {!sessions && !error && <Skeleton variant="rounded" height={LOADING_HEIGHT_PIXELS} />}
                    {sessions && (
                        <List disablePadding>
                            {sessions.map((session, index) => (
                                <li key={session.id}>
                                    {index > 0 && <Divider component="div" />}
                                    <SessionRow session={session} />
                                </li>
                            ))}
                        </List>
                    )}
                    <Stack spacing={1} sx={{alignItems: 'flex-start'}}>
                        {sessions && othersCount === 0 && <Typography variant="caption" color="text.secondary">{t('sessions.onlyThis')}</Typography>}
                        <Button variant="outlined" color="warning" disabled={!sessions || othersCount === 0} onClick={() => confirmation.open({})}>
                            {t('sessions.closeOthers')}
                        </Button>
                    </Stack>
                </Stack>
                <ConfirmDialog {...confirmation.dialogProps} tone="warning" title={t('sessions.confirmTitle')}
                               description={t('sessions.confirmText', {count: othersCount})} confirmLabel={t('sessions.confirm')} />
            </SectionCard>
        </ComponentTexts>
    );
}
