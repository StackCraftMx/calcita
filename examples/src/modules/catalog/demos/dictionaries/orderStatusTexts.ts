// Los textos del diccionario, en el archivo de textos del módulo (namespace dictionaries, compartido): el texto, la palabra
// corta para una columna angosta y la explicación que sale al pasar el cursor.
export const orderStatusTexts = {
    es: {
        dictionaries: {
            orderStatus: {
                pending: {label: 'Pendiente de pago', shortLabel: 'Pendiente', tooltip: 'El cliente todavía no paga.'},
                paid: {label: 'Pagado', tooltip: 'Ya se cobró; falta enviarlo.'},
                shipped: {label: 'En camino', tooltip: 'Salió del almacén.'},
                delivered: {label: 'Entregado', tooltip: 'El cliente ya lo recibió.'},
                canceled: {label: 'Cancelado', tooltip: 'No siguió: se canceló antes de entregarse.'},
            },
        },
    },
    en: {
        dictionaries: {
            orderStatus: {
                pending: {label: 'Awaiting payment', shortLabel: 'Pending', tooltip: 'The customer has not paid yet.'},
                paid: {label: 'Paid', tooltip: 'It was charged; it still has to ship.'},
                shipped: {label: 'On its way', tooltip: 'It left the warehouse.'},
                delivered: {label: 'Delivered', tooltip: 'The customer already received it.'},
                canceled: {label: 'Canceled', tooltip: 'It did not go on: it was canceled before delivery.'},
            },
        },
    },
};
