// Formularios con formik y yup (@stackcraftmx/calcita/forms). formik y yup los instala el proyecto (pnpm add formik yup):
// Calcita no se casa con una versión, usa la que ya tenga el sistema. Formik, Form y Yup también se pueden importar de aquí;
// es la misma copia que la del proyecto (los campos del paquete encuentran el formulario de la pantalla).
//
// Trae los campos con su error traducido (texto, lista, número, catálogo, color), el botón que espera, el formulario por
// pasos, el aviso de arriba y los errores del servidor (RFC 9457) pegados a cada campo. La fecha va en /date-pickers.
// También los formularios de entrar: iniciar sesión, «¿olvidó su contraseña?» y cambiar la contraseña.
export {FieldArray, Form, Formik, useField, useFormikContext} from 'formik';
export {
    ChangePasswordForm, ForgotPasswordForm, FormCatalogField, FormColorField, FormNumberField, FormProblemAlert, FormSelectField, FormServerProblem,
    FormTextField, FormWizard, RECOVERY_CODE_PATTERN, SECOND_STEP_METHOD, SecondStepForm, SignInForm, SubmitButton, TOTP_CODE_PATTERN,
    TwoStepVerificationCard, Yup, applyServerProblem, buildYupLocale, formLevelMessageOf, normalizeRecoveryCode, normalizeTotpCode,
    splitServerFieldErrors, translateValidationMessage, useFormikField,
} from '@/forms/index.js';
