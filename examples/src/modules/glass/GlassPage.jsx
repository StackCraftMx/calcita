// Ejemplo del vidrio líquido del tema (createToolkitTheme({glass: true})): el botón de vidrio de la barra lo prende y lo
// apaga para comparar.
//
// Lo que se ve aquí:
//   - una escena con mucho color y letras (el caso difícil para leer sobre vidrio) con lo que flota encima: GlassPanel con
//     botones como los de un mapa y con ajustes rápidos, la barra de pestañas de teléfono (BottomNavigation) y el botón
//     flotante (Fab); el fondo de la escena es FIJO: al deslizar la página, el vidrio pasa por
//     encima de las letras y se nota moverse;
//   - los controles con su gota: pestañas, botones de opción, botones en píldora, interruptor y deslizador;
//   - lo que se abre encima: diálogo, menú, tooltip, avisos, la lista de un Autocomplete y la hoja de lectura
//     (ContentDialog), que se queda sólida a propósito.
// Nada de esto sabe del vidrio: es MUI normal y componentes del framework. El tema hace todo.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import {
    ConfirmDialog, ContentDialog, GLASS_PANEL_RADIUS_PIXELS, fixedBackgroundLayerOf, GlassPanel, PageHeading, STACKCRAFT, SectionCard, isGlassTheme, toastError, toastSuccess,
    useToolkitTranslation,
} from '@stackcraftmx/calcita';

// las ciudades de la lista de ejemplo (datos de mentira)
const CITIES = Object.freeze(['Ciudad de México', 'Guadalajara', 'Mérida', 'Monterrey', 'Puebla', 'Querétaro']);
// lo que miden la escena y sus paneles
const SCENE_HEIGHT = {xs: 560, md: 440};
const SCENE_EDGE_SPACING = 2;
const QUICK_SETTINGS_WIDTH = 240;
// lo que ocupa la columna de botones del mapa con sus márgenes: los ajustes rápidos no se le encima en el teléfono
const MAP_BUTTONS_COLUMN_PIXELS = 96;
const BOTTOM_NAVIGATION_MAX_WIDTH = 420;
// el botón flotante va arriba de la barra de pestañas (64 px de alto más sus márgenes)
const FAB_ABOVE_NAVIGATION_SPACING = 12;
const INITIAL_BRIGHTNESS = 60;
const INITIAL_VOLUME = 35;

// el fondo de la escena: manchas fuertes de los colores de la marca (con vidrio, se deben ver desenfocadas detrás). Van
// en toda la ventana porque el fondo es fijo: la escena enseña el pedazo que le toca según dónde esté al deslizar
const SCENE_BACKGROUND = [
    `radial-gradient(30% 45% at 12% 20%, ${STACKCRAFT.forge} 0%, transparent 70%)`,
    `radial-gradient(28% 40% at 88% 25%, ${STACKCRAFT.spark} 0%, transparent 70%)`,
    `radial-gradient(35% 45% at 60% 80%, ${STACKCRAFT.ember} 0%, transparent 70%)`,
    `radial-gradient(25% 35% at 35% 55%, ${STACKCRAFT.cloud} 0%, transparent 70%)`,
    `radial-gradient(25% 35% at 80% 60%, ${STACKCRAFT.forge} 0%, transparent 70%)`,
].join(', ');
// el mosaico de la palabra del fondo (px): dos palabras por mosaico, una clara y una oscura
const SCENE_WORD_TILE = Object.freeze({width: 260, height: 130});

/**
 * Las letras grandes del fondo de la escena, como un dibujo (SVG) que se repite. Van en el FONDO y no como texto encima:
 * con el fondo fijo (background-attachment: fixed) se quedan quietas mientras la escena y su vidrio se deslizan por
 * encima, y así se nota el vidrio moverse (lo pidió el autor). Con ellas también se ve si el texto de encima se lee.
 *
 * @param {string} word la palabra ya traducida
 * @returns {string} el valor para background-image
 */
