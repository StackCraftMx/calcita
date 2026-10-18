import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, {timelineItemClasses} from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// Los pasos de un pedido de ejemplo, con su hora (de mentira), su ícono y su color. El color es información: verde lo que
// terminó bien.
const ORDER_STEPS = [
    {key: 'created', time: '09:12', Icon: ShoppingCartOutlinedIcon, color: 'grey'},
    {key: 'paid', time: '09:15', Icon: PaymentsOutlinedIcon, color: 'primary'},
    {key: 'packed', time: '13:40', Icon: Inventory2OutlinedIcon, color: 'info'},
    {key: 'shipped', time: '16:05', Icon: LocalShippingOutlinedIcon, color: 'info'},
    {key: 'delivered', time: '18:30', Icon: CheckCircleOutlineIcon, color: 'success'},
] as const;

const LEFT_ALIGNED_SX = {p: 0, m: 0, [`& .${timelineItemClasses.root}:before`]: {flex: 0, padding: 0}};
const TIMELINE_WIDTH = 360;

const DetailedTimelines = () => {
    const {t} = useToolkitTranslation('catalog');
    const isLast = (index: number) => index === ORDER_STEPS.length - 1;

    return (
        <Stack direction="row" spacing={4} useFlexGap sx={{flexWrap: 'wrap'}}>
            {/* la hora del otro lado del punto */}
            <Timeline sx={{width: TIMELINE_WIDTH, m: 0}}>
                {ORDER_STEPS.map(({key, time}, index) => (
                    <TimelineItem key={key}>
                        <TimelineOppositeContent color="text.secondary" sx={{flex: 0.3}}>{time}</TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot color="primary" variant={isLast(index) ? 'filled' : 'outlined'} />
                            {!isLast(index) && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>{t(`timeline.steps.${key}`)}</TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
            {/* el ícono de cada paso dentro de su punto, del color de lo que pasó */}
            <Timeline sx={{...LEFT_ALIGNED_SX, width: TIMELINE_WIDTH}}>
                {ORDER_STEPS.map(({key, time, Icon, color}, index) => (
                    <TimelineItem key={key}>
                        <TimelineSeparator>
                            <TimelineDot color={color}><Icon fontSize="small" /></TimelineDot>
                            {!isLast(index) && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent sx={{py: 1.5}}>
                            <Typography variant="subtitle2" component="p">{t(`timeline.steps.${key}`)}</Typography>
                            <Typography variant="caption" color="text.secondary">{time}</Typography>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        </Stack>
    );
};

export default DetailedTimelines;
