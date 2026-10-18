// Lo puro del tablero kanban: mover una tarjeta a otra columna (o a otro lugar de la suya) sin perder el orden de las
// demás. Las tarjetas van en UN arreglo y el orden de cada columna es el orden en que aparecen ahí, como lo regresaría un
// servidor ordenado por columna y posición.
//
// Funciones puras, sin React: function (regla de la casa).

/**
 * Las tarjetas de una columna, en su orden.
 *
 * @param {Array<{id: string, columnId: string}>} cards
 * @param {string} columnId
 * @returns {Array<{id: string, columnId: string}>}
 */
export function cardsOfColumn(cards, columnId) {
    return cards.filter((card) => card.columnId === columnId);
}

/**
 * Las tarjetas con una movida: la tarjeta queda en toColumnId, en la posición toIndex de esa columna.
 *
 * @param {Array<{id: string, columnId: string}>} cards
 * @param {{cardId: string, toColumnId: string, toIndex: number}} move
 * @returns {Array<{id: string, columnId: string}>} un arreglo nuevo (el de entrada no se toca)
 */
export function moveCard(cards, {cardId, toColumnId, toIndex}) {
    const card = cards.find((candidate) => candidate.id === cardId);
    if (!card) {
        return cards;
    }
    const others = cards.filter((candidate) => candidate.id !== cardId);
    const movedCard = {...card, columnId: toColumnId};
    // va antes de la que hoy ocupa ese lugar en la columna; si no hay, después de la última de la columna
    const cardAtPlace = cardsOfColumn(others, toColumnId)[toIndex];
    let insertAt;
    if (cardAtPlace) {
        insertAt = others.indexOf(cardAtPlace);
    } else {
        const lastOfColumn = others.map((candidate) => candidate.columnId).lastIndexOf(toColumnId);
        insertAt = lastOfColumn === -1 ? others.length : lastOfColumn + 1;
    }
    return [...others.slice(0, insertAt), movedCard, ...others.slice(insertAt)];
}

/**
 * ¿La columna pasó su tope de tarjetas (el límite de trabajo en curso)? Sin tope, nunca.
 *
 * @param {{limit?: number}} column
 * @param {number} cardCount
 * @returns {boolean}
 */
export function isOverLimit(column, cardCount) {
    return Number.isInteger(column.limit) && cardCount > column.limit;
}
