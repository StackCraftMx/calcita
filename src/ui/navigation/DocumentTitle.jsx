// Título de la pestaña: "<pantalla> | <aplicación>", con el nombre de la aplicación del proveedor (appName de
// ToolkitProvider); sin nombre, solo la pantalla. React 19 sube <title> al <head> solo; no hace falta react-helmet.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {{title: string}} props texto ya traducido
 */
export default function DocumentTitle({title, ...unknownProps}) {
    warnUnknownProps('DocumentTitle', unknownProps);
    const {appName} = useToolkitSettings();

    return <title>{appName ? `${title} | ${appName}` : title}</title>;
}
