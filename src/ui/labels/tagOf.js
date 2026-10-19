// Una etiqueta de color como la reciben las piezas de la casa (la tarjeta del tablero, el mensaje de la bandeja): texto solo
// («Clientes») o con su color del tema ({label: 'Alta', color: 'error'}). Función pura: se prueba sin navegador.
//
// Funciones puras, no renderizan: function (regla de la casa).

/**
 * Una etiqueta como la pintan la tarjeta y el mensaje: un texto suelto o {label, color} (un color del tema: error, warning, info…).
 *
 * @param {string|{label: string, color?: string}} tag
 * @returns {{label: string, color: string}}
 */
export function tagOf(tag) {
    return typeof tag === 'string' ? {label: tag, color: 'default'} : {label: tag.label, color: tag.color ?? 'default'};
}
