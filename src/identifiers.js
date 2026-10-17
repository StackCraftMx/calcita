// Identificadores generados en el navegador: siempre UUID v7 (regla de la casa).
//
// v7 y no v4 (crypto.randomUUID): los v7 ordenan por tiempo, así que en un log o en una tabla con índice único
// quedan en el orden en que se generaron y no fragmentan el índice B-tree de la base de datos.
//
// NOTA: el X-Request-Id NO se genera aquí; lo genera el backend y regresa en cada respuesta.
//
// Funciones puras, no renderizan: function (regla de la casa).
import {v7 as uuidV7} from 'uuid';

/** Un UUID v7 nuevo, p. ej. para una llave de idempotencia o una fila temporal. */
export function newIdentifier() {
    return uuidV7();
}
