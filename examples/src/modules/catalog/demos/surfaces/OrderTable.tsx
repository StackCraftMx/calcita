import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {Money} from '@stackcraftmx/calcita/money';

// los renglones de un pedido, con el importe en centavos como lo manda el API (datos de mentira)
const ORDER_LINES = [
    {product: 'Silla de oficina', quantity: 2, cents: 980000},
    {product: 'Lámpara de escritorio', quantity: 1, cents: 68990},
    {product: 'Teclado inalámbrico', quantity: 3, cents: 269835},
];
const TABLE_MAX_WIDTH = 560;

// el total se suma con Money (entero de centavos): nada de 0.1 + 0.2
const OrderTable = () => {
    const {t} = useToolkitTranslation('catalog');
    const total = ORDER_LINES.reduce((sum, line) => sum.plus(Money.fromMinorUnits(line.cents)), Money.zero());

    return (
        <TableContainer component={Paper} variant="outlined" sx={{maxWidth: TABLE_MAX_WIDTH}}>
            <Table size="small" aria-label={t('surfaces.table.ariaLabel')}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('surfaces.table.product')}</TableCell>
                        <TableCell align="right">{t('surfaces.table.quantity')}</TableCell>
                        <TableCell align="right">{t('surfaces.table.amount')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {ORDER_LINES.map((line) => (
                        <TableRow key={line.product} hover>
                            <TableCell>{line.product}</TableCell>
                            <TableCell align="right">{line.quantity}</TableCell>
                            <TableCell align="right">{Money.fromMinorUnits(line.cents).format()}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell colSpan={2} sx={{fontWeight: 600}}>{t('surfaces.table.total')}</TableCell>
                        <TableCell align="right" sx={{fontWeight: 600}}>{total.format()}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default OrderTable;
