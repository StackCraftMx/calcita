// Cuánto va de una subida, para decirlo en palabras: el porcentaje, lo que va de lo que pesa, la velocidad y cuánto falta.
// La velocidad y lo que falta salen de lo que ha viajado desde que empezó; si la subida ya los da (axios trae rate y
// estimated), se usan esos.
//
// Puro (sin React): se prueba con node (transferProgress.test.js).
//
// Genérico del paquete: function (regla de la casa).

const PERCENT = 100;
const MILLISECONDS_PER_SECOND = 1000;
// con menos de medio segundo de subida la velocidad todavía brinca: mejor no decirla
const MIN_SECONDS_FOR_SPEED = 0.5;

/**
 * @param {{loaded: number, total: number, rate?: number, estimated?: number}} transfer lo que avisa la subida (bytes)
 * @param {number} startedAt cuándo empezó la subida, en milisegundos
 * @param {number} [now]
 * @returns {{percent: number, loaded: number, total: number, bytesPerSecond: number|null, remainingSeconds: number|null}}
 */
export function transferProgressOf({loaded, total, rate, estimated}, startedAt, now = Date.now()) {
    const elapsedSeconds = (now - startedAt) / MILLISECONDS_PER_SECOND;
    const measuredSpeed = elapsedSeconds >= MIN_SECONDS_FOR_SPEED && loaded > 0 ? loaded / elapsedSeconds : null;
    const bytesPerSecond = rate ?? measuredSpeed;
    let remainingSeconds = estimated ?? null;
    if (remainingSeconds == null && bytesPerSecond) {
        remainingSeconds = Math.max(0, Math.ceil((total - loaded) / bytesPerSecond));
    }
    return {
        percent: total > 0 ? Math.min(PERCENT, Math.round((loaded * PERCENT) / total)) : 0,
        loaded,
        total,
        bytesPerSecond,
        remainingSeconds,
    };
}
