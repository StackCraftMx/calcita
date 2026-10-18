// Los textos de lo que vive en core: los del diccionario de estados de un pedido (namespace dictionaries) y los del atajo de
// los ejemplos para la app autenticadora (namespace demo).
export const coreTexts = {
    es: {
        demo: {
            totpCode: 'Usar el código de ejemplo',
            totpCodeHelp: 'Solo en los ejemplos: llena el código que enseñaría su app ahorita, por si no la tiene a la mano.',
        },
        dictionaries: {
            orderStatus: {
                pending: {label: 'Pendiente de pago', shortLabel: 'Pendiente', tooltip: 'El cliente todavía no paga.'},
                paid: {label: 'Pagado', tooltip: 'Pagado; el almacén lo está preparando.'},
                shipped: {label: 'En camino', tooltip: 'Ya salió del almacén y va con la paquetería.'},
                delivered: {label: 'Entregado', tooltip: 'El cliente ya lo recibió.'},
                canceled: {label: 'Cancelado', tooltip: 'No se envió: lo cancelaron antes de salir del almacén.'},
            },
        },
    },
    en: {
        demo: {
            totpCode: 'Use the sample code',
            totpCodeHelp: 'Examples only: fills in the code your app would show right now, in case you do not have it at hand.',
        },
        dictionaries: {
            orderStatus: {
                pending: {label: 'Awaiting payment', shortLabel: 'Pending', tooltip: 'The customer has not paid yet.'},
                paid: {label: 'Paid', tooltip: 'Paid; the warehouse is preparing it.'},
                shipped: {label: 'On its way', tooltip: 'It left the warehouse and is with the carrier.'},
                delivered: {label: 'Delivered', tooltip: 'The customer received it.'},
                canceled: {label: 'Canceled', tooltip: 'Not shipped: it was canceled before leaving the warehouse.'},
            },
        },
    },
};
