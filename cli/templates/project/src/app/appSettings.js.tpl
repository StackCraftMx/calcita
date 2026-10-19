// Lo que la app le pasa a ToolkitProvider y que no cambia mientras corre.
import {publicUrlOf} from '@/core';

/** El nombre de la app: en la barra y en la pestaña, después del título de cada pantalla («Contactos | __APP_TITLE__»). */
export const APP_NAME = '__APP_TITLE__';

/** La zona del producto: las fechas y horas se pintan en la hora de la Ciudad de México, se vean desde donde se vean. */
export const PRODUCT_TIME_ZONE = 'America/Mexico_City';

/** La moneda de los montos (ISO 4217). */
export const PRODUCT_CURRENCY = 'MXN';

/**
 * La versión del front que corre en esta pestaña: la pone el build (VITE_BUILD_ID, de vite.config.js, la misma que escribe
 * en version.json). En desarrollo no hay build: queda vacía y no se compara nada.
 */
export const APP_BUILD_ID = import.meta.env.VITE_BUILD_ID ?? '';

/**
 * Dónde está el archivo con la versión publicada: la app lo vuelve a leer al abrirla y cada tanto (usePublishedBuildWatch).
 * Solo en lo construido, con el prefijo si la app vive detrás de un proxy. OJO: el servidor no debe guardarlo (Cache-Control:
 * no-cache, como el index.html).
 */
export const BUILD_VERSION_URL = import.meta.env.PROD ? publicUrlOf('version.json') : null;

/** Los idiomas que ofrece la app; el primero es el de arranque. */
export const APP_LANGUAGES = Object.freeze({spanish: 'es', english: 'en'});
