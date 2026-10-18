// Conectarla a su API: fetchPage recibe lo que pide la tabla ({filters, sortOrders, page, pageSize}) y toServerTableParams
// lo convierte a la query del contrato (page desde 1, page_size, sort, direction y cada filtro; los vacíos no viajan; los
// múltiples como status[]=a&status[]=b, lo que valida Laravel). La señal cancela la consulta anterior si la persona sigue
// escribiendo.
//
//   GET /orders?page=1&page_size=25&sort=number&direction=asc&status[]=paid&contains=luis
//   → {rows: [...], total: 1382, facets: {status: [{value: 'paid', total: 14}, …]}}
import {createApiClient} from '@stackcraftmx/calcita';
import {toServerTableParams} from '@stackcraftmx/calcita/table';

const apiClient = createApiClient({baseUrl: '/api'});

interface TableRequest {
    filters?: Record<string, unknown>;
    sortOrders?: Array<{column: string, direction: 'asc' | 'desc'}>;
    page: number;
    pageSize: number;
}

export const fetchOrdersPage = (request: TableRequest, signal: AbortSignal) => (
    apiClient.get('/orders', {params: toServerTableParams(request), signal})
);

// en la pantalla: <ServerTable fetchPage={fetchOrdersPage} prefix="orders" … />
// con prefix, los filtros, el orden y la página viven en la URL (nuqs): se comparten por enlace y sobreviven a recargar
