// Catálogo · avisos y progreso: Alert en sus variantes y tipos, con título, acción o para cerrar; los avisos que flotan
// (toast del framework y Snackbar de MUI); el progreso (barra y círculo), el esqueleto mientras carga, el fondo que bloquea
// (Backdrop) y ModalWaiting del framework.
//
// Con el vidrio del tema (HIG de Apple): el aviso dentro del contenido lleva material teñido de su tipo («status
// indicators» es uno de los usos de color que Apple permite en el vidrio), y siempre con su ícono, para no comunicar solo
// con color; los avisos que flotan son de vidrio.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {ModalWaiting, PageHeading, toastError, toastInfo, toastSuccess, toastWarn, useToolkitTranslation} from '@stackcraftmx/calcita';

import {ShowcaseSection, Specimen} from '@/modules/catalog/Showcase.jsx';

const SEVERITIES = Object.freeze(['success', 'info', 'warning', 'error']);
const ALERT_VARIANTS = Object.freeze(['standard', 'outlined', 'filled']);
// cada aviso que flota, con su función del framework (el nombre va escrito: al compilar se acortan los nombres)
const TOASTS = Object.freeze([
    {severity: 'success', show: toastSuccess, code: 'toastSuccess'},
    {severity: 'info', show: toastInfo, code: 'toastInfo'},
    {severity: 'warning', show: toastWarn, code: 'toastWarn'},
    {severity: 'error', show: toastError, code: 'toastError'},
]);
// los valores de ejemplo del progreso (por ciento): HIG «Progress indicators» prefiere el que dice cuánto falta
const SAMPLE_PROGRESS = 60;
const SAMPLE_BUFFER = 80;
const SAMPLE_CIRCLE_PROGRESS = 75;
// cuánto dura la espera de ejemplo (milisegundos)
const WAITING_DEMO_MILLISECONDS = 2000;
// lo ancho de lo que se compara lado a lado
const SPECIMEN_WIDTH = 320;
const SNACKBAR_HIDE_MILLISECONDS = 5000;

