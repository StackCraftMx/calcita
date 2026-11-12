// Un formulario en tabla con formik: el reparto de un presupuesto por sucursal y canal. Es UN solo formulario: cada renglón
// es un renglón de la lista `rules` y cada campo valida en su celda, como si estuviera en un formulario normal.
//
//   - FormRepeatingFields con layout={REPEATING_LAYOUT.table}: los mismos renglones que se repiten de siempre (agregar,
//     quitar, mínimo y máximo, confirmar al quitar uno guardado), pintados como tabla. Cada campo de renderRow va en su
//     columna, en orden; el botón de arriba cambia a tarjetas con la misma lista;
//   - entre renglones: la sucursal con el canal no se repite (uniqueInListRule con dos columnas), la tasa va de menor a
//     mayor (orderedInListRule) y entre todos no pasan del presupuesto (listTotalAtMostRule);
//   - un campo depende de otro: al cambiar la sucursal se limpia el canal, y si la sucursal tiene un solo canal se pone solo;
//   - un renglón ya guardado (con id) no deja cambiar su sucursal ni su canal, y quitarlo pide confirmar;
//   - «Disponible» se calcula (presupuesto menos lo ya usado): no viaja, solo se enseña.
import {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
    NumberInput, REPEATING_LAYOUT, REPEATING_PHONE_LAYOUT, SegmentedControl, formatCurrency, toastSuccess,
} from '@stackcraftmx/calcita';
import {
    Form, Formik, FormNumberField, FormRepeatingFields, FormSelectField, SubmitButton, Yup, listTotalAtMostRule, orderedInListRule,
    uniqueInListRule,
} from '@stackcraftmx/calcita/forms';

// ─── En su proyecto salen del API ───
// las sucursales y los canales que vende cada una
const BRANCHES = [
    {value: 'north', label: 'Norte', channels: ['store', 'online']},
    {value: 'south', label: 'Sur', channels: ['store']},
    {value: 'center', label: 'Centro', channels: ['store', 'online', 'phone']},
];
const CHANNEL_LABELS: Record<string, string> = {store: 'Tienda', online: 'En línea', phone: 'Por teléfono'};
const channelOptionsOf = (branchId: string) => (BRANCHES.find((branch) => branch.value === branchId)?.channels ?? [])
    .map((channel) => ({value: channel, label: CHANNEL_LABELS[channel]}));

// cómo empieza un renglón nuevo, y lo que ya estaba guardado (con su id y lo que ya se usó)
type Rule = {id?: number, branch_id: string, channel: string, max_days: string, amount: string, used?: number, rate: string};
const EMPTY_RULE: Rule = {branch_id: '', channel: '', max_days: '', amount: '', rate: ''};
const INITIAL_VALUES = {
    budget: '100000.00',
    rules: [
        {id: 7, branch_id: 'north', channel: 'store', max_days: '30', amount: '40000.00', used: 12500, rate: '1.50'},
        {id: 9, branch_id: 'center', channel: 'online', max_days: '45', amount: '35000.00', used: 0, rate: '1.80'},
    ] as Rule[],
};
type BudgetValues = typeof INITIAL_VALUES;
type RowsLayout = 'cards' | 'table';
type PhoneRowsLayout = 'cards' | 'scroll';

// las columnas de la tabla, en el orden de los campos de renderRow
const TABLE_COLUMNS = [
    {key: 'branch', header: 'Sucursal', width: 150},
    {key: 'channel', header: 'Canal', width: 150},
    {key: 'days', header: 'Plazo', width: 110},
    {key: 'amount', header: 'Presupuesto', width: 150},
    {key: 'available', header: 'Disponible', width: 140},
    {key: 'rate', header: 'Tasa mínima', width: 120},
];

