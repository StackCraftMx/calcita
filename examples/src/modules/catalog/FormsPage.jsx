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
import MaskedFields from '@/modules/catalog/demos/forms/MaskedFields.tsx';
import VolumePrices from '@/modules/catalog/demos/forms/VolumePrices.tsx';
import ContactsHookForm from '@/modules/catalog/demos/forms/ContactsHookForm.tsx';
import ChoosingMany from '@/modules/catalog/demos/forms/ChoosingMany.tsx';
import TransferListDemo from '@/modules/catalog/demos/forms/TransferListDemo.tsx';

const loadFormik = () => import('@/modules/catalog/demos/forms/NewCustomerForm.tsx?demo-source');
const loadHookForm = () => import('@/modules/catalog/demos/forms/NewCustomerHookForm.tsx?demo-source');
const loadWizard = () => import('@/modules/catalog/demos/forms/CreditWizard.tsx?demo-source');
const loadHookWizard = () => import('@/modules/catalog/demos/forms/CreditWizardHookForm.tsx?demo-source');
const loadMasked = () => import('@/modules/catalog/demos/forms/MaskedFields.tsx?demo-source');
const loadRepeating = () => import('@/modules/catalog/demos/forms/VolumePrices.tsx?demo-source');
const loadRepeatingHookForm = () => import('@/modules/catalog/demos/forms/ContactsHookForm.tsx?demo-source');
const loadChoosingMany = () => import('@/modules/catalog/demos/forms/ChoosingMany.tsx?demo-source');
const loadTransferList = () => import('@/modules/catalog/demos/forms/TransferListDemo.tsx?demo-source');

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

const MASKED_EXTENSIONS = [
    {id: 'presets', option: 'mask={INPUT_MASK.phone · clabe · rfc · curp · uuid · postalCode · card}', example: '<MaskedInput label="CLABE" mask={INPUT_MASK.clabe} value={clabe} onChange={setClabe} />'},
    {id: 'pattern', option: "mask='9 A X H'", example: 'mask="AAA-9999"  // 9 dígito · A letra · X letra o dígito · H hexadecimal'},
    {id: 'clean', option: 'value · onChange (valor limpio)', example: "onChange={(clean) => setPhone(clean)}  // '5551234567'"},
    {id: 'forms', option: 'FormMaskedField', example: "<FormMaskedField name=\"phone\" mask=\"phone\" label=\"Teléfono\" />  // /forms o /react-hook-form"},
    {id: 'pure', option: 'maskedTextOf · rawValueOf · isMaskComplete', example: "maskedTextOf('5551234567', INPUT_MASK.phone)  // '555 123 4567'"},
    {id: 'textInput', option: 'lo de TextInput', example: 'helperText="10 dígitos" placeholder="555 123 4567" error={errors.phone}'},
];

const REPEATING_EXTENSIONS = [
    {id: 'rows', option: 'name · emptyRow · renderRow({nameOf, index, row})', example: "renderRow={({nameOf}) => <FormTextField name={nameOf('email')} label=\"Correo\" />}"},
    {id: 'limits', option: 'minRows · maxRows', example: 'minRows={1} maxRows={5}  // con el mínimo, «Quitar» limpia el renglón'},
    {id: 'layout', option: 'columns · rowLabelOf · addLabel · label', example: "columns={{xs: 1, md: 3}} rowLabelOf={(index) => `Precio ${index + 1}`}"},
    {id: 'unique', option: 'uniqueInListRule', example: "Yup.string().test(uniqueInListRule('prices', 'min_quantity'))"},
    {id: 'ordered', option: 'orderedInListRule', example: "Yup.string().test(orderedInListRule('prices', 'unit_price', {ascending: false}))"},
    {id: 'total', option: 'listTotalAtMostRule · listTotalOf', example: "Yup.array().test(listTotalAtMostRule('amount', (values) => values.credit_limit))"},
    {id: 'slots', option: 'rowActionsOf · footer · helperText', example: 'footer={<Typography>Suman {listTotalOf(rows, \'amount\').format()}</Typography>}'},
    {id: 'view', option: '<RepeatingFields> · useRowKeys', example: "import {RepeatingFields} from '@stackcraftmx/calcita';  // la vista sola, para otro formulario"},
];
const REPEATING_HOOK_EXTENSIONS = [
    {id: 'entry', option: "FormRepeatingFields de '@stackcraftmx/calcita/react-hook-form'", example: '<FormRepeatingFields name="contacts" emptyRow={EMPTY_CONTACT} renderRow={…} />'},
    {id: 'remove', option: 'removeBlockedReason · confirmRemove', example: "removeBlockedReason={(row) => (row.is_main ? 'Es el principal' : null)} confirmRemove={(row) => Boolean(row.id)}"},
    {id: 'events', option: 'onAdd · onRemove', example: 'onRemove={(row) => row.id && removedIds.push(row.id)}'},
    {id: 'serverProblem', option: 'applyServerProblem', example: "// el 422 en 'contacts.2.email' llega a ese renglón"},
];

