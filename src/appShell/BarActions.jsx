// Las acciones de UNA pantalla en una cápsula, como las barras de herramientas de Apple: la pantalla las pone en su código
// donde quiera y el marco decide dónde se ven.
//
//   - Escritorio con la barra en cápsulas (TOP_BAR.capsules): suben a la barra, cada <BarActions> en su cápsula. Dos grupos
//     que no van juntos (buscar; exportar y agregar) son dos <BarActions>, como Apple separa los grupos.
//   - Teléfono con cápsulas: las mismas cápsulas flotan arriba a la derecha y se quedan al bajar, como los botones de iOS 26
//     (en el teléfono no hay barra de arriba: la de pestañas va abajo). Se ven todas las que caben, solo con ícono; las que
//     ya no caben a lo ancho van a un menú «⋯» con su nombre (useFittingActionCount mide el renglón de verdad). Así una
//     pantalla con muchas acciones arriba no rompe el teléfono.
//   - Escritorio con la franja: entran a la franja como botones (con el color de la franja).
//   - Sin lugar (sin AppLayout, la barra fundida al menú, o el teléfono sin cápsulas): se quedan donde la pantalla las puso,
//     también en una cápsula de solo íconos. PageHeading ya las usa para sus `actions`.
//
// Se extiende sin tocar el framework: cualquier contenido adentro (lo normal es BarActionButton, que se acomoda solo), varias
// por pantalla con su `order`, estilos propios con `sx` (la cápsula de arriba o la flotante) e `inlineSx` (la que se queda en
// la pantalla), y `bare` cuando lo de adentro ya es una cápsula (el buscador de la tabla). Para una cápsula fuera de todo
// esto: BarCapsule.
//
// OJO: escritorio o teléfono se decide con useMediaQuery (el único lugar del marco): hay que mover los botones a otro lugar
// del árbol y eso no se puede solo con CSS sin pintarlos dos veces (con sus estados por duplicado). Con Next, el primer
// pintado los deja en el contenido y se mueven a su lugar al hidratar; con Vite no se nota.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaBarActions con defaultProps y
// styleOverrides.group (el grupo sin cápsula); la cápsula, con CalcitaBarCapsule. El sx y el inlineSx de la pantalla siguen
// ganando a todo.
//
// Genérico del paquete: function (regla de la casa).
import {Children, useState} from 'react';
import {createPortal} from 'react-dom';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

import BarCapsule, {monochromeButtonsSxOf} from '@/appShell/BarCapsule.jsx';
import {
    BAR_ACTIONS_PLACEMENT, BarActionsMenuCloseContext, BarActionsPlacementContext, useBarActionsSlot,
} from '@/appShell/barActionsSlot.js';
import {DESKTOP_MEDIA_QUERY} from '@/appShell/shellSizes.js';
import useFittingActionCount from '@/appShell/useFittingActionCount.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaBarActions): el grupo sin cápsula (bare, o en la
// franja); con cápsula, la cápsula es CalcitaBarCapsule
const THEME_NAME = 'CalcitaBarActions';
const ActionsGroup = piecePart(THEME_NAME, 'Group', Box);

// la marca de un grupo exclusivo (BarActions exclusive) y la regla que, mientras exista, esconde a los demás grupos del
// renglón flotante del teléfono (data-phone-bar-actions lo pone AppLayout)
const EXCLUSIVE_ATTRIBUTE = 'data-bar-exclusive';
const HIDE_NOT_EXCLUSIVE_STYLES = {[`[data-phone-bar-actions] > :not([${EXCLUSIVE_ATTRIBUTE}])`]: {display: 'none !important'}};

/** Lo de adentro sabe que quedó en una cápsula (BarActionButton se vuelve solo ícono). */
const InCapsule = ({children}) => (
    <BarActionsPlacementContext.Provider value={BAR_ACTIONS_PLACEMENT.capsule}>{children}</BarActionsPlacementContext.Provider>
);

/** El «⋯» del teléfono con las acciones que no caben, como renglones de menú con su nombre. */
const MoreActionsMenu = ({label, children}) => {
    const [anchorElement, setAnchorElement] = useState(null);
    const close = () => setAnchorElement(null);
    return (
        <>
            <Tooltip title={label}>
                <IconButton aria-label={label} aria-haspopup="menu" aria-expanded={Boolean(anchorElement)}
                            onClick={(event) => setAnchorElement(event.currentTarget)}>
                    <MoreHorizRoundedIcon />
                </IconButton>
            </Tooltip>
            {/* OJO keepMounted: una acción del «⋯» puede abrir algo suyo al picarla (DownloadMenu abre sus formatos y su
                confirmación); sin él, al cerrarse este menú se desmontaba con todo y lo que abrió */}
            <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={close} keepMounted
                  anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
                <BarActionsMenuCloseContext.Provider value={close}>
                    <BarActionsPlacementContext.Provider value={BAR_ACTIONS_PLACEMENT.menu}>{children}</BarActionsPlacementContext.Provider>
                </BarActionsMenuCloseContext.Provider>
            </Menu>
        </>
    );
};

