// Las piezas de Calcita se cambian desde el tema del proyecto como las de MUI: theme.components.Calcita<Pieza> con
// defaultProps y styleOverrides de cada una de sus partes (root, title, card…). Lo del proyecto va DESPUÉS del estilo de
// Calcita y le gana; los números se leen como en MUI (borderRadius: 4 son 4 px).
//
// Cómo se arma una parte con nombre: piecePart(nombre, parte, componente) da el componente (Box, Paper, Typography…) con su
// lugar en el tema, y el estilo de Calcita le llega en `ownSx` (lo mismo que antes iba en `sx`, con su forma de sx: objeto,
// lista o función del tema). Va en la base de la parte, ANTES de lo que ponga el proyecto. OJO: si quedara en `sx`, MUI lo
// aplicaría al final y el tema del proyecto ya no le podría ganar.
//
//   const CardRoot = piecePart('CalcitaMetricCard', 'Root', Paper);
//   <CardRoot variant="outlined" ownSx={{p: 2, borderRadius: 3}}>…</CardRoot>
//
// Y sus props por omisión: const {label, value} = usePieceProps(props, 'CalcitaMetricCard').
//
// SLOTS, como en MUI: cada parte con nombre también se puede cambiar por otro componente (`slots`) o recibir props de más
// (`slotProps`), con el nombre de la parte en minúscula, el mismo de styleOverrides. Desde la pantalla o desde el tema
// (defaultProps), sin pedirle nada a Calcita:
//
//   <RecordCard slots={{avatar: MiAvatar}} slotProps={{title: {component: 'h2'}}} … />
//   components: {CalcitaRecordCard: {defaultProps: {slotProps: {root: {elevation: 2}}}}}
//
// Una parte propia recibe su contenido y lo demás que le pasa Calcita, pero no su estilo (ownSx) ni, si la parte es un Stack,
// su acomodo (spacing, direction): eso lo pone ella.
//
// Cada pieza se exporta envuelta con withPieceSlots(Contenido, nombre): la envoltura lee slots y slotProps y se los da a
// sus partes por contexto (de cada pieza el suyo: una pieza dentro de otra no se los roba).
//
// Funciones genéricas del paquete: function (regla de la casa).
import {createContext, createElement, useContext} from 'react';
import Stack from '@mui/material/Stack';
import {styled, useThemeProps} from '@mui/material/styles';

// lo que la parte usa y no se le pasa al componente de adentro (ni al HTML)
const PIECE_ONLY_PROPS = new Set(['ownSx', 'ownerState', 'theme', 'as']);
// el acomodo que Calcita le pone a una parte que es un Stack (la separación, la dirección): solo Stack lo entiende. Una parte
// propia (slots) no lo recibe, igual que no recibe el estilo de Calcita: un Box o un div lo pintaba como atributo del HTML y
// React avisaba en la consola. Lo que la pantalla pase en slotProps sí le llega.
const STACK_LAYOUT_PROPS = Object.freeze(['spacing', 'direction', 'useFlexGap', 'divider']);
// lo que la pieza recibe para sus partes: no le llega al contenido (no son props suyas)
const SLOT_PROP_NAMES = Object.freeze(['slots', 'slotProps']);

// pieza → {slots, slotProps} de la que se está pintando (y de las de afuera)
const PieceSlotsContext = createContext(null);

/** El nombre de la parte como va en el tema y en slots: 'Root' → 'root', 'ItemIcon' → 'itemIcon'. */
function partKeyOf(slot) {
    return `${slot.charAt(0).toLowerCase()}${slot.slice(1)}`;
}

/**
 * El sx de la pantalla como lista, para ponerlo DESPUÉS del de la pieza sin mezclarlo dentro del mismo objeto.
 *
 * OJO, trampa pagada: `{...estiloDeLaPieza, ...sx}` reemplaza la llave entera cuando las dos traen la misma
 * ('& .MuiDataGrid-cell': la pieza ponía display flex y la pantalla solo quería alinear arriba: se perdía el flex sin
 * avisar). En una lista, MUI aplica cada elemento encima del anterior y se combinan regla por regla.
 *
 *   sx={[{p: 2}, ...sxListOf(sx)]}
 *
 * @param {object|Function|Array<object|Function|boolean|null|undefined>|null|undefined} sx
 * @returns {Array<object|Function|boolean|null|undefined>}
 */
export function sxListOf(sx) {
    if (sx === undefined || sx === null) {
        return [];
    }
    return Array.isArray(sx) ? sx : [sx];
}

/**
 * Las props de una parte con las de slotProps encima: las de la pantalla ganan, menos className (se suman), style (se
 * juntan) y sx (va después y se combina regla por regla).
 *
 * @param {object} partProps las que le pone Calcita
 * @param {object|((partProps: object) => object)|undefined} extra las de slotProps (o una función que las da)
 * @returns {object}
 */
export function mergedSlotProps(partProps, extra) {
    const extraProps = typeof extra === 'function' ? extra(partProps) : extra;
    if (!extraProps) {
        return partProps;
    }
    const className = [partProps.className, extraProps.className].filter(Boolean).join(' ') || undefined;
    const merged = {...partProps, ...extraProps, className};
    if (partProps.style || extraProps.style) {
        merged.style = {...partProps.style, ...extraProps.style};
    }
    if (partProps.sx !== undefined || extraProps.sx !== undefined) {
        merged.sx = [...sxListOf(partProps.sx), ...sxListOf(extraProps.sx)];
    }
    return merged;
}

/** Las props de una parte sin el acomodo que solo entiende Stack (STACK_LAYOUT_PROPS). */
function withoutStackLayout(partProps) {
    return Object.fromEntries(Object.entries(partProps).filter(([propName]) => !STACK_LAYOUT_PROPS.includes(propName)));
}

