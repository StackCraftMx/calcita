// Desde una pantalla, con la petición de la casa: apiClient.download trae el archivo y el nombre que manda el servidor
// (Content-Disposition), avisa su avance y entiende la cancelación. Detrás de una confirmación, run NO espera la descarga:
// el diálogo se cierra al confirmar y el avance se ve en el panel.
import Button from '@mui/material/Button';
import {ConfirmDialog, createApiClient, startDownload, useConfirmAction} from '@stackcraftmx/calcita';

const apiClient = createApiClient({baseUrl: '/api'});

const OrdersExportButton = ({onExported}: {onExported: () => void}) => {
    const exportOrders = useConfirmAction({
        run: async () => {
            // sin await: la descarga sigue en el panel y el diálogo se cierra ya
            void startDownload({
                label: 'Pedidos del mes',
                format: 'xlsx',
                request: ({signal, onDownloadProgress}) => apiClient.download('/orders/export', {signal, onDownloadProgress, params: {month: '2026-10'}}),
                // p. ej. volver a pedir la tabla, si la descarga cambia algo («exportado» en los renglones)
                onCompleted: () => onExported(),
            });
        },
    });

    return (
        <>
            <Button variant="outlined" onClick={() => exportOrders.open({})}>Descargar pedidos</Button>
            <ConfirmDialog {...exportOrders.dialogProps} title="¿Descargar los pedidos de octubre?"
                           description="Puede seguir trabajando mientras baja: el avance se ve abajo a la derecha." confirmLabel="Descargar" />
        </>
    );
};

export default OrdersExportButton;
