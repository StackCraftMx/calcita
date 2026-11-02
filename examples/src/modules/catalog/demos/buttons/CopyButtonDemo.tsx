// Copiar al portapapeles: la palomita un par de segundos y, si el navegador no deja copiar, el aviso en rojo (con
// onCopyFailed para registrarlo). Un renglón entero va con tableRowTextOf: separado por tabuladores, al pegarlo en Excel
// cada dato cae en su celda; value como función lo arma solo al picar.
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {CopyButton, createLogger, tableRowTextOf} from '@stackcraftmx/calcita';

// el folio y el renglón de ejemplo que se copian (datos de mentira)
const SAMPLE_FOLIO = 'P-2375';
const SAMPLE_ORDER_ROW = ['P-2375', 'Muebles del Norte', 'Lámpara de escritorio', 2, '$2,501.00'];
const log = createLogger('orders');

const CopyButtonDemo = () => (
    <Stack spacing={1.5}>
        {/* 1. Un dato corto que cuesta copiar a mano */}
        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
            <Typography variant="body1" sx={{fontVariantNumeric: 'tabular-nums'}}>{SAMPLE_FOLIO}</Typography>
            <CopyButton value={SAMPLE_FOLIO} label="Copiar el folio" />
        </Stack>
        {/* 2. Un renglón entero, listo para pegar en Excel */}
        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
            <Typography variant="body2" color="text.secondary">{SAMPLE_ORDER_ROW.join(' · ')}</Typography>
            <CopyButton label="Copiar el renglón para Excel" value={() => tableRowTextOf(SAMPLE_ORDER_ROW)}
                        onCopyFailed={(error) => log.warn('No se pudo copiar el renglón', {error})} />
        </Stack>
    </Stack>
);

export default CopyButtonDemo;
