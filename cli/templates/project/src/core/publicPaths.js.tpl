// Dónde vive la app: en la raíz o detrás de un proxy con prefijo (miempresa.com/ventas/, sin subdominio). El prefijo se da UNA
// vez, al construir, con ASSET_URL=/ventas (vite.config.js), la misma línea que lleva el .env del servidor. Vite lo deja en
// import.meta.env.BASE_URL ('/' o '/ventas/') y de aquí lo toman el router (basename), las imágenes de public/ y version.json.
//
// OJO: una dirección escrita a mano desde la raíz ('/favicon.svg', '/version.json') funciona en la raíz y se rompe detrás del
// proxy: se arma con publicUrlOf.
//
// El prefijo también puede llegar al SERVIR la página, sin volver a construir: si la página trae <base href="/ventas/"> (Laravel
// lo pone con config('app.url'), un proxy con su ruta), manda ese (documentBasePath). Para eso se construye con ASSET_URL=./
// (archivos relativos a la página). Sin <base>, todo sigue como arriba.
//
// Funciones puras, no renderizan: function (regla de la casa).

import {documentBasePath} from '@stackcraftmx/calcita';

// en las pruebas de node no hay import.meta.env (es de Vite): ahí, la raíz
const APP_BASE_URL = import.meta.env?.BASE_URL ?? '/';
// el prefijo que puso el servidor en <base href> ('' en la raíz), o null si la página no trae <base>
const SERVED_BASE_PATH = documentBasePath();

/** El prefijo como lo pide el router: '/ventas' (sin la diagonal del final) o '/'. */
export const ROUTER_BASENAME = (SERVED_BASE_PATH ?? APP_BASE_URL.replace(/\/$/, '')) || '/';

/**
 * La dirección de un archivo de public/ con el prefijo: 'favicon.svg' → '/ventas/favicon.svg'.
 *
 * @param {string} path la ruta dentro de public/, sin la diagonal del inicio
 * @returns {string}
 */
export function publicUrlOf(path) {
    return SERVED_BASE_PATH === null ? `${APP_BASE_URL}${path}` : `${SERVED_BASE_PATH}/${path}`;
}
