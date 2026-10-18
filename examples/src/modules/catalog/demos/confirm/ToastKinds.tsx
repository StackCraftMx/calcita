// Los avisos (toasts): un solo lugar para avisar lo que pasó, en palabras de la persona. toastProblem pinta un error del
// servidor (ApiError, RFC 9457) con su título y su detalle; toastPromise acompaña algo que tarda y dice cómo terminó.
// <Toaster /> va UNA vez en la raíz de la app.
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {ApiError, toastError, toastInfo, toastProblem, toastPromise, toastSuccess, toastWarn} from '@stackcraftmx/calcita';

const saveSlowly = () => new Promise<{folio: string}>((resolve) => {
    setTimeout(() => resolve({folio: 'P-2401'}), 1500);
});

const ToastKinds = () => (
    <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}}>
        <Button variant="outlined" color="success" onClick={() => toastSuccess('Se guardó el pedido.')}>Listo</Button>
        <Button variant="outlined" color="info" onClick={() => toastInfo('Hay 3 pedidos nuevos.')}>Información</Button>
        <Button variant="outlined" color="warning" onClick={() => toastWarn('El cliente no tiene correo: no se le avisará.')}>Advertencia</Button>
        <Button variant="outlined" color="error" onClick={() => toastError('No se pudo guardar.\nIntente de nuevo en un momento.')}>Error</Button>
        <Button variant="outlined" color="error" onClick={() => toastProblem(new ApiError({
            status: 422, problem: {title: 'Revise los datos', detail: 'El límite de crédito no puede pasar de $500,000.'},
        }))}>
            Error del servidor
        </Button>
        <Button variant="outlined" onClick={() => toastPromise(saveSlowly(), {
            loading: 'Guardando…', success: (order) => `Se guardó el pedido ${order.folio}.`, error: 'No se pudo guardar.',
        })}>
            Algo que tarda
        </Button>
    </Stack>
);

export default ToastKinds;
