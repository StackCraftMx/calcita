// Las acciones de lo elegido en una lista («5 pedidos elegidos · Cancelar · Borrar · Quitar selección»), en el lugar que le
// toca según el equipo. Una sola pieza para que cada lista con casillas (la tabla de servidor, una propia) no repita dónde
// va cada cosa:
//   - escritorio, y el teléfono sin barra de pestañas abajo (el tema de MUI sin vidrio): un renglón donde se pone la pieza,
//     cada acción como botón con su texto;
//   - teléfono con vidrio, o minimalista con cápsulas (usesMobileTabBar), según phoneLayout (SELECTION_PHONE_LAYOUT):
//       top (por omisión): arriba, en la barra flotante, «5 elegidos ✕» y las acciones como íconos en su propia cápsula,
//         como Apple separa los grupos; las que no caben, al «⋯» (BarActions);
//       en los dos, mientras hay algo elegido, el renglón de arriba queda solo para lo elegido (BarActions exclusive): las
//         demás cápsulas de la pantalla y la lupa se esconden, como el modo de edición del iPhone;
//       split: como iOS en modo de edición (Fotos, Mail, Archivos): arriba «5 elegidos ✕» y abajo, encima de las pestañas,
//         una cápsula fija con las acciones, donde llega el pulgar. Mientras se ve, pide su alto al marco
//         (FLOATING_BOTTOM_SPACE_CSS_VARIABLE) para no tapar el final de la página.
// Lo pidió el autor: en el teléfono, configurable, y por omisión todo arriba.
//
// Con vidrio, la cápsula de arriba deja sus botones del color del texto (BarCapsule: la regla de la barra); abajo, una acción
// destructiva (color: 'error') conserva su rojo, como pide la guía de Apple para lo que borra.
//
// Cada acción puede regresar una promesa: mientras corre, las demás se apagan (nadie cancela dos veces lo mismo).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSelectionActions con defaultProps y
// styleOverrides de sus partes: bar, count, clear, phoneCount, phoneActions.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import GlobalStyles from '@mui/material/GlobalStyles';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import BarActionButton from '@/appShell/BarActionButton.jsx';
import BarActions from '@/appShell/BarActions.jsx';
import BarCapsule from '@/appShell/BarCapsule.jsx';
import {
    FLOATING_BOTTOM_SPACE_CSS_VARIABLE, GLASS_PANEL_GAP_PIXELS, PHONE_MEDIA_QUERY, aboveMobileTabBarOf,
} from '@/appShell/shellSizes.js';
import {usesMobileTabBar} from '@/appShell/tabBarRule.js';
import {minimalFloatingStylesOf} from '@/theme/components/minimalComponents.js';
import {glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaSelectionActions)
const THEME_NAME = 'CalcitaSelectionActions';
const SelectionBar = piecePart(THEME_NAME, 'Bar', Stack);
const SelectionCount = piecePart(THEME_NAME, 'Count', Typography);
const SelectionClear = piecePart(THEME_NAME, 'Clear', Button);
const SelectionPhoneCount = piecePart(THEME_NAME, 'PhoneCount', Typography);
const SelectionPhoneActions = piecePart(THEME_NAME, 'PhoneActions', Box);

/** Dónde van las acciones de lo elegido en el teléfono con barra de pestañas abajo: todo arriba o divididas (iOS). */
export const SELECTION_PHONE_LAYOUT = Object.freeze({top: 'top', split: 'split'});

// lo que se separa la cápsula de abajo de la barra de pestañas (px), lo mismo que el aviso de versión nueva
const FLOATING_GAP_PIXELS = 8;
// lo que pide al marco mientras flota abajo: su alto (48) y su separación, con aire
const FLOATING_BOTTOM_SPACE_PIXELS = 64;
// lo que solo se ve en el teléfono
const PHONE_ONLY_SX = {display: 'none', [PHONE_MEDIA_QUERY]: {display: 'flex'}};

/**
 * ¿En el teléfono lo elegido sale de su renglón (arriba o abajo)? La misma regla que la barra de pestañas de abajo: con ella,
 * el renglón de la pantalla se queda con lo suyo (el conteo de la tabla) y las acciones flotan.
 *
 * @param {object} theme
 * @returns {boolean}
 */
export function selectionFloatsOnPhone(theme) {
    return usesMobileTabBar(theme);
}

/**
 * La cápsula fija abajo, centrada en la ventana, encima de la barra de pestañas.
 *
 * @param {object} theme
 * @returns {object}
 */
function bottomCapsuleSxOf(theme) {
    return {
        ...(isGlassTheme(theme) ? glassStylesOf(theme) : minimalFloatingStylesOf(theme)),
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: theme.zIndex.appBar,
        alignItems: 'center',
        gap: 0.5,
        width: 'max-content',
        maxWidth: `calc(100% - ${GLASS_PANEL_GAP_PIXELS * 2}px)`,
        borderRadius: '999px',
        p: 0.5,
        ...aboveMobileTabBarOf(FLOATING_GAP_PIXELS),
    };
}

