import {useState} from 'react';
import Button from '@mui/material/Button';
import MobileStepper from '@mui/material/MobileStepper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const CHECKOUT_STEPS = ['cart', 'address', 'payment', 'confirm'];
// el paso donde va el ejemplo (empieza en 0) y el que tiene un error
const ACTIVE_STEP = 2;
const ERROR_STEP = 1;
// lo ancho de una pantalla de teléfono (px)
const PHONE_WIDTH = 360;

const StepperVariants = () => {
    const {t} = useToolkitTranslation('catalog');
    const [verticalStep, setVerticalStep] = useState(1);
    const [mobileStep, setMobileStep] = useState(0);
    const stepLabelOf = (step: string) => t(`navigation.stepper.steps.${step}`);

    return (
        <Stack spacing={4}>
            <Stepper activeStep={ACTIVE_STEP}>
                {CHECKOUT_STEPS.map((step) => <Step key={step}><StepLabel>{stepLabelOf(step)}</StepLabel></Step>)}
            </Stepper>
            <Stepper activeStep={ACTIVE_STEP} alternativeLabel>
                {CHECKOUT_STEPS.map((step) => <Step key={step}><StepLabel>{stepLabelOf(step)}</StepLabel></Step>)}
            </Stepper>
            {/* el paso con error dice qué falta debajo de su nombre */}
            <Stepper activeStep={ERROR_STEP}>
                {CHECKOUT_STEPS.map((step, index) => {
                    const hasError = index === ERROR_STEP;
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
            <Stepper activeStep={verticalStep} orientation="vertical" sx={{maxWidth: PHONE_WIDTH}}>
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
            <MobileStepper variant="dots" steps={CHECKOUT_STEPS.length} position="static" activeStep={mobileStep}
                           sx={{width: PHONE_WIDTH, maxWidth: '100%'}}
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
        </Stack>
    );
};

export default StepperVariants;
