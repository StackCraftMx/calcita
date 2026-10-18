// Los textos de la app: un objeto por idioma con un namespace por módulo (orders, customers…). Con la misma forma se
// cambia un texto del paquete: aquí, «Cancelar» del namespace common pasa a decir «Regresar».
//
// Lo que falte aquí sale de los textos del paquete, y lo que no esté en inglés, en español.
export const APP_TEXTS = {
    es: {
        orders: {
            title: 'Pedidos',
            greeting: 'Hola, {{name}}',
            // plurales: _one para uno y _other para los demás (las reglas de Intl.PluralRules de cada idioma)
            pending_one: '{{count}} pedido pendiente',
            pending_other: '{{count}} pedidos pendientes',
        },
        common: {
            actions: {cancel: 'Regresar'},
        },
    },
    en: {
        orders: {
            title: 'Orders',
            greeting: 'Hi, {{name}}',
            pending_one: '{{count}} pending order',
            pending_other: '{{count}} pending orders',
        },
        common: {
            actions: {cancel: 'Go back'},
        },
    },
};