function sceneWordsPatternOf(word) {
    // la palabra viene de los textos de la app; se le quita lo que rompería el dibujo
    const safeWord = word.replace(/[<>&"]/g, '');
    const {width, height} = SCENE_WORD_TILE;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
        + `<g transform="rotate(-10 ${width / 2} ${height / 2})" font-family="system-ui, sans-serif" font-size="48" font-weight="800">`
        + `<text x="8" y="56" fill="rgba(255,255,255,0.6)">${safeWord}</text>`
        + `<text x="120" y="118" fill="rgba(10,10,10,0.4)">${safeWord}</text>`
        + '</g></svg>';
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** La escena: el fondo de color y lo que flota encima. */
const GlassScene = () => {
    const {t} = useToolkitTranslation('glass');
    const [brightness, setBrightness] = useState(INITIAL_BRIGHTNESS);
    const [isAirplaneMode, setIsAirplaneMode] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const mapButtons = [
        {key: 'zoomIn', Icon: AddIcon},
        {key: 'zoomOut', Icon: RemoveIcon},
        {key: 'layers', Icon: LayersOutlinedIcon},
        {key: 'myLocation', Icon: MyLocationIcon},
    ];

    return (
        <Box sx={{
            position: 'relative', overflow: 'hidden', height: SCENE_HEIGHT, borderRadius: `${GLASS_PANEL_RADIUS_PIXELS}px`,
            // el fondo, fijo a la ventana también en el iPhone (fixedBackgroundLayerOf): la escena y su vidrio pasan por encima
            ...fixedBackgroundLayerOf(
                {backgroundColor: STACKCRAFT.slateNavy, backgroundImage: `${sceneWordsPatternOf(t('scene.word'))}, ${SCENE_BACKGROUND}`},
                {clipPath: `inset(0 round ${GLASS_PANEL_RADIUS_PIXELS}px)`},
            ),
        }}>

            <GlassPanel sx={{position: 'absolute', top: (theme) => theme.spacing(SCENE_EDGE_SPACING), left: (theme) => theme.spacing(SCENE_EDGE_SPACING), p: 0.5}}>
                <Stack>
                    {mapButtons.map(({key, Icon}) => (
                        <Tooltip key={key} title={t(`scene.${key}`)} placement="right">
                            <IconButton aria-label={t(`scene.${key}`)}><Icon /></IconButton>
                        </Tooltip>
                    ))}
                </Stack>
            </GlassPanel>

            <GlassPanel component="section" aria-label={t('scene.quickSettings')}
                        sx={{position: 'absolute', top: (theme) => theme.spacing(SCENE_EDGE_SPACING), right: (theme) => theme.spacing(SCENE_EDGE_SPACING),
                             width: QUICK_SETTINGS_WIDTH, maxWidth: `calc(100% - ${MAP_BUTTONS_COLUMN_PIXELS}px)`, p: 2}}>
                <Typography variant="subtitle2" component="h3">{t('scene.quickSettings')}</Typography>
                <Typography variant="caption" color="text.secondary" id="glass-brightness">{t('scene.brightness')}</Typography>
                <Slider size="small" value={brightness} onChange={(event, value) => setBrightness(value)} aria-labelledby="glass-brightness" />
                <FormControlLabel label={t('scene.airplaneMode')}
                                  control={<Switch checked={isAirplaneMode} onChange={(event) => setIsAirplaneMode(event.target.checked)} />} />
            </GlassPanel>

            <Fab color="primary" variant="extended"
                 sx={{position: 'absolute', right: (theme) => theme.spacing(SCENE_EDGE_SPACING), bottom: (theme) => theme.spacing(FAB_ABOVE_NAVIGATION_SPACING)}}>
                <AddIcon sx={{mr: 1}} />
                {t('scene.newItem')}
            </Fab>

            <BottomNavigation showLabels value={activeTab} onChange={(event, value) => setActiveTab(value)}
                              sx={{
                                  position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: (theme) => theme.spacing(SCENE_EDGE_SPACING),
                                  width: (theme) => `min(${BOTTOM_NAVIGATION_MAX_WIDTH}px, calc(100% - ${theme.spacing(SCENE_EDGE_SPACING * 2)}))`,
                              }}>
                <BottomNavigationAction value="home" label={t('scene.tabHome')} icon={<HomeOutlinedIcon />} />
                <BottomNavigationAction value="search" label={t('scene.tabSearch')} icon={<SearchIcon />} />
                <BottomNavigationAction value="alerts" label={t('scene.tabAlerts')} icon={<NotificationsOutlinedIcon />} />
                <BottomNavigationAction value="profile" label={t('scene.tabProfile')} icon={<PersonOutlineIcon />} />
            </BottomNavigation>
        </Box>
    );
};

/** Los controles con su gota, sobre una tarjeta sólida (así se ven en una pantalla normal). */
const GlassControls = () => {
    const {t} = useToolkitTranslation('glass');
    const [period, setPeriod] = useState('week');
    const [view, setView] = useState('list');
    const [wantsNotifications, setWantsNotifications] = useState(true);
    const [volume, setVolume] = useState(INITIAL_VOLUME);

    return (
        <SectionCard title={t('controls.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('controls.text')}</Typography>
            <Stack spacing={2.5}>
                <Tabs value={period} onChange={(event, value) => setPeriod(value)} aria-label={t('controls.periodLabel')}>
                    <Tab value="day" label={t('controls.day')} />
                    <Tab value="week" label={t('controls.week')} />
                    <Tab value="month" label={t('controls.month')} />
                </Tabs>
                <ToggleButtonGroup exclusive size="small" value={view} aria-label={t('controls.viewLabel')}
                                   // quitar la selección no existe: un clic en la opción elegida no la apaga
                                   onChange={(event, value) => value !== null && setView(value)}>
                    <ToggleButton value="list">{t('controls.list')}</ToggleButton>
                    <ToggleButton value="grid">{t('controls.grid')}</ToggleButton>
                    <ToggleButton value="map">{t('controls.map')}</ToggleButton>
                </ToggleButtonGroup>
                <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
                    <Button variant="contained">{t('controls.save')}</Button>
                    <Button variant="outlined">{t('controls.cancel')}</Button>
                    <Button>{t('controls.later')}</Button>
                </Stack>
                <FormControlLabel label={t('controls.notifications')}
                                  control={<Switch checked={wantsNotifications} onChange={(event) => setWantsNotifications(event.target.checked)} />} />
                <Box sx={{maxWidth: 320}}>
                    <Typography variant="caption" color="text.secondary" id="glass-volume">{t('controls.volume')}</Typography>
                    <Slider value={volume} onChange={(event, value) => setVolume(value)} aria-labelledby="glass-volume" />
                </Box>
            </Stack>
        </SectionCard>
    );
};

/** Lo que se abre encima: diálogo, menú, tooltip, avisos, lista de opciones y la hoja de lectura. */
const GlassOverlays = () => {
    const {t} = useToolkitTranslation('glass');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [city, setCity] = useState(null);
    const closeMenu = () => setMenuAnchor(null);

    const archive = () => {
        setIsDialogOpen(false);
        toastSuccess(t('overlays.dialogDone'));
    };

    return (
        <SectionCard title={t('overlays.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('overlays.text')}</Typography>
            <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center', mb: 2}}>
                <Button variant="outlined" onClick={() => setIsDialogOpen(true)}>{t('overlays.openDialog')}</Button>
                <Button variant="outlined" aria-haspopup="menu" aria-expanded={Boolean(menuAnchor)} onClick={(event) => setMenuAnchor(event.currentTarget)}>
                    {t('overlays.openMenu')}
                </Button>
                <Tooltip title={t('overlays.tooltip')}>
                    <Button variant="outlined">{t('overlays.tooltipButton')}</Button>
                </Tooltip>
                <Button variant="outlined" color="success" onClick={() => toastSuccess(t('overlays.toastSuccessMessage'))}>{t('overlays.toastSuccess')}</Button>
                <Button variant="outlined" color="error" onClick={() => toastError(t('overlays.toastErrorMessage'))}>{t('overlays.toastError')}</Button>
                <Button variant="outlined" onClick={() => setIsSheetOpen(true)}>{t('overlays.openSheet')}</Button>
            </Stack>
            <Autocomplete options={CITIES} value={city} onChange={(event, value) => setCity(value)} sx={{maxWidth: 320}}
                          renderInput={(params) => <TextField {...params} label={t('overlays.cityLabel')} />} />

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem onClick={closeMenu}>{t('overlays.menuEdit')}</MenuItem>
                <MenuItem onClick={closeMenu}>{t('overlays.menuDuplicate')}</MenuItem>
                <MenuItem onClick={closeMenu}>{t('overlays.menuArchive')}</MenuItem>
            </Menu>
            <ConfirmDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} onConfirm={archive}
                           title={t('overlays.dialogTitle')} description={t('overlays.dialogDescription')} confirmLabel={t('overlays.dialogConfirm')} />
            <ContentDialog open={isSheetOpen} onClose={() => setIsSheetOpen(false)} title={t('overlays.sheetTitle')}>
                <Typography>{t('overlays.sheetText')}</Typography>
            </ContentDialog>
        </SectionCard>
    );
};

export const GlassPage = () => {
    const {t} = useToolkitTranslation('glass');
    const isGlass = isGlassTheme(useTheme());

    return (
        <>
            <PageHeading title={t('page.title')} description={t('page.subtitle')} />
            <Stack spacing={2}>
                <Alert severity="info">{isGlass ? t('page.reduced') : t('page.off')}</Alert>
                <SectionCard title={t('scene.title')}>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('scene.text')}</Typography>
                    <GlassScene />
                </SectionCard>
                <GlassControls />
                <GlassOverlays />
            </Stack>
        </>
    );
};
