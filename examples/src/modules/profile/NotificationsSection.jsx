// La pestaña propia «Notificaciones» de Mi perfil: qué avisos recibe la persona. Es del proyecto, no del framework:
// ProfileScreen la recibe en extraTabs y la pinta como una más.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {SectionCard, toastProblem, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';

import {getMyNotifications, updateMyNotifications} from '@/modules/profile/profileApi.js';

// los avisos que se pueden prender, en el orden en que se ven (las llaves del API)
const NOTIFICATION_KEYS = Object.freeze(['newOrders', 'weeklySummary']);

export const NotificationsSection = () => {
    const {t} = useToolkitTranslation('profile');
    const [notifications, setNotifications] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        getMyNotifications(controller.signal).then(setNotifications).catch((error) => {
            if (!controller.signal.aborted) {
                toastProblem(error);
            }
        });
        return () => controller.abort();
    }, []);

    const save = async () => {
        setIsSaving(true);
        try {
            await updateMyNotifications(notifications);
            toastSuccess(t('notifications.saved'));
        } catch (error) {
            toastProblem(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SectionCard title={t('notifications.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('notifications.text')}</Typography>
            {/* guard: mientras llegan, la ruedita */}
            {notifications ? (
                <Stack spacing={1} sx={{alignItems: 'flex-start'}}>
                    {NOTIFICATION_KEYS.map((key) => (
                        <FormControlLabel key={key} label={t(`notifications.${key}`)}
                                          control={<Switch checked={notifications[key]}
                                                           onChange={(event) => setNotifications((current) => ({...current, [key]: event.target.checked}))} />} />
                    ))}
                    <Button variant="contained" onClick={save} disabled={isSaving} sx={{mt: 1}}>{t('notifications.save')}</Button>
                </Stack>
            ) : <CircularProgress size={24} aria-label={t('notifications.title')} />}
        </SectionCard>
    );
};
