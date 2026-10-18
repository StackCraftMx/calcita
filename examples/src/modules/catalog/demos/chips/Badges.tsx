import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const BADGE_COLORS = ['primary', 'secondary', 'error', 'success'] as const;
const UNREAD_MESSAGES = 4;
// un número grande para ver el tope (99+)
const PENDING_NOTIFICATIONS = 120;

// el número va también en el aria-label: el lector de pantalla no lee la insignia sola
const Badges = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
            {BADGE_COLORS.map((color) => (
                <IconButton key={color} aria-label={t('chips.badges.messages', {count: UNREAD_MESSAGES})}>
                    <Badge badgeContent={UNREAD_MESSAGES} color={color}><MailOutlineIcon /></Badge>
                </IconButton>
            ))}
            <IconButton aria-label={t('chips.badges.messages', {count: PENDING_NOTIFICATIONS})}>
                <Badge badgeContent={PENDING_NOTIFICATIONS} max={99} color="error"><NotificationsNoneIcon /></Badge>
            </IconButton>
            <IconButton aria-label={t('chips.badges.news')}>
                <Badge variant="dot" color="error"><NotificationsNoneIcon /></Badge>
            </IconButton>
        </Stack>
    );
};

export default Badges;
