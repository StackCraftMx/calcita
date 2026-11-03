// Junta los textos de cada módulo en el objeto `texts` que recibe ToolkitProvider: {es: {namespace: {...}}, en: {...}}.
//
// Cada módulo trae su archivo de textos con sus namespaces (orders, customers...) y, si quiere, entradas de un namespace
// compartido (dictionaries, validation). Aquí se juntan por idioma y por namespace: dos módulos con el mismo namespace suman
// sus llaves, y si repiten una llave TRUENA: un texto pisado en silencio sale en la pantalla equivocada y nadie sabe de dónde
// vino. Los objetos de adentro también se suman (validation.fields de dos módulos), con la misma regla.
//
//   // src/app/appTexts.js — los archivos de textos se descubren solos (el glob tiene que ser un texto literal)
//   const files = import.meta.glob('@/modules/**/*Texts.js', {eager: true});
//   export const APP_TEXTS = combineTexts(Object.values(files).flatMap((file) => Object.values(file)));
//
// Funciones puras, sin React: function (regla de la casa). Pruebas en combineTexts.test.js.

/**
 * Suma las llaves de un namespace: los objetos se juntan por dentro; una llave con texto repetida truena.
 *
 * @param {object} current lo que ya hay
 * @param {object} added lo que trae otro módulo
 * @param {{language: string, namespace: string, path: string[]}} place dónde va, para decir dónde chocaron
 * @returns {object}
 */
function mergeKeys(current, added, place) {
    const merged = {...current};
    for (const [key, value] of Object.entries(added)) {
        const existing = merged[key];
        const bothObjects = existing && typeof existing === 'object' && value && typeof value === 'object';
        if (bothObjects) {
            merged[key] = mergeKeys(existing, value, {...place, path: [...place.path, key]});
            continue;
        }
        if (Object.hasOwn(merged, key)) {
            throw new Error(`Dos módulos definen el texto «${place.namespace}:${[...place.path, key].join('.')}» en «${place.language}»`);
        }
        merged[key] = value;
    }
    return merged;
}

/**
 * @param {Array<Record<string, Record<string, object>>>} textFiles los textos de cada módulo, por idioma
 * @returns {Record<string, Record<string, object>>} todos los textos, por idioma y namespace
 * @throws {Error} si dos módulos definen el mismo texto
 */
export function combineTexts(textFiles) {
    const combined = {};
    for (const moduleTexts of textFiles) {
        for (const [language, namespaces] of Object.entries(moduleTexts ?? {})) {
            combined[language] ??= {};
            for (const [namespace, keys] of Object.entries(namespaces)) {
                combined[language][namespace] = mergeKeys(combined[language][namespace] ?? {}, keys, {language, namespace, path: []});
            }
        }
    }
    return combined;
}
