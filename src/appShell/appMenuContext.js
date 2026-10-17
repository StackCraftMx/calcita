// El menú de la app al alcance de las páginas: AppLayout lo pone y PageHeading lo lee para armar sus migas solas (Inicio ›
// Sección › Pantalla) sin que cada página las escriba. Fuera de AppLayout el menú está vacío y no hay migas automáticas.
//
// Hook genérico del paquete: function (regla de la casa).
import {createContext, useContext} from 'react';

export const AppMenuContext = createContext({menuItems: []});

/**
 * @returns {{menuItems: object[]}} lo que AppLayout recibió de composeMenu
 */
export function useAppMenu() {
    return useContext(AppMenuContext);
}
