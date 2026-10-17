// Los textos del paquete dentro de un componente, con la misma forma que useTranslation de react-i18next:
//
//   const {t, language, changeLanguage} = useToolkitTranslation('table');
//   t('goToPage.of', {count: pageCount, total})
//
// Se vuelve a pintar cuando cambia el idioma o los textos del proveedor. El orden en que se buscan los textos está en
// toolkitSettings.js.
//
// Hook genérico: function (regla de la casa).
import {useCallback} from 'react';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {translateWith} from '@/toolkit/toolkitSettings.js';

/**
 * @param {string|string[]} namespace el namespace de las llaves sin prefijo; con una lista, el primero
 * @returns {{t: (key: string, values?: object) => string, language: string, changeLanguage: (language: string) => void}}
 */
export function useToolkitTranslation(namespace) {
    const settings = useToolkitSettings();
    const defaultNamespace = Array.isArray(namespace) ? namespace[0] : namespace;
    const t = useCallback(
        (key, values) => translateWith(settings, defaultNamespace, key, values),
        [settings, defaultNamespace],
    );
    // sin onLanguageChange del proyecto no hay a quién avisarle: el botón de idioma no hace nada
    const changeLanguage = useCallback((language) => settings.onLanguageChange?.(language), [settings]);

    return {t, language: settings.language, changeLanguage};
}
