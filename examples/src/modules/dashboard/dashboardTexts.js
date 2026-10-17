// Los textos del tablero (namespace dashboard).
export const dashboardTexts = {
    es: {
        dashboard: {
            menu: {
                label: 'Tablero',
                description: 'Las cifras del mes contra el anterior, lo vendido por mes, lo más pedido y los últimos pedidos.',
            },
            permissions: {
                view: 'Ver el tablero',
                viewDescription: 'Las cifras del mes, las gráficas y los últimos pedidos.',
            },
            page: {
                title: 'Tablero',
                subtitle: 'Hola, {{name}}: así va {{month}} contra {{previousMonth}}. Las cifras salen de los mismos pedidos de la tabla, así que cuadran con ella.',
                loading: 'Cargando el tablero',
            },
            cards: {
                sold: 'Vendido',
                orders: 'Pedidos',
                averageTicket: 'Ticket promedio',
                canceled: 'Cancelados',
                previous: 'En {{month}}: {{value}}',
            },
            monthly: {
                title: 'Vendido por mes',
                period: 'Mes',
                value: 'Vendido',
                ariaLabel: 'Lo vendido en cada mes',
                empty: 'Todavía no hay ventas.',
                tooltip: '{{month}}: {{value}}',
            },
            products: {
                title: 'Lo más pedido en {{month}}',
                empty: 'No hubo pedidos en el mes.',
            },
            recent: {
                title: 'Últimos pedidos',
                seeAll: 'Ver todos',
                ariaLabel: 'Los últimos pedidos',
                number: 'Pedido',
                customer: 'Cliente',
                product: 'Producto',
                total: 'Total',
                status: 'Estado',
                createdAt: 'Fecha',
            },
        },
    },
    en: {
        dashboard: {
            menu: {
                label: 'Dashboard',
                description: 'The figures of the month against the previous one, sales per month, the top products and the latest orders.',
            },
            permissions: {
                view: 'View the dashboard',
                viewDescription: 'The figures of the month, the charts and the latest orders.',
            },
            page: {
                title: 'Dashboard',
                subtitle: 'Hi, {{name}}: this is {{month}} against {{previousMonth}}. The figures come from the same orders as the table, so they match it.',
                loading: 'Loading the dashboard',
            },
            cards: {
                sold: 'Sold',
                orders: 'Orders',
                averageTicket: 'Average ticket',
                canceled: 'Canceled',
                previous: 'In {{month}}: {{value}}',
            },
            monthly: {
                title: 'Sold per month',
                period: 'Month',
                value: 'Sold',
                ariaLabel: 'What was sold each month',
                empty: 'There are no sales yet.',
                tooltip: '{{month}}: {{value}}',
            },
            products: {
                title: 'Top products in {{month}}',
                empty: 'There were no orders in the month.',
            },
            recent: {
                title: 'Latest orders',
                seeAll: 'See all',
                ariaLabel: 'The latest orders',
                number: 'Order',
                customer: 'Customer',
                product: 'Product',
                total: 'Total',
                status: 'Status',
                createdAt: 'Date',
            },
        },
    },
};
