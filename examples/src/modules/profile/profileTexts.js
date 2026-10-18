// Los textos de «Mi perfil» de los ejemplos (namespace profile) y de su diccionario de áreas (namespace dictionaries): lo
// que el proyecto le suma a ProfileScreen (un campo propio y una pestaña propia). Llegan a ToolkitProvider por appTexts.js.
export const profileTexts = {
    es: {
        profile: {
            fields: {
                department: 'Área',
                departmentHelp: 'La que sale en los pedidos que usted firma.',
            },
            notifications: {
                tab: 'Notificaciones',
                title: 'Qué avisos recibe',
                text: 'Se mandan a su correo. Una pestaña propia del proyecto: ProfileScreen la recibe en extraTabs.',
                newOrders: 'Cuando entra un pedido',
                weeklySummary: 'El resumen de cada lunes',
                save: 'Guardar avisos',
                saved: 'Se guardaron sus avisos.',
            },
        },
        dictionaries: {
            department: {
                sales: {label: 'Ventas'},
                warehouse: {label: 'Almacén'},
                administration: {label: 'Administración'},
            },
        },
    },
    en: {
        profile: {
            fields: {
                department: 'Department',
                departmentHelp: 'The one shown on the orders you sign.',
            },
            notifications: {
                tab: 'Notifications',
                title: 'Which notices you get',
                text: 'They go to your email. A tab of the project: ProfileScreen receives it in extraTabs.',
                newOrders: 'When an order comes in',
                weeklySummary: 'The summary every Monday',
                save: 'Save notices',
                saved: 'Your notices were saved.',
            },
        },
        dictionaries: {
            department: {
                sales: {label: 'Sales'},
                warehouse: {label: 'Warehouse'},
                administration: {label: 'Administration'},
            },
        },
    },
};
