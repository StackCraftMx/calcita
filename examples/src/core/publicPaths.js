// Dónde vive la app: en la raíz o detrás de un proxy con prefijo (calcita.stackcraft.com.mx/demo/). El prefijo se da UNA vez,
// al construir, con ASSET_URL=/demo (vite.config.js), la misma línea que lleva el .env del servidor. Vite lo deja en
// import.meta.env.BASE_URL ('/' o '/demo/') y de aquí lo toman el router (basename), las imágenes de public/ y version.json.
//
// OJO: una dirección escrita a mano desde la raíz ('/branding/logo.svg', '/version.json') funciona en la raíz y se rompe detrás
// del proxy: se arma con publicUrlOf.
//
// Funciones puras, no renderizan: function (regla de la casa).

// en las pruebas de node no hay import.meta.env (es de Vite): ahí, la raíz
const APP_BASE_URL = import.meta.env?.BASE_URL ?? '/';

/** El prefijo como lo pide el router: '/demo' (sin la diagonal del final) o '/'. */
export const ROUTER_BASENAME = APP_BASE_URL.replace(/\/$/, '') || '/';

/**
 * La dirección de un archivo de public/ con el prefijo: 'branding/logo.svg' → '/demo/branding/logo.svg'.
 *
 * @param {string} path la ruta dentro de public/, sin la diagonal del inicio
 * @returns {string}
 */
export function publicUrlOf(path) {
    return `${APP_BASE_URL}${path}`;
}
