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
// Funciones genéricas del paquete: function (regla de la casa).
import {styled, useThemeProps} from '@mui/material/styles';

// lo que la parte usa y no se le pasa al componente de adentro (ni al HTML)
const PIECE_ONLY_PROPS = new Set(['ownSx', 'ownerState', 'theme', 'as']);

/**
 * Un componente con su lugar en el tema: theme.components[name].styleOverrides[parte con minúscula] se aplica después
 * del estilo de Calcita (ownSx) y gana.
 *
 * @template {import('react').ElementType} C
 * @param {string} name el nombre de la pieza en el tema (CalcitaMetricCard)
 * @param {string} slot la parte, con mayúscula: Root, Title, Card…
 * @param {C} [component] lo que se pinta (por omisión un div)
 * @returns {import('react').ComponentType<any>}
 */
export function piecePart(name, slot, component = 'div') {
    return styled(component, {name, slot, shouldForwardProp: (prop) => !PIECE_ONLY_PROPS.has(prop)})(
        ({theme, ownSx}) => (ownSx ? theme.unstable_sx(ownSx) : {}),
    );
}

/**
 * Los props de la pieza con los defaultProps del tema del proyecto debajo: lo que llega en la pantalla gana.
 *
 * @template {object} P
 * @param {P} props
 * @param {string} name el nombre de la pieza en el tema
 * @returns {P}
 */
export function usePieceProps(props, name) {
    return useThemeProps({props, name});
}
