// Las llamadas de __LABEL_ES__: la ÚNICA puerta de sus pantallas al servidor. Hoy van al servidor de mentira
// (src/fakeServer/__name__Server.js); con backend, cada una cambia por su petición con apiClient (core) sin tocar las
// pantallas:
//
//   export const loadRecords = async (signal) => (await apiClient.get('/__kebab__', {signal})).map(recordOf);
//
// Aquí también se cambia la forma de los datos: el API manda snake_case (created_at) y las pantallas usan camelCase.
//
// Funciones que no renderizan: function (regla de la casa).
import {newIdentifier} from '@stackcraftmx/calcita';

import {createRecord, listRecords} from '@/fakeServer/__name__Server.js';

/** Un registro como lo usan las pantallas. */
function recordOf(record) {
    return {id: record.id, name: record.name, notes: record.notes, createdAt: record.created_at};
}

/**
 * La lista, del más nuevo al más viejo.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{id: string, name: string, notes: string, createdAt: string}>>}
 */
export async function loadRecords(signal) {
    return (await listRecords(signal)).map(recordOf);
}

/**
 * Agrega uno. El id lo pone el navegador (newIdentifier: UUID v7, se ordena por fecha). Truena con el ApiError si el
 * servidor dice que no.
 *
 * @param {{name: string, notes: string}} values
 * @returns {Promise<{message: string}>} el aviso del servidor, ya en el idioma de la persona
 */
export async function addRecord(values) {
    const response = await createRecord({id: newIdentifier(), ...values});
    return {message: response.message};
}
