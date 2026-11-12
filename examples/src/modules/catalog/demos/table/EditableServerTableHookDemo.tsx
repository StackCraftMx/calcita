// Campos que se editan en la tabla del servidor con react-hook-form (useEditableServerRows de
// '@stackcraftmx/calcita/react-hook-form'): lo mismo que con formik; cada renglón es su propio useForm (form.setValue para
// el campo de al lado, applyServerProblem(error, form) para los errores del servidor).
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import {ApiError, SegmentedControl, UNSAVED_ROWS, toastSuccess} from '@stackcraftmx/calcita';
import {Yup} from '@stackcraftmx/calcita/forms';
import {FormNumberField, FormSelectField, applyServerProblem, useEditableServerRows} from '@stackcraftmx/calcita/react-hook-form';
import {ServerTable, textColumn} from '@stackcraftmx/calcita/table';

// ─── El servidor de mentira (en su proyecto NO va: fetchPage y saveRule llaman a su API) ───
type Rule = {id: number, folio: string, branch_id: string, channel: string, amount: string};
const BRANCH_IDS = ['north', 'south', 'center'];
const SERVER_RULES: Rule[] = Array.from({length: 23}, (_, index) => ({
    id: index + 101, folio: `H-${String(index + 1).padStart(3, '0')}`, branch_id: BRANCH_IDS[index % 3], channel: 'store', amount: `${(index + 1) * 1000}.00`,
}));
const SERVER_MAX_AMOUNT = 50000;
const waitForServer = () => new Promise((resolve) => setTimeout(resolve, 300));
const fetchRulesPage = async ({page, pageSize}: {page: number, pageSize: number}) => {
    await waitForServer();
    return {rows: SERVER_RULES.slice(page * pageSize, (page + 1) * pageSize).map((rule) => ({...rule})), total: SERVER_RULES.length};
};
const saveRule = async (rule: Rule) => {
    await waitForServer();
    if (Number(rule.amount) > SERVER_MAX_AMOUNT) {
        throw new ApiError({status: 422, problem: {title: 'Revise el renglón', errors: {amount: ['Una regla no lleva más de $50,000.00.']}}});
    }
    const index = SERVER_RULES.findIndex((saved) => saved.id === rule.id);
    SERVER_RULES[index] = {...rule};
    return SERVER_RULES[index];
};

// ─── Lo que sí va en su proyecto ───
const BRANCHES = [
    {value: 'north', label: 'Norte', channels: ['store', 'online']},
    {value: 'south', label: 'Sur', channels: ['store']},
    {value: 'center', label: 'Centro', channels: ['store', 'online', 'phone']},
];
const CHANNEL_LABELS: Record<string, string> = {store: 'Tienda', online: 'En línea', phone: 'Por teléfono'};
const channelOptionsOf = (branchId: string) => (BRANCHES.find((branch) => branch.value === branchId)?.channels ?? [])
    .map((channel) => ({value: channel, label: CHANNEL_LABELS[channel]}));
// 1. Las reglas de UN renglón
const RULE_SCHEMA = Yup.object({
    branch_id: Yup.string().required(),
    channel: Yup.string().required(),
    amount: Yup.string().required(),
});
type UnsavedRows = 'keep' | 'confirm';

const EditableServerTableHookDemo = () => {
    const [unsavedRows, setUnsavedRows] = useState<UnsavedRows>(UNSAVED_ROWS.keep);
    // 2. Cada renglón su formulario: cómo se guarda uno y qué pasa con lo capturado al cambiar de página
    const editing = useEditableServerRows({
        rowSchema: RULE_SCHEMA,
        unsavedRows,
        rowLabelOf: (rule: Rule) => `Regla ${rule.folio}`,
        onSaveRow: async (values: Rule, {form}) => {
            try {
                const saved = await saveRule(values);
                toastSuccess(`Viaja: ${JSON.stringify(saved)}`);
            } catch (error) {
                // el error del servidor en su celda (si el renglón no se ve, «Guardar todos» lo cuenta como no guardado)
                applyServerProblem(error, form);
                throw error;
            }
        },
    });

    // 3. Las columnas: las de siempre y las que llevan un campo (fieldColumn), con el ✓ al final (actionsColumn)
    const columns = [
        textColumn({field: 'folio', label: 'Folio', width: 100, sort: false, filter: false}),
        editing.fieldColumn({
            field: 'branch_id', label: 'Sucursal', width: 170,
            renderField: ({nameOf, form}) => (
                <FormSelectField name={nameOf('branch_id')} label="Sucursal" options={BRANCHES} onChange={(branchId: string) => {
                    const channels = channelOptionsOf(branchId);
                    form.setValue(nameOf('channel'), channels.length === 1 ? channels[0].value : '', {shouldDirty: true});
                }} />
            ),
        }),
        editing.fieldColumn({
            field: 'channel', label: 'Canal', width: 170,
            renderField: ({nameOf, row}) => <FormSelectField name={nameOf('channel')} label="Canal" options={channelOptionsOf(row.branch_id)} />,
        }),
        editing.fieldColumn({
            field: 'amount', label: 'Presupuesto', width: 180,
            renderField: ({nameOf}) => <FormNumberField name={nameOf('amount')} label="Presupuesto" prefix="$" />,
        }),
        editing.actionsColumn(),
    ];

    return (
        <Stack spacing={2}>
            <SegmentedControl ariaLabel="Lo capturado al cambiar de página con react-hook-form" value={unsavedRows} onChange={(value) => setUnsavedRows(value as UnsavedRows)} options={[
                {value: UNSAVED_ROWS.keep, label: 'Se recuerda'},
                {value: UNSAVED_ROWS.confirm, label: 'Se pregunta'},
            ]} />
            {/* 4. La barra de lo capturado sin guardar (con «Guardar todos» y «Descartar») y la tabla con lo del hook */}
            {editing.unsavedBar}
            <ServerTable {...editing.tableProps} fetchPage={fetchRulesPage} queryKey="editable-rules-hook" columns={columns}
                         defaultPageSize={5} pageSizeOptions={[5, 10]} ariaLabel="Reglas de reparto con react-hook-form" />
        </Stack>
    );
};

export default EditableServerTableHookDemo;
