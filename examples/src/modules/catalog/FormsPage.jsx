// Hecho en Calcita · formularios: los campos de la casa con formik o react-hook-form, el formulario al estilo de Apple, los
// errores del servidor en su campo, varias opciones (multiple) y el formulario por pasos con formik o react-hook-form. Cada sección dice para qué sirve en una línea, enseña el
// código mínimo y trae su tabla «Cómo se extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import NewCustomerForm from '@/modules/catalog/demos/forms/NewCustomerForm.tsx';
import NewCustomerHookForm from '@/modules/catalog/demos/forms/NewCustomerHookForm.tsx';
import CreditWizard from '@/modules/catalog/demos/forms/CreditWizard.tsx';
import CreditWizardHookForm from '@/modules/catalog/demos/forms/CreditWizardHookForm.tsx';

const loadFormik = () => import('@/modules/catalog/demos/forms/NewCustomerForm.tsx?demo-source');
const loadHookForm = () => import('@/modules/catalog/demos/forms/NewCustomerHookForm.tsx?demo-source');
const loadWizard = () => import('@/modules/catalog/demos/forms/CreditWizard.tsx?demo-source');
const loadHookWizard = () => import('@/modules/catalog/demos/forms/CreditWizardHookForm.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (forms.<sección>.extend.<id>)
const FORMIK_EXTENSIONS = [
    {id: 'section', option: '<FormSection title footer>', example: '<FormSection title="Contacto" footer="El correo es el de sus facturas.">…</FormSection>'},
    {id: 'text', option: 'FormTextField type · helperText · placeholder', example: '<FormTextField name="password" label="Contraseña" type="password" />'},
    {id: 'textShape', option: 'uppercase · normalizeOnBlur · multiline · clearable', example: '<FormTextField name="rfc" label="RFC" uppercase />'},
    {id: 'adornments', option: 'startAdornment · endAdornment', example: '<FormTextField name="weight" label="Peso" endAdornment="kg" />'},
    {id: 'number', option: 'FormNumberField prefix · suffix · decimals · allowNegative · maxDigits', example: '<FormNumberField name="discount" label="Descuento" suffix="%" decimals={1} />'},
    {id: 'select', option: 'FormSelectField options', example: "options={[{value: 'retail', label: 'Menudeo', description: 'Por pieza'}]}"},
    {id: 'catalog', option: 'FormCatalogField options · formatLabel · loading', example: '<FormCatalogField name="state" label="Estado" options={states} loading={!states} />'},
    {id: 'multiple', option: 'multiple (FormSelectField · FormCatalogField)', example: '<FormSelectField name="deliveryDays" label="Días en que recibe" options={days} multiple />'},
    {id: 'otherFields', option: 'FormDateField · FormColorField', example: "import {FormDateField} from '@stackcraftmx/calcita/date-pickers';"},
    {id: 'rules', option: 'Yup', example: 'Yup.object({email: Yup.string().trim().required().email()})'},
    {id: 'serverProblem', option: 'applyServerProblem(error, helpers)', example: 'catch (error) { applyServerProblem(error, {...formikHelpers, values}); }'},
    {id: 'problemAlert', option: '<FormProblemAlert />', example: '<FormProblemAlert />'},
    {id: 'submit', option: '<SubmitButton>', example: '<SubmitButton>Guardar</SubmitButton>'},
];
const HOOK_FORM_EXTENSIONS = [
    {id: 'entry', option: "'@stackcraftmx/calcita/react-hook-form'", example: "import {FormTextField, SubmitButton} from '@stackcraftmx/calcita/react-hook-form';"},
    {id: 'setup', option: 'useForm · yupResolver · FormProvider', example: 'const form = useForm({resolver: yupResolver(schema), defaultValues});'},
    {id: 'multiple', option: 'multiple', example: '<FormCatalogField name="zones" label="Estados" options={states} multiple />'},
    {id: 'serverProblem', option: 'applyServerProblem(error, form)', example: 'catch (error) { applyServerProblem(error, form); }'},
];
const WIZARD_EXTENSIONS = [
    {id: 'steps', option: 'steps[].key · label · content', example: "{key: 'company', label: 'Empresa', content: <CompanyFields />}"},
    {id: 'fields', option: 'steps[].fields', example: "fields: ['company', 'rfc']"},
    {id: 'optional', option: 'steps[].optional', example: 'optional: true'},
    {id: 'submitLabel', option: 'submitLabel', example: '<FormWizard steps={steps} submitLabel="Enviar solicitud" />'},
    {id: 'texts', option: 'texts', example: "texts={{wizard: {next: 'Continuar', skip: 'Ahora no'}}}"},
    {id: 'layout', option: '<WizardLayout>', example: '<WizardLayout steps={steps} activeIndex={index} skippedKeys={skipped} onNext={next} onBack={back} onSkip={skip} submitButton={…} />'},
];
const HOOK_WIZARD_EXTENSIONS = [
    {id: 'entry', option: "FormWizard de '@stackcraftmx/calcita/react-hook-form'", example: '<FormProvider {...form}><form onSubmit={form.handleSubmit(send)}><FormWizard … /></form></FormProvider>'},
    {id: 'skip', option: 'steps[].optional', example: 'optional: true  // «Omitir» hace resetField de sus campos'},
    {id: 'serverProblem', option: 'applyServerProblem(error, form)', example: 'catch (error) { applyServerProblem(error, form); }'},
    {id: 'texts', option: 'texts', example: "texts={{wizard: {next: 'Continuar', back: 'Regresar'}}}"},
];

export const FormsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `forms.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('forms.title')} description={t('forms.description')} />
            <DemoSection title={t('forms.formik.title')} description={t('forms.formik.description')}
                         extensions={rowsOf('formik', FORMIK_EXTENSIONS)} Demo={NewCustomerForm} loadSource={loadFormik} />
            <DemoSection title={t('forms.hookForm.title')} description={t('forms.hookForm.description')}
                         extensions={rowsOf('hookForm', HOOK_FORM_EXTENSIONS)} Demo={NewCustomerHookForm} loadSource={loadHookForm} />
            <DemoSection title={t('forms.wizard.title')} description={t('forms.wizard.description')}
                         extensions={rowsOf('wizard', WIZARD_EXTENSIONS)} Demo={CreditWizard} loadSource={loadWizard} />
            <DemoSection title={t('forms.hookWizard.title')} description={t('forms.hookWizard.description')}
                         extensions={rowsOf('hookWizard', HOOK_WIZARD_EXTENSIONS)} Demo={CreditWizardHookForm} loadSource={loadHookWizard} />
        </Stack>
    );
};
