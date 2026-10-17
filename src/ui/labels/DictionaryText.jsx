// Solo el texto de un valor de diccionario (sin punto, chip ni tooltip), para listas de dato → valor o títulos.
// Si el valor no está en el diccionario se pinta su código crudo (ver labelOf en dictionaries/dictionaries.js).
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

import {labelOf, lookup} from '@/dictionaries/dictionaries.js';

/**
 * @param {{dictionary: Record<string, object>, value: string|null|undefined}} props
 */
export default function DictionaryText({dictionary, value}) {
    const {t} = useToolkitTranslation('dictionaries');
    return labelOf(lookup(dictionary, value), t);
}
