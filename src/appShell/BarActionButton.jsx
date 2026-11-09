// Un botón de acción de la pantalla que se acomoda solo a donde quedó (lo pidió el autor, y es lo que pide la guía de Apple
// para las barras: «Prefer simple, recognizable symbols for items instead of text»):
//   - en una cápsula (arriba en la barra, flotando en el teléfono o en la franja): solo el ícono, con su nombre en el tooltip
//     y para el lector de pantalla. En el teléfono el tooltip sale al dejar el dedo encima, como en iOS. Con
//     showLabel={BAR_ACTION_LABEL.desktop}, en escritorio va ícono y nombre (sobra lugar y dos íconos solos se confunden) y
//     en el teléfono, solo el ícono. También desde el tema: components.CalcitaBarActionButton.defaultProps.showLabel;
//   - en el menú «⋯» (las que ya no caben en su renglón, en el teléfono o en la barra de escritorio): un renglón con ícono y texto;
//   - suelto (fuera de BarActions): ícono con texto, botón sin relleno.
// Lo demás va al botón (disabled, color, component y to para una liga…). Sin ícono, en la cápsula va su texto (un botón sin
// relleno) y en el «⋯» el renglón sin ícono: mejor un texto que un botón vacío.
// Desactivado en la barra: el color de los demás botones de la barra, tenue (BAR_DISABLED_OPACITY). Cada proyecto lo cambia
// con disabledSx, por botón o en el tema para todos.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaBarActionButton con defaultProps, styleOverrides de
// sus partes (button, iconButton, menuItem) y slots/slotProps para cambiarlas.
//
// Genérico del paquete: function (regla de la casa).
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';

import {BAR_ACTION_LABEL, BAR_ACTIONS_PLACEMENT, useBarActionsPlacement, useCloseBarActionsMenu} from '@/appShell/barActionsSlot.js';
import {PHONE_MEDIA_QUERY} from '@/appShell/shellSizes.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaBarActionButton)
const THEME_NAME = 'CalcitaBarActionButton';
const BarActionButtonButton = piecePart(THEME_NAME, 'Button', Button);
const BarActionButtonIconButton = piecePart(THEME_NAME, 'IconButton', IconButton);
const BarActionButtonMenuItem = piecePart(THEME_NAME, 'MenuItem', MenuItem);

// DESACTIVADO EN LA BARRA: el mismo color que los demás botones de la barra, a la mitad. OJO: MUI lo pinta con su gris pensado
// para un fondo claro (action.disabled), y los activos de la barra toman el color de la barra: sobre una franja oscura el
// desactivado casi desaparecía (gris oscuro sobre azul marino) y en el vidrio apenas se notaba. Con `inherit` toma el color de
// la cápsula o de la franja. Medido en Chrome contra 38 % (el de Material 3) y 60 %: con 38 el vidrio claro quedaba igual que
// antes y con 60 ya se confundía con uno activo.
const BAR_DISABLED_OPACITY = 0.5;
const BAR_DISABLED_SX = Object.freeze({'&.Mui-disabled': {color: 'inherit', opacity: BAR_DISABLED_OPACITY}});

/** El sx de la pantalla como lista (MUI acepta un objeto, una función o una lista), para ponerle algo antes. */
const sxListOf = (sx) => {
    if (Array.isArray(sx)) {
        return sx;
    }
    return sx ? [sx] : [];
};

/**
 * @param {object} props
 * @param {string} props.label el nombre de la acción, ya traducido: «Agregar sucursal»
 * @param {import('react').ReactNode} [props.icon] el ícono (<AddRoundedIcon />); sin él, se ve su texto
 * @param {(event: object) => void} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {'inherit'|'primary'|'secondary'|'success'|'error'|'info'|'warning'} [props.color] por omisión primary
 * @param {'auto'|'desktop'} [props.showLabel] en la cápsula de la barra: BAR_ACTION_LABEL.auto (por omisión, solo el ícono)
 *     o BAR_ACTION_LABEL.desktop (ícono y nombre en escritorio; en el teléfono, solo el ícono)
 * @param {object|Function} [props.disabledSx] cómo se ve cuando está desactivado, en la barra, en el «⋯» y suelto:
 *     {opacity: 0.6} o {color: 'text.secondary'}. En el tema (components.CalcitaBarActionButton.defaultProps.disabledSx) vale
 *     para todos los botones; de fábrica, en la barra, el color de los demás botones a la mitad
 * @param {object} [props.sx] ajustes del botón; lo demás que se le pase también llega al botón (o al renglón del «⋯»)
 */
function BarActionButtonContent(props) {
    const {
        label, icon, onClick, disabled, color = 'primary', showLabel = BAR_ACTION_LABEL.auto, disabledSx, sx, ...otherProps
    } = usePieceProps(props, THEME_NAME);
    // lo desactivado de la pantalla o del tema va antes del sx de la pantalla (que sigue ganando a todo)
    const buttonProps = {...otherProps, sx: [disabledSx ? {'&.Mui-disabled': disabledSx} : {}, ...sxListOf(sx)]};
    const placement = useBarActionsPlacement();
    const closeMenu = useCloseBarActionsMenu();
    // la misma regla con la que el marco decide si es teléfono (useMediaQuery acepta el «@media» de adelante)
    const isPhone = useMediaQuery(PHONE_MEDIA_QUERY);
    if (!Object.values(BAR_ACTION_LABEL).includes(showLabel)) {
        throw new RangeError(`BarActionButton: showLabel es ${Object.values(BAR_ACTION_LABEL).join(' o ')} (llegó ${showLabel}).`);
    }
    const isIconOnly = !(showLabel === BAR_ACTION_LABEL.desktop && !isPhone);

    if (placement === BAR_ACTIONS_PLACEMENT.menu) {
        // primero se cierra el menú: la acción puede abrir una ventana y el menú quedaba encima
        const pickFromMenu = (event) => {
            closeMenu();
            onClick?.(event);
        };
        return (
            <BarActionButtonMenuItem onClick={pickFromMenu} disabled={disabled} {...buttonProps}>
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
                <ListItemText inset={!icon}>{label}</ListItemText>
            </BarActionButtonMenuItem>
        );
    }
    if (placement === BAR_ACTIONS_PLACEMENT.capsule && icon && isIconOnly) {
        // OJO: el tooltip envuelve un span para que también salga con el botón deshabilitado (MUI no lo pinta sobre un
        // elemento deshabilitado)
        return (
            <Tooltip title={label}>
                <span>
                    <BarActionButtonIconButton aria-label={label} onClick={onClick} disabled={disabled} color={color} ownSx={BAR_DISABLED_SX} {...buttonProps}>
                        {icon}
                    </BarActionButtonIconButton>
                </span>
            </Tooltip>
        );
    }
    // en la barra con su nombre (o sin ícono): desactivado, del color de la barra; suelto, como cualquier botón de MUI
    const ownSx = placement === BAR_ACTIONS_PLACEMENT.capsule ? BAR_DISABLED_SX : undefined;
    return <BarActionButtonButton startIcon={icon} onClick={onClick} disabled={disabled} color={color} ownSx={ownSx} {...buttonProps}>{label}</BarActionButtonButton>;
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const BarActionButton = withPieceSlots(BarActionButtonContent, THEME_NAME);
export default BarActionButton;