const TableForm = () => {
    // para comparar: tabla o tarjetas, y qué hace la tabla en el teléfono
    const [layout, setLayout] = useState<RowsLayout>(REPEATING_LAYOUT.table);
    const [phoneLayout, setPhoneLayout] = useState<PhoneRowsLayout>(REPEATING_PHONE_LAYOUT.cards);

    // 1. Las reglas de cada columna y las de entre renglones
    const schema = useMemo(() => Yup.object({
        budget: Yup.string().required(),
        rules: Yup.array().min(1).of(Yup.object({
            branch_id: Yup.string().required(),
            channel: Yup.string().required().test(uniqueInListRule('rules', ['branch_id', 'channel'])),
            max_days: Yup.string().required(),
            amount: Yup.string().required(),
            rate: Yup.string().required().test(orderedInListRule('rules', 'rate', {displayOf: (rate) => `${rate} %`})),
        })).test(listTotalAtMostRule('amount', (values) => (values as BudgetValues).budget, {currency: 'MXN'})),
    }), []);

    return (
        <Stack spacing={2}>
            <Stack direction={{xs: 'column', sm: 'row'}} sx={{gap: 2}}>
                <SegmentedControl ariaLabel="Cómo se pintan los renglones" value={layout} onChange={(value) => setLayout(value as RowsLayout)} options={[
                    {value: REPEATING_LAYOUT.table, label: 'Tabla'},
                    {value: REPEATING_LAYOUT.cards, label: 'Tarjetas'},
                ]} />
                <SegmentedControl ariaLabel="La tabla en el teléfono" value={phoneLayout} onChange={(value) => setPhoneLayout(value as PhoneRowsLayout)} options={[
                    {value: REPEATING_PHONE_LAYOUT.cards, label: 'Teléfono: tarjetas'},
                    {value: REPEATING_PHONE_LAYOUT.scroll, label: 'Teléfono: deslizar'},
                ]} />
            </Stack>
            <Formik initialValues={INITIAL_VALUES} validationSchema={schema}
                    onSubmit={(values: BudgetValues) => {
                        toastSuccess(`Viaja: ${JSON.stringify(values.rules)}`);
                    }}>
                {({values, setFieldValue}) => (
                    <Form noValidate>
                        <Stack spacing={2}>
                            <Box sx={{maxWidth: 260}}>
                                <FormNumberField name="budget" label="Presupuesto total" prefix="$" />
                            </Box>
                            {/* 2. La lista por su nombre, pintada como tabla: cada campo de renderRow va en su columna */}
                            <FormRepeatingFields
                                name="rules"
                                label="Reparto por sucursal"
                                emptyRow={EMPTY_RULE}
                                maxRows={6}
                                layout={layout}
                                tableColumns={TABLE_COLUMNS}
                                phoneLayout={phoneLayout}
                                addLabel="Agregar una sucursal"
                                // 3. Un renglón ya guardado se confirma antes de quitarlo (en su proyecto, aquí llamaría a su API)
                                confirmRemove={(rule: Rule) => Boolean(rule.id)}
                                renderRow={({nameOf, row}: {nameOf: (field: string) => string, row: Rule}) => {
                                    const isSaved = Boolean(row.id);
                                    const available = Number(row.amount || 0) - (row.used ?? 0);
                                    return (
                                        <>
                                            {/* 4. Al cambiar la sucursal se limpia el canal; con un solo canal se pone solo */}
                                            <FormSelectField name={nameOf('branch_id')} label="Sucursal" options={BRANCHES} disabled={isSaved}
                                                             onChange={(branchId: string) => {
                                                                 const channels = channelOptionsOf(branchId);
                                                                 setFieldValue(nameOf('channel'), channels.length === 1 ? channels[0].value : '');
                                                             }} />
                                            <FormSelectField name={nameOf('channel')} label="Canal" options={channelOptionsOf(row.branch_id)} disabled={isSaved} />
                                            <FormNumberField name={nameOf('max_days')} label="Plazo en días" decimals={0} min={1} max={120} />
                                            <FormNumberField name={nameOf('amount')} label="Presupuesto" prefix="$" />
                                            {/* 5. Calculado: no viaja, solo se lee (readOnly: no se ve apagado y el lector lo lee) */}
                                            <NumberInput label="Disponible" prefix="$" value={available.toFixed(2)} onChange={() => {}} readOnly />
                                            <FormNumberField name={nameOf('rate')} label="Tasa mínima" suffix="%" />
                                        </>
                                    );
                                }}
                            />
                            <SubmitButton sx={{alignSelf: 'flex-start'}}>Guardar el reparto</SubmitButton>
                            {/* lo que viaja va sin espacios: se parte donde haga falta para no ensanchar la página en el teléfono */}
                            <Typography variant="body2" color="text.secondary" sx={{overflowWrap: 'anywhere'}}>
                                Presupuesto: {formatCurrency(Number(values.budget || 0))} · Viaja: «{JSON.stringify(values.rules.map(({used, ...rule}) => rule))}»
                            </Typography>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Stack>
    );
};

export default TableForm;
