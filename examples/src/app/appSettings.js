// Lo que la app de ejemplos le pasa a ToolkitProvider y que no cambia mientras corre.
import {publicUrlOf} from '@/core';

/** El nombre que sale en la pestaña después del título de cada pantalla («Pedidos | Ejemplos de Calcita»). */
export const APP_NAME = 'Ejemplos de Calcita';

/** La zona del producto: las horas de los pedidos se pintan en la hora de la Ciudad de México, la de la tienda. */
export const PRODUCT_TIME_ZONE = 'America/Mexico_City';

/** La moneda de los montos de la tienda (ISO 4217). */
export const PRODUCT_CURRENCY = 'MXN';

/**
 * La versión del front que corre en esta pestaña: la pone el build (VITE_BUILD_ID, de vite.config.js, la misma que escribe
 * en version.json). En desarrollo no hay build y queda una fija, para que la página de avisos pueda simular otra.
 */
export const APP_BUILD_ID = import.meta.env.VITE_BUILD_ID || 'ejemplos-local';

/**
 * Dónde está el archivo con la versión publicada: la app lo vuelve a leer al abrirla y cada tanto (usePublishedBuildWatch).
 * Solo en lo construido; en desarrollo no hay archivo ni versión que comparar.
 */
export const BUILD_VERSION_URL = import.meta.env.PROD ? publicUrlOf('version.json') : null;

/** Los idiomas que ofrece la app; el primero es el de arranque. */
export const APP_LANGUAGES = Object.freeze({spanish: 'es', english: 'en'});
