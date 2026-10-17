// Lo que la app de ejemplos le pasa a ToolkitProvider y que no cambia mientras corre.

/** El nombre que sale en la pestaña después del título de cada pantalla («Pedidos | Ejemplos de Calcita»). */
export const APP_NAME = 'Ejemplos de Calcita';

/** La zona del producto: las horas de los pedidos se pintan en la hora de la Ciudad de México, la de la tienda. */
export const PRODUCT_TIME_ZONE = 'America/Mexico_City';

/** La moneda de los montos de la tienda (ISO 4217). */
export const PRODUCT_CURRENCY = 'MXN';

/**
 * La compilación del front que corre en esta pestaña. En un proyecto real sale del build (una variable de entorno al
 * construir, o la que escribe el servidor en la página) y el servidor anuncia la publicada en cada respuesta; aquí es fija
 * y la página de avisos simula que se publicó otra.
 */
export const APP_BUILD_ID = 'ejemplos-local';

/** Los idiomas que ofrece la app; el primero es el de arranque. */
export const APP_LANGUAGES = Object.freeze({spanish: 'es', english: 'en'});
