// Catálogo · diálogos y menús: lo que se abre encima del contenido. Diálogo simple, confirmación (ConfirmDialog del
// framework, también la que borra), con formulario, con contenido largo, la hoja de lectura (ContentDialog), la hoja de
// abajo y el panel de la derecha (Drawer); menús con íconos y con la opción actual; la ventanita (Popover) y los tooltips.
//
// Con el vidrio del tema (HIG de Apple): todo esto flota de vidrio; los diálogos llevan «Cancelar» a la izquierda y la
// acción a la derecha (HIG «Alerts»), los cajones flotan separados de la orilla (Adopting Liquid Glass: «half sheets are
// inset») y el menú marca la opción actual con su palomita (HIG «Menus»). La hoja de lectura se queda sólida: es para leer.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ShareIcon from '@mui/icons-material/Share';
import {ConfirmDialog, ContentDialog, PageHeading, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';

import {ShowcaseSection, Specimen} from '@/modules/catalog/Showcase.jsx';

// qué diálogo o cajón está abierto (uno a la vez: HIG «Sheets», «Display only one sheet at a time»)
const OPEN_LAYER = Object.freeze({
    none: 'none',
    simple: 'simple',
    confirm: 'confirm',
    destructive: 'destructive',
    form: 'form',
    long: 'long',
    reading: 'reading',
    bottomSheet: 'bottomSheet',
    sidePanel: 'sidePanel',
});
// los menús que se pueden abrir, cada uno con su botón
const OPEN_MENU = Object.freeze({none: 'none', actions: 'actions', sort: 'sort', popover: 'popover'});
const SORT_FIELDS = Object.freeze(['date', 'amount', 'customer']);
const TOOLTIP_PLACEMENTS = Object.freeze(['top', 'right', 'bottom', 'left']);
// cuántos párrafos lleva el diálogo de contenido largo: los justos para que se deslice por dentro
const LONG_CONTENT_PARAGRAPHS = 8;
// lo ancho del panel de la derecha
const SIDE_PANEL_WIDTH = 320;

export const OverlaysPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const [openLayer, setOpenLayer] = useState(OPEN_LAYER.none);
    const [openMenu, setOpenMenu] = useState({kind: OPEN_MENU.none, anchor: null});
    const [sortField, setSortField] = useState('date');
    const [nickname, setNickname] = useState('');

    const close = () => setOpenLayer(OPEN_LAYER.none);
    const openMenuFrom = (kind) => (event) => setOpenMenu({kind, anchor: event.currentTarget});
    const closeMenu = () => setOpenMenu({kind: OPEN_MENU.none, anchor: null});
    const isMenuOpen = (kind) => openMenu.kind === kind;
    // lo que hace cada opción del ejemplo: avisa y cierra (en una app de verdad, la acción)
    const confirmAndClose = (message) => {
        toastSuccess(message);
        close();
    };

    const dialogButtons = [
        {layer: OPEN_LAYER.simple, code: '<Dialog>'},
        {layer: OPEN_LAYER.confirm, code: '<ConfirmDialog />'},
        {layer: OPEN_LAYER.destructive, code: '<ConfirmDialog tone="error" />'},
        {layer: OPEN_LAYER.form, code: '<Dialog> + <TextField />'},
        {layer: OPEN_LAYER.long, code: 'scroll="paper"'},
        {layer: OPEN_LAYER.reading, code: '<ContentDialog />'},
    ];
    const sheetButtons = [
        {layer: OPEN_LAYER.bottomSheet, code: '<Drawer anchor="bottom">'},
        {layer: OPEN_LAYER.sidePanel, code: '<Drawer anchor="right">'},
    ];
    const shareTargets = [
        {key: 'copyLink', Icon: LinkIcon},
        {key: 'email', Icon: MailOutlineIcon},
        {key: 'duplicate', Icon: ContentCopyIcon},
    ];

    return (
        <Stack spacing={3}>
            <PageHeading title={t('overlays.title')} description={t('overlays.description')} />

            <ShowcaseSection title={t('overlays.dialogs.title')} description={t('overlays.dialogs.description')}>
                {dialogButtons.map(({layer, code}) => (
                    <Specimen key={layer} label={t(`overlays.dialogs.kinds.${layer}`)} code={code}>
                        <Button variant="outlined" onClick={() => setOpenLayer(layer)}>{t('overlays.open')}</Button>
                    </Specimen>
                ))}
            </ShowcaseSection>

            <ShowcaseSection title={t('overlays.sheets.title')} description={t('overlays.sheets.description')}>
                {sheetButtons.map(({layer, code}) => (
                    <Specimen key={layer} label={t(`overlays.sheets.kinds.${layer}`)} code={code}>
                        <Button variant="outlined" onClick={() => setOpenLayer(layer)}>{t('overlays.open')}</Button>
                    </Specimen>
                ))}
            </ShowcaseSection>

            <ShowcaseSection title={t('overlays.menus.title')} description={t('overlays.menus.description')}>
                <Specimen label={t('overlays.menus.actions')} code="<Menu> <MenuItem><ListItemIcon />…">
                    <Button variant="outlined" onClick={openMenuFrom(OPEN_MENU.actions)} aria-haspopup="menu"
                            aria-expanded={isMenuOpen(OPEN_MENU.actions)}>{t('overlays.menus.more')}</Button>
                </Specimen>
                <Specimen label={t('overlays.menus.current')} code="<MenuItem selected>">
                    <Button variant="outlined" onClick={openMenuFrom(OPEN_MENU.sort)} aria-haspopup="menu" aria-expanded={isMenuOpen(OPEN_MENU.sort)}>
                        {t('overlays.menus.sortedBy', {field: t(`inputs.select.fields.${sortField}`)})}
                    </Button>
                </Specimen>
                <Specimen label="Popover" code="<Popover anchorEl={…}>">
                    <Button variant="outlined" onClick={openMenuFrom(OPEN_MENU.popover)} aria-expanded={isMenuOpen(OPEN_MENU.popover)}>
                        {t('overlays.menus.whatIsThis')}
                    </Button>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('overlays.tooltips.title')} description={t('overlays.tooltips.description')}>
                {TOOLTIP_PLACEMENTS.map((placement) => (
                    <Specimen key={placement} label={t(`overlays.tooltips.placements.${placement}`)} code={`placement="${placement}"`}>
                        <Tooltip title={t('overlays.tooltips.sample')} placement={placement}><Button variant="text">{t('overlays.tooltips.hover')}</Button></Tooltip>
                    </Specimen>
                ))}
                <Specimen label={t('overlays.tooltips.arrow')} code="arrow">
                    <Tooltip title={t('overlays.tooltips.sample')} arrow><Button variant="text">{t('overlays.tooltips.hover')}</Button></Tooltip>
                </Specimen>
            </ShowcaseSection>

            {/* los diálogos: uno a la vez */}
            <Dialog open={openLayer === OPEN_LAYER.simple} onClose={close} aria-labelledby="catalog-simple-dialog-title">
                <DialogTitle id="catalog-simple-dialog-title">{t('overlays.dialogs.simpleTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('overlays.dialogs.simpleText')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>{t('samples.cancel')}</Button>
                    <Button variant="contained" onClick={() => confirmAndClose(t('overlays.dialogs.published'))}>{t('samples.publish')}</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog open={openLayer === OPEN_LAYER.confirm} title={t('overlays.dialogs.confirmTitle')} description={t('overlays.dialogs.confirmText')}
                           confirmLabel={t('samples.send')} onConfirm={() => confirmAndClose(t('overlays.dialogs.sent'))} onClose={close} />
            <ConfirmDialog open={openLayer === OPEN_LAYER.destructive} tone="error" title={t('overlays.dialogs.destructiveTitle')}
                           description={t('overlays.dialogs.destructiveText')} confirmLabel={t('samples.delete')}
                           onConfirm={() => confirmAndClose(t('overlays.dialogs.deleted'))} onClose={close} />

            <Dialog open={openLayer === OPEN_LAYER.form} onClose={close} aria-labelledby="catalog-form-dialog-title" fullWidth maxWidth="xs">
                <DialogTitle id="catalog-form-dialog-title">{t('overlays.dialogs.formTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2}}>{t('overlays.dialogs.formText')}</DialogContentText>
                    <TextField autoFocus fullWidth label={t('overlays.dialogs.nickname')} value={nickname} onChange={(event) => setNickname(event.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>{t('samples.cancel')}</Button>
                    <Button variant="contained" disabled={!nickname.trim()} onClick={() => confirmAndClose(t('overlays.dialogs.saved'))}>{t('samples.save')}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openLayer === OPEN_LAYER.long} onClose={close} scroll="paper" aria-labelledby="catalog-long-dialog-title">
                <DialogTitle id="catalog-long-dialog-title">{t('overlays.dialogs.longTitle')}</DialogTitle>
                <DialogContent dividers>
                    {Array.from({length: LONG_CONTENT_PARAGRAPHS}, (unused, index) => (
                        <DialogContentText key={index} sx={{mb: 2}}>{t('overlays.dialogs.longParagraph', {number: index + 1})}</DialogContentText>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>{t('samples.cancel')}</Button>
                    <Button variant="contained" onClick={() => confirmAndClose(t('overlays.dialogs.accepted'))}>{t('samples.accept')}</Button>
                </DialogActions>
            </Dialog>

            <ContentDialog open={openLayer === OPEN_LAYER.reading} onClose={close} title={t('overlays.dialogs.readingTitle')}>
                <Typography sx={{mb: 2}}>{t('overlays.dialogs.readingText')}</Typography>
                {Array.from({length: LONG_CONTENT_PARAGRAPHS}, (unused, index) => (
                    <Typography key={index} color="text.secondary" sx={{mb: 2}}>{t('overlays.dialogs.longParagraph', {number: index + 1})}</Typography>
                ))}
            </ContentDialog>

            {/* los cajones que salen encima: la hoja de abajo (compartir) y el panel de la derecha (filtros) */}
            <Drawer anchor="bottom" open={openLayer === OPEN_LAYER.bottomSheet} onClose={close}>
                <Box sx={{p: 2}}>
                    <Typography variant="subtitle1" component="h2" sx={{fontWeight: 600, mb: 1}}>{t('overlays.sheets.shareTitle')}</Typography>
                    <List disablePadding>
                        {shareTargets.map(({key, Icon}) => (
                            <ListItemButton key={key} onClick={() => confirmAndClose(t(`overlays.sheets.shared.${key}`))} sx={{borderRadius: 1.5}}>
                                <ListItemIcon><Icon /></ListItemIcon>
                                <ListItemText primary={t(`overlays.sheets.targets.${key}`)} />
                            </ListItemButton>
                        ))}
                    </List>
                    <Button fullWidth sx={{mt: 1}} onClick={close}>{t('samples.cancel')}</Button>
                </Box>
            </Drawer>
            <Drawer anchor="right" open={openLayer === OPEN_LAYER.sidePanel} onClose={close} slotProps={{paper: {sx: {width: SIDE_PANEL_WIDTH}}}}>
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

            {/* los menús y la ventanita */}
            <Menu anchorEl={openMenu.anchor} open={isMenuOpen(OPEN_MENU.actions)} onClose={closeMenu}>
                <MenuItem onClick={closeMenu}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>{t('samples.edit')}</MenuItem>
                <MenuItem onClick={closeMenu}><ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>{t('samples.share')}</MenuItem>
                <MenuItem onClick={closeMenu}><ListItemIcon><ArchiveOutlinedIcon fontSize="small" /></ListItemIcon>{t('samples.archive')}</MenuItem>
                <Divider />
                <MenuItem onClick={closeMenu} sx={{color: 'error.main'}}>
                    <ListItemIcon sx={{color: 'inherit'}}><DeleteOutlineIcon fontSize="small" /></ListItemIcon>{t('samples.delete')}
                </MenuItem>
            </Menu>
            <Menu anchorEl={openMenu.anchor} open={isMenuOpen(OPEN_MENU.sort)} onClose={closeMenu}>
                {SORT_FIELDS.map((field) => (
                    <MenuItem key={field} selected={field === sortField} onClick={() => {
                        setSortField(field);
                        closeMenu();
                    }}>
                        {t(`inputs.select.fields.${field}`)}
                    </MenuItem>
                ))}
            </Menu>
            <Popover anchorEl={openMenu.anchor} open={isMenuOpen(OPEN_MENU.popover)} onClose={closeMenu}
                     anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}>
                <Box sx={{p: 2, maxWidth: 280}}>
                    <Typography variant="subtitle2" sx={{mb: 0.5}}>{t('overlays.menus.popoverTitle')}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('overlays.menus.popoverText')}</Typography>
                </Box>
            </Popover>
        </Stack>
    );
};
