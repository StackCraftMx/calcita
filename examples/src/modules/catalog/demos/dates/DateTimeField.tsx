// Un instante, algo que pasa una vez (un envío programado, una cita): viaja en UTC y se pinta en la zona del proveedor
// (ToolkitProvider timeZone), rotulada abajo con su nombre. Si una pantalla trabaja con la hora de otra sucursal, timeZone
// la cambia solo en ese campo: el instante que viaja es el mismo.
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {DateTimeInput} from '@stackcraftmx/calcita/date-pickers';

// la siguiente hora en punto, para que el ejemplo no arranque con una fecha que ya pasó
const nextHourInstant = () => {
    const nextHour = new Date();
    nextHour.setUTCHours(nextHour.getUTCHours() + 1, 0, 0, 0);
    return nextHour.toISOString().replace('.000Z', 'Z');
};

const DateTimeField = () => {
    const [sendAt, setSendAt] = useState(nextHourInstant);

    return (
        <Stack spacing={2} sx={{maxWidth: 360}}>
            {/* 1. En la zona del proveedor: de ahora en adelante, minuto a minuto */}
            <DateTimeInput label="Enviar el recordatorio" value={sendAt} onChange={setSendAt} disablePast />
            {/* 2. El mismo instante en la hora de otra sucursal: cambiar uno cambia el otro */}
            <DateTimeInput label="La misma hora en Tijuana" value={sendAt} onChange={setSendAt} timeZone="America/Tijuana" />
            {/* 3. Lo que viaja al servidor: el instante en UTC, con la Z al final */}
            <Typography variant="body2" color="text.secondary">Viaja: «{sendAt}»</Typography>
        </Stack>
    );
};

export default DateTimeField;