/** La cápsula que flota en el teléfono: las que caben como ícono y, si sobran, el «⋯» con las demás. */
const PhoneFloatingCapsule = ({phoneSlot, label, sx, texts, children, ...rest}) => {
    const {t} = useToolkitTranslation('layout', texts);
    const [capsuleElement, setCapsuleElement] = useState(null);
    const actions = Children.toArray(children);
    const visibleCount = useFittingActionCount(phoneSlot, capsuleElement, actions.length);
    const hiddenActions = actions.slice(visibleCount);
    return (
        <BarCapsule ref={setCapsuleElement} aria-label={label} sx={sx} {...rest}>
            <InCapsule>{actions.slice(0, visibleCount)}</InCapsule>
            {hiddenActions.length > 0 && <MoreActionsMenu label={t('barActions.more')}>{hiddenActions}</MoreActionsMenu>}
        </BarCapsule>
    );
};

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children los botones de este grupo (normalmente BarActionButton)
 * @param {string} [props.label] el nombre del grupo (lector de pantalla): «Acciones de pedidos»
 * @param {number} [props.order] en qué lugar va entre los grupos de la pantalla (CSS order; por omisión el de aparición)
 * @param {object|Function|Array} [props.sx] estilos propios de la cápsula de arriba o de la flotante del teléfono (o del
 *     grupo, en la franja)
 * @param {object|Function|Array} [props.inlineSx] estilos de la cápsula cuando se queda en la pantalla
 * @param {boolean} [props.bare] sin cápsula alrededor: lo de adentro ya es una (un buscador)
 * @param {boolean} [props.exclusive] en el teléfono, mientras se ve, es lo único del renglón flotante (con los demás grupos
 *     exclusivos): los otros se esconden, como el modo de edición del iPhone deja solo lo de lo elegido. Lo usa SelectionActions
 * @param {object} [props.texts] los textos que cambian, con la forma de `layout` en los textos del paquete
 */
export default function BarActions(props) {
    // lo que el proyecto puso en su tema (components.CalcitaBarActions.defaultProps) y encima lo que llega aquí
    const {children, label, order, sx, inlineSx, bare = false, exclusive = false, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {slot, phoneSlot, usesCapsules} = useBarActionsSlot();
    const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
    // en escritorio, la barra; en el teléfono, el renglón flotante (solo existe con cápsulas)
    const target = isDesktop ? slot : phoneSlot;
    const orderSx = order === undefined ? {} : {order};
    const extraSx = Array.isArray(sx) ? sx : [sx];
    const extraInlineSx = Array.isArray(inlineSx) ? inlineSx : [inlineSx];

    // sin lugar: donde la pantalla las puso, en su cápsula de íconos
    if (!target) {
        if (bare) {
            return <ActionsGroup role="group" aria-label={label} ownSx={{display: 'flex', alignItems: 'center'}} sx={extraInlineSx}>{children}</ActionsGroup>;
        }
        return (
            <BarCapsule aria-label={label} sx={[{alignSelf: 'flex-start'}, ...extraInlineSx]}>
                <InCapsule>{children}</InCapsule>
            </BarCapsule>
        );
    }
    // exclusivo en el teléfono: se marca y esconde a los demás grupos del renglón mientras se ve. OJO: sin esto, con algo
    // elegido no cabían el conteo, sus acciones, la lupa y las de la pantalla, y el renglón se salía por los dos lados
    const exclusiveProps = !isDesktop && exclusive ? {[EXCLUSIVE_ATTRIBUTE]: ''} : {};
    const hideOthers = !isDesktop && exclusive && <GlobalStyles styles={HIDE_NOT_EXCLUSIVE_STYLES} />;
    // flotando en el teléfono: las que caben y el «⋯»
    if (!isDesktop && !bare) {
        return (
            <>
                {hideOthers}
                {createPortal(<PhoneFloatingCapsule phoneSlot={phoneSlot} label={label} sx={[orderSx, ...extraSx]} texts={texts} {...exclusiveProps}>{children}</PhoneFloatingCapsule>, target)}
            </>
        );
    }
    // arriba en la barra (o el buscador flotando en el teléfono)
    if (usesCapsules && !bare) {
        return createPortal(<BarCapsule aria-label={label} sx={[orderSx, ...extraSx]}><InCapsule>{children}</InCapsule></BarCapsule>, target);
    }
    if (usesCapsules) {
        return (
            <>
                {hideOthers}
                {createPortal(<ActionsGroup role="group" aria-label={label} ownSx={[{display: 'flex', alignItems: 'center'}, orderSx]} sx={extraSx} {...exclusiveProps}>{children}</ActionsGroup>, target)}
            </>
        );
    }
    // en la franja: botones sueltos (solo ícono) con el color de la franja (sobre el naranja de Stackcraft, el color
    // principal no se vería)
    return createPortal(
        <ActionsGroup role="group" aria-label={label}
                      ownSx={[{display: 'flex', alignItems: 'center', gap: 0.5, ...monochromeButtonsSxOf('inherit')}, orderSx]} sx={extraSx}>
            <InCapsule>{children}</InCapsule>
        </ActionsGroup>,
        target,
    );
}
