// Las acciones de UNA pantalla en una cápsula, como las barras de herramientas de Apple: la pantalla las pone en su código
// donde quiera y el marco decide dónde se ven.
//
//   - Escritorio con la barra en cápsulas (TOP_BAR.capsules): suben a la barra, cada <BarActions> en su cápsula. Dos grupos
//     que no van juntos (buscar; exportar y agregar) son dos <BarActions>, como Apple separa los grupos. Si en una ventana
//     angosta no caben (con su nombre, showLabel desktop, o con la letra «Muy grande»), las últimas van al «⋯» como en el
//     teléfono y en la barra de una ventana de la Mac: antes se metían debajo de la cuenta.
//   - Teléfono con cápsulas: las mismas cápsulas flotan arriba a la derecha y se quedan al bajar, como los botones de iOS 26
//     (en el teléfono no hay barra de arriba: la de pestañas va abajo). Se ven todas las que caben, solo con ícono; las que
//     ya no caben a lo ancho van a un menú «⋯» con su nombre (useFittingActionCount mide el renglón de verdad). Así una
//     pantalla con muchas acciones arriba no rompe el teléfono.
//   - Escritorio con la franja: entran a la franja como botones (con el color de la franja); lo que no cabe, al «⋯».
//   - Sin lugar (sin AppLayout, la barra fundida al menú, o el teléfono sin cápsulas): se quedan donde la pantalla las puso,
//     también en una cápsula de solo íconos. PageHeading ya las usa para sus `actions`.
//
// Se extiende sin tocar el framework: cualquier contenido adentro (lo normal es BarActionButton, que se acomoda solo), varias
// por pantalla con su `order`, estilos propios con `sx` (la cápsula de arriba o la flotante) e `inlineSx` (la que se queda en
// la pantalla), y `bare` cuando lo de adentro ya es una cápsula (el buscador de la tabla). Para una cápsula fuera de todo
// esto: BarCapsule.
//
// Cuántos se ven lo decide la medición; la pantalla puede ponerle un tope aparte para el teléfono y para escritorio
// (`maxVisible={{phone: 3, desktop: 5}}`), contando el «⋯» como el tope de la barra de pestañas cuenta «Más»: con tope 3 y
// cinco acciones se ven dos y el «⋯»; con justo tres, las tres. El tope nunca enseña de más: si no caben, la medición
// sigue mandando al «⋯». Vale también cuando se quedan en la pantalla; con `bare` no hay «⋯» y no aplica.
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
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaBarActions): el grupo sin cápsula (bare, o en la
// franja); con cápsula, la cápsula es CalcitaBarCapsule
const THEME_NAME = 'CalcitaBarActions';
const ActionsGroup = piecePart(THEME_NAME, 'Group', Box);

// la marca de un grupo exclusivo (BarActions exclusive) y la regla que, mientras exista, esconde a los demás grupos del
// renglón flotante del teléfono (data-phone-bar-actions lo pone AppLayout)
const EXCLUSIVE_ATTRIBUTE = 'data-bar-exclusive';
const HIDE_NOT_EXCLUSIVE_STYLES = {[`[data-phone-bar-actions] > :not([${EXCLUSIVE_ATTRIBUTE}])`]: {display: 'none !important'}};

// las llaves de maxVisible: un tope para el teléfono y otro para escritorio
const MAX_VISIBLE_KEYS = Object.freeze(['phone', 'desktop']);
// lo menos que puede pedir un tope: 1 (con más de una acción, solo el «⋯»)
const MIN_MAX_VISIBLE = 1;

/** Un tope que no existe (un 0, un «movil» mal escrito) se dice al arrancar, no se ignora callado. */
const checkMaxVisible = (maxVisible) => {
    if (maxVisible === undefined) {
        return;
    }
    if (maxVisible === null || typeof maxVisible !== 'object' || Array.isArray(maxVisible)) {
        throw new TypeError(`BarActions: maxVisible es {phone, desktop}, un tope para cada uno (llegó ${JSON.stringify(maxVisible)}).`);
    }
    Object.entries(maxVisible).forEach(([key, limit]) => {
        if (!MAX_VISIBLE_KEYS.includes(key)) {
            throw new RangeError(`BarActions: maxVisible solo lleva ${MAX_VISIBLE_KEYS.join(' y ')} (llegó «${key}»).`);
        }
        if (limit !== undefined && (!Number.isInteger(limit) || limit < MIN_MAX_VISIBLE)) {
            throw new RangeError(`BarActions: maxVisible.${key} es un entero de ${MIN_MAX_VISIBLE} o más, contando el «⋯» (llegó ${limit}).`);
        }
    });
};

/**
 * Lo más que pueden verse con el tope, contando el «⋯»: si todas caben en el tope, todas; si no, una menos, que es el
 * lugar del «⋯». Sin tope, todas (luego la medición dice cuántas caben).
 */
const visibleLimitOf = (actionCount, maxVisible) => {
    if (maxVisible === undefined || actionCount <= maxVisible) {
        return actionCount;
    }
    return maxVisible - 1;
};

/** Lo de adentro sabe que quedó en una cápsula (BarActionButton se vuelve solo ícono). */
const InCapsule = ({children}) => (
    <BarActionsPlacementContext.Provider value={BAR_ACTIONS_PLACEMENT.capsule}>{children}</BarActionsPlacementContext.Provider>
);

/** El «⋯» con las acciones que no caben en su renglón, como renglones de menú con su nombre. */
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

/**
 * Un grupo en su renglón (el que flota en el teléfono o el de la barra de escritorio): las acciones que caben y, si sobran,
 * el «⋯» con las demás. Container es lo que las envuelve: la cápsula (BarCapsule) o, en la franja, el grupo sin cápsula.
 * Sin slot (se quedan en la pantalla) no se mide: se ven todas, o las del tope.
 */
const FittingActions = ({Container, slot, maxVisible, texts, children, ...containerProps}) => {
    const {t} = useToolkitTranslation('layout', texts);
    const [containerElement, setContainerElement] = useState(null);
    const actions = Children.toArray(children);
    const visibleCount = useFittingActionCount(slot, containerElement, visibleLimitOf(actions.length, maxVisible));
    const hiddenActions = actions.slice(visibleCount);
    return (
        <Container ref={setContainerElement} {...containerProps}>
            <InCapsule>{actions.slice(0, visibleCount)}</InCapsule>
            {hiddenActions.length > 0 && <MoreActionsMenu label={t('barActions.more')}>{hiddenActions}</MoreActionsMenu>}
        </Container>
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
 * @param {{phone?: number, desktop?: number}} [props.maxVisible] lo más que se ven, contando el «⋯» (1 o más): uno para el
 *     teléfono y otro para escritorio; el que falte, sin tope. Si no caben, se ven menos. En el tema
 *     (components.CalcitaBarActions.defaultProps.maxVisible) vale para todas las pantallas; el de la pantalla lo reemplaza entero
 * @param {object} [props.texts] los textos que cambian, con la forma de `layout` en los textos del paquete
 */
function BarActionsContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaBarActions.defaultProps) y encima lo que llega aquí
    const {
        children, label, order, sx, inlineSx, bare = false, exclusive = false, maxVisible, texts, ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    checkMaxVisible(maxVisible);
    const {slot, phoneSlot, usesCapsules} = useBarActionsSlot();
    const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
    // en escritorio, la barra; en el teléfono, el renglón flotante (solo existe con cápsulas)
    const target = isDesktop ? slot : phoneSlot;
    // el tope de este aparato (la franja solo existe en escritorio)
    const deviceMaxVisible = isDesktop ? maxVisible?.desktop : maxVisible?.phone;
    const orderSx = order === undefined ? {} : {order};
    const extraSx = Array.isArray(sx) ? sx : [sx];
    const extraInlineSx = Array.isArray(inlineSx) ? inlineSx : [inlineSx];

    // sin lugar: donde la pantalla las puso, en su cápsula de íconos (todas, o las del tope y el «⋯»)
    if (!target) {
        if (bare) {
            return <ActionsGroup role="group" aria-label={label} ownSx={{display: 'flex', alignItems: 'center'}} sx={extraInlineSx}>{children}</ActionsGroup>;
        }
        return (
            <FittingActions Container={BarCapsule} slot={null} maxVisible={deviceMaxVisible} texts={texts} aria-label={label}
                            sx={[{alignSelf: 'flex-start'}, ...extraInlineSx]}>
                {children}
            </FittingActions>
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
                {createPortal(
                    <FittingActions Container={BarCapsule} slot={phoneSlot} maxVisible={deviceMaxVisible} texts={texts} aria-label={label}
                                    sx={[orderSx, ...extraSx]} {...exclusiveProps}>
                        {children}
                    </FittingActions>,
                    target,
                )}
            </>
        );
    }
    // arriba en la barra (o el buscador flotando en el teléfono): las que caben y el «⋯»
    if (usesCapsules && !bare) {
        return createPortal(
            <FittingActions Container={BarCapsule} slot={target} maxVisible={deviceMaxVisible} texts={texts} aria-label={label} sx={[orderSx, ...extraSx]}>
                {children}
            </FittingActions>,
            target,
        );
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
    // principal no se vería); las que no caben, al «⋯»
    return createPortal(
        <FittingActions Container={ActionsGroup} slot={target} maxVisible={deviceMaxVisible} texts={texts} role="group" aria-label={label}
                        ownSx={[{display: 'flex', alignItems: 'center', gap: 0.5, ...monochromeButtonsSxOf('inherit')}, orderSx]} sx={extraSx}>
            {children}
        </FittingActions>,
        target,
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const BarActions = withPieceSlots(BarActionsContent, THEME_NAME);
export default BarActions;
