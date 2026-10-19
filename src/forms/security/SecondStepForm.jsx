// El segundo paso al entrar: la contraseña fue correcta y la cuenta tiene verificación en dos pasos.
//
// Los métodos van en el orden de su fuerza: primero la llave de acceso (no se la roba una página falsa), luego el código de
// la app, y el de recuperación detrás de un enlace (es para emergencias y se gasta). Cada código equivocado cuenta para el
// bloqueo de la cuenta: el servidor dice cuántos intentos quedan (problem.remaining_attempts) y se le dice a la persona.
// Si se acabaron los intentos o se venció el tiempo (un 401 sin intentos, o code account_locked), se regresa a empezar.
//
// La pantalla no sabe del servidor: el proyecto le pasa qué hacer.
//
//   <SecondStepForm methods={['passkey', 'totp', 'recoveryCode']} canUsePasskeys={passkeysSupported()}
//                   onUsePasskey={async () => finishWith(await api.post('/auth/second-step/passkey',
//                       await signWithPasskey(await api.get('/auth/second-step/passkey-options'))))}
//                   onSubmitCode={async ({method, code}) => finishWith(await api.post(`/auth/second-step/${method}`, {code}))}
//                   onCancel={(message) => backToSignIn(message)} />
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSecondStepForm con defaultProps y
// styleOverrides de sus partes: actions.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {Form, Formik} from 'formik';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';

import FormProblemAlert from '@/forms/FormProblemAlert.jsx';
import FormTextField from '@/forms/FormTextField.jsx';
import SubmitButton from '@/forms/SubmitButton.jsx';
import {applyServerProblem} from '@/forms/applyServerProblem.js';
import {Yup} from '@/forms/validation.js';
import {
    RECOVERY_CODE_MAX_LENGTH, RECOVERY_CODE_MIN_LENGTH, RECOVERY_CODE_PATTERN, TOTP_CODE_MAX_LENGTH, TOTP_CODE_MIN_LENGTH, TOTP_CODE_PATTERN,
    normalizeRecoveryCode, normalizeTotpCode,
} from '@/forms/security/securityRules.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaSecondStepForm)
const THEME_NAME = 'CalcitaSecondStepForm';
const SecondStepActions = piecePart(THEME_NAME, 'Actions', Stack);

/** Las formas de confirmar el segundo paso, como las manda el servidor. */
export const SECOND_STEP_METHOD = Object.freeze({passkey: 'passkey', totp: 'totp', recoveryCode: 'recoveryCode'});

const UNAUTHENTICATED_STATUS = 401;
const ACCOUNT_LOCKED_CODE = 'account_locked';

/**
 * ¿Se acabó la oportunidad (bloqueo o se venció el tiempo)? Entonces hay que empezar de nuevo desde la contraseña.
 *
 * @param {Error & {status?: number, code?: string, problem?: object}} error
 * @returns {boolean}
 */
function isOutOfAttempts(error) {
    return error?.code === ACCOUNT_LOCKED_CODE
        || (error?.status === UNAUTHENTICATED_STATUS && !Number.isInteger(error?.problem?.remaining_attempts));
}

/**
 * @param {object} props
 * @param {string[]} props.methods los que tiene la cuenta (SECOND_STEP_METHOD), como los mandó el servidor
 * @param {boolean} [props.canUsePasskeys] passkeysSupported() de /passkeys
 * @param {() => Promise<unknown>} [props.onUsePasskey] firma con la llave y termina de entrar; truena si no se pudo
 * @param {(input: {method: string, code: string}) => Promise<unknown>} props.onSubmitCode manda el código ya limpio y
 *     termina de entrar; truena con el ApiError si no
 * @param {(message: string|null) => void} props.onCancel regresa a escribir la contraseña (con el motivo, si lo hay)
 * @param {import('react').ReactNode} [props.footer] abajo del botón, dentro del formulario: puede llenar el código con
 *     useFormikContext (p. ej. el atajo de los ejemplos)
 * @param {object} [props.texts] los textos que cambian, con la forma de `security` en los textos del paquete
 */
