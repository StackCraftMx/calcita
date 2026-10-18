// Junta los textos de cada módulo en el objeto `texts` que recibe ToolkitProvider: {es: {namespace: {...}}, en: {...}}.
//
// Cada módulo trae sus archivos de textos (*Texts.js) con su namespace. Aquí se juntan por idioma y por namespace; dos
// archivos con el mismo namespace suman sus llaves, y si repiten una llave truena: un texto pisado en silencio saldría en
// la pantalla equivocada.
//
// Funciones puras, sin React: function (regla de la casa).

/**
 * @param {Array<Record<string, Record<string, object>>>} textFiles los textos de cada archivo, por idioma
 * @returns {Record<string, Record<string, object>>} todos los textos, por idioma y namespace
 */
export function combineTexts(textFiles) {
    const combined = {};

    for (const fileTexts of textFiles) {
        for (const [language, namespaces] of Object.entries(fileTexts)) {
            combined[language] ??= {};
            for (const [namespace, keys] of Object.entries(namespaces)) {
                const currentKeys = combined[language][namespace] ?? {};
                const repeatedKey = Object.keys(keys).find((key) => Object.hasOwn(currentKeys, key));
                if (repeatedKey) {
                    throw new Error(`Dos archivos definen el texto «${namespace}:${repeatedKey}» en «${language}»`);
                }
                combined[language][namespace] = {...currentKeys, ...keys};
            }
        }
    }

    return combined;
}
