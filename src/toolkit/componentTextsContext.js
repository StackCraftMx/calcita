// Los textos propios que un componente les pasa a las piezas de adentro (la tabla a sus filtros de columna, sus chips y su
// barra de elegidos): así un `texts` en ServerTable cambia también el «Limpiar esta columna» del filtro, sin pasarlo pieza por
// pieza. Cada capa sabe cuál la envuelve (parent): la más cercana gana.
//
// Contexto de React, no renderiza: archivo .js (regla de la casa).
import {createContext} from 'react';

/** @type {import('react').Context<{namespace: string, texts: object|undefined, parent: object|null}|null>} */
export const ComponentTextsContext = createContext(null);

/**
 * Las capas de afuera hacia la más lejana, para componentTextOf.
 *
 * @param {{namespace: string, texts: object|undefined, parent: object|null}|null} layer
 * @returns {Array<{namespace: string, texts: object|undefined}>}
 */
export function layersOf(layer) {
    const layers = [];
    for (let current = layer; current; current = current.parent) {
        layers.push(current);
    }

    return layers;
}
