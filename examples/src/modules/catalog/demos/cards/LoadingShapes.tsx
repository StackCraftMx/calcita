// Los esqueletos de carga: mientras llega la información, la forma de lo que va a llegar en lugar de una rueda.
//   1. Una ficha: el encabezado (DetailHeaderSkeleton) y sus datos (DefinitionListSkeleton) en gris; lo que ya se sabe (el
//      título de la tarjeta) va de verdad. Al llegar el registro, nada brinca.
//   2. Un tablero de un tercero que tiene que seguir montado mientras carga (Tableau empieza de cero si se desmonta): el
//      esqueleto va ENCIMA (SkeletonOverlay) y se quita cuando el tablero avisa que está listo.
// La frontera: el esqueleto es para ESPERAR información. Guardar, enviar o subir conservan su rueda.
import {useCallback, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {DefinitionList, DefinitionListSkeleton, DetailHeader, DetailHeaderSkeleton, SectionCard, SkeletonOverlay} from '@stackcraftmx/calcita';

// cuánto tarda el servidor de mentira en contestar (ms): lo justo para ver el esqueleto
const FAKE_DELAY = 1500;
// cuánto tarda el tablero de mentira en avisar que ya está listo (ms)
const FAKE_DASHBOARD_DELAY = 2500;

const CLIENT = [
    {label: 'Razón social', value: 'Distribuidora del Norte SA de CV'},
    {label: 'RFC', value: 'DNO010101AB1'},
    {label: 'Contacto', value: 'Mónica Vega · compras@ejemplo.mx'},
    {label: 'Teléfono', value: '55 5012 1037'},
    {label: 'Alta', value: '12 de marzo de 2025'},
];

/** El tablero de un tercero, de mentira: tarda en armarse y avisa con onReady (en Tableau, «firstinteractive»). */
const FakeDashboard = ({onReady}: {onReady: () => void}) => {
    useEffect(() => {
        const timer = window.setTimeout(onReady, FAKE_DASHBOARD_DELAY);
        return () => window.clearTimeout(timer);
    }, [onReady]);
    return (
        <Box sx={{height: 240, display: 'grid', placeItems: 'center', bgcolor: 'action.hover', borderRadius: 2}}>
            <Typography color="text.secondary">El tablero ya está listo</Typography>
        </Box>
    );
};

const LoadingShapes = () => {
    const [isClientLoading, setIsClientLoading] = useState(true);
    const [isDashboardReady, setIsDashboardReady] = useState(false);
    const [dashboardRun, setDashboardRun] = useState(0);
    // con memoria: una función nueva en cada pintada volvería a empezar la espera del tablero
    const markDashboardReady = useCallback(() => setIsDashboardReady(true), []);

    // la ficha: «llega» después de un rato; «Cargar de nuevo» la vuelve a pedir
    useEffect(() => {
        if (!isClientLoading) {
            return undefined;
        }
        const timer = window.setTimeout(() => setIsClientLoading(false), FAKE_DELAY);
        return () => window.clearTimeout(timer);
    }, [isClientLoading]);

    return (
        <Stack spacing={3}>
            <Stack spacing={1}>
                <Box>
                    <Button variant="outlined" onClick={() => setIsClientLoading(true)} disabled={isClientLoading}>Cargar la ficha de nuevo</Button>
                </Box>
                {isClientLoading
                    ? <DetailHeaderSkeleton media lines={1} tabs={4} />
                    : <DetailHeader eyebrow="Cliente" title="Distribuidora del Norte" />}
                <SectionCard title="Datos del cliente">
                    {isClientLoading ? <DefinitionListSkeleton rows={CLIENT.length} /> : <DefinitionList entries={CLIENT} />}
                </SectionCard>
            </Stack>

            <Stack spacing={1}>
                <Box>
                    <Button variant="outlined" disabled={!isDashboardReady}
                            onClick={() => { setIsDashboardReady(false); setDashboardRun((run) => run + 1); }}>
                        Volver a cargar el tablero
                    </Button>
                </Box>
                {/* el tablero se monta desde el principio, debajo; el esqueleto lo tapa hasta que avisa */}
                <SkeletonOverlay isLoading={!isDashboardReady}>
                    <FakeDashboard key={dashboardRun} onReady={markDashboardReady} />
                </SkeletonOverlay>
            </Stack>
        </Stack>
    );
};

export default LoadingShapes;
