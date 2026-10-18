import {useState} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const BASIC_TABS = ['summary', 'orders', 'invoices'];
const ICON_TABS = [
    {key: 'orders', Icon: ReceiptLongOutlinedIcon},
    {key: 'alerts', Icon: NotificationsNoneIcon},
    {key: 'settings', Icon: SettingsOutlinedIcon},
];
// más pestañas de las que caben: se deslizan con sus flechas
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct'];
const VERTICAL_TABS_HEIGHT = 180;

const TabVariants = () => {
    const {t} = useToolkitTranslation('catalog');
    const [basicTab, setBasicTab] = useState(BASIC_TABS[0]);
    const [iconTab, setIconTab] = useState(ICON_TABS[0].key);
    const [month, setMonth] = useState('sep');
    const [verticalTab, setVerticalTab] = useState(BASIC_TABS[0]);

    return (
        <Stack spacing={3} sx={{minWidth: 0}}>
            <Tabs value={basicTab} onChange={(event, value) => setBasicTab(value)} aria-label={t('navigation.tabs.ariaLabel')}>
                {BASIC_TABS.map((tab) => <Tab key={tab} value={tab} label={t(`navigation.tabs.items.${tab}`)} />)}
                <Tab value="archived" label={t('navigation.tabs.items.archived')} disabled />
            </Tabs>
            <Tabs value={iconTab} onChange={(event, value) => setIconTab(value)} aria-label={t('navigation.tabs.ariaLabel')}>
                {ICON_TABS.map(({key, Icon}) => (
                    <Tab key={key} value={key} icon={<Icon />} iconPosition="start" label={t(`navigation.tabs.items.${key}`)} />
                ))}
            </Tabs>
            <Tabs value={month} onChange={(event, value) => setMonth(value)} variant="scrollable" scrollButtons="auto"
                  aria-label={t('navigation.tabs.months')}>
                {MONTHS.map((monthKey) => <Tab key={monthKey} value={monthKey} label={t(`navigation.tabs.monthNames.${monthKey}`)} />)}
            </Tabs>
            <Box sx={{display: 'flex', height: VERTICAL_TABS_HEIGHT}}>
                <Tabs orientation="vertical" value={verticalTab} onChange={(event, value) => setVerticalTab(value)}
                      aria-label={t('navigation.tabs.ariaLabel')} sx={{borderRight: 1, borderColor: 'divider'}}>
                    {BASIC_TABS.map((tab) => <Tab key={tab} value={tab} label={t(`navigation.tabs.items.${tab}`)} />)}
                </Tabs>
                <Typography sx={{p: 2}} color="text.secondary">{t(`navigation.tabs.items.${verticalTab}`)}</Typography>
            </Box>
        </Stack>
    );
};

export default TabVariants;
