// Un mes (el de un reporte, un saldo, un cierre): viaja 'AAAA-MM' y se ve con su nombre en el idioma activo. Abre en los
// meses del año que ya tiene; el año se cambia con el botón de arriba.
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {MonthInput} from '@stackcraftmx/calcita/date-pickers';

// el mes de hoy en 'AAAA-MM'
const currentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

const MonthField = () => {
    const [month, setMonth] = useState(currentMonth);

    return (
        <Stack spacing={2} sx={{maxWidth: 360}}>
            {/* 1. Un reporte: solo meses que ya empezaron */}
            <MonthInput label="Mes del reporte" value={month} onChange={setMonth} disableFuture />
            {/* 2. Lo que viaja al servidor */}
            <Typography variant="body2" color="text.secondary">Viaja: «{month}»</Typography>
        </Stack>
    );
};

export default MonthField;
