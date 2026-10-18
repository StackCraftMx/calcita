// Lo que respondería el API de __LABEL_ES__: la lista y agregar uno. Datos de mentira en memoria: se pierden al recargar
// la página. Cada respuesta tiene la forma que tendría el API de verdad (llaves en snake_case y errores RFC 9457 con el
// mensaje en el idioma de la persona).
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {ApiError} from '@stackcraftmx/calcita';

import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverText.js';

const HTTP_STATUS = Object.freeze({conflict: 409, unprocessable: 422});
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const MESSAGES = Object.freeze({
    validationTitle: {es: 'Revise los datos', en: 'Check the data'},
    validationDetail: {es: 'Hay campos por corregir.', en: 'Some fields need to be fixed.'},
    nameRequired: {es: 'Escriba el nombre.', en: 'Enter the name.'},
    repeatedTitle: {es: 'Ya está en la lista', en: 'Already on the list'},
    repeated: {es: '«{{name}}» ya está en la lista.', en: '“{{name}}” is already on the list.'},
    created: {es: 'Se agregó «{{name}}».', en: '“{{name}}” was added.'},
});

/** La fecha de hace unos días, como texto ISO (UTC): los ejemplos siempre se ven recientes. */
function daysAgo(days) {
    return new Date(Date.now() - days * MILLISECONDS_PER_DAY).toISOString();
}

let records = [
    {id: '__name__-sample-1', name: 'Primer ejemplo', notes: 'Viene de src/fakeServer/__name__Server.js', created_at: daysAgo(2)},
    {id: '__name__-sample-2', name: 'Segundo ejemplo', notes: '', created_at: daysAgo(1)},
];

/**
 * GET __kebab__: la lista, del más nuevo al más viejo.
 *
 * @param {AbortSignal} [signal]
 */
export async function listRecords(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return [...records].sort((first, second) => second.created_at.localeCompare(first.created_at));
}

/**
 * POST __kebab__: agrega uno. Sin nombre responde 422 (con el error en su campo); con un nombre que ya está, 409.
 *
 * @param {{id: string, name: string, notes?: string}} input
 */
export async function createRecord({id, name, notes}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const cleanName = name?.trim() ?? '';
    if (!cleanName) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {
                title: serverTextOf(MESSAGES.validationTitle), detail: serverTextOf(MESSAGES.validationDetail),
                errors: {name: [serverTextOf(MESSAGES.nameRequired)]},
            },
        });
    }
    if (records.some((record) => record.name.toLowerCase() === cleanName.toLowerCase())) {
        throw new ApiError({
            status: HTTP_STATUS.conflict,
            problem: {title: serverTextOf(MESSAGES.repeatedTitle), detail: serverTextOf(MESSAGES.repeated, {name: cleanName})},
        });
    }
    const record = {id, name: cleanName, notes: notes?.trim() ?? '', created_at: new Date().toISOString()};
    records = [...records, record];
    return {record, message: serverTextOf(MESSAGES.created, {name: cleanName})};
}
