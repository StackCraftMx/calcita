// El contexto de ToolkitProvider y los hooks que lo leen. Vive aparte del proveedor (que es .jsx) para que los hooks se
// importen desde archivos .js sin arrastrar JSX.
//
// Hooks genéricos: function (regla de la casa).
import {createContext, useContext} from 'react';
import {allowOnlyUnrestricted} from '@/access/accessRules.js';
import {browserNavigation} from '@/toolkit/browserNavigation.js';
import {toolkitSettings} from '@/toolkit/toolkitSettings.js';

export const ToolkitContext = createContext(null);

/**
 * La configuración del proveedor; sin proveedor, la vigente con la navegación del navegador.
 *
 * @returns {{language: string, onLanguageChange: Function|null, texts: object, translate: Function|null, timeZone: string, currency: string, appName: string, buildId: string, navigation: object, canAccess: Function}}
 */
export function useToolkitSettings() {
    const settings = useContext(ToolkitContext);

    return settings ?? {...toolkitSettings(), onLanguageChange: null, navigation: browserNavigation, canAccess: allowOnlyUnrestricted};
}

/**
 * La navegación que conectó el proyecto: {useNavigate, useLocation, Link}.
 *
 * @returns {{useNavigate: Function, useLocation: Function, Link: import('react').ElementType}}
 */
export function useToolkitNavigation() {
    return useToolkitSettings().navigation;
}
