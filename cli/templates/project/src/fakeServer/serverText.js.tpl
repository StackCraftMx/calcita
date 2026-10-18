// Los mensajes del servidor de mentira en el idioma de la app, como los mandaría un backend que lee el idioma de la
// petición (Accept-Language). Cada servidor de mentira trae sus mensajes junto a su código ({es, en}): no hay una lista
// central que todos editen.
//
// Funciones puras, sin React: function (regla de la casa).
import {toolkitSettings} from '@stackcraftmx/calcita';

const DEFAULT_LANGUAGE = 'es';

/**
 * Un mensaje en el idioma activo, con sus {{variables}} puestas.
 *
 * @param {Record<string, string>} texts el mismo mensaje en cada idioma: {es: 'Se agregó «{{name}}».', en: '…'}
 * @param {Record<string, string|number>} [values]
 * @returns {string}
 */
export function serverTextOf(texts, values = {}) {
    const text = texts[toolkitSettings().language] ?? texts[DEFAULT_LANGUAGE];
    return text.replace(/\{\{(\w+)\}\}/g, (placeholder, name) => String(values[name] ?? placeholder));
}
