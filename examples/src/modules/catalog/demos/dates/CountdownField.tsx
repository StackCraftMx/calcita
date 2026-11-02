// La cuenta regresiva: «02:14:30» hasta un momento, con días cuando faltan, y lo que dice al llegar a cero (con onComplete
// para avisar una sola vez). Con children como función se pinta a su manera; useCountdown da las partes para armar la suya.
import {useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Countdown, toastSuccess} from '@stackcraftmx/calcita';

// ─── Los momentos de mentira (en su proyecto NO van: son los del API, p. ej. registration.closes_at) ───
const inSeconds = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

// las inscripciones del ejemplo cierran en 2 minutos (se alcanza a ver correr) y el botón las deja en 10 segundos para ver el cierre
const REGISTRATION_SECONDS = 120;
const CLOSING_SOON_SECONDS = 10;

const CountdownField = () => {
    const [closesAt, setClosesAt] = useState(() => inSeconds(REGISTRATION_SECONDS));
    const [saleEndsAt] = useState(() => inSeconds(2 * 86_400 + 5 * 3600));

    return (
        <Stack spacing={2}>
            {/* 1. Segundo a segundo: al llegar a cero dice lo suyo y avisa una vez */}
            <Stack direction="row" spacing={1} sx={{alignItems: 'baseline'}}>
                <Typography color="text.secondary">Las inscripciones cierran en</Typography>
                <Countdown until={closesAt} label="Tiempo para que cierren las inscripciones" completedText="Cerradas"
                           onComplete={() => toastSuccess('Se cerraron las inscripciones.')} variant="h6" />
                <Button size="small" onClick={() => setClosesAt(inSeconds(CLOSING_SOON_SECONDS))}>Cerrar en 10 segundos</Button>
                <Button size="small" onClick={() => setClosesAt(inSeconds(REGISTRATION_SECONDS))}>Volver a empezar</Button>
            </Stack>
            {/* 2. Con días cuando faltan (showSeconds={false} quita los segundos) */}
            <Stack direction="row" spacing={1} sx={{alignItems: 'baseline'}}>
                <Typography color="text.secondary">La oferta termina en</Typography>
                <Countdown until={saleEndsAt} label="Tiempo para que termine la oferta" />
            </Stack>
            {/* 3. A su manera: las partes en sus propias cajas, con segundos */}
            <Countdown until={saleEndsAt}>
                {({days, hours, minutes, seconds}) => (
                    <Stack direction="row" spacing={1}>
                        {[[days, 'días'], [hours, 'horas'], [minutes, 'min'], [seconds, 'seg']].map(([amount, unit]) => (
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
