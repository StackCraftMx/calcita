// Lo que la tarjeta del tablero decide sin pintar nada: si su fecha ya venció, vence hoy o falta. Cómo se lee una etiqueta
// (texto suelto o con su color) vive en ui/labels/tagOf.js y aquí se vuelve a exportar. Funciones puras: se prueban sin
// navegador (kanbanCards.test.js).
//
// Funciones puras, no renderizan: function (regla de la casa).

/** Cómo va la fecha límite de una tarjeta. */
export const DUE_STATUS = Object.freeze({overdue: 'overdue', today: 'today', upcoming: 'upcoming'});

/**
 * El día de hoy como AAAA-MM-DD en la zona de este navegador (la fecha límite es un día, no un instante).
 *
 * @param {Date} [now]
 * @returns {string}
 */
export function todayIsoDateOf(now = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Cómo va una fecha límite contra hoy. AAAA-MM-DD se compara bien como texto.
 *
 * @param {string|null|undefined} dueDate AAAA-MM-DD
 * @param {string} today AAAA-MM-DD
 * @returns {'overdue'|'today'|'upcoming'|null} null sin fecha
 */
export function dueStatusOf(dueDate, today) {
    if (!dueDate) {
        return null;
    }
    if (dueDate < today) {
        return DUE_STATUS.overdue;
    }
    return dueDate === today ? DUE_STATUS.today : DUE_STATUS.upcoming;
}

// la regla de una etiqueta vive en lo compartido (la usan el tablero y la bandeja); aquí sigue a la mano
export {tagOf} from '@/ui/labels/tagOf.js';
