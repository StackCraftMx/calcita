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
export {Controller, FormProvider, useForm, useFormContext} from 'react-hook-form';
export {yupResolver} from '@hookform/resolvers/yup';
export {default as FormCatalogField} from '@/hookForm/FormCatalogField.jsx';
export {default as FormColorField} from '@/hookForm/FormColorField.jsx';
export {default as FormNumberField} from '@/hookForm/FormNumberField.jsx';
export {default as FormProblemAlert} from '@/hookForm/FormProblemAlert.jsx';
export {default as FormSelectField} from '@/hookForm/FormSelectField.jsx';
export {default as FormWizard} from '@/hookForm/FormWizard.jsx';
export {default as FormTextField} from '@/hookForm/FormTextField.jsx';
export {default as SubmitButton} from '@/hookForm/SubmitButton.jsx';
export {SERVER_PROBLEM_ROOT, applyServerProblem} from '@/hookForm/applyServerProblem.js';
export {useHookFormField} from '@/hookForm/useHookFormField.js';