const CHOOSING_MANY_EXTENSIONS = [
    {id: 'checkboxGroup', option: 'CheckboxGroupInput · FormCheckboxGroupField', example: '<FormCheckboxGroupField name="channels" label="Avisos por" options={CHANNELS} selectAll row />'},
    {id: 'selectAll', option: 'selectAll', example: '<FormSelectField name="days" label="Días" options={DAYS} multiple selectAll />'},
    {id: 'checkboxes', option: 'checkboxes', example: '<FormCatalogField name="states" label="Estados" options={states} multiple checkboxes />'},
    {id: 'limitTags', option: 'limitTags', example: 'limitTags={3}  // sin foco: 3 chips y «+5 más»'},
    {id: 'options', option: 'options[].description · options[].disabled', example: "{value: 'call', label: 'Llamada', description: 'Para cobranza vencida', disabled: true}"},
    {id: 'rules', option: 'Yup.array()', example: 'Yup.array().min(1)  // «Elija al menos 1 opción»'},
    {id: 'pure', option: 'selectAllStateOf', example: 'const {allChosen, someChosen, toggled} = selectAllStateOf(chosen, candidates);'},
];
const TRANSFER_LIST_EXTENSIONS = [
    {id: 'field', option: 'TransferListInput · FormTransferListField', example: '<FormTransferListField name="allowedBranchIds" options={branches} />'},
    {id: 'titles', option: 'availableTitle · chosenTitle', example: 'availableTitle="Todos los usuarios" chosenTitle="Pueden ver el reporte"'},
    {id: 'search', option: 'searchable · listHeight', example: 'searchable listHeight={360}  // por omisión, buscador con más de 8'},
    {id: 'options', option: 'options[].description · options[].disabled', example: "{value: 'b-12', label: 'Comprador SA', description: 'RFC CSA010101AA1'}"},
    {id: 'theme', option: 'theme.components.CalcitaTransferListInput', example: 'components: {CalcitaTransferListInput: {styleOverrides: {list: {borderRadius: 4}}}}'},
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
            <DemoSection title={t('forms.masked.title')} description={t('forms.masked.description')}
                         extensions={rowsOf('masked', MASKED_EXTENSIONS)} Demo={MaskedFields} loadSource={loadMasked} />
            <DemoSection title={t('forms.repeating.title')} description={t('forms.repeating.description')}
                         extensions={rowsOf('repeating', REPEATING_EXTENSIONS)} Demo={VolumePrices} loadSource={loadRepeating} />
            <DemoSection title={t('forms.repeatingHookForm.title')} description={t('forms.repeatingHookForm.description')}
                         extensions={rowsOf('repeatingHookForm', REPEATING_HOOK_EXTENSIONS)} Demo={ContactsHookForm} loadSource={loadRepeatingHookForm} />
            <DemoSection title={t('forms.choosingMany.title')} description={t('forms.choosingMany.description')}
                         extensions={rowsOf('choosingMany', CHOOSING_MANY_EXTENSIONS)} Demo={ChoosingMany} loadSource={loadChoosingMany} />
            <DemoSection title={t('forms.transferList.title')} description={t('forms.transferList.description')}
                         extensions={rowsOf('transferList', TRANSFER_LIST_EXTENSIONS)} Demo={TransferListDemo} loadSource={loadTransferList} />
        </Stack>
    );
};
