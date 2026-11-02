// Una llave estable por renglón de una lista que se repite, para formik (react-hook-form ya trae la suya en useFieldArray).
//
// Por qué no el índice: al quitar el renglón 2, el 3 pasa a ser el 2; con el índice como llave React le dejaría al nuevo
// 2 lo que tenía el viejo (lo escrito a medias en una lista de opciones, un error), y se vería el dato de otro renglón.
//
// Si la lista cambia desde afuera (el formulario se limpia o llega del servidor), las llaves se vuelven a hacer.
//
// Hook genérico: function (regla de la casa).
import {useRef} from 'react';

import {newIdentifier} from '@/identifiers.js';

/**
 * @param {number} rowCount cuántos renglones tiene la lista hoy
 * @returns {{keys: string[], added: () => void, removed: (index: number) => void, renewed: (index: number) => void}}
 *     added / removed / renewed se llaman JUNTO con el cambio de la lista (agregar al final, quitar uno, limpiar uno)
 */
export function useRowKeys(rowCount) {
    const keysRef = useRef([]);
    // la lista cambió desde afuera: tantas llaves como renglones
    if (keysRef.current.length !== rowCount) {
        keysRef.current = Array.from({length: rowCount}, (unused, index) => keysRef.current[index] ?? newIdentifier());
    }
    return {
        keys: keysRef.current,
        added: () => {
            keysRef.current = [...keysRef.current, newIdentifier()];
        },
        removed: (index) => {
            keysRef.current = keysRef.current.filter((unused, keyIndex) => keyIndex !== index);
        },
        // un renglón limpio es otro renglón: los campos de adentro empiezan de cero
        renewed: (index) => {
            keysRef.current = keysRef.current.map((key, keyIndex) => (keyIndex === index ? newIdentifier() : key));
        },
    };
}
