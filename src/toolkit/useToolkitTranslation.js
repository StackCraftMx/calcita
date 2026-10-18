// Los textos del paquete dentro de un componente, con la misma forma que useTranslation de react-i18next:
//
//   const {t, language, changeLanguage} = useToolkitTranslation('table');
//   t('goToPage.of', {count: pageCount, total})
//
// Se vuelve a pintar cuando cambia el idioma o los textos del proveedor. El orden en que se buscan los textos está en
// toolkitSettings.js; antes que todos van los textos propios del componente (su prop `texts`, el segundo parámetro) y los de
// ComponentTexts de afuera: un texto de una pantalla se cambia ahí, sin tocar el idioma completo.
//
//   const {t} = useToolkitTranslation('table', texts);
//
// Hook genérico: function (regla de la casa).
import {useCallback, useContext} from 'react';
import {ComponentTextsContext, layersOf} from '@/toolkit/componentTextsContext.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {componentTextOf, translateWith} from '@/toolkit/toolkitSettings.js';

const NAMESPACE_SEPARATOR = ':';

/**
 * @param {string|string[]} [namespace] el namespace de las llaves sin prefijo; con una lista, el primero. Sin él, cada
 *     llave lleva el suyo ('orders:list.title')
 * @param {object} [ownTexts] los textos propios del componente (su prop `texts`), con la forma de ese namespace
 * @returns {{t: (key: string, values?: object) => string, language: string, changeLanguage: (language: string) => void}}
 */
export function useToolkitTranslation(namespace, ownTexts) {
    const settings = useToolkitSettings();
    const outerTexts = useContext(ComponentTextsContext);
    const defaultNamespace = Array.isArray(namespace) ? namespace[0] : namespace;
    const t = useCallback((key, values) => {
        const [keyNamespace, plainKey] = key.includes(NAMESPACE_SEPARATOR) ? key.split(NAMESPACE_SEPARATOR, 2) : [defaultNamespace, key];
        const layers = [{namespace: defaultNamespace, texts: ownTexts}, ...layersOf(outerTexts)];
        return componentTextOf(layers, keyNamespace, plainKey, values, settings.language)
            ?? translateWith(settings, defaultNamespace, key, values);
    }, [settings, defaultNamespace, ownTexts, outerTexts]);
    // sin onLanguageChange del proyecto no hay a quién avisarle: el botón de idioma no hace nada
    const changeLanguage = useCallback((language) => settings.onLanguageChange?.(language), [settings]);

    return {t, language: settings.language, changeLanguage};
}
