// El formato a su gusto y lo obligatorio: con el mes en letras, «16/jul/2029» no se presta a dudas (un 03/04 se lee distinto
// según de dónde sea quien mire). format usa los códigos de dayjs; lo que viaja sigue igual ('AAAA-MM-DD' o el instante en
// UTC). required pone el asterisco en la etiqueta, como en los demás campos.
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {DateInput, DateTimeInput} from '@stackcraftmx/calcita/date-pickers';

// en un solo lugar: el mismo formato en todos los campos de fecha de la pantalla
const LETTER_DATE_FORMAT = 'DD/MMM/YYYY';

const LetterMonthDate = () => {
    const [validUntil, setValidUntil] = useState('2029-07-16');
    const [signedAt, setSignedAt] = useState('');

    return (
        <Stack spacing={2} sx={{maxWidth: 360}}>
            {/* 1. El mes en letras, y obligatoria */}
            <DateInput label="Vigencia de la identificación" value={validUntil} onChange={setValidUntil} format={LETTER_DATE_FORMAT} required />
            {/* 2. Igual con hora */}
            <DateTimeInput label="Firma del contrato" value={signedAt} onChange={setSignedAt} format={`${LETTER_DATE_FORMAT} HH:mm`} />
            {/* 3. Lo que viaja no cambia */}
            <Typography variant="body2" color="text.secondary">Viaja: «{validUntil}» y «{signedAt}»</Typography>
        </Stack>
    );
};

export default LetterMonthDate;
