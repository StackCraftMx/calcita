// La descripción de una tarea guarda el HTML del editor con formato (RichTextEditor): para la ventana de la tarea. La tarjeta
// del tablero y el buscador necesitan su texto, sin etiquetas: KanbanBoard pinta la descripción como texto y, con el HTML,
// la tarjeta enseñaba «<p>Ideas para <strong>…» tal cual, y buscar «strong» encontraba la tarea.
//
// Cada bloque (párrafo, renglón de una lista, título) se separa con un espacio: textContent a secas los pegaba
// («…al mesEntrega sin costo…»).
//
// Solo corre en el navegador (DOMParser). El texto que sale lo pinta React como texto, así que una etiqueta que viniera en
// el HTML no llega a la página.
//
// Funciones que no renderizan: function (regla de la casa).

// lo que en el HTML del editor es un bloque: lo que va en su propio renglón
const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, pre';

/**
 * El texto de una descripción guardada como HTML, en un solo renglón.
 *
 * @param {string|null|undefined} html lo que guardó el editor con formato
 * @returns {string} '' si no trae nada
 */
export function descriptionTextOf(html) {
    if (!html) {
        return '';
    }
    const body = new DOMParser().parseFromString(html, 'text/html').body;
    // solo los bloques de hasta adentro: un <li> trae su <p> y saldría dos veces
    const blocks = [...body.querySelectorAll(BLOCK_SELECTOR)].filter((block) => !block.querySelector(BLOCK_SELECTOR));
    const texts = blocks.length > 0 ? blocks.map((block) => block.textContent) : [body.textContent];
    return texts.map((text) => text.trim()).filter(Boolean).join(' ');
}
