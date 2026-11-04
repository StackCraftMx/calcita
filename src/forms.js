// Formularios con formik y yup (@stackcraftmx/calcita/forms). formik y yup los instala el proyecto (pnpm add formik yup):
// Calcita no se casa con una versión, usa la que ya tenga el sistema. Formik, Form y Yup también se pueden importar de aquí;
// es la misma copia que la del proyecto (los campos del paquete encuentran el formulario de la pantalla).
//
// Trae los campos con su error traducido (texto, lista, número, catálogo, color), el botón que espera, el formulario por
// pasos, el aviso de arriba y los errores del servidor (RFC 9457) pegados a cada campo. La fecha va en /date-pickers.
// También los formularios de entrar: iniciar sesión, «¿olvidó su contraseña?» y cambiar la contraseña.
export {FieldArray, Form, useField, useFormikContext} from 'formik';
// el de formik, con el esquema a la vista de los campos (CalcitaFormik.jsx); lo demás, igual
export {default as Formik} from '@/forms/CalcitaFormik.jsx';
export {FormSchemaProvider, useFormSchema} from '@/forms/FormSchemaProvider.jsx';
export {
    ChangePasswordForm, ForgotPasswordForm, FormAttachmentsField, FormCatalogField, FormCheckboxGroupField, FormColorField, FormFileField, FormFileUploadField, FormImageField,
    FormMaskedField, FormNumberField, FormProblemAlert, FormRepeatingFields, FormSelectField, FormServerProblem, FormTransferListField,
    FormTextField, FormWizard, RECOVERY_CODE_PATTERN, SECOND_STEP_METHOD, SecondStepForm, SignInForm, SubmitButton, TOTP_CODE_PATTERN,
    TwoStepVerificationCard, Yup, applyServerProblem, buildYupLocale, formLevelMessageOf, isRequiredInSchema, normalizeRecoveryCode, normalizeTotpCode,
    listTotalAtMostRule, listTotalOf, orderedInListRule, percentRule, sameAsFieldRule, splitRowFieldErrors, splitServerFieldErrors, translateValidationMessage,
    uniqueInListRule, useFormikField,
} from '@/forms/index.js';
