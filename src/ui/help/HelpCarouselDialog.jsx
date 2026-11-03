// La ayuda en carrusel: unos cuantos pasos, cada uno con su imagen o ilustración, su título y su texto, para explicar una
// pantalla la primera vez que se entra (o cuando cambia). Se avanza con «Siguiente», con los puntos de abajo, con las
// flechas del teclado o deslizando con el dedo; el último paso dice «Listo». Con «reducir movimiento» del sistema no hay
// animación.
//
// Cuándo sale y que se recuerde lo hace useHelpCarousel; esta ventana solo enseña y avisa:
//   onClose(reason, {dontShowAgain})   reason 'finished' (terminó) o 'closed' (la cerró antes); el proyecto puede guardarlo
//                                      también en su servidor
//   onStepChange(index)                cada paso que se ve
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaHelpCarouselDialog con defaultProps y
// styleOverrides de sus partes: media, content, dots, actions.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useId, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Fade from '@mui/material/Fade';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/** Por qué se cerró la ayuda. */
export const HELP_CLOSE_REASON = Object.freeze({finished: 'finished', closed: 'closed'});

// lo que hay que deslizar con el dedo para cambiar de paso (px)
const SWIPE_DISTANCE = 50;
const FADE_MILLISECONDS = 220;
const MEDIA_HEIGHT = 200;

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaHelpCarouselDialog)
const THEME_NAME = 'CalcitaHelpCarouselDialog';
const HelpMedia = piecePart(THEME_NAME, 'Media', Box);
const HelpContent = piecePart(THEME_NAME, 'Content', DialogContent);
const HelpDots = piecePart(THEME_NAME, 'Dots', Stack);
const HelpActions = piecePart(THEME_NAME, 'Actions', DialogActions);

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {(reason: string, details: {dontShowAgain: boolean}) => void} props.onClose HELP_CLOSE_REASON y si marcó «No volver a mostrar»
 * @param {Array<{title: string, content: import('react').ReactNode, image?: string, imageAlt?: string, media?: import('react').ReactNode}>} props.steps
 *     title y content ya traducidos; image (una dirección) o media (una ilustración propia) arriba
 * @param {string} [props.title] ya traducido: de qué es la ayuda («Cómo usar el tablero»), arriba de los pasos
 * @param {boolean} [props.showDontShowAgain] la casilla «No volver a mostrar al entrar» (por omisión sí)
 * @param {(index: number) => void} [props.onStepChange]
 * @param {number} [props.initialStep]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function HelpCarouselDialogContent(props) {
    const {
        open, onClose, steps, title, showDontShowAgain = true, onStepChange, initialStep = 0, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const titleId = useId();
    const [stepIndex, setStepIndex] = useState(initialStep);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const reducesMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const swipeStartRef = useRef(null);
    const lastIndex = steps.length - 1;
    const step = steps[Math.min(stepIndex, lastIndex)];

    // cada vez que se abre empieza en su primer paso
    useEffect(() => {
        if (open) {
            setStepIndex(initialStep);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
    useEffect(() => {
        if (open) {
            onStepChange?.(stepIndex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, stepIndex]);

    const goTo = (index) => setStepIndex(Math.max(0, Math.min(lastIndex, index)));
    const close = (reason) => onClose(reason, {dontShowAgain});
    const next = () => (stepIndex >= lastIndex ? close(HELP_CLOSE_REASON.finished) : goTo(stepIndex + 1));

    if (!step) {
        return null;
    }
    return (
        <Dialog
            open={open}
            onClose={() => close(HELP_CLOSE_REASON.closed)}
            maxWidth="sm"
            fullWidth
            aria-labelledby={titleId}
            onKeyDown={(event) => {
                // las flechas cambian de paso (dentro de la casilla o de un botón también: no escriben nada)
                if (event.key === 'ArrowRight') {
                    goTo(stepIndex + 1);
                } else if (event.key === 'ArrowLeft') {
                    goTo(stepIndex - 1);
                }
            }}
        >
            <Box
                onPointerDown={(event) => {
                    swipeStartRef.current = event.clientX;
                }}
                onPointerUp={(event) => {
                    const distance = swipeStartRef.current === null ? 0 : event.clientX - swipeStartRef.current;
                    swipeStartRef.current = null;
                    if (Math.abs(distance) >= SWIPE_DISTANCE) {
                        goTo(stepIndex + (distance < 0 ? 1 : -1));
                    }
                }}
                sx={{position: 'relative', touchAction: 'pan-y'}}
            >
                <IconButton aria-label={t('help.close')} onClick={() => close(HELP_CLOSE_REASON.closed)}
                            sx={{position: 'absolute', top: 8, right: 8, zIndex: 1}}>
                    <CloseRoundedIcon />
                </IconButton>
                <Fade key={stepIndex} in appear={!reducesMotion} timeout={reducesMotion ? 0 : FADE_MILLISECONDS}>
                    <div>
                        {(step.image || step.media) && (
                            <HelpMedia ownSx={{height: MEDIA_HEIGHT, display: 'grid', placeItems: 'center', overflow: 'hidden', bgcolor: 'action.hover'}}>
                                {step.media ?? <Box component="img" src={step.image} alt={step.imageAlt ?? ''} sx={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />}
                            </HelpMedia>
                        )}
                        <HelpContent ownSx={{pt: 2.5}}>
                            {title && <Typography variant="overline" color="text.secondary" component="p">{title}</Typography>}
                            <Typography id={titleId} variant="h6" component="h2" sx={{pr: 4}}>{step.title}</Typography>
                            <Typography component="div" color="text.secondary" sx={{mt: 1}}>{step.content}</Typography>
                        </HelpContent>
                    </div>
                </Fade>
            </Box>
            {/* los puntos: dónde va y para saltar a un paso */}
            <HelpDots direction="row" ownSx={{justifyContent: 'center', gap: 1, pb: 1}} role="group" aria-label={t('help.stepOf', {current: stepIndex + 1, total: steps.length})}>
                {steps.map((unused, index) => (
                    <ButtonBase key={index} onClick={() => goTo(index)} aria-label={t('help.goToStep', {number: index + 1})}
                                aria-current={index === stepIndex ? 'step' : undefined}
                                sx={{width: index === stepIndex ? 22 : 8, height: 8, borderRadius: 4, transition: reducesMotion ? 'none' : 'width 200ms',
                                    bgcolor: index === stepIndex ? 'primary.main' : 'action.disabled'}} />
                ))}
            </HelpDots>
            <HelpActions ownSx={{px: 3, pb: 2, gap: 1, flexWrap: 'wrap'}}>
                {showDontShowAgain && (
                    <FormControlLabel sx={{mr: 'auto'}} label={t('help.dontShowAgain')}
                                      control={<Checkbox size="small" checked={dontShowAgain} onChange={(event) => setDontShowAgain(event.target.checked)} />} />
                )}
                {stepIndex > 0 && <Button onClick={() => goTo(stepIndex - 1)}>{t('help.back')}</Button>}
                <Button variant="contained" onClick={next} autoFocus>
                    {stepIndex >= lastIndex ? t('help.done') : t('help.next')}
                </Button>
            </HelpActions>
        </Dialog>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const HelpCarouselDialog = withPieceSlots(HelpCarouselDialogContent, THEME_NAME);
export default HelpCarouselDialog;
