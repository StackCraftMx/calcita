import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// la barra sí es vidrio con el tema: es navegación, no contenido
const TopAppBar = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Box sx={{borderRadius: 3, overflow: 'hidden'}}>
            <AppBar position="static">
                <Toolbar sx={{gap: 1}}>
                    <IconButton edge="start" color="inherit" aria-label={t('surfaces.appBar.menu')}><MenuIcon /></IconButton>
                    <Typography variant="h6" component="p" sx={{flexGrow: 1}}>{t('surfaces.appBar.sampleTitle')}</Typography>
                    <IconButton color="inherit" aria-label={t('samples.search')}><SearchIcon /></IconButton>
                    <IconButton edge="end" color="inherit" aria-label={t('samples.more')}><MoreVertIcon /></IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default TopAppBar;
