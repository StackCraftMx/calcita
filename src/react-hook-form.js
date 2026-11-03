// Formularios con react-hook-form (@stackcraftmx/calcita/react-hook-form): los MISMOS campos que /forms (formik), con los
// mismos nombres, la misma vista y las mismas reglas; cambiar de librería es cambiar el import. Pide react-hook-form y,
// para validar con yup (el Yup del paquete, de /forms), @hookform/resolvers.
//
//   const form = useForm({resolver: yupResolver(schema), defaultValues});
//   <FormProvider {...form}><form onSubmit={form.handleSubmit(submit)} noValidate>
//       <FormTextField name="email" label="Correo" />  …  <SubmitButton>Guardar</SubmitButton>
//   </form></FormProvider>
//
// La fecha con react-hook-form: DateInput de /date-pickers dentro de un Controller.
export {Controller, FormProvider, useFieldArray, useForm, useFormContext, useWatch} from 'react-hook-form';
export {yupResolver} from '@hookform/resolvers/yup';
export {default as FormAttachmentsField} from '@/hookForm/FormAttachmentsField.jsx';
export {default as FormCatalogField} from '@/hookForm/FormCatalogField.jsx';
export {default as FormCheckboxGroupField} from '@/hookForm/FormCheckboxGroupField.jsx';
export {default as FormColorField} from '@/hookForm/FormColorField.jsx';
export {default as FormFileField} from '@/hookForm/FormFileField.jsx';
export {default as FormFileUploadField} from '@/hookForm/FormFileUploadField.jsx';
export {default as FormImageField} from '@/hookForm/FormImageField.jsx';
export {default as FormMaskedField} from '@/hookForm/FormMaskedField.jsx';
export {default as FormNumberField} from '@/hookForm/FormNumberField.jsx';
export {default as FormProblemAlert} from '@/hookForm/FormProblemAlert.jsx';
export {default as FormRepeatingFields} from '@/hookForm/FormRepeatingFields.jsx';
export {default as FormTransferListField} from '@/hookForm/FormTransferListField.jsx';
// las reglas de listas son las mismas de /forms (no dependen de formik): sirven con yupResolver
export {listTotalAtMostRule, listTotalOf, orderedInListRule, uniqueInListRule} from '@/forms/listRules.js';
export {percentRule, sameAsFieldRule} from '@/forms/fieldRules.js';
export {default as FormSelectField} from '@/hookForm/FormSelectField.jsx';
export {default as FormWizard} from '@/hookForm/FormWizard.jsx';
export {default as FormTextField} from '@/hookForm/FormTextField.jsx';
export {default as SubmitButton} from '@/hookForm/SubmitButton.jsx';
export {SERVER_PROBLEM_ROOT, applyServerProblem} from '@/hookForm/applyServerProblem.js';
export {useHookFormField} from '@/hookForm/useHookFormField.js';
