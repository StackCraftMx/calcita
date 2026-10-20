// Lo que se ve de un formulario por pasos: los pasos arriba (en el teléfono, «Paso 2 de 4» y su nombre), los campos del paso
// y los botones (Anterior · Omitir este paso · Siguiente o Enviar). No sabe de formik ni de react-hook-form: el FormWizard de
// cada uno (/forms y /react-hook-form) pone la lógica (qué revisa «Siguiente», qué hace «Omitir») y le pasa su botón de
// enviar y su aviso de errores. Suelto sirve para armar un asistente propio con otra librería.
//
// Los textos se cambian con `texts`, con la forma de `common` en los textos del paquete: {wizard: {next: 'Continuar'}}.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaWizardLayout con defaultProps y
// styleOverrides de sus partes: stepper, phoneSteps, actions.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaWizardLayout)
const THEME_NAME = 'CalcitaWizardLayout';
const WizardStepper = piecePart(THEME_NAME, 'Stepper', Stepper);
const WizardPhoneSteps = piecePart(THEME_NAME, 'PhoneSteps', Box);
const WizardActions = piecePart(THEME_NAME, 'Actions', Stack);

/**
 * @param {object} props
 * @param {Object[]} props.steps en orden
 * @param {string} props.steps[].key
 * @param {string} props.steps[].label ya traducido
 * @param {boolean} [props.steps[].optional] se puede omitir
 * @param {import('react').ReactNode} props.steps[].content los campos del paso
 * @param {number} props.activeIndex el paso que se ve
 * @param {Set<string>} props.skippedKeys los pasos omitidos
 * @param {boolean} [props.isSubmitting] mientras se envía, «Anterior» se apaga
 * @param {() => void} props.onBack
 * @param {() => void} props.onNext
 * @param {() => void} props.onSkip
 * @param {import('react').ReactNode} props.submitButton el botón de enviar del último paso
 * @param {import('react').ReactNode} [props.problemAlert] el aviso de errores del servidor, arriba de los botones del último paso
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`: {wizard: {next, back, skip, optional, skipped, stepOf}}
 */
export default function WizardLayout(props) {
    // lo que el proyecto puso en su tema (components.CalcitaWizardLayout.defaultProps) y encima lo que llega aquí
    const {
    steps, activeIndex, skippedKeys, isSubmitting = false, onBack, onNext, onSkip, submitButton, problemAlert, texts,
    ...unknownProps
} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const activeStep = steps[activeIndex];
    const isLastStep = activeIndex === steps.length - 1;

    return (
        <Stack spacing={3}>
            {/* en el teléfono los nombres de los pasos no caben: se dice en qué paso va */}
            <WizardStepper activeStep={activeIndex} alternativeLabel ownSx={{display: {xs: 'none', sm: 'flex'}}}>
                {steps.map((step) => {
                    let caption;
                    if (skippedKeys.has(step.key)) {
                        caption = t('wizard.skipped');
                    } else if (step.optional) {
                        caption = t('wizard.optional');
                    }
                    return (
                        <Step key={step.key} completed={skippedKeys.has(step.key) ? false : undefined}>
                            <StepLabel optional={caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}>
                                {step.label}
                            </StepLabel>
                        </Step>
                    );
                })}
            </WizardStepper>
            <WizardPhoneSteps ownSx={{display: {xs: 'block', sm: 'none'}}}>
                <Typography variant="overline" color="text.secondary">{t('wizard.stepOf', {current: activeIndex + 1, total: steps.length})}</Typography>
                <Typography variant="h6">{activeStep.label}</Typography>
            </WizardPhoneSteps>

            <Box>{activeStep.content}</Box>

            {isLastStep && problemAlert}

            <WizardActions direction={{xs: 'column-reverse', sm: 'row'}} spacing={1.5} ownSx={{justifyContent: 'space-between'}}>
                <Button variant="text" color="inherit" disabled={activeIndex === 0 || isSubmitting} onClick={onBack}>
                    {t('wizard.back')}
                </Button>
                <Stack direction={{xs: 'column-reverse', sm: 'row'}} spacing={1.5}>
                    {activeStep.optional && !isLastStep && (
                        <Button variant="text" onClick={onSkip}>{t('wizard.skip')}</Button>
                    )}
                    {isLastStep
                        ? submitButton
                        : <Button variant="contained" size="large" onClick={onNext}>{t('wizard.next')}</Button>}
                </Stack>
            </WizardActions>
        </Stack>
    );
}
