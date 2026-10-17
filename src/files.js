// Guardar en disco un archivo que llegó como Blob (CSV de renglones descartados, logs, salidas).
//
// La descarga va por el cliente HTTP y no por un <a href> directo a la API a propósito: así un 401 o un 409
// llegan al manejador de siempre (sesión vencida, problema RFC 9457) en lugar de dejar un JSON crudo en una
// pestaña nueva.
//
// Funciones puras, no renderizan: function (regla de la casa).

/** Tipo de contenido de un Excel (XLSX): el mismo que manda el servidor (IngestionDictionary::XLSX_CONTENT_TYPE). */
export const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Un XLSX es un zip, y un zip completo termina con su registro de cierre (End of Central Directory): 22 bytes que
// empiezan con la firma «PK\x05\x06» y terminan con el largo del comentario del zip. El servidor arma sus Excel al vuelo
// y sin comentario, así que ese registro son sus últimos 22 bytes; si la escritura falla a la mitad, nunca se escribe.
// La firma se lee como entero de 4 bytes con el byte menos significativo primero (así la guarda el zip).
const ZIP_END_RECORD_SIGNATURE = 0x06054b50;
const ZIP_END_RECORD_LENGTH = 22;
const ZIP_END_RECORD_COMMENT_LENGTH_POSITION = 20;

/**
 * Nombre de archivo del header Content-Disposition. Prefiere filename*=UTF-8'' (acentos) sobre filename=.
 *
 * @param {string|null|undefined} contentDisposition
 * @param {string} fallbackFileName si el header no trae nombre
 */
export function fileNameFromContentDisposition(contentDisposition, fallbackFileName) {
    if (!contentDisposition) {
        return fallbackFileName;
    }
    const encodedMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (encodedMatch) {
        try {
            return decodeURIComponent(encodedMatch[1].trim());
        } catch {
            // nombre mal codificado: seguimos con filename=
        }
    }
    const plainMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
    return plainMatch ? plainMatch[1].trim() : fallbackFileName;
}

/**
 * Dispara la descarga de un Blob con el nombre dado.
 *
 * @param {Blob} blob
 * @param {string} fileName
 */
export function saveBlob(blob, fileName) {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    // OJO: liberamos la URL un momento después; revocarla en el mismo tick cancela la descarga en Safari
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

/**
 * ¿Llegó completo el zip (un XLSX)? Sí, si termina con su registro de cierre.
 *
 * Por qué hace falta: el servidor manda los Excel por partes y con 200 desde el primer pedazo. Si algo falla a media
 * escritura (p. ej. llegan más renglones de los que se contaron), ya no puede cambiar la respuesta a un error: el archivo
 * llega cortado y Excel no lo abre. Esta revisión es lo que evita guardarlo como si estuviera bien.
 *
 * OJO: supone un zip sin comentario, como los que escribe el servidor (zipstream sin comentario).
 *
 * @param {Blob} blob el archivo descargado
 * @returns {Promise<boolean>}
 */
export async function isCompleteZip(blob) {
    // guard clause: ni siquiera cabe el registro de cierre
    if (blob.size < ZIP_END_RECORD_LENGTH) {
        return false;
    }

    const endRecord = new DataView(await blob.slice(blob.size - ZIP_END_RECORD_LENGTH).arrayBuffer());
    return endRecord.getUint32(0, true) === ZIP_END_RECORD_SIGNATURE
        && endRecord.getUint16(ZIP_END_RECORD_COMMENT_LENGTH_POSITION, true) === 0;
}
