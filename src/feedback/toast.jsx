// Avisos efímeros: el punto ÚNICO de uso de sonner.
//
// Siempre se importa desde aquí (del paquete) y nunca de 'sonner' directo: así los defaults, el texto multilínea y las
// opciones se comparten, y cambiar de librería es tocar un archivo.
//
// Los avisos NO sustituyen al mensaje en pantalla. Un error de una tabla o de un formulario se explica en su lugar;
// el toast es para lo que pasa fuera de la vista: "periodo cerrado", "descarga lista", "sesión terminada".
//
// API:
//   toastSuccess / toastError / toastWarn / toastInfo / toastDefault (mensaje, opciones?)
//   toastLoading(mensaje, opciones?)             → id para dismissToast(id)
//   toastPromise(promesa, {loading, success, error}, opciones?)
//   dismissToast(id)
//   errorsObjectToMessage(errores, {dedup?})     → texto multilínea
//   toastProblem(error, opciones?)               → de un ApiError (RFC 9457)
//
// OJO: los textos por defecto salen de los textos del paquete (common:toast.*) con la configuración vigente del
// proveedor, porque estas funciones se llaman fuera de los componentes.
//
// Funciones que no renderizan por sí mismas: function (regla de la casa).
import {toast} from 'sonner';

import {fieldErrorsOf} from '@/problems.js';
import {translateToolkit} from '@/toolkit/toolkitSettings.js';

export const TOAST_DEFAULT_OPTIONS = Object.freeze({
    duration: 5000,
    closeButton: true,
    dismissible: true,
});

// mapa en vez de switch: agregar un tipo es una línea
const TOAST_FUNCTION_BY_TYPE = {
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    default: toast,
};

/**
 * Texto con saltos de línea → nodos. Sin dangerouslySetInnerHTML a propósito: aquí terminan mensajes del servidor y
 * ninguno debe poder inyectar HTML.
 *
 * @param {import('react').ReactNode} message
 */
function toToastContent(message) {
    if (message === null || message === undefined) {
        return '';
    }
    if (typeof message !== 'string' || !message.includes('\n')) {
        return message;
    }
    const lines = message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    return (
        <div style={{display: 'grid', gap: 4}}>
            {lines.map((line, position) => <div key={position}>{line}</div>)}
        </div>
    );
}

function mergeOptions(options) {
    return {...TOAST_DEFAULT_OPTIONS, ...options};
}

function showToast(type, message, options) {
    const showFunction = TOAST_FUNCTION_BY_TYPE[type] ?? toast;
    return showFunction(toToastContent(message), mergeOptions(options));
}

/**
 * Aviso de que algo salió bien.
 *
 * @param {import('react').ReactNode} [message] ya traducido; con saltos de línea, un renglón cada uno; por omisión «Listo» (common:toast.done)
 * @param {import('sonner').ExternalToast} [options] las de sonner (duración, acción…), encima de TOAST_DEFAULT_OPTIONS
 * @returns {string|number} el id del aviso (para cerrarlo con dismissToast)
 */
export function toastSuccess(message, options) {
    return showToast('success', message ?? translateToolkit('common', 'toast.done'), options);
}

/**
 * Aviso de error.
 *
 * @param {import('react').ReactNode} [message] ya traducido; con saltos de línea, un renglón cada uno; por omisión el error genérico (common:toast.error)
 * @param {import('sonner').ExternalToast} [options] las de sonner (duración, acción…), encima de TOAST_DEFAULT_OPTIONS
 * @returns {string|number} el id del aviso (para cerrarlo con dismissToast)
 */
export function toastError(message, options) {
    return showToast('error', message ?? translateToolkit('common', 'toast.error'), options);
}

/**
 * Aviso de advertencia.
 *
 * @param {import('react').ReactNode} [message] ya traducido; con saltos de línea, un renglón cada uno; por omisión la advertencia genérica (common:toast.warning)
 * @param {import('sonner').ExternalToast} [options] las de sonner (duración, acción…), encima de TOAST_DEFAULT_OPTIONS
 * @returns {string|number} el id del aviso (para cerrarlo con dismissToast)
 */
