// Logger con espacio de nombres sobre console.
//
// Por qué un envoltorio y no una librería: corre en el navegador, son pocas líneas legibles y, cuando haga falta un
// reporte externo (Sentry o el que sea), se enchufa en emit() sin tocar cada llamada.
//
// Reglas:
//   - datos estructurados: log.warn('mensaje', {status, requestId}); nunca concatenar cadenas.
//   - IMPORTANTE: sin datos personales. Nada de correos, nombres, contraseñas ni contenido de archivos: solo ids,
//     códigos, status y el request_id (misma regla que el backend: logs sin datos personales).
//   - por omisión solo salen error y warn. La aplicación pide todo en desarrollo con setLogLevel('debug') (el paquete no
//     sabe si la aplicación corre en desarrollo: import.meta.env es de quien construye). Para ver más en una instalación
//     ya desplegada:
//       localStorage.setItem('calcita:logLevel', 'debug')
//
// Funciones puras, no renderizan: function (regla de la casa).

const LEVELS = {error: 0, warn: 1, info: 2, debug: 3};

const LOG_LEVEL_STORAGE_KEY = 'calcita:logLevel';

// el nivel cuando nadie lo pidió en localStorage; lo cambia la aplicación con setLogLevel
let defaultLevel = LEVELS.warn;

/**
 * El nivel de lo que sale en consola: 'error', 'warn', 'info' o 'debug'. Lo llama la aplicación al arrancar, por ejemplo
 * setLogLevel(import.meta.env.DEV ? 'debug' : 'warn').
 *
 * @param {'error'|'warn'|'info'|'debug'} level
 * @returns {void}
 */
export function setLogLevel(level) {
    if (!(level in LEVELS)) {
        throw new Error(`setLogLevel espera error, warn, info o debug y recibió «${level}»`);
    }
    defaultLevel = LEVELS[level];
}

function currentLevel() {
    try {
        const override = window.localStorage?.getItem(LOG_LEVEL_STORAGE_KEY);
        if (override && override in LEVELS) {
            return LEVELS[override];
        }
    } catch {
        // ventana privada o almacenamiento bloqueado: usamos el nivel por defecto
    }
    return defaultLevel;
}

function emit(level, namespace, message, context) {
    if (LEVELS[level] > currentLevel()) {
        return;
    }

    // OJO: debug sale por console.log a propósito; console.debug cae en "Verbose" y DevTools lo esconde
    const write = level === 'debug' ? console.log : (console[level] ?? console.log);
    if (context === undefined) {
        write(`[${namespace}] ${message}`);
    } else {
        write(`[${namespace}] ${message}`, context);
    }
}

/**
 * Logger que antepone [namespace] a cada mensaje.
 *
 * @param {string} namespace p. ej. 'api', 'session'
 */
export function createLogger(namespace) {
    return {
        error: (message, context) => emit('error', namespace, message, context),
        warn: (message, context) => emit('warn', namespace, message, context),
        info: (message, context) => emit('info', namespace, message, context),
        debug: (message, context) => emit('debug', namespace, message, context),
    };
}
