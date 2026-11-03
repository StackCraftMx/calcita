// Los textos de lo que vive en core: los del diccionario de estados de un pedido (namespace dictionaries) y los mensajes de
// error propios de un campo en todas las pantallas (validation.fields.<campo>.<regla>: ganan al general de Calcita sin tocar
// ningún esquema).
export const coreTexts = {
    es: {
        dictionaries: {
            orderStatus: {
                pending: {label: 'Pendiente de pago', shortLabel: 'Pendiente', tooltip: 'El cliente todavía no paga.'},
                paid: {label: 'Pagado', tooltip: 'Pagado; el almacén lo está preparando.'},
                shipped: {label: 'En camino', tooltip: 'Ya salió del almacén y va con la paquetería.'},
                delivered: {label: 'Entregado', tooltip: 'El cliente ya lo recibió.'},
                canceled: {label: 'Cancelado', tooltip: 'No se envió: lo cancelaron antes de salir del almacén.'},
            },
        },
        validation: {
            fields: {
                postal_code: {postalCode: 'El código postal de México lleva 5 dígitos, como 06600.'},
            },
        },
    },
    en: {
        dictionaries: {
            orderStatus: {
                pending: {label: 'Awaiting payment', shortLabel: 'Pending', tooltip: 'The customer has not paid yet.'},
                paid: {label: 'Paid', tooltip: 'Paid; the warehouse is preparing it.'},
                shipped: {label: 'On its way', tooltip: 'It left the warehouse and is with the carrier.'},
                delivered: {label: 'Delivered', tooltip: 'The customer received it.'},
                canceled: {label: 'Canceled', tooltip: 'Not shipped: it was canceled before leaving the warehouse.'},
            },
        },
        validation: {
            fields: {
                postal_code: {postalCode: 'A Mexican postal code has 5 digits, like 06600.'},
            },
        },
    },
};
