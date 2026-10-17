// Catálogo · superficies y texto: Paper (con sombra y con borde), Card, las tarjetas del framework (MetricCard, GlassPanel),
// el acordeón, la barra (AppBar), las listas, la tabla de MUI (Table), los divisores y la escala de texto (Typography).
//
// Con el vidrio del tema (HIG de Apple, «Materials»): el contenido NO lleva el vidrio de los controles; con «También en las
// tarjetas» (glass: {surfaces: true}) lleva material, esmerilado y sin brillo de borde: Paper con borde, Card y el acordeón.
// Las de sombra se quedan sólidas. La barra sí es vidrio: es navegación.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {
    GlassPanel, MetricCard, PageHeading, STACKCRAFT, TREND_DIRECTION, fixedBackgroundLayerOf, formatCurrency, initialsOf, useToolkitTranslation,
} from '@stackcraftmx/calcita';

import {ShowcaseSection, Specimen} from '@/modules/catalog/Showcase.jsx';

// las sombras que se comparan (MUI va de 0 a 24)
const PAPER_ELEVATIONS = Object.freeze([0, 1, 4, 8]);
// lo que mide cada tarjeta de muestra
const SPECIMEN_CARD_WIDTH = 220;
const SPECIMEN_CARD_HEIGHT = 96;
const WIDE_CARD_WIDTH = 320;
const ACCORDION_PANELS = Object.freeze(['shipping', 'returns', 'invoices']);
const FOLDERS = Object.freeze([
    {key: 'inbox', Icon: InboxOutlinedIcon},
    {key: 'drafts', Icon: DraftsOutlinedIcon},
    {key: 'sent', Icon: SendOutlinedIcon},
]);
// personas y pedidos de mentira para la lista y la tabla (el importe en centavos, como lo manda el API)
const SAMPLE_CONTACTS = Object.freeze(['Ana Martínez', 'Luis Herrera', 'Mónica Vega']);
const SAMPLE_ORDER_LINES = Object.freeze([
    {product: 'Silla de oficina', quantity: 2, cents: 980000},
    {product: 'Lámpara de escritorio', quantity: 1, cents: 68990},
    {product: 'Teclado inalámbrico', quantity: 3, cents: 269835},
]);
const CENTS_PER_UNIT = 100;
const TYPOGRAPHY_VARIANTS = Object.freeze(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline', 'button']);
// el fondo de color de la muestra del panel de vidrio: algo que desenfocar. Fijo a la ventana (fixedBackgroundLayerOf,
// también en el iPhone): al deslizar, el panel pasa por encima del color y se nota el vidrio moverse
const GLASS_SCENE_BACKGROUND = `linear-gradient(135deg, ${STACKCRAFT.forge}, ${STACKCRAFT.slateNavy})`;
const GLASS_SCENE_HEIGHT = 140;
const GLASS_SCENE_RADIUS_PIXELS = 24;

export const SurfacesPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const [expandedPanel, setExpandedPanel] = useState(ACCORDION_PANELS[0]);
    const [selectedFolder, setSelectedFolder] = useState(FOLDERS[0].key);

    const totalCents = SAMPLE_ORDER_LINES.reduce((sum, line) => sum + line.cents, 0);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('surfaces.title')} description={t('surfaces.description')} />

            <ShowcaseSection title={t('surfaces.paper.title')} description={t('surfaces.paper.description')}>
                {PAPER_ELEVATIONS.map((elevation) => (
                    <Specimen key={elevation} label={t('surfaces.paper.elevation', {elevation})} code={`<Paper elevation={${elevation}}>`}>
                        <Paper elevation={elevation} sx={{width: SPECIMEN_CARD_WIDTH, height: SPECIMEN_CARD_HEIGHT}} />
                    </Specimen>
                ))}
                <Specimen label={t('variants.outlined')} code='<Paper variant="outlined">'>
                    <Paper variant="outlined" sx={{width: SPECIMEN_CARD_WIDTH, height: SPECIMEN_CARD_HEIGHT}} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('surfaces.card.title')} description={t('surfaces.card.description')}>
                <Specimen label="Card" code="<Card><CardHeader /><CardContent /><CardActions /></Card>">
                    <Card sx={{width: WIDE_CARD_WIDTH}}>
                        <CardHeader avatar={<Avatar>{initialsOf(SAMPLE_CONTACTS[0])}</Avatar>} title={SAMPLE_CONTACTS[0]} subheader={t('surfaces.card.subheader')}
                                    action={<IconButton aria-label={t('samples.more')}><MoreVertIcon /></IconButton>} />
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">{t('surfaces.card.body')}</Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small">{t('samples.reply')}</Button>
                            <Button size="small" variant="contained">{t('samples.view')}</Button>
                        </CardActions>
                    </Card>
                </Specimen>
                <Specimen label="MetricCard" code="<MetricCard label value trend={{label, direction, isGood}} />">
                    <Box sx={{width: SPECIMEN_CARD_WIDTH}}>
                        <MetricCard label={t('surfaces.card.metricLabel')} value={formatCurrency(870822.7)}
                                    trend={{label: '+4.4 %', direction: TREND_DIRECTION.up, isGood: true}} />
                    </Box>
                </Specimen>
                <Specimen label="GlassPanel" code="<GlassPanel>…</GlassPanel>">
                    <Box sx={{
                        width: WIDE_CARD_WIDTH, height: GLASS_SCENE_HEIGHT, borderRadius: `${GLASS_SCENE_RADIUS_PIXELS}px`, p: 2, display: 'flex',
                        alignItems: 'flex-end',
                        ...fixedBackgroundLayerOf({backgroundImage: GLASS_SCENE_BACKGROUND}, {clipPath: `inset(0 round ${GLASS_SCENE_RADIUS_PIXELS}px)`}),
                    }}>
                        <GlassPanel sx={{p: 1.5}}>
                            <Typography variant="subtitle2">{t('surfaces.card.glassPanel')}</Typography>
                        </GlassPanel>
                    </Box>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('surfaces.accordion.title')} description={t('surfaces.accordion.description')}>
                <Specimen wide label="Accordion" code="<Accordion expanded={…}><AccordionSummary /><AccordionDetails /></Accordion>">
                    <Box sx={{width: '100%'}}>
                        {ACCORDION_PANELS.map((panel) => (
                            <Accordion key={panel} expanded={expandedPanel === panel} onChange={(event, isExpanded) => setExpandedPanel(isExpanded ? panel : null)}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography sx={{fontWeight: 600}}>{t(`surfaces.accordion.panels.${panel}.title`)}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body2" color="text.secondary">{t(`surfaces.accordion.panels.${panel}.text`)}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                        <Accordion disabled>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>{t('surfaces.accordion.disabled')}</Typography></AccordionSummary>
                        </Accordion>
                    </Box>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('surfaces.appBar.title')} description={t('surfaces.appBar.description')}>
                <Specimen wide label="AppBar" code='<AppBar position="static"><Toolbar />'>
                    <Box sx={{width: '100%', borderRadius: 3, overflow: 'hidden'}}>
                        <AppBar position="static">
                            <Toolbar sx={{gap: 1}}>
                                <IconButton edge="start" color="inherit" aria-label={t('surfaces.appBar.menu')}><MenuIcon /></IconButton>
                                <Typography variant="h6" component="p" sx={{flexGrow: 1}}>{t('surfaces.appBar.sampleTitle')}</Typography>
                                <IconButton color="inherit" aria-label={t('samples.search')}><SearchIcon /></IconButton>
                                <IconButton edge="end" color="inherit" aria-label={t('samples.more')}><MoreVertIcon /></IconButton>
                            </Toolbar>
                        </AppBar>
                    </Box>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('surfaces.lists.title')} description={t('surfaces.lists.description')}>
                <Specimen label={t('surfaces.lists.navigation')} code="<ListItemButton selected={…}>">
                    <List sx={{width: SPECIMEN_CARD_WIDTH}} subheader={<ListSubheader disableSticky sx={{bgcolor: 'transparent'}}>{t('surfaces.lists.mailboxes')}</ListSubheader>}>
                        {FOLDERS.map(({key, Icon}) => (
                            <ListItemButton key={key} selected={selectedFolder === key} onClick={() => setSelectedFolder(key)} sx={{borderRadius: 1.5}}>
                                <ListItemIcon><Icon /></ListItemIcon>
                                <ListItemText primary={t(`surfaces.lists.folders.${key}`)} />
                            </ListItemButton>
                        ))}
                    </List>
                </Specimen>
                <Specimen label={t('surfaces.lists.people')} code="<ListItemAvatar /> + secondary + secondaryAction">
                    <List sx={{width: WIDE_CARD_WIDTH}}>
                        {SAMPLE_CONTACTS.map((person) => (
                            <ListItem key={person} disableGutters
                                      secondaryAction={<IconButton edge="end" aria-label={t('samples.deleteNamed', {name: person})}><DeleteOutlineIcon /></IconButton>}>
                                <ListItemAvatar><Avatar>{initialsOf(person)}</Avatar></ListItemAvatar>
                                <ListItemText primary={person} secondary={t('surfaces.lists.lastOrder')} />
                            </ListItem>
                        ))}
                    </List>
                </Specimen>
                <Specimen label={t('surfaces.lists.drillDown')} code="<ListItemButton> + <ChevronRightIcon />">
                    <List dense sx={{width: SPECIMEN_CARD_WIDTH}}>
                        {['profile', 'security', 'preferences'].map((key) => (
                            <ListItemButton key={key} sx={{borderRadius: 1.5}}>
                                <ListItemText primary={t(`surfaces.lists.settings.${key}`)} />
                                <ChevronRightIcon fontSize="small" color="action" aria-hidden />
                            </ListItemButton>
                        ))}
                    </List>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('surfaces.table.title')} description={t('surfaces.table.description')}>
                <Specimen wide label="Table" code='<TableContainer component={Paper} variant="outlined"><Table size="small">'>
                    <TableContainer component={Paper} variant="outlined" sx={{maxWidth: 560}}>
                        <Table size="small" aria-label={t('surfaces.table.ariaLabel')}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('surfaces.table.product')}</TableCell>
                                    <TableCell align="right">{t('surfaces.table.quantity')}</TableCell>
                                    <TableCell align="right">{t('surfaces.table.amount')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {SAMPLE_ORDER_LINES.map((line) => (
                                    <TableRow key={line.product} hover>
                                        <TableCell>{line.product}</TableCell>
                                        <TableCell align="right">{line.quantity}</TableCell>
                                        <TableCell align="right">{formatCurrency(line.cents / CENTS_PER_UNIT)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={2} sx={{fontWeight: 600}}>{t('surfaces.table.total')}</TableCell>
                                    <TableCell align="right" sx={{fontWeight: 600}}>{formatCurrency(totalCents / CENTS_PER_UNIT)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('surfaces.dividers.title')} description={t('surfaces.dividers.description')}>
                <Specimen label={t('surfaces.dividers.horizontal')} code="<Divider />">
                    <Box sx={{width: SPECIMEN_CARD_WIDTH}}>
                        <Typography variant="body2">{t('surfaces.dividers.above')}</Typography>
                        <Divider sx={{my: 1}} />
                        <Typography variant="body2">{t('surfaces.dividers.below')}</Typography>
                    </Box>
                </Specimen>
                <Specimen label={t('surfaces.dividers.withText')} code='<Divider textAlign="center">…</Divider>'>
                    <Box sx={{width: SPECIMEN_CARD_WIDTH}}><Divider>{t('surfaces.dividers.or')}</Divider></Box>
                </Specimen>
                <Specimen label={t('surfaces.dividers.vertical')} code='<Divider orientation="vertical" flexItem />'>
                    <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                        <Typography variant="body2">{t('samples.edit')}</Typography>
                        <Typography variant="body2">{t('samples.share')}</Typography>
                        <Typography variant="body2">{t('samples.delete')}</Typography>
                    </Stack>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('surfaces.typography.title')} description={t('surfaces.typography.description')}>
                <Stack spacing={1.5} sx={{width: '100%'}}>
                    {TYPOGRAPHY_VARIANTS.map((variant) => (
                        <Stack key={variant} direction={{xs: 'column', sm: 'row'}} spacing={{xs: 0.5, sm: 2}} sx={{alignItems: {sm: 'baseline'}}}>
                            <Typography variant="caption" component="code" color="text.secondary"
                                        sx={{width: 96, flexShrink: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'}}>{variant}</Typography>
                            <Typography variant={variant} component="p" noWrap sx={{minWidth: 0}}>{t('surfaces.typography.sample')}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </ShowcaseSection>
        </Stack>
    );
};
