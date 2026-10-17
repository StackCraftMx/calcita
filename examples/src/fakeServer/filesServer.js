// Lo que respondería el API de archivos: la bitácora de pedidos en CSV (tarda, para poder cancelarla desde el panel de
// descargas) y un archivo que no se puede generar (para ver cómo el panel enseña el motivo).
//
// Regresan lo que espera startDownload del paquete: {blob, fileName}, o un ApiError con su problema traducido.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {toolkitSettings} from '@stackcraftmx/calcita';

import {ApiError} from '@/fakeServer/ApiError.js';
import {deliverLikeNetwork, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {allOrdersNewestFirst} from '@/fakeServer/ordersServer.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

const HTTP_STATUS = Object.freeze({serviceUnavailable: 503});

// lo que tarda la bitácora completa: lo suficiente para alcanzar a cancelarla
const ORDERS_LOG_MILLISECONDS = 10_000;
// lo que tarda el servidor en contestar que no puede
const UNAVAILABLE_MILLISECONDS = 1500;

const CSV_CONTENT_TYPE = 'text/csv;charset=utf-8';
// la marca que avisa a Excel que el CSV va en UTF-8: sin ella rompe los acentos y la ñ
const UTF8_BYTE_ORDER_MARK = '﻿';
const CSV_LINE_END = '\r\n';

// las columnas de la bitácora, en orden: el campo del API y su encabezado en cada idioma
const ORDERS_LOG_COLUMNS = Object.freeze([
    {field: 'number', header: {es: 'Pedido', en: 'Order'}},
    {field: 'created_at', header: {es: 'Fecha y hora (UTC)', en: 'Date and time (UTC)'}},
    {field: 'customer_name', header: {es: 'Cliente', en: 'Customer'}},
    {field: 'product_name', header: {es: 'Producto', en: 'Product'}},
    {field: 'quantity', header: {es: 'Piezas', en: 'Quantity'}},
    {field: 'total', header: {es: 'Importe', en: 'Amount'}},
    {field: 'payment_method', header: {es: 'Forma de pago (código)', en: 'Payment method (code)'}},
    {field: 'status', header: {es: 'Estado (código)', en: 'Status (code)'}},
]);

/**
 * Un campo del CSV entre comillas cuando lo necesita (una coma, unas comillas o un salto de renglón adentro).
 *
 * @param {unknown} value
 * @returns {string}
 */
function csvFieldOf(value) {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * GET /files/orders-log: la bitácora de todos los pedidos, con los encabezados en el idioma activo (lo que haría el
 * Accept-Language de la petición).
 *
 * @param {{signal: AbortSignal, onDownloadProgress: Function}} transferOptions las que pasa startDownload
 * @param {string} fileName el nombre con que se guarda
 * @returns {Promise<{blob: Blob, fileName: string}>}
 */
export async function downloadOrdersLog(transferOptions, fileName) {
    const {language} = toolkitSettings();
    const headerLine = ORDERS_LOG_COLUMNS.map((column) => csvFieldOf(column.header[language] ?? column.header.es)).join(',');
    const orderLines = allOrdersNewestFirst().map((order) => ORDERS_LOG_COLUMNS.map((column) => csvFieldOf(order[column.field])).join(','));
    const blob = new Blob([UTF8_BYTE_ORDER_MARK + [headerLine, ...orderLines].join(CSV_LINE_END) + CSV_LINE_END], {type: CSV_CONTENT_TYPE});

    await deliverLikeNetwork(blob, transferOptions, ORDERS_LOG_MILLISECONDS);
    return {blob, fileName};
}

/**
 * GET /files/unavailable: un archivo que el servidor no puede generar (503).
 *
 * @param {{signal: AbortSignal}} transferOptions
 * @returns {Promise<never>}
 */
export async function downloadUnavailableFile({signal}) {
    await waitLikeNetwork(UNAVAILABLE_MILLISECONDS, signal);
    throw new ApiError({
        status: HTTP_STATUS.serviceUnavailable,
        problem: {
            status: HTTP_STATUS.serviceUnavailable, code: 'file_service_unavailable',
            title: serverTextOf('files.unavailableTitle'), detail: serverTextOf('files.unavailableDetail'),
        },
    });
}
