// Cada renglón su propio formulario con react-hook-form (EditableRows de '@stackcraftmx/calcita/react-hook-form'): lo mismo
// que con formik, con los mismos rowSchema y validateRow; cambia lo que recibe la pantalla: el useForm de cada renglón
// (form.setValue para el campo de al lado, applyServerProblem(error, form) para los errores del servidor).
//
//   - las reglas de UN renglón van en rowSchema; la de entre renglones (la sucursal con el canal no se repite) va en
//     validateRow, que recibe los demás renglones;
//   - el servidor dice que no (más de $50,000 en un renglón): applyServerProblem pone el error en su celda;
//   - «Agregar» crea un renglón que vive aquí hasta guardarlo; «Quitar» uno guardado lo borra EN ESE MOMENTO (pide confirmar).
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {ApiError, REPEATING_LAYOUT, toastProblem, toastSuccess} from '@stackcraftmx/calcita';
import {Yup} from '@stackcraftmx/calcita/forms';
import {EditableRows, FormNumberField, FormSelectField, applyServerProblem} from '@stackcraftmx/calcita/react-hook-form';

// ─── El servidor de mentira (en su proyecto NO va: es su API) ───
type Rule = {id?: number, branch_id: string, channel: string, amount: string};
const SERVER_MAX_AMOUNT = 50000;
const SERVER_DELAY_MILLISECONDS = 400;
const waitForServer = () => new Promise((resolve) => setTimeout(resolve, SERVER_DELAY_MILLISECONDS));
let nextRuleId = 40;
const saveRuleOnServer = async (rule: Rule) => {
    await waitForServer();
    if (Number(rule.amount) > SERVER_MAX_AMOUNT) {
        throw new ApiError({status: 422, problem: {title: 'Revise el renglón', errors: {amount: ['Una sucursal no recibe más de $50,000.00.']}}});
    }
    return {...rule, id: rule.id ?? (nextRuleId += 1)};
};
const removeRuleOnServer = async () => waitForServer();

// ─── Lo que sí va en su proyecto ───
const BRANCHES = [
    {value: 'north', label: 'Norte', channels: ['store', 'online']},
    {value: 'south', label: 'Sur', channels: ['store']},
    {value: 'center', label: 'Centro', channels: ['store', 'online', 'phone']},
];
const CHANNEL_LABELS: Record<string, string> = {store: 'Tienda', online: 'En línea', phone: 'Por teléfono'};
const channelOptionsOf = (branchId: string) => (BRANCHES.find((branch) => branch.value === branchId)?.channels ?? [])
    .map((channel) => ({value: channel, label: CHANNEL_LABELS[channel]}));

const EMPTY_RULE: Rule = {branch_id: '', channel: '', amount: ''};
const FIRST_RULES: Rule[] = [
    {id: 7, branch_id: 'north', channel: 'store', amount: '40000.00'},
    {id: 9, branch_id: 'center', channel: 'online', amount: '35000.00'},
];
const TABLE_COLUMNS = [
    {key: 'branch', header: 'Sucursal', width: 150},
    {key: 'channel', header: 'Canal', width: 150},
    {key: 'amount', header: 'Presupuesto', width: 160},
];
// 1. Las reglas de UN renglón
const RULE_SCHEMA = Yup.object({
    branch_id: Yup.string().required(),
    channel: Yup.string().required(),
    amount: Yup.string().required(),
});

const RowByRowHookForm = () => {
    // los renglones guardados: en su proyecto, lo que regresa su API
    const [rules, setRules] = useState<Rule[]>(FIRST_RULES);

    return (
        <Stack spacing={2}>
            <EditableRows
                label="Reparto por sucursal con react-hook-form"
                rows={rules}
                rowKeyOf={(rule: Rule) => rule.id ?? ''}
                rowSchema={RULE_SCHEMA}
                // 2. La regla con los demás renglones: la misma sucursal con el mismo canal no se repite
                validateRow={(rule: Rule, {otherRows}: {otherRows: Rule[]}) => (
                    otherRows.some((other) => other.branch_id === rule.branch_id && other.channel === rule.channel && rule.channel)
                        ? {channel: 'Esa sucursal ya tiene ese canal en otro renglón.'}
                        : {}
                )}
                layout={REPEATING_LAYOUT.table}
                tableColumns={TABLE_COLUMNS}
                emptyRow={EMPTY_RULE}
                addLabel="Agregar una sucursal"
                // 3. Guardar un renglón: si el servidor dice que no, el error va a su celda
                onSaveRow={async (values: Rule, {form, isNew}) => {
                    try {
                        const saved = await saveRuleOnServer(values);
                        setRules((all) => (isNew ? [...all, saved] : all.map((rule) => (rule.id === saved.id ? saved : rule))));
                        toastSuccess(`Viaja: ${JSON.stringify(saved)}`);
                    } catch (error) {
                        applyServerProblem(error, form);
                        throw error;
                    }
                }}
                // 4. Quitar uno guardado: se borra en ese momento
                onRemoveRow={async (rule: Rule) => {
                    try {
                        await removeRuleOnServer();
                        setRules((all) => all.filter((other) => other.id !== rule.id));
                    } catch (error) {
                        toastProblem(error as Error);
                    }
                }}
                renderRow={({nameOf, row, form}) => (
                    <>
                        {/* 5. Al cambiar la sucursal se limpia el canal (setValue del useForm de ESTE renglón) */}
                        <FormSelectField name={nameOf('branch_id')} label="Sucursal" options={BRANCHES}
                                         onChange={(branchId: string) => {
                                             const channels = channelOptionsOf(branchId);
                                             form.setValue(nameOf('channel'), channels.length === 1 ? channels[0].value : '');
                                         }} />
                        <FormSelectField name={nameOf('channel')} label="Canal" options={channelOptionsOf(row.branch_id)} />
                        <FormNumberField name={nameOf('amount')} label="Presupuesto" prefix="$" />
                    </>
                )}
            />
            <Typography variant="body2" color="text.secondary" sx={{overflowWrap: 'anywhere'}}>
                Guardado en el servidor: «{JSON.stringify(rules)}»
            </Typography>
        </Stack>
    );
};

export default RowByRowHookForm;
