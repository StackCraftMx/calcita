// Catálogo · línea de tiempo: Timeline de @mui/lab (simple, alternada, con la hora del otro lado y con íconos de colores)
// y GroupedTimeline del framework (/timeline): el historial agrupado por intento, con el vigente resaltado y los
// anteriores apagados y plegados.
//
// Lo renderiza la app: arrow (regla de la casa).
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
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';
import {GroupedTimeline, TIMELINE_EMPHASIS} from '@stackcraftmx/calcita/timeline';

import {ShowcaseSection, Specimen} from '@/modules/catalog/Showcase.jsx';

// los pasos de un pedido de ejemplo, con su hora (de mentira), su ícono y su color: el color es información (verde lo
// que terminó bien, ámbar lo que falló y se reintenta)
const ORDER_STEPS = Object.freeze([
    {key: 'created', time: '09:12', Icon: ShoppingCartOutlinedIcon, color: 'grey'},
    {key: 'paid', time: '09:15', Icon: PaymentsOutlinedIcon, color: 'primary'},
    {key: 'packed', time: '13:40', Icon: Inventory2OutlinedIcon, color: 'info'},
    {key: 'shipped', time: '16:05', Icon: LocalShippingOutlinedIcon, color: 'info'},
    {key: 'delivered', time: '18:30', Icon: CheckCircleOutlineIcon, color: 'success'},
]);
// sin el hueco del lado opuesto: con la línea a la izquierda, el texto ocupa todo el ancho
const LEFT_ALIGNED_TIMELINE_SX = Object.freeze({p: 0, m: 0, [`& .${timelineItemClasses.root}:before`]: {flex: 0, padding: 0}});
const TIMELINE_WIDTH = 360;

export const TimelinePage = () => {
    const {t} = useToolkitTranslation('catalog');
    const stepTitle = (key) => t(`timeline.steps.${key}`);

    // el ejemplo del framework: el intento de entrega vigente resaltado, el anterior apagado y plegado
    const deliveryGroups = [
        {
            key: 'order',
            title: t('timeline.framework.orderGroup'),
            items: ORDER_STEPS.slice(0, 3).map(({key, time, Icon, color}) => ({key, icon: Icon, tone: color, title: stepTitle(key), timestamp: time})),
        },
        {
            key: 'attempt-2',
            title: t('timeline.framework.attempt', {number: 2}),
            badge: t('timeline.framework.current'),
            emphasis: TIMELINE_EMPHASIS.highlighted,
            items: ORDER_STEPS.slice(3).map(({key, time, Icon, color}) => ({key, icon: Icon, tone: color, title: stepTitle(key), timestamp: time})),
        },
        {
            key: 'attempt-1',
            title: t('timeline.framework.attempt', {number: 1}),
            summary: t('timeline.framework.eventsSummary', {count: 2}),
            emphasis: TIMELINE_EMPHASIS.muted,
            isCollapsible: true,
            defaultExpanded: false,
            items: [
                {key: 'shipped-1', icon: LocalShippingOutlinedIcon, tone: 'info', title: stepTitle('shipped'), timestamp: t('timeline.framework.yesterday', {time: '15:50'})},
                {
                    key: 'failed-1', icon: ReportProblemOutlinedIcon, tone: 'warning', title: t('timeline.steps.failed'),
                    timestamp: t('timeline.framework.yesterday', {time: '19:10'}),
                    details: <Typography variant="body2" color="text.secondary">{t('timeline.framework.failedNote')}</Typography>,
                },
            ],
        },
    ];

    return (
        <Stack spacing={3}>
            <PageHeading title={t('timeline.title')} description={t('timeline.description')} />

            <ShowcaseSection title={t('timeline.mui.title')} description={t('timeline.mui.description')}>
                <Specimen label={t('timeline.mui.basic')} code='<Timeline> + TimelineItem:before {flex: 0}'>
                    <Timeline sx={{...LEFT_ALIGNED_TIMELINE_SX, width: TIMELINE_WIDTH}}>
                        {ORDER_STEPS.map(({key}, index) => (
                            <TimelineItem key={key}>
                                <TimelineSeparator>
                                    <TimelineDot />
                                    {index < ORDER_STEPS.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>{stepTitle(key)}</TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </Specimen>
                <Specimen label={t('timeline.mui.alternate')} code='<Timeline position="alternate">'>
                    <Timeline position="alternate" sx={{width: TIMELINE_WIDTH, m: 0}}>
                        {ORDER_STEPS.map(({key}, index) => (
                            <TimelineItem key={key}>
                                <TimelineSeparator>
                                    <TimelineDot variant="outlined" />
                                    {index < ORDER_STEPS.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>{stepTitle(key)}</TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('timeline.detail.title')} description={t('timeline.detail.description')}>
                <Specimen label={t('timeline.detail.opposite')} code="<TimelineOppositeContent>">
                    <Timeline sx={{width: TIMELINE_WIDTH, m: 0}}>
                        {ORDER_STEPS.map(({key, time}, index) => (
                            <TimelineItem key={key}>
                                <TimelineOppositeContent color="text.secondary" sx={{flex: 0.3}}>{time}</TimelineOppositeContent>
                                <TimelineSeparator>
                                    <TimelineDot color="primary" variant={index === ORDER_STEPS.length - 1 ? 'filled' : 'outlined'} />
                                    {index < ORDER_STEPS.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>{stepTitle(key)}</TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </Specimen>
                <Specimen label={t('timeline.detail.icons')} code='<TimelineDot color="success"><…Icon /></TimelineDot>'>
                    <Timeline sx={{...LEFT_ALIGNED_TIMELINE_SX, width: TIMELINE_WIDTH}}>
                        {ORDER_STEPS.map(({key, time, Icon, color}, index) => (
                            <TimelineItem key={key}>
                                <TimelineSeparator>
                                    <TimelineDot color={color}><Icon fontSize="small" /></TimelineDot>
                                    {index < ORDER_STEPS.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent sx={{py: 1.5}}>
                                    <Typography variant="subtitle2" component="p">{stepTitle(key)}</Typography>
                                    <Typography variant="caption" color="text.secondary">{time}</Typography>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('frameworkTitle')} description={t('timeline.framework.description')}>
                <Specimen wide label="GroupedTimeline" code="<GroupedTimeline groups={[{key, title, badge, emphasis, isCollapsible, items}]} />">
                    <Stack sx={{width: '100%', maxWidth: 560}}>
                        <GroupedTimeline groups={deliveryGroups} />
                    </Stack>
                </Specimen>
            </ShowcaseSection>
        </Stack>
    );
};
