// La cuenta regresiva: «02:14:30» hasta un momento, con días cuando faltan, y lo que dice al llegar a cero (con onComplete
// para avisar una sola vez). Con children como función se pinta a su manera; useCountdown da las partes para armar la suya.
import {useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Countdown, toastSuccess} from '@stackcraftmx/calcita';

// ─── Los momentos de mentira (en su proyecto NO van: son los del API, p. ej. auction.closes_at) ───
const inSeconds = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

const CountdownField = () => {
    const [closesAt, setClosesAt] = useState(() => inSeconds(8));
    const [saleEndsAt] = useState(() => inSeconds(2 * 86_400 + 5 * 3600));

    return (
        <Stack spacing={2}>
            {/* 1. Corta: al llegar a cero dice lo suyo y avisa una vez */}
            <Stack direction="row" spacing={1} sx={{alignItems: 'baseline'}}>
                <Typography color="text.secondary">La subasta cierra en</Typography>
                <Countdown until={closesAt} label="Tiempo para que cierre la subasta" completedText="Cerrada"
                           onComplete={() => toastSuccess('La subasta cerró.')} variant="h6" />
                <Button size="small" onClick={() => setClosesAt(inSeconds(8))}>Volver a empezar</Button>
            </Stack>
            {/* 2. Con días y sin segundos */}
            <Stack direction="row" spacing={1} sx={{alignItems: 'baseline'}}>
                <Typography color="text.secondary">La oferta termina en</Typography>
                <Countdown until={saleEndsAt} showSeconds={false} label="Tiempo para que termine la oferta" />
            </Stack>
            {/* 3. A su manera: las partes en sus propias cajas */}
            <Countdown until={saleEndsAt}>
                {({days, hours, minutes}) => (
                    <Stack direction="row" spacing={1}>
                        {[[days, 'días'], [hours, 'horas'], [minutes, 'min']].map(([amount, unit]) => (
                            <Stack key={unit} sx={{px: 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover', alignItems: 'center', minWidth: 64}}>
                                <Typography variant="h6" sx={{fontVariantNumeric: 'tabular-nums'}}>{amount}</Typography>
                                <Typography variant="caption" color="text.secondary">{unit}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </Countdown>
        </Stack>
    );
};

export default CountdownField;
