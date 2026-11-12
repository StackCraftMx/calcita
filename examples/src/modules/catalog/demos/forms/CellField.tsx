// Campos dentro de las celdas de una tabla, con la misma forma que en un formulario. Sirve con cualquier campo de Calcita
// (texto, número, lista, catálogo, color, fecha, y sus versiones de formik y react-hook-form) y con FormRow para lo demás.
//
// UNA sola FormSection alrededor de la tabla, no una por celda: todos los campos de adentro toman la forma de la casa.
//   - variant={FORM_SECTION_VARIANT.bare}: sin tarjeta, sin líneas y sin el aire del renglón (la celda ya los trae);
//   - labelWidth={0}: sin columna de etiqueta (el nombre de la columna ya dice qué es). La etiqueta de cada campo no se ve
//     pero el lector de pantalla la lee («Fecha de pago de F-1042»): sin ella, el campo no tendría nombre.
//
// Para que un campo suelto (fuera de una FormSection) también lleve la cápsula, va en el tema, una vez para toda la app:
// createToolkitTheme({fields: {radius: 999}}).
import {useState} from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {FORM_SECTION_VARIANT, FormSection, NumberInput, SelectInput, formatCurrency} from '@stackcraftmx/calcita';
import {DateInput} from '@stackcraftmx/calcita/date-pickers';

// en su proyecto salen del API: el folio, cuánto se debe y desde cuándo se puede pagar
const INVOICES = [
    {folio: 'F-1042', amount: 18250, issuedOn: '2026-10-02'},
    {folio: 'F-1043', amount: 7400.5, issuedOn: '2026-10-15'},
    {folio: 'F-1047', amount: 32000, issuedOn: '2026-11-01'},
];
// las formas de pago (en su proyecto, de su diccionario)
const PAYMENT_METHODS = [
    {value: 'transfer', label: 'Transferencia'},
    {value: 'check', label: 'Cheque'},
    {value: 'cash', label: 'Efectivo'},
];

type Payment = {date: string, paid: string, method: string};
const EMPTY_PAYMENT: Payment = {date: '', paid: '', method: ''};

const CellField = () => {
    const [payments, setPayments] = useState<Record<string, Payment>>({'F-1042': {date: '2026-11-10', paid: '18250.00', method: 'transfer'}});
    const paymentOf = (folio: string) => payments[folio] ?? EMPTY_PAYMENT;
    const change = (folio: string, part: Partial<Payment>) => setPayments((all) => ({...all, [folio]: {...paymentOf(folio), ...part}}));

    return (
        // una sola sección para toda la tabla: sin tarjeta y sin columna de etiqueta
        <FormSection variant={FORM_SECTION_VARIANT.bare} labelWidth={0}>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Folio</TableCell>
                            <TableCell align="right">Importe</TableCell>
                            <TableCell sx={{minWidth: 170}}>Abono</TableCell>
                            <TableCell sx={{minWidth: 180}}>Forma de pago</TableCell>
                            <TableCell sx={{minWidth: 200}}>Fecha de pago</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {INVOICES.map(({folio, amount, issuedOn}) => (
                            <TableRow key={folio}>
                                <TableCell>{folio}</TableCell>
                                <TableCell align="right">{formatCurrency(amount)}</TableCell>
                                <TableCell>
                                    {/* no se abona más de lo que se debe: con fix se corrige solo al salir */}
                                    <NumberInput label={`Abono de ${folio}`} prefix="$" value={paymentOf(folio).paid} max={amount} limitMode="fix"
                                                 onChange={(paid: string) => change(folio, {paid})} />
                                </TableCell>
                                <TableCell>
                                    <SelectInput label={`Forma de pago de ${folio}`} options={PAYMENT_METHODS} value={paymentOf(folio).method}
                                                 onChange={(method: string) => change(folio, {method})} />
                                </TableCell>
                                <TableCell>
                                    {/* no se paga antes de la emisión */}
                                    <DateInput label={`Fecha de pago de ${folio}`} value={paymentOf(folio).date} minDate={issuedOn}
                                               onChange={(date: string) => change(folio, {date})} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </FormSection>
    );
};

export default CellField;
