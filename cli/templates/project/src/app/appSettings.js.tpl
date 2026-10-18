// Lo que la app le pasa a ToolkitProvider y que no cambia mientras corre.

/** El nombre de la app: en la barra y en la pestaña, después del título de cada pantalla («Contactos | __APP_TITLE__»). */
export const APP_NAME = '__APP_TITLE__';

/** La zona del producto: las fechas y horas se pintan en la hora de la Ciudad de México, se vean desde donde se vean. */
export const PRODUCT_TIME_ZONE = 'America/Mexico_City';

/** La moneda de los montos (ISO 4217). */
export const PRODUCT_CURRENCY = 'MXN';

/** Los idiomas que ofrece la app; el primero es el de arranque. */
export const APP_LANGUAGES = Object.freeze({spanish: 'es', english: 'en'});
