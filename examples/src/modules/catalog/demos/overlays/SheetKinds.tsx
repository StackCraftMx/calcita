import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';

const SHARE_TARGETS = [
    {key: 'copyLink', Icon: LinkIcon},
    {key: 'email', Icon: MailOutlineIcon},
    {key: 'duplicate', Icon: ContentCopyIcon},
];
const SIDE_PANEL_WIDTH = 320;

// con vidrio, los cajones flotan separados de la orilla (Apple: «half sheets are inset»)
const SheetKinds = () => {
    const {t} = useToolkitTranslation('catalog');
    const [openSheet, setOpenSheet] = useState<'none' | 'bottomSheet' | 'sidePanel'>('none');

    const close = () => setOpenSheet('none');
    const confirmAndClose = (message: string) => {
        toastSuccess(message);
        close();
    };

    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
            <Button variant="outlined" onClick={() => setOpenSheet('bottomSheet')}>{t('overlays.sheets.kinds.bottomSheet')}</Button>
            <Button variant="outlined" onClick={() => setOpenSheet('sidePanel')}>{t('overlays.sheets.kinds.sidePanel')}</Button>

            {/* la hoja de abajo: compartir */}
            <Drawer anchor="bottom" open={openSheet === 'bottomSheet'} onClose={close}>
                <Box sx={{p: 2}}>
                    <Typography variant="subtitle1" component="h2" sx={{fontWeight: 600, mb: 1}}>{t('overlays.sheets.shareTitle')}</Typography>
                    <List disablePadding>
                        {SHARE_TARGETS.map(({key, Icon}) => (
                            <ListItemButton key={key} onClick={() => confirmAndClose(t(`overlays.sheets.shared.${key}`))} sx={{borderRadius: 1.5}}>
                                <ListItemIcon><Icon /></ListItemIcon>
                                <ListItemText primary={t(`overlays.sheets.targets.${key}`)} />
                            </ListItemButton>
                        ))}
                    </List>
                    <Button fullWidth sx={{mt: 1}} onClick={close}>{t('samples.cancel')}</Button>
                </Box>
            </Drawer>

            {/* el panel de la derecha: filtros */}
            <Drawer anchor="right" open={openSheet === 'sidePanel'} onClose={close} slotProps={{paper: {sx: {width: SIDE_PANEL_WIDTH}}}}>
                <Stack spacing={2} sx={{p: 2.5}}>
                    <Typography variant="h6" component="h2">{t('overlays.sheets.filtersTitle')}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('overlays.sheets.filtersText')}</Typography>
                    <TextField label={t('samples.customer')} size="small" />
                    <TextField label={t('samples.city')} size="small" />
                    <Stack direction="row" spacing={1} sx={{justifyContent: 'flex-end'}}>
                        <Button onClick={close}>{t('samples.cancel')}</Button>
                        <Button variant="contained" onClick={() => confirmAndClose(t('overlays.sheets.filtersApplied'))}>{t('samples.apply')}</Button>
                    </Stack>
                </Stack>
            </Drawer>
        </Stack>
    );
};

export default SheetKinds;