export default function SecondStepForm(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSecondStepForm.defaultProps) y encima lo que llega aquí
    const {methods, canUsePasskeys = false, onUsePasskey, onSubmitCode, onCancel, footer, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('security', texts);
    const hasApp = methods.includes(SECOND_STEP_METHOD.totp);
    const hasRecovery = methods.includes(SECOND_STEP_METHOD.recoveryCode);
    const hasPasskey = methods.includes(SECOND_STEP_METHOD.passkey) && canUsePasskeys && Boolean(onUsePasskey);
    const [method, setMethod] = useState(hasApp ? SECOND_STEP_METHOD.totp : SECOND_STEP_METHOD.recoveryCode);
    const [passkeyError, setPasskeyError] = useState(null);
    const [isUsingPasskey, setIsUsingPasskey] = useState(false);
    const isApp = method === SECOND_STEP_METHOD.totp;

    // el esquema se arma al pintar: yup toma sus mensajes al armarlo
    const schema = isApp
        ? Yup.object({code: Yup.string().trim().required(t('twoStep.codeRequired')).min(TOTP_CODE_MIN_LENGTH).max(TOTP_CODE_MAX_LENGTH)
            .matches(TOTP_CODE_PATTERN, t('twoStep.codeFormat'))})
        : Yup.object({code: Yup.string().trim().required(t('secondStep.recoveryCodeRequired')).min(RECOVERY_CODE_MIN_LENGTH)
            .max(RECOVERY_CODE_MAX_LENGTH).matches(RECOVERY_CODE_PATTERN, t('secondStep.recoveryCodeFormat'))});

    const usePasskey = async () => {
        setPasskeyError(null);
        setIsUsingPasskey(true);
        try {
            await onUsePasskey();
        } catch (error) {
            // cancelar el aviso del sistema no es un error que enseñar
            if (!error?.cancelled) {
                setPasskeyError(error?.message);
            }
        } finally {
            setIsUsingPasskey(false);
        }
    };

    const submit = async (values, formikHelpers) => {
        formikHelpers.setStatus(null);
        try {
            const code = isApp ? normalizeTotpCode(values.code) : normalizeRecoveryCode(values.code);
            await onSubmitCode({method, code});
        } catch (error) {
            formikHelpers.setFieldValue('code', '', false);
            if (isOutOfAttempts(error)) {
                onCancel(error?.message ?? null);
                return;
            }
            applyServerProblem(error, {...formikHelpers, values});
            // cuántos intentos quedan, junto al mensaje del servidor
            const remainingAttempts = error?.problem?.remaining_attempts;
            if (Number.isInteger(remainingAttempts)) {
                formikHelpers.setStatus(`${error.message} ${t('secondStep.remainingAttempts', {count: remainingAttempts})}`);
            }
        }
    };

    return (
        <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">{t('secondStep.intro')}</Typography>

            {hasPasskey && (
                <>
                    <Button variant="contained" size="large" startIcon={<FingerprintOutlinedIcon />} onClick={usePasskey} disabled={isUsingPasskey}>
                        {t('secondStep.usePasskey')}
                    </Button>
                    {passkeyError && <Alert severity="error" role="alert">{passkeyError}</Alert>}
                    {(hasApp || hasRecovery) && <Divider>{t('secondStep.or')}</Divider>}
                </>
            )}

            {(hasApp || hasRecovery) && (
                // key: al cambiar de método, el formulario empieza limpio
                <Formik key={method} initialValues={{code: ''}} validationSchema={schema} onSubmit={submit}>
                    <Stack component={Form} noValidate spacing={2}>
                        <FormProblemAlert />
                        {isApp ? (
                            <FormTextField name="code" label={t('secondStep.appCodeLabel')} autoFocus autoComplete="one-time-code" clearable={false}
                                           helperText={t('secondStep.appCodeHelp')}
                                           slotProps={{htmlInput: {inputMode: 'numeric', maxLength: TOTP_CODE_MAX_LENGTH}}} />
                        ) : (
                            <FormTextField name="code" label={t('secondStep.recoveryCodeLabel')} autoFocus autoComplete="off" clearable={false}
                                           helperText={t('secondStep.recoveryCodeHelp')} slotProps={{htmlInput: {maxLength: RECOVERY_CODE_MAX_LENGTH}}} />
                        )}
                        <SubmitButton fullWidth>{t('secondStep.confirm')}</SubmitButton>
                        {footer}
                    </Stack>
                </Formik>
            )}
            {!hasApp && !hasRecovery && footer}

            <SecondStepActions spacing={0.5} ownSx={{alignItems: 'center'}}>
                {hasApp && hasRecovery && (
                    <Link component="button" type="button" variant="body2"
                          onClick={() => setMethod(isApp ? SECOND_STEP_METHOD.recoveryCode : SECOND_STEP_METHOD.totp)}>
                        {isApp ? t('secondStep.useRecovery') : t('secondStep.useApp')}
                    </Link>
                )}
                <Link component="button" type="button" variant="body2" onClick={() => onCancel(null)}>{t('secondStep.otherAccount')}</Link>
            </SecondStepActions>
        </Stack>
    );
}
