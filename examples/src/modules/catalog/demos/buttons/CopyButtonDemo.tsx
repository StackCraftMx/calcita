import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {CopyButton} from '@stackcraftmx/calcita';

// el folio de ejemplo que se copia (dato de mentira)
const SAMPLE_FOLIO = 'P-2375';

// copia al portapapeles y enseña la palomita un par de segundos; sin permiso de portapapeles no truena
const CopyButtonDemo = () => (
    <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
        <Typography variant="body1" sx={{fontVariantNumeric: 'tabular-nums'}}>{SAMPLE_FOLIO}</Typography>
        <CopyButton value={SAMPLE_FOLIO} />
    </Stack>
);

export default CopyButtonDemo;
