// Formularios con formik y yup (@stackcraftmx/calcita/forms). formik y yup vienen DENTRO del paquete: el proyecto no los
// instala aparte. OJO: Formik, Form y Yup se importan siempre de aquí y no de 'formik' / 'yup' directo; con otra versión
// de formik en el proyecto, los campos del paquete no encontrarían el formulario de la pantalla.
//
// Trae los campos con su error traducido (texto, lista, número, catálogo, color), el botón que espera, el formulario por
// pasos, el aviso de arriba y los errores del servidor (RFC 9457) pegados a cada campo. La fecha va en /date-pickers.
// También los formularios de entrar: iniciar sesión, «¿olvidó su contraseña?» y cambiar la contraseña.
export {FieldArray, Form, Formik, useField, useFormikContext} from 'formik';
export {
    ChangePasswordForm, ForgotPasswordForm, FormCatalogField, FormColorField, FormNumberField, FormProblemAlert, FormSelectField, FormServerProblem,
    FormTextField, FormWizard, SignInForm, SubmitButton, Yup, applyServerProblem, buildYupLocale, formLevelMessageOf, splitServerFieldErrors,
    translateValidationMessage, useFormikField,
} from '@/forms/index.js';
