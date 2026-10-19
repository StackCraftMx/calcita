// Botón de regreso por el ROUTER, no por un enlace fijo.
//
// navigate(-1) regresa a la entrada anterior del historial con sus parámetros intactos: los filtros, el orden, la
// pestaña y la página que nuqs dejó en la URL de la lista siguen ahí. Un enlace fijo a la lista los perdería.
//
// Si alguien llegó directo (pegó el enlace del detalle, abrió en pestaña nueva, recargó después de un login) no hay
// historial al que volver: se usa la última URL de la lista que se guardó en sessionStorage al salir de ella
// (useRememberListUrl) y, si tampoco hay, fallbackTo.
//
// El TEXTO dice a dónde regresa: si la página anterior anotó su nombre de regreso (usePageName de navigationTrail.js),
// se pinta ese («Regresar al detalle del pedido 15»); si no, o si no hay historial, el label que le pasen.
//
// Navega con la navegación del proveedor (ToolkitProvider), no con un router en particular.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {recallListUrl} from '@/lastListUrl.js';
import {currentHistoryIndex, pageNameAt} from '@/navigationTrail.js';

/**
 * @param {object} props
 * @param {string} props.fallbackTo ruta de la lista sin filtros (último respaldo)
 * @param {string} [props.listKey] la misma llave que usa useRememberListUrl en la lista
 * @param {string} [props.label] ya traducido; se usa cuando la página anterior no anotó su nombre o no hay historial
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function BackButton({fallbackTo, listKey, label, texts, ...buttonProps}) {
    const {t} = useToolkitTranslation('common', texts);
    const {useNavigate} = useToolkitNavigation();
    const navigate = useNavigate();

    // react-router guarda en history.state un índice: 0 = primera entrada de esta pestaña en la app. Otro router no lo
    // guarda: entonces se toma como si no hubiera historial y se regresa a la última lista o a fallbackTo
    const historyIndex = currentHistoryIndex();
    const hasHistory = historyIndex > 0;
    const previousPageName = hasHistory ? pageNameAt(historyIndex - 1) : null;

    const goBack = () => {
        if (hasHistory) {
            navigate(-1);
            return;
        }
        navigate((listKey && recallListUrl(listKey)) || fallbackTo);
    };

    return (
        <Button size="small" color="inherit" startIcon={<ArrowBackIcon />} onClick={goBack} {...buttonProps}>
            {previousPageName ? t(previousPageName.labelKey, previousPageName.params) : (label ?? t('actions.back'))}
        </Button>
    );
}
