import {useState} from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// el renglón con el texto antes: el texto a la izquierda y el interruptor a la derecha, como en Ajustes (px)
const SWITCH_ROW_WIDTH = 320;

const Switches = () => {
    const {t} = useToolkitTranslation('catalog');
    const [settings, setSettings] = useState<Record<string, boolean>>({notifications: true, emailReports: false});

    return (
        <Stack spacing={2.5}>
            {/* como pide Apple: el interruptor al final del renglón de una lista, con lo que hace explicado debajo */}
            <List dense disablePadding sx={{width: SWITCH_ROW_WIDTH}}>
                {Object.keys(settings).map((setting) => (
                    <ListItem key={setting} disableGutters
                              secondaryAction={(
                                  <Switch edge="end" checked={settings[setting]}
                                          onChange={(event) => setSettings((current) => ({...current, [setting]: event.target.checked}))}
                                          slotProps={{input: {'aria-label': t(`selection.switch.settings.${setting}`)}}} />
                              )}>
                        <ListItemText primary={t(`selection.switch.settings.${setting}`)} secondary={t(`selection.switch.settings.${setting}Help`)} />
                    </ListItem>
                ))}
            </List>
            <FormControlLabel control={<Switch defaultChecked />} label={t('selection.switch.sampleLabel')} />
            <FormControlLabel control={<Switch />} label={t('selection.switch.sampleLabel')} labelPlacement="start" sx={{width: SWITCH_ROW_WIDTH}} />
            <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                <Switch defaultChecked slotProps={{input: {'aria-label': t('selection.switch.on')}}} />
                <Switch size="small" defaultChecked slotProps={{input: {'aria-label': t('sizes.small')}}} />
                <Switch disabled slotProps={{input: {'aria-label': t('states.disabled')}}} />
                <Switch disabled checked slotProps={{input: {'aria-label': t('states.disabled')}}} />
            </Stack>
        </Stack>
    );
};

export default Switches;