/**
 * @param {object} props
 * @param {string} props.countText «5 pedidos elegidos», ya traducido. La pieza se pinta mientras la pantalla la ponga: con
 *     nada elegido, no la ponga
 * @param {Array<{key: string, label: string, icon?: import('react').ReactNode, color?: 'inherit'|'primary'|'secondary'|'error'|'info'|'success'|'warning', disabled?: boolean, onClick: () => unknown}>} [props.actions]
 *     label ya traducido; en el teléfono se ve el ícono (sin él, el texto). onClick puede regresar una promesa
 * @param {() => void} props.onClear quitar la selección
 * @param {'top'|'split'} [props.phoneLayout] SELECTION_PHONE_LAYOUT; por omisión todo arriba
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`: {selection: {clear, actionsLabel, summaryLabel}}
 * @param {object} [props.sx] estilos del renglón
 */
export default function SelectionActions(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSelectionActions.defaultProps) y encima lo que llega aquí
    const {countText, actions = [], onClear, phoneLayout = SELECTION_PHONE_LAYOUT.top, texts, sx} = usePieceProps(props, THEME_NAME);
    const theme = useTheme();
    const {t} = useToolkitTranslation('common', texts);
    const [runningActionKey, setRunningActionKey] = useState(null);
    const floatsOnPhone = selectionFloatsOnPhone(theme);
    const extraSx = Array.isArray(sx) ? sx : [sx];

    const runAction = async (action) => {
        setRunningActionKey(action.key);
        try {
            await action.onClick();
        } finally {
            setRunningActionKey(null);
        }
    };
    const isDisabledOf = (action) => runningActionKey !== null || Boolean(action.disabled);

    const clearButton = (
        <Tooltip title={t('selection.clear')}>
            <IconButton aria-label={t('selection.clear')} onClick={onClear}>
                <CloseRoundedIcon />
            </IconButton>
        </Tooltip>
    );

    // el renglón: escritorio siempre; en el teléfono, solo si ahí no flota
    const row = (
        <SelectionBar role="toolbar" aria-label={t('selection.actionsLabel')} direction="row" spacing={1} useFlexGap
               ownSx={[{flexGrow: 1, alignItems: 'center', flexWrap: 'wrap', minHeight: 32},
                   floatsOnPhone && {[PHONE_MEDIA_QUERY]: {display: 'none'}}, ...extraSx]}>
            <SelectionCount variant="body2" ownSx={{fontWeight: 600, mr: 1}}>{countText}</SelectionCount>
            {actions.map((action) => (
                <Button key={action.key} size="small" color={action.color ?? 'primary'} startIcon={action.icon}
                        disabled={isDisabledOf(action)} onClick={() => runAction(action)}>
                    {action.label}
                </Button>
            ))}
            <SelectionClear size="small" color="inherit" startIcon={<CloseRoundedIcon />} onClick={onClear} ownSx={{ml: 'auto'}}>
                {t('selection.clear')}
            </SelectionClear>
        </SelectionBar>
    );

    if (!floatsOnPhone) {
        return row;
    }

    const showsBottomCapsule = phoneLayout === SELECTION_PHONE_LAYOUT.split && actions.length > 0;

    return (
        <>
            {row}
            {/* arriba: con las demás cápsulas flotantes de la pantalla (BarActions), antes que ellas. Sin label en BarActions:
                el nombre ya lo lleva la cápsula (dos grupos anidados con el mismo nombre se leen dos veces) */}
            <BarActions bare exclusive order={-2} sx={PHONE_ONLY_SX} inlineSx={PHONE_ONLY_SX}>
                <BarCapsule aria-label={t('selection.summaryLabel')} sx={{pl: 2}}>
                    <SelectionPhoneCount variant="body2" role="status" aria-live="polite" ownSx={{fontWeight: 600, whiteSpace: 'nowrap', mr: 0.5}}>
                        {countText}
                    </SelectionPhoneCount>
                    {clearButton}
                </BarCapsule>
            </BarActions>
            {phoneLayout === SELECTION_PHONE_LAYOUT.top && actions.length > 0 && (
                <BarActions label={t('selection.actionsLabel')} exclusive order={-1} sx={PHONE_ONLY_SX} inlineSx={PHONE_ONLY_SX}>
                    {actions.map((action) => (
                        <BarActionButton key={action.key} label={action.label} icon={action.icon} color={action.color}
                                         disabled={isDisabledOf(action)} onClick={() => runAction(action)} />
                    ))}
                </BarActions>
            )}
            {showsBottomCapsule && (
                <>
                    <GlobalStyles styles={{':root': {[FLOATING_BOTTOM_SPACE_CSS_VARIABLE]: `${FLOATING_BOTTOM_SPACE_PIXELS}px`}}} />
                    <SelectionPhoneActions role="toolbar" aria-label={t('selection.actionsLabel')} ownSx={[bottomCapsuleSxOf, PHONE_ONLY_SX]}>
                        {actions.map((action) => (action.icon ? (
                            <Tooltip key={action.key} title={action.label}>
                                {/* el span deja ver el tooltip aunque el botón esté apagado */}
                                <span>
                                    <IconButton aria-label={action.label} color={action.color ?? 'default'} disabled={isDisabledOf(action)}
                                                onClick={() => runAction(action)}>
                                        {action.icon}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Button key={action.key} size="small" color={action.color ?? 'primary'} disabled={isDisabledOf(action)}
                                    onClick={() => runAction(action)}>
                                {action.label}
                            </Button>
                        )))}
                    </SelectionPhoneActions>
                </>
            )}
        </>
    );
}
