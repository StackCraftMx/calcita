import {useState} from 'react';
import type {MouseEvent} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const SORT_FIELDS = ['date', 'amount', 'customer'];
type OpenMenu = {kind: 'none' | 'actions' | 'sort' | 'popover'; anchor: HTMLElement | null};
const CLOSED: OpenMenu = {kind: 'none', anchor: null};

// cada menú sale del botón que lo abre; el de ordenar marca la opción actual con su palomita (Apple, «Menus»)
const MenuKinds = () => {
    const {t} = useToolkitTranslation('catalog');
    const [openMenu, setOpenMenu] = useState<OpenMenu>(CLOSED);
    const [sortField, setSortField] = useState('date');

    const openFrom = (kind: OpenMenu['kind']) => (event: MouseEvent<HTMLElement>) => setOpenMenu({kind, anchor: event.currentTarget});
    const close = () => setOpenMenu(CLOSED);
    const isOpen = (kind: OpenMenu['kind']) => openMenu.kind === kind;

    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
            <Button variant="outlined" onClick={openFrom('actions')} aria-haspopup="menu" aria-expanded={isOpen('actions')}>
                {t('overlays.menus.more')}
            </Button>
            <Button variant="outlined" onClick={openFrom('sort')} aria-haspopup="menu" aria-expanded={isOpen('sort')}>
                {t('overlays.menus.sortedBy', {field: t(`inputs.select.fields.${sortField}`)})}
            </Button>
            <Button variant="outlined" onClick={openFrom('popover')} aria-expanded={isOpen('popover')}>{t('overlays.menus.whatIsThis')}</Button>

            <Menu anchorEl={openMenu.anchor} open={isOpen('actions')} onClose={close}>
                <MenuItem onClick={close}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>{t('samples.edit')}</MenuItem>
                <MenuItem onClick={close}><ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>{t('samples.share')}</MenuItem>
                <MenuItem onClick={close}><ListItemIcon><ArchiveOutlinedIcon fontSize="small" /></ListItemIcon>{t('samples.archive')}</MenuItem>
                <Divider />
                {/* lo que borra va al final, separado y en rojo */}
                <MenuItem onClick={close} sx={{color: 'error.main'}}>
                    <ListItemIcon sx={{color: 'inherit'}}><DeleteOutlineIcon fontSize="small" /></ListItemIcon>{t('samples.delete')}
                </MenuItem>
            </Menu>
            <Menu anchorEl={openMenu.anchor} open={isOpen('sort')} onClose={close}>
                {SORT_FIELDS.map((field) => (
                    <MenuItem key={field} selected={field === sortField} onClick={() => {
                        setSortField(field);
                        close();
                    }}>
                        {t(`inputs.select.fields.${field}`)}
                    </MenuItem>
                ))}
            </Menu>
            <Popover anchorEl={openMenu.anchor} open={isOpen('popover')} onClose={close} anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}>
                <Box sx={{p: 2, maxWidth: 280}}>
                    <Typography variant="subtitle2" sx={{mb: 0.5}}>{t('overlays.menus.popoverTitle')}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('overlays.menus.popoverText')}</Typography>
                </Box>
            </Popover>
        </Stack>
    );
};

export default MenuKinds;
