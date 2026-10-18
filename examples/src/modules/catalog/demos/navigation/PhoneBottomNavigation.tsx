import {useState} from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const BOTTOM_TABS = [
    {key: 'home', Icon: HomeOutlinedIcon},
    {key: 'search', Icon: SearchIcon},
    {key: 'alerts', Icon: NotificationsNoneIcon},
    {key: 'profile', Icon: PersonOutlineIcon},
];
const PHONE_WIDTH = 360;

// con vidrio flota encima del contenido y lo elegido va en su gota (Apple, «Tab bars»)
const PhoneBottomNavigation = () => {
    const {t} = useToolkitTranslation('catalog');
    const [bottomTab, setBottomTab] = useState(BOTTOM_TABS[0].key);
    return (
        <Box sx={{width: PHONE_WIDTH, maxWidth: '100%'}}>
            <BottomNavigation showLabels value={bottomTab} onChange={(event, value) => setBottomTab(value)}>
                {BOTTOM_TABS.map(({key, Icon}) => (
                    <BottomNavigationAction key={key} value={key} label={t(`navigation.bottom.items.${key}`)} icon={<Icon />} />
                ))}
            </BottomNavigation>
        </Box>
    );
};

export default PhoneBottomNavigation;
