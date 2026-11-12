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
import OwnErrorMessages from '@/modules/catalog/demos/forms/OwnErrorMessages.tsx';
import EditingWizard from '@/modules/catalog/demos/forms/EditingWizard.tsx';
import RequiredFromSchema from '@/modules/catalog/demos/forms/RequiredFromSchema.tsx';
import PhoneLabels from '@/modules/catalog/demos/forms/PhoneLabels.tsx';
import DocumentsWizard from '@/modules/catalog/demos/forms/DocumentsWizard.tsx';
import CellField from '@/modules/catalog/demos/forms/CellField.tsx';
import TableForm from '@/modules/catalog/demos/forms/TableForm.tsx';
import RowByRowForm from '@/modules/catalog/demos/forms/RowByRowForm.tsx';
import RowByRowHookForm from '@/modules/catalog/demos/forms/RowByRowHookForm.tsx';
import FieldLimits from '@/modules/catalog/demos/forms/FieldLimits.tsx';

const loadFormik = () => import('@/modules/catalog/demos/forms/NewCustomerForm.tsx?demo-source');
const loadHookForm = () => import('@/modules/catalog/demos/forms/NewCustomerHookForm.tsx?demo-source');
const loadWizard = () => import('@/modules/catalog/demos/forms/CreditWizard.tsx?demo-source');
const loadHookWizard = () => import('@/modules/catalog/demos/forms/CreditWizardHookForm.tsx?demo-source');
const loadMasked = () => import('@/modules/catalog/demos/forms/MaskedFields.tsx?demo-source');
const loadRepeating = () => import('@/modules/catalog/demos/forms/VolumePrices.tsx?demo-source');
const loadRepeatingHookForm = () => import('@/modules/catalog/demos/forms/ContactsHookForm.tsx?demo-source');
const loadChoosingMany = () => import('@/modules/catalog/demos/forms/ChoosingMany.tsx?demo-source');
const loadTransferList = () => import('@/modules/catalog/demos/forms/TransferListDemo.tsx?demo-source');
const loadOwnMessages = () => import('@/modules/catalog/demos/forms/OwnErrorMessages.tsx?demo-source');
const loadEditingWizard = () => import('@/modules/catalog/demos/forms/EditingWizard.tsx?demo-source');
const loadRequiredFromSchema = () => import('@/modules/catalog/demos/forms/RequiredFromSchema.tsx?demo-source');
const loadPhoneLabels = () => import('@/modules/catalog/demos/forms/PhoneLabels.tsx?demo-source');
const loadDocumentsWizard = () => import('@/modules/catalog/demos/forms/DocumentsWizard.tsx?demo-source');
const loadFieldLimits = () => import('@/modules/catalog/demos/forms/FieldLimits.tsx?demo-source');
const loadCellField = () => import('@/modules/catalog/demos/forms/CellField.tsx?demo-source');
const loadTableForm = () => import('@/modules/catalog/demos/forms/TableForm.tsx?demo-source');
const loadRowByRowForm = () => import('@/modules/catalog/demos/forms/RowByRowForm.tsx?demo-source');
const loadRowByRowHookForm = () => import('@/modules/catalog/demos/forms/RowByRowHookForm.tsx?demo-source');

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
    {id: 'screenEvents', option: 'onChange · onBlur', example: '<FormSelectField name="kind" … onChange={(kind) => loadRatesFor(kind)} />'},
];
const HOOK_FORM_EXTENSIONS = [
    {id: 'entry', option: "'@stackcraftmx/calcita/react-hook-form'", example: "import {FormTextField, SubmitButton} from '@stackcraftmx/calcita/react-hook-form';"},
    {id: 'setup', option: 'useForm · yupResolver · FormProvider', example: 'const form = useForm({resolver: yupResolver(schema), defaultValues});'},
    {id: 'multiple', option: 'multiple', example: '<FormCatalogField name="zones" label="Estados" options={states} multiple />'},
    {id: 'serverProblem', option: 'applyServerProblem(error, form)', example: 'catch (error) { applyServerProblem(error, form); }'},
    {id: 'screenEvents', option: 'onChange · onBlur', example: '<FormTextField name="name" label="Nombre" onChange={setInvoiceName} />'},
];
const WIZARD_EXTENSIONS = [
    {id: 'steps', option: 'steps[].key · label · content', example: "{key: 'company', label: 'Empresa', content: <CompanyFields />}"},
    {id: 'fields', option: 'steps[].fields', example: "fields: ['company', 'rfc']"},
    {id: 'optional', option: 'steps[].optional', example: 'optional: true'},
    {id: 'hideBackOnFirstStep', option: 'hideBackOnFirstStep', example: '<FormWizard steps={steps} hideBackOnFirstStep />  // sin «Anterior» en el primer paso'},
    {id: 'submitLabel', option: 'submitLabel', example: '<FormWizard steps={steps} submitLabel="Enviar solicitud" />'},
    {id: 'texts', option: 'texts', example: "texts={{wizard: {next: 'Continuar', skip: 'Ahora no'}}}"},
    {id: 'layout', option: '<WizardLayout>', example: '<WizardLayout steps={steps} activeIndex={index} skippedKeys={skipped} onNext={next} onBack={back} onSkip={skip} submitButton={…} />'},
];
const EDITING_WIZARD_EXTENSIONS = [
    {id: 'initialStepKey', option: 'initialStepKey', example: 'initialStepKey={review.stepKey}  // el paso que dice el servidor'},
    {id: 'orientation', option: 'orientation · WIZARD_ORIENTATION', example: 'orientation={WIZARD_ORIENTATION.vertical}'},
    {id: 'stepSelection', option: 'stepSelection · WIZARD_STEP_SELECTION', example: 'stepSelection={WIZARD_STEP_SELECTION.free}  // o .checked'},
    {id: 'completed', option: 'steps[].completed', example: "{key: 'company', label: 'Empresa', completed: true, …}"},
    {id: 'onStepChange', option: 'onStepChange(stepKey, index)', example: "onStepChange={(stepKey) => setSearchParams({step: stepKey})}"},
    {id: 'layout', option: '<WizardLayout orientation onStepSelect>', example: '<WizardLayout … orientation="vertical" onStepSelect={(index) => setActiveIndex(index)} />'},
];
const REQUIRED_EXTENSIONS = [
    {id: 'provider', option: 'ToolkitProvider requiredFromSchema', example: '<ToolkitProvider requiredFromSchema>  // una vez, en la raíz'},
    {id: 'required', option: 'required', example: '<FormTextField name="rfc" label="RFC" required />  // gana al esquema'},
    {id: 'formikImport', option: 'Formik de Calcita · FormSchemaProvider', example: '<FormSchemaProvider schema={schema}>…</FormSchemaProvider>  // con el Formik de formik'},
    {id: 'hookForm', option: 'react-hook-form · FormSchemaProvider', example: '<FormProvider {...form}><FormSchemaProvider schema={schema}>…los campos…</FormSchemaProvider></FormProvider>'},
    {id: 'mark', option: "CalcitaFieldFrame · CalcitaFormRow label '&[data-required]::after'", example: "components: {CalcitaFormRow: {styleOverrides: {label: {'&[data-required]::after': {color: 'red'}}}}}"},
    {id: 'markText', option: "texts common.form.requiredMark", example: "texts={{es: {common: {form: {requiredMark: '(obligatorio)'}}}}}"},
    {id: 'pure', option: 'isRequiredInSchema(schema, name, values)', example: "isRequiredInSchema(schema, 'contacts.2.email', values)"},
];
const PHONE_LABELS_EXTENSIONS = [
    {id: 'placement', option: 'labelPlacement · FORM_LABEL_PLACEMENT', example: '<FormSection title="Representante" labelPlacement={FORM_LABEL_PLACEMENT.topOnPhone}>'},
    {id: 'theme', option: 'CalcitaFormSection defaultProps', example: "components: {CalcitaFormSection: {defaultProps: {labelPlacement: 'topOnPhone'}}}"},
    {id: 'breakpoint', option: 'theme.breakpoints sm', example: 'createTheme({breakpoints: {values: {sm: 640}}})  // dónde empieza el teléfono'},
];
const DOCUMENTS_STEP_EXTENSIONS = [
    {id: 'reason', option: 'steps[].nextDisabledReason', example: "nextDisabledReason: missing > 0 ? `Faltan ${missing} documentos` : null  // formik y react-hook-form"},
    {id: 'layoutReason', option: '<WizardLayout nextDisabledReason>', example: '<WizardLayout … nextDisabledReason={reason} submitButton={<Button disabled={Boolean(reason)}>Enviar</Button>} />'},
    {id: 'reasonTheme', option: 'CalcitaWizardLayout nextReason', example: "components: {CalcitaWizardLayout: {styleOverrides: {nextReason: {color: 'red'}}}}"},
    {id: 'labelWidth', option: 'labelWidth · FORM_LABEL_WIDTH', example: '<FormSection labelWidth={FORM_LABEL_WIDTH.auto} labelPlacement={FORM_LABEL_PLACEMENT.topOnPhone}>  // o labelWidth="320px" · {280}'},
    {id: 'sectionSx', option: 'FormSection sx', example: '<FormSection sx={{mb: 3}}>'},
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

const LIMITS_EXTENSIONS = [
    {id: 'mode', option: 'ToolkitProvider limitMode · limitMode', example: '<ToolkitProvider limitMode={LIMIT_MODE.fix}>  // o en un campo: limitMode={LIMIT_MODE.warn}'},
    {id: 'schema', option: 'ToolkitProvider limitsFromSchema', example: 'Yup.string().max(12)  ·  Yup.array().min(2).max(3)  ·  Yup.number().min(0).max(100)'},
    {id: 'fixEvent', option: 'onLimitFix · messages fixedToMin · fixedToMax', example: "onLimitFix={(fix) => bitacora.push(fix)}  // {rule, limit, typedValue, fixedValue, message}"},
    {id: 'number', option: 'NumberInput · FormNumberField min · max', example: '<FormNumberField name="amount" label="Monto" min={5000} max={500000} />'},
    {id: 'text', option: 'TextInput · FormTextField minLength · maxLength', example: '<FormTextField name="reference" label="Referencia" maxLength={12} />  // «3 de 12»'},
    {id: 'lists', option: 'minSelected · maxSelected', example: '<FormSelectField name="days" label="Días" options={days} multiple maxSelected={3} />'},
    {id: 'files', option: 'AttachmentsInput · FormAttachmentsField minFiles', example: '<FormAttachmentsField name="evidence" label="Evidencia" minFiles={2} maxFiles={5} />'},
    {id: 'dates', option: 'minDate · maxDate · disablePast · disableFuture · minTime · minMonth · minDateTime', example: '<FormDateField name="deliveryDate" label="Entrega" disablePast maxDate="2026-12-31" />'},
    {id: 'hookForm', option: 'react-hook-form · FormSchemaProvider', example: '<FormProvider {...form}><FormSchemaProvider schema={schema}>…los campos…</FormSchemaProvider></FormProvider>'},
    {id: 'messages', option: 'messages · validation.fields.<campo>.max', example: "<FormNumberField name=\"amount\" min={5000} messages={{min: 'El crédito empieza en $5,000'}} />"},
    {id: 'pure', option: 'numberLimitProblemOf · fixedNumberText · textLimitProblemOf · listLimitProblemOf', example: "numberLimitProblemOf('1500', {max: 1000})  // {key: 'validation:numberMax', values: {max: '1,000'}}"},
];

const CELL_FIELD_EXTENSIONS = [
    {id: 'bare', option: 'FormSection variant · FORM_SECTION_VARIANT', example: '<FormSection variant={FORM_SECTION_VARIANT.bare} labelWidth={0}><Table>…</Table></FormSection>  // una para toda la tabla'},
    {id: 'anyField', option: 'TextInput · NumberInput · SelectInput · CatalogInput · DateInput · FormRow', example: '<NumberInput label="Abono de F-1042" prefix="$" max={amount} … />  // y sus versiones de formik y react-hook-form'},
    {id: 'noLabelColumn', option: 'labelWidth={0}', example: '<DateInput label="Fecha de pago de F-1042" … />  // no se ve, el lector la lee'},
    {id: 'looseField', option: 'createToolkitTheme({fields: {radius}})', example: 'createToolkitTheme({fields: {radius: 999}})  // la cápsula también en un campo suelto'},
    {id: 'theme', option: 'CalcitaFormSection defaultProps', example: "components: {CalcitaFormSection: {defaultProps: {variant: 'bare'}}}  // casi nunca: es para una celda"},
];

const TABLE_FORM_EXTENSIONS = [
    {id: 'layout', option: 'layout · REPEATING_LAYOUT · tableColumns', example: "layout={REPEATING_LAYOUT.table} tableColumns={[{key: 'branch', header: 'Sucursal', width: 150}, …]}"},
    {id: 'order', option: 'renderRow (en orden)', example: 'renderRow={({nameOf}) => (<><FormSelectField name={nameOf(\'branch_id\')} … /><FormNumberField … /></>)}'},
    {id: 'phone', option: 'phoneLayout · REPEATING_PHONE_LAYOUT', example: 'phoneLayout={REPEATING_PHONE_LAYOUT.scroll}  // por omisión, tarjetas'},
    {id: 'unique', option: 'uniqueInListRule(lista, [columnas])', example: "Yup.string().test(uniqueInListRule('rules', ['branch_id', 'channel']))"},
    {id: 'dependent', option: 'onChange · setFieldValue', example: "onChange={(branchId) => setFieldValue(nameOf('channel'), '')}"},
    {id: 'saved', option: 'disabled · confirmRemove', example: 'confirmRemove={(rule) => Boolean(rule.id)}  // y disabled={Boolean(row.id)} en lo que no cambia'},
    {id: 'computed', option: 'NumberInput readOnly · un texto', example: '<NumberInput label="Disponible" value={available} readOnly onChange={() => {}} />'},
    {id: 'hookForm', option: "FormRepeatingFields de '@stackcraftmx/calcita/react-hook-form'", example: '<FormRepeatingFields name="rules" layout={REPEATING_LAYOUT.table} tableColumns={…} … />  // igual'},
    {id: 'theme', option: 'CalcitaRepeatingFields table · headerCell · cell · numberCell', example: "components: {CalcitaRepeatingFields: {styleOverrides: {headerCell: {fontWeight: 700}}}}"},
];

const ROW_BY_ROW_EXTENSIONS = [
    {id: 'piece', option: 'EditableRows · rows · rowKeyOf · onSaveRow', example: 'onSaveRow={(values, {isNew}) => (isNew ? createRule(values) : updateRule(values))}'},
    {id: 'schema', option: 'rowSchema · validateRow', example: "validateRow={(rule, {otherRows}) => (otherRows.some(…) ? {channel: 'Ya está'} : {})}"},
    {id: 'renderRow', option: 'renderRow({row, savedRow, isNew, nameOf, form})', example: "form.setFieldValue(nameOf('channel'), '')  // el formulario de ESE renglón"},
    {id: 'server', option: 'applyServerProblem(error, {...helpers, values})', example: 'catch (error) { applyServerProblem(error, {...helpers, values}); throw error; }'},
    {id: 'addRemove', option: 'emptyRow · onRemoveRow · confirmRemove', example: 'emptyRow={EMPTY_RULE} onRemoveRow={(rule) => removeRule(rule.id)}  // sin ellos, solo se edita'},
    {id: 'sameView', option: 'layout · tableColumns · phoneLayout', example: 'layout={REPEATING_LAYOUT.table} tableColumns={COLUMNS}  // lo mismo que FormRepeatingFields'},
    {id: 'hookForm', option: "EditableRows de '@stackcraftmx/calcita/react-hook-form' · formOptions", example: "rowSchema={ruleSchema} formOptions={{mode: 'onBlur'}}  // onSaveRow recibe {form}; renderRow, form.setValue"},
];

const ROW_BY_ROW_HOOK_EXTENSIONS = [
    {id: 'entry', option: "EditableRows de '@stackcraftmx/calcita/react-hook-form'", example: "import {EditableRows, FormSelectField} from '@stackcraftmx/calcita/react-hook-form';"},
    {id: 'save', option: 'onSaveRow(values, {form, isNew})', example: 'catch (error) { applyServerProblem(error, form); throw error; }'},
    {id: 'dependent', option: 'renderRow({form}) · form.setValue', example: "form.setValue(nameOf('channel'), '')"},
    {id: 'options', option: 'formOptions', example: "formOptions={{mode: 'onBlur'}}  // lo demás de useForm de cada renglón"},
];

const OWN_MESSAGES_EXTENSIONS = [
    {id: 'messages', option: 'messages (en el campo)', example: "<FormTextField name=\"rfc\" label=\"RFC\" messages={{rfc: 'Revise el RFC', required: 'Escriba el RFC'}} />"},
    {id: 'fieldTexts', option: 'validation.fields.<campo>.<regla>', example: "texts={{es: {validation: {fields: {postal_code: {postalCode: 'Lleva 5 dígitos'}}}}}}"},
    {id: 'label', option: '{{label}} · .label()', example: "Yup.string().label('RFC').required()  // «Escriba {{label}}»"},
    {id: 'legacy', option: 'readValidationMessage', example: '<ToolkitProvider readValidationMessage={(error) => (error?.codigo ? {key: `legado:${error.codigo}`} : undefined)}>'},
    {id: 'rules', option: 'sameAsFieldRule · percentRule · postalCodeRule', example: "Yup.string().test(sameAsFieldRule('clabe', {otherLabel: 'la CLABE'}))"},
    {id: 'ownField', option: 'useValidationText({name, label, messages})', example: 'const errorText = useValidationText({name, label})(error);'},
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
            <DemoSection title={t('forms.ownMessages.title')} description={t('forms.ownMessages.description')}
                         extensions={rowsOf('ownMessages', OWN_MESSAGES_EXTENSIONS)} Demo={OwnErrorMessages} loadSource={loadOwnMessages} />
            <DemoSection title={t('forms.editingWizard.title')} description={t('forms.editingWizard.description')}
                         extensions={rowsOf('editingWizard', EDITING_WIZARD_EXTENSIONS)} Demo={EditingWizard} loadSource={loadEditingWizard} />
            <DemoSection title={t('forms.requiredMarks.title')} description={t('forms.requiredMarks.description')}
                         extensions={rowsOf('requiredMarks', REQUIRED_EXTENSIONS)} Demo={RequiredFromSchema} loadSource={loadRequiredFromSchema} />
            <DemoSection title={t('forms.phoneLabels.title')} description={t('forms.phoneLabels.description')}
                         extensions={rowsOf('phoneLabels', PHONE_LABELS_EXTENSIONS)} Demo={PhoneLabels} loadSource={loadPhoneLabels} />
            <DemoSection title={t('forms.documentsStep.title')} description={t('forms.documentsStep.description')}
                         extensions={rowsOf('documentsStep', DOCUMENTS_STEP_EXTENSIONS)} Demo={DocumentsWizard} loadSource={loadDocumentsWizard} />
            <DemoSection title={t('forms.limits.title')} description={t('forms.limits.description')}
                         extensions={rowsOf('limits', LIMITS_EXTENSIONS)} Demo={FieldLimits} loadSource={loadFieldLimits} />
            <DemoSection title={t('forms.cellField.title')} description={t('forms.cellField.description')}
                         extensions={rowsOf('cellField', CELL_FIELD_EXTENSIONS)} Demo={CellField} loadSource={loadCellField} />
            <DemoSection title={t('forms.tableForm.title')} description={t('forms.tableForm.description')}
                         extensions={rowsOf('tableForm', TABLE_FORM_EXTENSIONS)} Demo={TableForm} loadSource={loadTableForm} />
            <DemoSection title={t('forms.rowByRow.title')} description={t('forms.rowByRow.description')}
                         extensions={rowsOf('rowByRow', ROW_BY_ROW_EXTENSIONS)} Demo={RowByRowForm} loadSource={loadRowByRowForm} />
            <DemoSection title={t('forms.rowByRowHookForm.title')} description={t('forms.rowByRowHookForm.description')}
                         extensions={rowsOf('rowByRowHookForm', ROW_BY_ROW_HOOK_EXTENSIONS)} Demo={RowByRowHookForm} loadSource={loadRowByRowHookForm} />
        </Stack>
    );
};
