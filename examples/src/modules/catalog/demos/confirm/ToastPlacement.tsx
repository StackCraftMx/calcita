// Dónde salen los avisos: en la esquina que no tape nada de su app. Abajo a la izquierda (por omisión) estorba si ahí está
// el pie del menú; abajo a la derecha taparía el botón «Siguiente» de un formulario. En su app va uno solo, en la raíz:
//
//   <Toaster position={TOASTER_POSITION.bottomCenter} />
//
// Lo demás de sonner pasa tal cual (duration, visibleToasts, offset…). Aquí la demo monta el suyo con un id para no mover
// los avisos de toda la página, y cada aviso dice a cuál va (toasterId).
import {useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {SegmentedControl, TOASTER_POSITION, Toaster, toastInfo} from '@stackcraftmx/calcita';

type ToasterPosition = typeof TOASTER_POSITION[keyof typeof TOASTER_POSITION];

const DEMO_TOASTER_ID = 'placement-demo';

const ToastPlacement = () => {
    const [position, setPosition] = useState<ToasterPosition>(TOASTER_POSITION.bottomCenter);

    return (
        <Stack spacing={2} sx={{alignItems: 'flex-start'}}>
            {/* 1. La esquina */}
            <SegmentedControl ariaLabel="Dónde salen los avisos" value={position} onChange={(value) => setPosition(value as ToasterPosition)} options={[
                {value: TOASTER_POSITION.bottomLeft, label: 'Abajo a la izquierda'},
                {value: TOASTER_POSITION.bottomCenter, label: 'Abajo al centro'},
                {value: TOASTER_POSITION.topRight, label: 'Arriba a la derecha'},
            ]} />
            {/* 2. Un aviso para verlo */}
            <Button variant="outlined" onClick={() => toastInfo('Se guardó el borrador.', {toasterId: DEMO_TOASTER_ID})}>Avisar</Button>
            {/* 3. El de la demo; el de su app no lleva id */}
            <Toaster id={DEMO_TOASTER_ID} position={position} duration={4000} />
        </Stack>
    );
};

export default ToastPlacement;
