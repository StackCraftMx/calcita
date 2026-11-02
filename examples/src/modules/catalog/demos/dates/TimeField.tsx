// Una hora del día sin fecha (el horario de una sucursal, la hora de una cita en un día ya elegido): viaja 'HH:mm' de 24
// horas. Con ToolkitProvider hourCycle={HOUR_CYCLE.twelveHours} se ve «09:00 a. m.» y viaja igual «09:00». No tiene zona.
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {TimeInput} from '@stackcraftmx/calcita/date-pickers';

const TimeField = () => {
    const [opensAt, setOpensAt] = useState('09:00');
    const [closesAt, setClosesAt] = useState('18:00');

    return (
        <Stack spacing={2} sx={{maxWidth: 360}}>
            {/* 1. De media en media hora */}
            <TimeInput label="Abre a las" value={opensAt} onChange={setOpensAt} />
            {/* 2. No puede cerrar antes de abrir: el límite es la otra hora */}
            <TimeInput label="Cierra a las" value={closesAt} onChange={setClosesAt} minTime={opensAt} />
            {/* 3. Lo que viaja al servidor */}
            <Typography variant="body2" color="text.secondary">Viaja: «{opensAt}» a «{closesAt}»</Typography>
        </Stack>
    );
};

export default TimeField;
