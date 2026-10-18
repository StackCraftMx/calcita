import {useState} from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const CHECKBOX_COLORS = ['primary', 'secondary', 'success', 'error'] as const;
// las casillas hijas: los avisos que se prenden por canal
const NOTIFICATION_CHANNELS = ['email', 'sms', 'push'] as const;
type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

const Checkboxes = () => {
    const {t} = useToolkitTranslation('catalog');
    const [channels, setChannels] = useState<Record<NotificationChannel, boolean>>({email: true, sms: false, push: true});

    // la casilla madre: palomeada si todas, vacía si ninguna y «mixta» si unas sí y otras no (regla de Apple, «Toggles»)
    const checkedCount = NOTIFICATION_CHANNELS.filter((channel) => channels[channel]).length;
    const isAllChecked = checkedCount === NOTIFICATION_CHANNELS.length;
    const isMixed = checkedCount > 0 && !isAllChecked;
    const setAllChannels = (isChecked: boolean) => setChannels({email: isChecked, sms: isChecked, push: isChecked});

    return (
        <Stack direction="row" spacing={4} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
            <Stack spacing={1}>
                {/* sin texto a la vista: el aria-label dice qué es cada una */}
                <Stack direction="row">
                    <Checkbox slotProps={{input: {'aria-label': t('selection.checkbox.off')}}} />
                    <Checkbox defaultChecked slotProps={{input: {'aria-label': t('selection.checkbox.on')}}} />
                    <Checkbox indeterminate slotProps={{input: {'aria-label': t('selection.checkbox.mixed')}}} />
                    <Checkbox disabled slotProps={{input: {'aria-label': t('states.disabled')}}} />
                    <Checkbox disabled checked slotProps={{input: {'aria-label': t('states.disabled')}}} />
                </Stack>
                <Stack direction="row">
                    {CHECKBOX_COLORS.map((color) => (
                        <Checkbox key={color} defaultChecked color={color} slotProps={{input: {'aria-label': t(`colors.${color}`)}}} />
                    ))}
                </Stack>
            </Stack>
            <Box>
                <FormControlLabel label={t('selection.checkbox.allChannels')}
                                  control={<Checkbox checked={isAllChecked} indeterminate={isMixed} onChange={(event) => setAllChannels(event.target.checked)} />} />
                <FormGroup sx={{pl: 3}}>
                    {NOTIFICATION_CHANNELS.map((channel) => (
                        <FormControlLabel key={channel} label={t(`selection.channels.${channel}`)}
                                          control={<Checkbox checked={channels[channel]}
                                                             onChange={(event) => setChannels((current) => ({...current, [channel]: event.target.checked}))} />} />
                    ))}
                </FormGroup>
            </Box>
        </Stack>
    );
};

export default Checkboxes;
