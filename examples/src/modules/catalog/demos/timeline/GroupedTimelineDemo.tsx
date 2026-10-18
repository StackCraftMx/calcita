import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {GroupedTimeline, TIMELINE_EMPHASIS} from '@stackcraftmx/calcita/timeline';

// Los pasos de un pedido de ejemplo, con su hora (de mentira), su ícono y su color. El color es información: verde lo que
// terminó bien.
const ORDER_STEPS = [
    {key: 'created', time: '09:12', Icon: ShoppingCartOutlinedIcon, color: 'grey'},
    {key: 'paid', time: '09:15', Icon: PaymentsOutlinedIcon, color: 'primary'},
    {key: 'packed', time: '13:40', Icon: Inventory2OutlinedIcon, color: 'info'},
    {key: 'shipped', time: '16:05', Icon: LocalShippingOutlinedIcon, color: 'info'},
    {key: 'delivered', time: '18:30', Icon: CheckCircleOutlineIcon, color: 'success'},
] as const;

const TIMELINE_MAX_WIDTH = 560;

// El historial de un pedido agrupado por intento de entrega: el vigente resaltado y el anterior apagado y plegado, para
// que lo viejo no obligue a bajar.
const GroupedTimelineDemo = () => {
    const {t} = useToolkitTranslation('catalog');
    const stepsAsItems = (steps: ReadonlyArray<(typeof ORDER_STEPS)[number]>) => steps.map(({key, time, Icon, color}) => (
        {key, icon: Icon, tone: color, title: t(`timeline.steps.${key}`), timestamp: time}
    ));

    const groups = [
        {key: 'order', title: t('timeline.framework.orderGroup'), items: stepsAsItems(ORDER_STEPS.slice(0, 3))},
        {
            key: 'attempt-2',
            title: t('timeline.framework.attempt', {number: 2}),
            badge: t('timeline.framework.current'),
            emphasis: TIMELINE_EMPHASIS.highlighted,
            items: stepsAsItems(ORDER_STEPS.slice(3)),
        },
        {
            key: 'attempt-1',
            title: t('timeline.framework.attempt', {number: 1}),
            summary: t('timeline.framework.eventsSummary', {count: 2}),
            emphasis: TIMELINE_EMPHASIS.muted,
            isCollapsible: true,
            defaultExpanded: false,
            items: [
                {key: 'shipped-1', icon: LocalShippingOutlinedIcon, tone: 'info', title: t('timeline.steps.shipped'), timestamp: t('timeline.framework.yesterday', {time: '15:50'})},
                {
                    key: 'failed-1', icon: ReportProblemOutlinedIcon, tone: 'warning', title: t('timeline.steps.failed'),
                    timestamp: t('timeline.framework.yesterday', {time: '19:10'}),
                    details: <Typography variant="body2" color="text.secondary">{t('timeline.framework.failedNote')}</Typography>,
                },
            ],
        },
    ];

    return (
        <Box sx={{maxWidth: TIMELINE_MAX_WIDTH}}>
            <GroupedTimeline groups={groups} />
        </Box>
    );
};

export default GroupedTimelineDemo;
