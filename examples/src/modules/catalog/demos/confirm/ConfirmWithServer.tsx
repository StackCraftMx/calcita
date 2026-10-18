// Confirmar antes de algo que no se deshace (useConfirmAction + ConfirmDialog): el diálogo se queda ocupado mientras el
// servidor contesta; si dice que no, el motivo sale DENTRO del diálogo (la persona puede reintentar o cancelar); si sale
// bien, se cierra y avisa. La primera vez este servidor de mentira contesta 409 a propósito.
import {useState} from 'react';
import Button from '@mui/material/Button';
import {ApiError, ConfirmDialog, toastSuccess, useConfirmAction} from '@stackcraftmx/calcita';

interface Order {
    id: number;
    number: string;
}

// ─── El servidor de mentira (en su proyecto NO va: es la llamada de su *Api.js) ───
let attempts = 0;
const cancelOrder = async (order: Order) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    attempts += 1;
    if (attempts === 1) {
        throw new ApiError({status: 409, problem: {title: 'Ya salió', detail: `El pedido ${order.number} ya va en camino: avise al repartidor primero.`}});
    }
    return {message: `Se canceló el pedido ${order.number}.`};
};

const ConfirmWithServer = () => {
    const [order] = useState<Order>({id: 2375, number: 'P-2375'});
    const cancel = useConfirmAction({
        run: ({subject}) => cancelOrder(subject as Order),
        onDone: (response) => toastSuccess((response as {message: string}).message),
    });

    return (
        <>
            <Button variant="outlined" color="error" onClick={() => cancel.open(order)}>Cancelar el pedido {order.number}</Button>
            <ConfirmDialog {...cancel.dialogProps} tone="error" title={`¿Cancelar el pedido ${order.number}?`}
                           description="El cliente recibe un correo y el pedido ya no se puede reactivar." confirmLabel="Cancelar el pedido"
                           cancelLabel="Regresar" />
        </>
    );
};

export default ConfirmWithServer;
