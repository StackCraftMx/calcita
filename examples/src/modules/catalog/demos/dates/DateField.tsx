// Una fecha de calendario: al formulario y al servidor viaja 'AAAA-MM-DD' en texto, sin hora ni zona (nunca pasa por Date,
// que la movería de día según la zona del equipo). En pantalla, DD/MM/AAAA en español y MM/DD/AAAA en inglés.
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {DateInput} from '@stackcraftmx/calcita/date-pickers';

const DateField = () => {
    const [birthDate, setBirthDate] = useState('1990-05-14');
    const [deliveryDate, setDeliveryDate] = useState('');

    return (
        <Stack spacing={2} sx={{maxWidth: 360}}>
            {/* 1. Un nacimiento: abre en los años y no deja fechas que todavía no pasan */}
            <DateInput label="Fecha de nacimiento" value={birthDate} onChange={setBirthDate} openTo="year" disableFuture />
            {/* 2. Una entrega: de hoy en adelante */}
            <DateInput label="Fecha de entrega" value={deliveryDate} onChange={setDeliveryDate} disablePast />
            {/* 3. Lo que viaja al servidor: texto, '' si está vacía */}
            <Typography variant="body2" color="text.secondary">Viaja: «{birthDate}» y «{deliveryDate}»</Typography>
        </Stack>
    );
};

export default DateField;