export const AlertsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const [isClosableAlertOpen, setIsClosableAlertOpen] = useState(true);
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [isBackdropOpen, setIsBackdropOpen] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    const wait = () => {
        setIsWaiting(true);
        window.setTimeout(() => setIsWaiting(false), WAITING_DEMO_MILLISECONDS);
    };

    return (
        <Stack spacing={3}>
            <PageHeading title={t('feedback.title')} description={t('feedback.description')} />

            {ALERT_VARIANTS.map((variant) => (
                <ShowcaseSection key={variant} title={t(`feedback.alerts.${variant}.title`)} description={t(`feedback.alerts.${variant}.description`)}>
                    {SEVERITIES.map((severity) => (
                        <Specimen key={severity} wide label={t(`feedback.severities.${severity}`)} code={`<Alert variant="${variant}" severity="${severity}">`}>
                            <Alert variant={variant} severity={severity} sx={{width: '100%'}}>{t(`feedback.alerts.samples.${severity}`)}</Alert>
                        </Specimen>
                    ))}
                </ShowcaseSection>
            ))}

            <ShowcaseSection title={t('feedback.alerts.extras.title')} description={t('feedback.alerts.extras.description')}>
                <Specimen wide label={t('feedback.alerts.extras.withTitle')} code="<AlertTitle>…</AlertTitle>">
                    <Alert severity="warning" sx={{width: '100%'}}>
                        <AlertTitle>{t('feedback.alerts.extras.sampleTitle')}</AlertTitle>
                        {t('feedback.alerts.extras.sampleText')}
                    </Alert>
                </Specimen>
                <Specimen wide label={t('feedback.alerts.extras.withAction')} code="action={<Button>…</Button>}">
                    <Alert severity="info" sx={{width: '100%'}} action={<Button color="inherit" size="small">{t('samples.undo')}</Button>}>
                        {t('feedback.alerts.extras.archived')}
                    </Alert>
                </Specimen>
                <Specimen wide label={t('feedback.alerts.extras.closable')} code="onClose={…}">
                    {isClosableAlertOpen ? (
                        <Alert severity="success" sx={{width: '100%'}} onClose={() => setIsClosableAlertOpen(false)}>{t('feedback.alerts.samples.success')}</Alert>
                    ) : (
                        <Button variant="outlined" onClick={() => setIsClosableAlertOpen(true)}>{t('feedback.alerts.extras.showAgain')}</Button>
                    )}
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('feedback.toasts.title')} description={t('feedback.toasts.description')}>
                {TOASTS.map(({severity, show, code}) => (
                    <Specimen key={severity} label={t(`feedback.severities.${severity}`)} code={`${code}('…')`}>
                        <Button variant="outlined" onClick={() => show(t(`feedback.alerts.samples.${severity}`))}>{t('feedback.toasts.show')}</Button>
                    </Specimen>
                ))}
                <Specimen label="Snackbar" code="<Snackbar message={…} action={…} />">
                    <Button variant="outlined" onClick={() => setIsSnackbarOpen(true)}>{t('feedback.toasts.snackbar')}</Button>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('feedback.progress.title')} description={t('feedback.progress.description')}>
                <Specimen label={t('feedback.progress.determinate')} code={`<LinearProgress variant="determinate" value={${SAMPLE_PROGRESS}} />`}>
                    <Box sx={{width: SPECIMEN_WIDTH}}>
                        <LinearProgress variant="determinate" value={SAMPLE_PROGRESS} aria-label={t('feedback.progress.uploading')} />
                        <Typography variant="caption" color="text.secondary">{t('feedback.progress.uploadedOf', {percent: SAMPLE_PROGRESS})}</Typography>
                    </Box>
                </Specimen>
                <Specimen label={t('feedback.progress.indeterminate')} code="<LinearProgress />">
                    <Box sx={{width: SPECIMEN_WIDTH}}><LinearProgress aria-label={t('feedback.progress.loading')} /></Box>
                </Specimen>
                <Specimen label={t('feedback.progress.buffer')} code='variant="buffer"'>
                    <Box sx={{width: SPECIMEN_WIDTH}}>
                        <LinearProgress variant="buffer" value={SAMPLE_PROGRESS} valueBuffer={SAMPLE_BUFFER} aria-label={t('feedback.progress.playing')} />
                    </Box>
                </Specimen>
                <Specimen label={t('feedback.progress.circle')} code={`<CircularProgress variant="determinate" value={${SAMPLE_CIRCLE_PROGRESS}} />`}>
                    <Box sx={{position: 'relative', display: 'inline-flex'}}>
                        <CircularProgress variant="determinate" value={SAMPLE_CIRCLE_PROGRESS} aria-label={t('feedback.progress.uploading')} />
                        <Box sx={{inset: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Typography variant="caption" color="text.secondary">{`${SAMPLE_CIRCLE_PROGRESS}%`}</Typography>
                        </Box>
                    </Box>
                    <CircularProgress aria-label={t('feedback.progress.loading')} />
                    <CircularProgress size={20} aria-label={t('feedback.progress.loading')} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('feedback.skeleton.title')} description={t('feedback.skeleton.description')}>
                <Specimen label={t('feedback.skeleton.card')} code='<Skeleton variant="text | circular | rounded" />'>
                    <Stack spacing={1} sx={{width: SPECIMEN_WIDTH}}>
                        <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{flexGrow: 1}}>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" />
                            </Box>
                        </Stack>
                        <Skeleton variant="rounded" height={96} />
                    </Stack>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('feedback.blocking.title')} description={t('feedback.blocking.description')}>
                <Specimen label="Backdrop" code="<Backdrop open={…} onClick={…}>">
                    <Button variant="outlined" onClick={() => setIsBackdropOpen(true)}>{t('feedback.blocking.backdrop')}</Button>
                </Specimen>
                <Specimen label="ModalWaiting" code="<ModalWaiting open={…} />">
                    <Button variant="outlined" onClick={wait}>{t('feedback.blocking.waiting')}</Button>
                </Specimen>
            </ShowcaseSection>

            <Snackbar open={isSnackbarOpen} autoHideDuration={SNACKBAR_HIDE_MILLISECONDS} onClose={() => setIsSnackbarOpen(false)}
                      message={t('feedback.alerts.extras.archived')}
                      action={<Button color="inherit" size="small" onClick={() => setIsSnackbarOpen(false)}>{t('samples.undo')}</Button>} />
            <Backdrop open={isBackdropOpen} onClick={() => setIsBackdropOpen(false)} sx={(theme) => ({zIndex: theme.zIndex.drawer + 2, color: 'common.white'})}>
                <Stack spacing={2} sx={{alignItems: 'center'}}>
                    <CircularProgress color="inherit" aria-label={t('feedback.progress.loading')} />
                    <Typography>{t('feedback.blocking.closeHint')}</Typography>
                </Stack>
            </Backdrop>
            <ModalWaiting open={isWaiting} />
        </Stack>
    );
};