export function toastWarn(message, options) {
    return showToast('warning', message ?? translateToolkit('common', 'toast.warning'), options);
}

/**
 * Aviso informativo.
 *
 * @param {import('react').ReactNode} [message] ya traducido; con saltos de línea, un renglón cada uno; por omisión el aviso genérico (common:toast.info)
 * @param {import('sonner').ExternalToast} [options] las de sonner (duración, acción…), encima de TOAST_DEFAULT_OPTIONS
 * @returns {string|number} el id del aviso (para cerrarlo con dismissToast)
 */
export function toastInfo(message, options) {
    return showToast('info', message ?? translateToolkit('common', 'toast.info'), options);
}

/**
 * Aviso sin tipo (sin ícono ni color).
 *
 * @param {import('react').ReactNode} [message] ya traducido; con saltos de línea, un renglón cada uno
 * @param {import('sonner').ExternalToast} [options] las de sonner (duración, acción…), encima de TOAST_DEFAULT_OPTIONS
 * @returns {string|number} el id del aviso (para cerrarlo con dismissToast)
 */
export function toastDefault(message, options) {
    return showToast('default', message ?? '', options);
}

/**
 * Aviso que NO se cierra solo. Regresa el id para cerrarlo al terminar.
 *
 * @param {import('react').ReactNode} [message] ya traducido; por omisión «Trabajando…» (common:toast.working)
 * @param {import('sonner').ExternalToast} [options]
 * @returns {string|number} el id del aviso (para dismissToast)
 */
export function toastLoading(message, options) {
    return toast.loading(toToastContent(message ?? translateToolkit('common', 'toast.working')), {...mergeOptions(options), duration: Infinity});
}

/**
 * Envuelve una promesa: cargando → listo | error, solo.
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {object} messages ya traducidos
 * @param {import('react').ReactNode} messages.loading
 * @param {import('react').ReactNode | ((data: T) => import('react').ReactNode)} messages.success
 * @param {import('react').ReactNode | ((failure: unknown) => import('react').ReactNode)} messages.error
 * @param {import('sonner').ExternalToast} [options]
 */
export function toastPromise(promise, {loading, success, error}, options) {
    return toast.promise(promise, {
        loading: toToastContent(loading),
        success: typeof success === 'function' ? (data) => toToastContent(success(data)) : toToastContent(success),
        error: typeof error === 'function' ? (failure) => toToastContent(error(failure)) : toToastContent(error),
        ...mergeOptions(options),
    });
}

/**
 * Cierra un aviso (el id que regresan las funciones de arriba); sin id, todos.
 *
 * @param {string|number} [toastId]
 */
export function dismissToast(toastId) {
    return toast.dismiss(toastId);
}

/**
 * {email: ['Requerido', 'Inválido']} → "Requerido\nInválido".
 *
 * @param {Record<string, string[]|string>|null|undefined} errorsByField
 * @param {{dedup?: boolean}} [options]
 * @returns {string}
 */
export function errorsObjectToMessage(errorsByField, {dedup = true} = {}) {
    if (!errorsByField || typeof errorsByField !== 'object') {
        return '';
    }
    const messages = Object.values(errorsByField)
        .flatMap((fieldMessages) => (Array.isArray(fieldMessages) ? fieldMessages : [String(fieldMessages)]))
        .map((message) => String(message).trim())
        .filter(Boolean);
    return (dedup ? [...new Set(messages)] : messages).join('\n');
}

/**
 * Aviso de error a partir de un ApiError: usa el detail traducido y, si es un 422, enumera los mensajes por campo.
 *
 * @param {Error & {problem?: object}} error
 * @param {object} [options] opciones de sonner
 */
export function toastProblem(error, options) {
    const fieldMessages = errorsObjectToMessage(fieldErrorsOf(error?.problem));
    return toastError(fieldMessages || error?.message || translateToolkit('common', 'toast.error'), options);
}
