// Las llamadas del ejemplo de descargas al API (aquí, al servidor de mentira; con backend, a axios): las cifras por mes
// del reporte (entre dos meses), la bitácora de pedidos (tarda, para poder cancelarla) y un archivo que el servidor no puede generar.
export {downloadOrdersLog, downloadUnavailableFile} from '@/fakeServer/filesServer.js';
export {getMonthlyReport} from '@/fakeServer/metricsServer.js';