/**
 * Un componente con su lugar en el tema: theme.components[name].styleOverrides[parte con minúscula] se aplica después
 * del estilo de Calcita (ownSx) y gana. La parte también se puede cambiar o recibir props de más con slots y slotProps
 * de su pieza.
 *
 * @template {import('react').ElementType} C
 * @param {string} name el nombre de la pieza en el tema (CalcitaMetricCard)
 * @param {string} slot la parte, con mayúscula: Root, Title, Card…
 * @param {C} [component] lo que se pinta (por omisión un div)
 * @returns {import('react').ComponentType<any>}
 */
export function piecePart(name, slot, component = 'div') {
    const StyledPart = styled(component, {name, slot, shouldForwardProp: (prop) => !PIECE_ONLY_PROPS.has(prop)})(
        ({theme, ownSx}) => (ownSx ? theme.unstable_sx(ownSx) : {}),
    );
    const partKey = partKeyOf(slot);
    const isStackPart = component === Stack;

    // React 19: ref llega como una prop más y se pasa tal cual
    function PiecePart(props) {
        const pieceSlots = useContext(PieceSlotsContext)?.[name];
        if (!pieceSlots) {
            return createElement(StyledPart, props);
        }
        const extraProps = pieceSlots.slotProps?.[partKey];
        const Replacement = pieceSlots.slots?.[partKey];
        if (!Replacement) {
            return createElement(StyledPart, mergedSlotProps(props, extraProps));
        }
        // el componente de la pantalla no sabe de los estilos ni del acomodo de Calcita: le llega lo demás, y encima lo que
        // la pantalla le dé en slotProps
        const {ownSx: unusedOwnSx, ownerState: unusedOwnerState, ...calcitaProps} = props;
        return createElement(Replacement, mergedSlotProps(isStackPart ? withoutStackLayout(calcitaProps) : calcitaProps, extraProps));
    }
    PiecePart.displayName = `${name}${slot}`;
    return PiecePart;
}

/**
 * Los props de la pieza con los defaultProps del tema del proyecto debajo: lo que llega en la pantalla gana. Sin slots ni
 * slotProps: esos son de sus partes (withPieceSlots).
 *
 * OJO: una pieza cuyo `slotProps` ya es de otra cosa (TextInput se lo pasa al TextField de MUI: input, htmlInput…) lo
 * conserva con {ownSlotProps: true} y no se envuelve con withPieceSlots.
 *
 * @template {object} P
 * @param {P} props
 * @param {string} name el nombre de la pieza en el tema
 * @param {{ownSlotProps?: boolean}} [options]
 * @returns {P}
 */
export function usePieceProps(props, name, {ownSlotProps = false} = {}) {
    const themedProps = useThemeProps({props, name});
    if (ownSlotProps || !SLOT_PROP_NAMES.some((propName) => propName in themedProps)) {
        return themedProps;
    }
    const {slots: unusedSlots, slotProps: unusedSlotProps, ...pieceProps} = themedProps;
    return pieceProps;
}

/**
 * La pieza con slots y slotProps: lee los de la pantalla (y los de defaultProps del tema) y se los da a sus partes.
 *
 * OJO con el tipo: se toma del componente entero (Parameters) y no de un genérico de sus props: con las props opcionales
 * (ColorSchemeToggle) TypeScript las deducía como `object` y se perdían.
 *
 * Una parte que también se exporta sola y se pinta DENTRO de su pieza madre con el mismo nombre (las tarjetas de
 * TableCardsView dentro de ServerTable, las dos CalcitaServerTable) va con {sharedWithParent: true}: adentro usa los slots
 * de la madre (sin eso los borraría con los suyos, vacíos), salvo que la pantalla le dé los suyos; sola, los suyos.
 *
 * @template {(props: any) => any} C
 * @param {C} Content la pieza
 * @param {string} name el nombre de la pieza en el tema
 * @param {{sharedWithParent?: boolean}} [options]
 * @returns {(props: NonNullable<Parameters<C>[0]> & {slots?: Record<string, import('react').ElementType>, slotProps?: Record<string, object|((partProps: object) => object)>}) => ReturnType<C>}
 */
export function withPieceSlots(Content, name, {sharedWithParent = false} = {}) {
    function PieceWithSlots(props) {
        const {slots, slotProps} = useThemeProps({props, name});
        const outerSlots = useContext(PieceSlotsContext);
        // slots y slotProps son de las partes, no de la pieza: no le llegan (una pieza que avisa de props que no conoce
        // los tomaría por un error de la pantalla)
        const {slots: unusedSlots, slotProps: unusedSlotProps, ...contentProps} = props;
        // dentro de su madre con el mismo nombre se queda con los de ella, salvo que la pantalla le dé los suyos
        const usesParentSlots = sharedWithParent && Boolean(outerSlots?.[name]) && !props.slots && !props.slotProps;
        // sin slots ni slotProps (lo de casi siempre) no se agrega nada: la pieza se pinta igual que antes
        if (usesParentSlots || (!slots && !slotProps && !outerSlots?.[name])) {
            return createElement(Content, contentProps);
        }
        // la de adentro con el mismo nombre (una tarjeta dentro de otra) no hereda los de afuera
        const value = {...outerSlots, [name]: {slots, slotProps}};
        return createElement(PieceSlotsContext.Provider, {value}, createElement(Content, contentProps));
    }
    PieceWithSlots.displayName = (Content.displayName ?? Content.name ?? name).replace(/Content$/, '');
    return PieceWithSlots;
}
