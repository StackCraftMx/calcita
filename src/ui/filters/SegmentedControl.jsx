// Pestañas en píldora: una tira de botones donde se elige UNO (el producto de una lista, la vista de un
// tablero). Va en un renglón que se desliza en el teléfono, como las pestañas de una app móvil.
//
// SEGMENTED_CONTROL_SX es el estilo de la tira; se exporta para quien arma su propia tira con menús adentro (una barra
// de productos con menús).
//
// Con el vidrio del tema es el control segmentado de Liquid Glass: la tira sin borde y lo elegido en la «gota» (la misma
// de las pestañas y de los botones de opción), no en un relleno de color. Con el naranja fijo le ganaba al vidrio, no se
// parecía a las pestañas de al lado y en oscuro quedaba con letra negra.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSegmentedControl con styleOverrides.root
// (la tira y, adentro, sus opciones: '& .MuiToggleButton-root') y defaultProps.
//
// Genérico del paquete: function (regla de la casa).
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {styled, useThemeProps} from '@mui/material/styles';

import {glassDropOf, isGlassTheme} from '@/theme/glassSurface.js';
import {textSizeOf} from '@/theme/appleTracking.js';
import ScrollableRow from '@/ui/layout/ScrollableRow.jsx';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// con vidrio, el alto de cada opción: con el margen de la tira (3 px arriba y abajo) da los 40 px de un campo
// el aire de la fila para la sombra, en unidades de spacing (4 px)
const ROW_SHADOW_ROOM = 0.5;
const GLASS_SEGMENT_MIN_HEIGHT_PIXELS = 34;

export const SEGMENTED_CONTROL_SX = {
    gap: 0.5,
    p: 0.375,
    border: 1,
    borderColor: 'divider',
    borderRadius: 999,
    flexWrap: 'nowrap',
    flex: '0 0 auto',
    '& .MuiToggleButton-root': {
        border: 0, borderRadius: '999px', m: 0, px: 1.75, py: 0.375,
        ...textSizeOf(13), fontWeight: 600, textTransform: 'none', color: 'text.secondary', whiteSpace: 'nowrap',
    },
    // la píldora de cada opción. OJO: con dos clases; el grupo de MUI quita las esquinas y junta los botones de en medio con
    // reglas de dos clases (& .MuiToggleButtonGroup-middleButton). Antes se le ganaba con !important, y así el tema del
    // proyecto tampoco podía cambiar la forma
    '& .MuiToggleButton-root.MuiToggleButtonGroup-grouped': {border: 0, borderRadius: '999px', m: 0},
    '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {
        bgcolor: 'primary.main', color: 'primary.contrastText',
    },
};

/**
 * Lo que cambia con vidrio: sin borde (la tira ya se marca sola) y lo elegido en su gota.
 *
 * @param {object} theme
 * @returns {object}
 */
function glassSegmentedSxOf(theme) {
    // con el minimalista: la tira gris y lo elegido un escalón arriba, como el de Apple (los pone el tema); sin el naranja lleno
    if (theme.toolkit?.look === 'minimal') {
        return {
            border: 0,
            '& .MuiToggleButton-root': {minHeight: GLASS_SEGMENT_MIN_HEIGHT_PIXELS},
            '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {
                bgcolor: 'background.paper', color: 'text.primary', ...theme.applyStyles('dark', {bgcolor: 'rgba(118, 118, 128, 0.36)'}),
            },
        };
    }
    if (!isGlassTheme(theme)) {
        return {};
    }
    return {
        border: 0,
        // del mismo alto que un campo (40 px con su margen de 3 px arriba y abajo): en una fila de filtros junto a «Desde» y
        // «Hasta» quedaba más bajito y descuadrado (lo reportaron)
        '& .MuiToggleButton-root': {minHeight: GLASS_SEGMENT_MIN_HEIGHT_PIXELS},
        '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {...glassDropOf(theme), color: 'text.primary'},
    };
}

// el nombre de la pieza en el tema (theme.components.CalcitaSegmentedControl)
const THEME_NAME = 'CalcitaSegmentedControl';

// la tira con su estilo y el de vidrio o minimalista; el tema del proyecto (styleOverrides.root) va después y le gana
const SegmentedControlRoot = styled(ToggleButtonGroup, {name: THEME_NAME, slot: 'Root'})(({theme}) => (
    theme.unstable_sx([SEGMENTED_CONTROL_SX, glassSegmentedSxOf(theme)])
));

/**
 * @param {object} props
 * @param {Array<{value: string, label: string, disabled?: boolean}>} props.options en el orden en que se pintan; ya
 *     traducidas
 * @param {string|null} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} props.ariaLabel ya traducido
 */
export default function SegmentedControl(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSegmentedControl.defaultProps) y encima lo que llega aquí
    const {options, value, onChange, ariaLabel, ...unknownProps} = useThemeProps({props, name: THEME_NAME});
    warnUnknownProps(THEME_NAME, unknownProps);
    return (
        // la fila deja 4 px arriba y abajo para que la sombra no se corte (ScrollableRow, py 0.5); el margen negativo los
        // devuelve: el control mide sus 40 px y se alinea con los campos de junto (quedaba 4 px más arriba)
        <ScrollableRow gap={1} py={ROW_SHADOW_ROOM} sx={{alignItems: 'center', my: -ROW_SHADOW_ROOM}}>
            <SegmentedControlRoot exclusive size="small" value={value} aria-label={ariaLabel}
                               // quitar la selección no existe: un clic en la pestaña elegida no la apaga
                               onChange={(event, nextValue) => nextValue !== null && onChange(nextValue)}>
                {options.map((option) => (
                    <ToggleButton key={option.value} value={option.value} disabled={option.disabled}>{option.label}</ToggleButton>
                ))}
            </SegmentedControlRoot>
        </ScrollableRow>
    );
}
