// Lo que se ve de un formulario por pasos: los pasos, los campos del paso abierto y los botones (Anterior · Omitir este paso ·
// Siguiente o Enviar). No sabe de formik ni de react-hook-form: el FormWizard de cada uno (/forms y /react-hook-form) pone la
// lógica (qué revisa «Siguiente», qué hace «Omitir», si se puede saltar a otro paso) y le pasa su botón de enviar y su aviso de
// errores. Suelto sirve para armar un asistente propio con otra librería.
//
// Dos acomodos (WIZARD_ORIENTATION):
//   horizontal  los pasos en fila arriba y los campos abajo; en el teléfono no caben los nombres: «Paso 2 de 4» y su nombre;
//   vertical    uno debajo del otro, como un acordeón: los campos y los botones van dentro del paso abierto (también en el
//               teléfono). Es el de editar un expediente: se ve de un vistazo qué pasos hay y se entra al que hace falta.
//
// Con onStepSelect los títulos de los pasos se pulsan (con teclado también: son botones) y avisan qué paso se pidió; quien lo
// usa decide si salta. Sin él, los títulos solo informan (lo de siempre). Omitir es opcional: sin onSkip no sale el botón.
//
// Un paso que todavía no se puede dejar (faltan documentos obligatorios) lo dice con nextDisabledReason, ya traducido: «Siguiente»
// se ve apagado y no avanza, y el motivo sale en un aviso al pasar el cursor o al llegar con Tab. OJO: el botón NO lleva
// `disabled`: un botón apagado así no recibe el foco y con el teclado no habría cómo saber por qué; va con aria-disabled y la
// clase de apagado de MUI (se ve igual que uno apagado, también con el tema). En el teléfono un aviso no sale con el dedo: el
// motivo va escrito arriba de los botones. En el último paso el botón de enviar es de quien lo pasa en submitButton: él lo
// apaga (el FormWizard de formik y el de react-hook-form ya lo hacen); el motivo sale igual.
//
// Los textos se cambian con `texts`, con la forma de `common` en los textos del paquete: {wizard: {next: 'Continuar'}}.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaWizardLayout con defaultProps y
// styleOverrides de sus partes: stepper, phoneSteps, actions, nextReason (el motivo escrito en el teléfono).
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Button, {buttonClasses} from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {WIZARD_ORIENTATION, isStepCompleted} from '@/inputs/wizardSteps.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// sin pasos omitidos (quien no usa «Omitir» no tiene que mandar nada)
const NO_SKIPPED_KEYS = new Set();

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaWizardLayout)
const THEME_NAME = 'CalcitaWizardLayout';
const WizardStepper = piecePart(THEME_NAME, 'Stepper', Stepper);
const WizardPhoneSteps = piecePart(THEME_NAME, 'PhoneSteps', Box);
const WizardActions = piecePart(THEME_NAME, 'Actions', Stack);
const WizardNextReason = piecePart(THEME_NAME, 'NextReason', Typography);

/**
 * @param {object} props
 * @param {Object[]} props.steps en orden
 * @param {string} props.steps[].key
 * @param {string} props.steps[].label ya traducido
 * @param {boolean} [props.steps[].optional] se puede omitir
 * @param {boolean} [props.steps[].completed] lleva la palomita; por omisión, en fila y sin pulsar, los de antes del abierto
 * @param {import('react').ReactNode} props.steps[].content los campos del paso
 * @param {number} props.activeIndex el paso que se ve
 * @param {Set<string>} [props.skippedKeys] los pasos omitidos
 * @param {boolean} [props.isSubmitting] mientras se envía, «Anterior» se apaga
 * @param {import('react').ReactNode} [props.nextDisabledReason] ya traducido: el paso abierto todavía no se puede dejar
 *     («Faltan 2 documentos»). «Siguiente» se ve apagado y no avanza, y el motivo sale en un aviso (escrito, en el teléfono).
 *     En el último paso, apague usted su submitButton. Sin él, como siempre
 * @param {'horizontal'|'vertical'} [props.orientation] uno de WIZARD_ORIENTATION; por omisión horizontal
 * @param {boolean} [props.hideBackOnFirstStep] en el primer paso no se pinta «Anterior» (no hay a dónde volver); por omisión
 *     sale apagado, como antes
 * @param {() => void} props.onBack
 * @param {() => void} props.onNext
 * @param {() => void} [props.onSkip] sin él no sale «Omitir este paso»
 * @param {(index: number) => void} [props.onStepSelect] con él, los títulos de los pasos se pulsan y avisan cuál se pidió
 * @param {import('react').ReactNode} props.submitButton el botón de enviar del último paso
 * @param {import('react').ReactNode} [props.problemAlert] el aviso de errores del servidor, arriba de los botones del último paso
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`: {wizard: {next, back, skip, optional, skipped, stepOf}}
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos de esta pantalla en la columna de los pasos
 */
function WizardLayoutContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaWizardLayout.defaultProps) y encima lo que llega aquí
    const {
        steps, activeIndex, skippedKeys = NO_SKIPPED_KEYS, isSubmitting = false, nextDisabledReason = null,
        orientation = WIZARD_ORIENTATION.horizontal, hideBackOnFirstStep = false, onBack, onNext, onSkip, onStepSelect, submitButton,
        problemAlert, texts, sx, ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const reasonId = useId();
    const activeStep = steps[activeIndex];
    const isLastStep = activeIndex === steps.length - 1;
    const isVertical = orientation === WIZARD_ORIENTATION.vertical;
    const isSelectable = typeof onStepSelect === 'function';
    const isBackHidden = hideBackOnFirstStep && activeIndex === 0;
    const isNextBlocked = Boolean(nextDisabledReason);

    // el título de un paso: con onStepSelect es un botón (se pulsa y se llega con Tab); sin él, solo informa
    const stepTitleOf = (step, index) => {
        let caption;
        if (skippedKeys.has(step.key)) {
            caption = t('wizard.skipped');
        } else if (step.optional) {
            caption = t('wizard.optional');
        }
        const optional = caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>;
        if (isSelectable) {
            return <StepButton optional={optional} onClick={() => onStepSelect(index)}>{step.label}</StepButton>;
        }
        return <StepLabel optional={optional}>{step.label}</StepLabel>;
    };

    // el botón de seguir: «Siguiente», o el de enviar en el último paso. Con un motivo para no avanzar, «Siguiente» se ve
    // apagado pero se sigue alcanzando con Tab (aria-disabled, no disabled: ver el encabezado) y no hace nada al pulsarlo
    const nextButton = isLastStep ? submitButton : (
        <Button variant="contained" size="large" onClick={isNextBlocked ? undefined : onNext}
                {...(isNextBlocked && {'aria-disabled': true, 'aria-describedby': reasonId, className: buttonClasses.disabled})}>
            {t('wizard.next')}
        </Button>
    );
    // el aviso va sobre una caja alrededor del botón: un botón que se ve apagado no recibe el cursor (MUI le quita los eventos)
    // y la caja sí. En el teléfono no se abre con el dedo: ahí el motivo va escrito
    const forwardButton = isNextBlocked ? (
        <Tooltip title={nextDisabledReason} describeChild disableTouchListener>
            <Box component="span" sx={{display: 'flex', flexDirection: 'column'}}>{nextButton}</Box>
        </Tooltip>
    ) : nextButton;

    // los botones del paso abierto: en fila van abajo de los campos; en vertical, dentro del paso
    const buttons = (
        // sin «Anterior», los de seguir se quedan a la derecha (solos, space-between los mandaba a la izquierda; un margen
        // automático no sirve: Stack les pone margin 0 a sus hijos con más fuerza)
        <WizardActions direction={{xs: 'column-reverse', sm: 'row'}} spacing={1.5} ownSx={{justifyContent: isBackHidden ? 'flex-end' : 'space-between'}}>
            {!isBackHidden && (
                <Button variant="text" color="inherit" disabled={activeIndex === 0 || isSubmitting} onClick={onBack}>
                    {t('wizard.back')}
                </Button>
            )}
            <Stack direction={{xs: 'column-reverse', sm: 'row'}} spacing={1.5}>
                {activeStep.optional && !isLastStep && onSkip && (
                    <Button variant="text" onClick={onSkip}>{t('wizard.skip')}</Button>
                )}
                {forwardButton}
            </Stack>
        </WizardActions>
    );
    // con un motivo, escrito arriba de los botones en el teléfono (en pantallas anchas lo dice el aviso). Sin motivo, los
    // botones solos, como siempre. useFlexGap: el motivo escondido no deja hueco arriba de los botones
    const actions = isNextBlocked ? (
        <Stack spacing={1} useFlexGap>
            <WizardNextReason id={reasonId} variant="body2" color="text.secondary" ownSx={{display: {xs: 'block', sm: 'none'}}}>
                {nextDisabledReason}
            </WizardNextReason>
            {buttons}
        </Stack>
    ) : buttons;
    const completedOf = (step, index) => isStepCompleted(step, {index, activeIndex, skippedKeys, isSelectable});

    if (isVertical) {
        return (
            // nonLinear: con los títulos que se pulsan, MUI no debe apagar los pasos de adelante
            <WizardStepper activeStep={activeIndex} orientation="vertical" nonLinear={isSelectable}>
                {steps.map((step, index) => (
                    <Step key={step.key} completed={completedOf(step, index)}>
                        {stepTitleOf(step, index)}
                        {/* solo el paso abierto tiene sus campos montados: al cerrarse se desmontan (unmountOnExit). Los botones
                            van solo en el abierto: el que se cierra (la animación dura un momento) ya no es el paso de esos
                            botones, y un «Guardar» repetido confunde */}
                        <StepContent slotProps={{transition: {unmountOnExit: true}}}>
                            <Stack spacing={3} sx={{pt: 1}}>
                                <Box>{step.content}</Box>
                                {index === activeIndex && isLastStep && problemAlert}
                                {index === activeIndex && actions}
                            </Stack>
                        </StepContent>
                    </Step>
                ))}
            </WizardStepper>
        );
    }

    return (
        <Stack sx={sx} spacing={3}>
            {/* en el teléfono los nombres de los pasos no caben: se dice en qué paso va */}
            <WizardStepper activeStep={activeIndex} alternativeLabel nonLinear={isSelectable} ownSx={{display: {xs: 'none', sm: 'flex'}}}>
                {steps.map((step, index) => (
                    <Step key={step.key} completed={completedOf(step, index)}>
                        {stepTitleOf(step, index)}
                    </Step>
                ))}
            </WizardStepper>
            <WizardPhoneSteps ownSx={{display: {xs: 'block', sm: 'none'}}}>
                <Typography variant="overline" color="text.secondary">{t('wizard.stepOf', {current: activeIndex + 1, total: steps.length})}</Typography>
                <Typography variant="h6">{activeStep.label}</Typography>
            </WizardPhoneSteps>

            <Box>{activeStep.content}</Box>

            {isLastStep && problemAlert}

            {actions}
        </Stack>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const WizardLayout = withPieceSlots(WizardLayoutContent, THEME_NAME);
export default WizardLayout;
