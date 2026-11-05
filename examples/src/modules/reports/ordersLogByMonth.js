// La bitácora de varios meses en un solo archivo, cuando el API la entrega de un mes por petición.
//
// Para el panel de descargas es UNA descarga (un renglón, una barra, un botón para cancelar todo el lote): por eso el
// lote vive dentro de una sola `request` de startDownload. Mientras baja, onLabelChange le dice al panel en qué mes va
// («Bitácora por mes: 3 de 10, marzo 2026»); sin eso el renglón se queda con el mismo nombre todo el tiempo y quien
// espera no sabe si avanza.
//
// Funciones sin React: function (regla de la casa). No llama al API por su cuenta: la pantalla le pasa la petición de un
// mes (la de reportsApi.js), y así se prueba sin servidor.

const CSV_CONTENT_TYPE = 'text/csv;charset=utf-8';
const CSV_LINE_END = '\r\n';
// la marca que avisa a Excel que el CSV va en UTF-8: sin ella rompe los acentos y la ñ
const UTF8_BYTE_ORDER_MARK = '﻿';

/**
 * Junta varios CSV con los mismos encabezados en uno solo: los encabezados del primero y los renglones de todos (repetidos
 * en medio del archivo, Excel los leería como un pedido más).
 *
 * OJO: blob.text() quita la marca de UTF-8 al leer el archivo. Por eso se le quita a cada uno (por si viene) y se le pone
 * una sola vez al principio: sin volver a ponerla, el archivo junto se abría en Excel con los acentos rotos.
 *
 * @param {string[]} csvTexts cada uno termina con su salto de renglón
 * @returns {string}
 */
export function joinedCsvOf(csvTexts) {
    const withoutMark = csvTexts.map((csvText) => (csvText.startsWith(UTF8_BYTE_ORDER_MARK) ? csvText.slice(UTF8_BYTE_ORDER_MARK.length) : csvText));
    return UTF8_BYTE_ORDER_MARK + withoutMark.map((csvText, position) => (
        position === 0 ? csvText : csvText.slice(csvText.indexOf(CSV_LINE_END) + CSV_LINE_END.length)
    )).join('');
}

/**
 * Baja la bitácora de cada mes, uno tras otro, y regresa un solo CSV. Es la `request` de startDownload: recibe sus
 * transferOptions (cancelar, avance y rótulo).
 *
 * El avance suma los bytes de los meses que ya bajaron y los del que va bajando; el total va en null porque no se sabe
 * cuánto pesan los que faltan (la barra no tiene fin y el panel enseña lo que lleva).
 *
 * @param {object} batch
 * @param {string[]} batch.months 'AAAA-MM', en el orden en que se piden
 * @param {(month: string, transferOptions: {signal: AbortSignal, onDownloadProgress: Function}) => Promise<{blob: Blob}>} batch.downloadMonth
 *     la petición de un mes
 * @param {(month: string, position: number, total: number) => string} batch.labelOf el rótulo del panel ya traducido
 *     mientras baja ese mes (position empieza en 1)
 * @param {string} batch.fileName el nombre con que se guarda
 * @param {{signal: AbortSignal, onDownloadProgress: Function, onLabelChange: (label: string) => void}} transferOptions
 * @returns {Promise<{blob: Blob, fileName: string}>}
 */
export async function downloadOrdersLogByMonth({months, downloadMonth, labelOf, fileName}, {signal, onDownloadProgress, onLabelChange}) {
    const csvTexts = [];
    let finishedBytes = 0;

    for (const [index, month] of months.entries()) {
        onLabelChange(labelOf(month, index + 1, months.length));
        const {blob} = await downloadMonth(month, {
            signal,
            onDownloadProgress: ({loaded}) => onDownloadProgress({loaded: finishedBytes + loaded, total: null}),
        });
        finishedBytes += blob.size;
        csvTexts.push(await blob.text());
    }

    return {blob: new Blob([joinedCsvOf(csvTexts)], {type: CSV_CONTENT_TYPE}), fileName};
}
