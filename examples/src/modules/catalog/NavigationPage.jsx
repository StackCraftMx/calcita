// Catálogo · navegación: pestañas (con texto, con ícono, muchas que se deslizan y verticales), migas (Breadcrumbs), ligas
// (Link), paginación, pasos (Stepper y MobileStepper) y la barra de abajo del teléfono (BottomNavigation).
//
// Con el vidrio del tema (HIG de Apple): la pestaña elegida y la página actual van en la gota, y la barra de abajo flota de
// vidrio con lo elegido en su gota («A tab bar floats above content… on a Liquid Glass background», HIG «Tab bars»).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import MobileStepper from '@mui/material/MobileStepper';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {ShowcaseSection, Specimen} from '@/modules/catalog/Showcase.jsx';

const BASIC_TABS = Object.freeze(['summary', 'orders', 'invoices']);
const ICON_TABS = Object.freeze([
    {key: 'orders', Icon: ReceiptLongOutlinedIcon},
    {key: 'alerts', Icon: NotificationsNoneIcon},
    {key: 'settings', Icon: SettingsOutlinedIcon},
]);
// los meses de las pestañas que se deslizan: más de las que caben
const SCROLLABLE_MONTHS = Object.freeze(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct']);
const CHECKOUT_STEPS = Object.freeze(['cart', 'address', 'payment', 'confirm']);
const PAGINATION_VARIANTS = Object.freeze(['text', 'outlined']);
const BOTTOM_TABS = Object.freeze([
    {key: 'home', Icon: HomeOutlinedIcon},
    {key: 'search', Icon: SearchIcon},
    {key: 'alerts', Icon: NotificationsNoneIcon},
    {key: 'profile', Icon: PersonOutlineIcon},
]);
const SAMPLE_PAGE_COUNT = 12;
// el paso donde va el ejemplo (empieza en 0) y el que tiene un error
const SAMPLE_ACTIVE_STEP = 2;
const SAMPLE_ERROR_STEP = 1;
// lo ancho de lo que imita una pantalla de teléfono
const PHONE_WIDTH = 360;
const VERTICAL_TABS_HEIGHT = 180;
// las ligas de muestra no llevan a ningún lado: sin esto, «#» brincaba al inicio de la página
const SAMPLE_LINK_PROPS = Object.freeze({href: '#', onClick: (event) => event.preventDefault()});

export const NavigationPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const [basicTab, setBasicTab] = useState(BASIC_TABS[0]);
    const [iconTab, setIconTab] = useState(ICON_TABS[0].key);
    const [month, setMonth] = useState('sep');
    const [verticalTab, setVerticalTab] = useState(BASIC_TABS[0]);
    const [page, setPage] = useState(3);
    const [verticalStep, setVerticalStep] = useState(1);
    const [mobileStep, setMobileStep] = useState(0);
    const [bottomTab, setBottomTab] = useState(BOTTOM_TABS[0].key);

    const stepLabelOf = (step) => t(`navigation.stepper.steps.${step}`);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('navigation.title')} description={t('navigation.description')} />

            <ShowcaseSection title={t('navigation.tabs.title')} description={t('navigation.tabs.description')}>
                <Specimen wide label={t('navigation.tabs.text')} code='<Tabs value={…}><Tab label="…" /></Tabs>'>
                    <Tabs value={basicTab} onChange={(event, value) => setBasicTab(value)} aria-label={t('navigation.tabs.ariaLabel')}>
                        {BASIC_TABS.map((tab) => <Tab key={tab} value={tab} label={t(`navigation.tabs.items.${tab}`)} />)}
                        <Tab value="archived" label={t('navigation.tabs.items.archived')} disabled />
                    </Tabs>
                </Specimen>
                <Specimen wide label={t('navigation.tabs.icons')} code='<Tab icon={<…Icon />} iconPosition="start" />'>
                    <Tabs value={iconTab} onChange={(event, value) => setIconTab(value)} aria-label={t('navigation.tabs.ariaLabel')}>
                        {ICON_TABS.map(({key, Icon}) => <Tab key={key} value={key} icon={<Icon />} iconPosition="start" label={t(`navigation.tabs.items.${key}`)} />)}
                    </Tabs>
                </Specimen>
                <Specimen wide label={t('navigation.tabs.scrollable')} code='variant="scrollable" scrollButtons="auto"'>
                    <Box sx={{maxWidth: '100%', minWidth: 0}}>
                        <Tabs value={month} onChange={(event, value) => setMonth(value)} variant="scrollable" scrollButtons="auto" aria-label={t('navigation.tabs.months')}>
                            {SCROLLABLE_MONTHS.map((monthKey) => <Tab key={monthKey} value={monthKey} label={t(`navigation.tabs.monthNames.${monthKey}`)} />)}
                        </Tabs>
                    </Box>
                </Specimen>
                <Specimen label={t('navigation.tabs.vertical')} code='orientation="vertical"'>
                    <Box sx={{display: 'flex', height: VERTICAL_TABS_HEIGHT}}>
                        <Tabs orientation="vertical" value={verticalTab} onChange={(event, value) => setVerticalTab(value)} aria-label={t('navigation.tabs.ariaLabel')}
                              sx={{borderRight: 1, borderColor: 'divider'}}>
                            {BASIC_TABS.map((tab) => <Tab key={tab} value={tab} label={t(`navigation.tabs.items.${tab}`)} />)}
                        </Tabs>
                        <Typography sx={{p: 2}} color="text.secondary">{t(`navigation.tabs.items.${verticalTab}`)}</Typography>
                    </Box>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('navigation.breadcrumbs.title')} description={t('navigation.breadcrumbs.description')}>
                <Specimen label={t('navigation.breadcrumbs.basic')} code="<Breadcrumbs><Link>…</Link><Typography>…</Typography></Breadcrumbs>">
                    <Breadcrumbs aria-label={t('navigation.breadcrumbs.ariaLabel')}>
                        <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.breadcrumbs.home')}</Link>
                        <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.breadcrumbs.orders')}</Link>
                        <Typography sx={{color: 'text.primary'}}>P-2375</Typography>
                    </Breadcrumbs>
                </Specimen>
                <Specimen label={t('navigation.breadcrumbs.collapsed')} code="maxItems={3}">
                    <Breadcrumbs maxItems={3} aria-label={t('navigation.breadcrumbs.ariaLabel')}>
                        <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.breadcrumbs.home')}</Link>
                        <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.breadcrumbs.reports')}</Link>
                        <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>2026</Link>
                        <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.tabs.monthNames.sep')}</Link>
                        <Typography sx={{color: 'text.primary'}}>{t('navigation.breadcrumbs.sales')}</Typography>
                    </Breadcrumbs>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('navigation.links.title')} description={t('navigation.links.description')}>
                {['always', 'hover', 'none'].map((underline) => (
                    <Specimen key={underline} label={t(`navigation.links.underline.${underline}`)} code={`<Link underline="${underline}">`}>
                        <Link {...SAMPLE_LINK_PROPS} underline={underline}>{t('navigation.links.sample')}</Link>
                    </Specimen>
                ))}
            </ShowcaseSection>

            <ShowcaseSection title={t('navigation.pagination.title')} description={t('navigation.pagination.description')}>
                {PAGINATION_VARIANTS.map((variant) => (
                    <Specimen key={variant} wide label={t(`variants.${variant}`)} code={`<Pagination variant="${variant}" count={${SAMPLE_PAGE_COUNT}} />`}>
                        <Pagination variant={variant} count={SAMPLE_PAGE_COUNT} page={page} onChange={(event, value) => setPage(value)} />
                    </Specimen>
                ))}
                <Specimen wide label={t('navigation.pagination.rounded')} code='shape="rounded" showFirstButton showLastButton'>
                    <Pagination shape="rounded" count={SAMPLE_PAGE_COUNT} page={page} onChange={(event, value) => setPage(value)} showFirstButton showLastButton />
                </Specimen>
                <Specimen label={t('navigation.pagination.sizes')} code='size="small | large"'>
                    <Stack spacing={1}>
                        <Pagination size="small" count={5} />
                        <Pagination size="large" count={5} />
                    </Stack>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('navigation.stepper.title')} description={t('navigation.stepper.description')}>
                <Specimen wide label={t('navigation.stepper.horizontal')} code="<Stepper activeStep={…}>">
                    <Stepper activeStep={SAMPLE_ACTIVE_STEP} sx={{width: '100%'}}>
                        {CHECKOUT_STEPS.map((step) => <Step key={step}><StepLabel>{stepLabelOf(step)}</StepLabel></Step>)}
                    </Stepper>
                </Specimen>
                <Specimen wide label={t('navigation.stepper.alternative')} code="alternativeLabel">
                    <Stepper activeStep={SAMPLE_ACTIVE_STEP} alternativeLabel sx={{width: '100%'}}>
                        {CHECKOUT_STEPS.map((step) => <Step key={step}><StepLabel>{stepLabelOf(step)}</StepLabel></Step>)}
                    </Stepper>
                </Specimen>
                <Specimen wide label={t('navigation.stepper.withError')} code="<StepLabel error optional={…}>">
                    <Stepper activeStep={SAMPLE_ERROR_STEP} sx={{width: '100%'}}>
                        {CHECKOUT_STEPS.map((step, index) => {
                            const hasError = index === SAMPLE_ERROR_STEP;
                            return (
                                <Step key={step}>
                                    <StepLabel error={hasError}
                                               optional={hasError ? <Typography variant="caption" color="error">{t('navigation.stepper.errorHint')}</Typography> : null}>
                                        {stepLabelOf(step)}
                                    </StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                </Specimen>
                <Specimen label={t('navigation.stepper.vertical')} code='orientation="vertical" + <StepContent>'>
                    <Stepper activeStep={verticalStep} orientation="vertical" sx={{maxWidth: 360}}>
                        {CHECKOUT_STEPS.map((step, index) => (
                            <Step key={step}>
                                <StepLabel>{stepLabelOf(step)}</StepLabel>
                                <StepContent>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 1.5}}>{t(`navigation.stepper.help.${step}`)}</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button size="small" disabled={index === 0} onClick={() => setVerticalStep(index - 1)}>{t('samples.back')}</Button>
                                        <Button size="small" variant="contained" onClick={() => setVerticalStep(Math.min(index + 1, CHECKOUT_STEPS.length - 1))}>
                                            {t('samples.continue')}
                                        </Button>
                                    </Stack>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </Specimen>
                <Specimen label={t('navigation.stepper.dots')} code='<MobileStepper variant="dots" />'>
                    <MobileStepper variant="dots" steps={CHECKOUT_STEPS.length} position="static" activeStep={mobileStep} sx={{width: PHONE_WIDTH, maxWidth: '100%'}}
                                   nextButton={(
                                       <Button size="small" onClick={() => setMobileStep((step) => step + 1)} disabled={mobileStep === CHECKOUT_STEPS.length - 1}>
                                           {t('samples.next')}<KeyboardArrowRightIcon />
                                       </Button>
                                   )}
                                   backButton={(
                                       <Button size="small" onClick={() => setMobileStep((step) => step - 1)} disabled={mobileStep === 0}>
                                           <KeyboardArrowLeftIcon />{t('samples.back')}
                                       </Button>
                                   )} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('navigation.bottom.title')} description={t('navigation.bottom.description')}>
                <Specimen label={t('navigation.bottom.label')} code="<BottomNavigation showLabels value={…}>">
                    <Box sx={{width: PHONE_WIDTH, maxWidth: '100%'}}>
                        <BottomNavigation showLabels value={bottomTab} onChange={(event, value) => setBottomTab(value)}>
                            {BOTTOM_TABS.map(({key, Icon}) => (
                                <BottomNavigationAction key={key} value={key} label={t(`navigation.bottom.items.${key}`)} icon={<Icon />} />
                            ))}
                        </BottomNavigation>
                    </Box>
                </Specimen>
            </ShowcaseSection>
        </Stack>
    );
};
