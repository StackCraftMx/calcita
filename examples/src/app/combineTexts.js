// Junta los textos de cada módulo en el objeto `texts` que recibe ToolkitProvider: {es: {namespace: {...}}, en: {...}}.
//
// Cada módulo trae su archivo de textos con sus namespaces (orders, customers...) y sus entradas de diccionario
// (namespace dictionaries, compartido). Aquí se juntan por idioma y por namespace; dos módulos que usen el mismo
// namespace suman sus llaves, y si repiten una llave truena: un texto pisado en silencio sale en la pantalla equivocada.
//
// Funciones puras, sin React: function (regla de la casa). Se prueba con node --test (combineTexts.test.js).

/**
 * @param {Array<Record<string, Record<string, object>>>} moduleTextsList los textos de cada módulo, por idioma
 * @returns {Record<string, Record<string, object>>} todos los textos, por idioma y namespace
 */
export function combineTexts(moduleTextsList) {
    const combined = {};

    for (const moduleTexts of moduleTextsList) {
        for (const [language, namespaces] of Object.entries(moduleTexts)) {
            combined[language] ??= {};
            for (const [namespace, keys] of Object.entries(namespaces)) {
                const currentKeys = combined[language][namespace] ?? {};
                const repeatedKey = Object.keys(keys).find((key) => Object.hasOwn(currentKeys, key));
                if (repeatedKey) {
                    throw new Error(`Dos módulos definen el texto «${namespace}:${repeatedKey}» en «${language}»`);
                }
                combined[language][namespace] = {...currentKeys, ...keys};
            }
        }
    }

    return combined;
}
