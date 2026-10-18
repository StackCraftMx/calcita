// Los lugares del marco donde caen las acciones de cada pantalla (BarActions), y cómo va la barra. Los da AppLayout:
//   - slot: en escritorio, dentro de la barra de arriba (null si no hay barra visible, como con la barra fundida al menú);
//   - phoneSlot: en el teléfono con cápsulas, el renglón que flota arriba a la derecha y se queda al bajar (null si no hay).
// Fuera de AppLayout (una prueba, una pantalla sin marco) no hay lugar y las acciones se quedan donde la pantalla las pone.
// También dice a lo de adentro dónde quedó, para que un botón se acomode solo (BarActionButton):
//   - en una cápsula (arriba en la barra, flotando en el teléfono o en la pantalla): solo el ícono, con su nombre en el tooltip;
//   - en el menú «⋯» del teléfono (las que ya no caben en el renglón): un renglón del menú con ícono y texto;
//   - suelto (fuera de BarActions): ícono con texto.
//
// Contexto del paquete: no renderiza (regla de la casa).
import {createContext, useContext} from 'react';

/** Dónde quedó un botón de acción: en una cápsula, en el menú «⋯» o suelto. */
export const BAR_ACTIONS_PLACEMENT = Object.freeze({capsule: 'capsule', menu: 'menu', inline: 'inline'});

export const BarActionsSlotContext = createContext({slot: null, phoneSlot: null, usesCapsules: false});
export const BarActionsPlacementContext = createContext(BAR_ACTIONS_PLACEMENT.inline);
// en el menú «⋯»: cómo cerrarlo después de picar una acción
export const BarActionsMenuCloseContext = createContext(() => {});

/**
 * @returns {{slot: Element|null, phoneSlot: Element|null, usesCapsules: boolean}} slot: el lugar de la barra en escritorio;
 *     phoneSlot: el renglón flotante del teléfono; usesCapsules: la barra va en cápsulas
 */
export function useBarActionsSlot() {
    return useContext(BarActionsSlotContext);
}

/**
 * Dónde quedó lo que está adentro de BarActions (BAR_ACTIONS_PLACEMENT). Fuera de BarActions, 'inline'.
 *
 * @returns {string}
 */
export function useBarActionsPlacement() {
    return useContext(BarActionsPlacementContext);
}

/**
 * En el menú «⋯» del teléfono, la función que lo cierra (para algo propio que haga su acción y deba cerrarlo); fuera de él
 * no hace nada.
 *
 * @returns {() => void}
 */
export function useCloseBarActionsMenu() {
    return useContext(BarActionsMenuCloseContext);
}
