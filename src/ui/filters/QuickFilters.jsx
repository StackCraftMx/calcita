// Accesos rápidos: una tira de chips donde se elige UNO (p. ej. el estatus de un pedido).
//
// Es el complemento de FilterChips, no lo mismo:
//   - FilterChips dice qué filtros están PUESTOS y sirve para quitarlos;
//   - esto dice qué opciones HAY y sirve para saltar entre ellas de un toque.
//
// El conteo de cada chip sale de las facetas del servidor, contadas sobre el conjunto COMPLETO y sin este filtro
// puesto: al elegir una, las demás siguen diciendo cuántas tienen.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaQuickFilters con defaultProps y
// styleOverrides de sus partes: root, caption, chip, chipLabel, chipCount.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useRef} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import {alpha} from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import ScrollableRow from '@/ui/layout/ScrollableRow.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaQuickFilters)
const THEME_NAME = 'CalcitaQuickFilters';
const QuickRoot = piecePart(THEME_NAME, 'Root', Box);
const QuickCaption = piecePart(THEME_NAME, 'Caption', Typography);
const QuickChip = piecePart(THEME_NAME, 'Chip', Chip);
const QuickChipLabel = piecePart(THEME_NAME, 'ChipLabel', Box);
const QuickChipCount = piecePart(THEME_NAME, 'ChipCount', Box);


// qué tan marcado va el velo del contador del filtro elegido
const ACTIVE_COUNT_VEIL_OPACITY = 0.18;

/**
 * El velo del contador del filtro elegido: el color del texto base (negro en claro, blanco en oscuro) casi transparente.
 * Un tema con variables CSS trae ese color en theme.vars; el tema por omisión de MUI, en su modo.
 *
 * @param {object} theme tema de MUI
 * @returns {string} color CSS
 */
function activeCountVeilOf(theme) {
    if (theme.vars) {
        return `rgba(${theme.vars.palette.common.onBackgroundChannel} / ${ACTIVE_COUNT_VEIL_OPACITY})`;
    }
    const baseTextColor = theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black;

    return alpha(baseTextColor, ACTIVE_COUNT_VEIL_OPACITY);
}

/** "99+" arriba de 99 y "1.2k" arriba de 999: el chip no se estira. */
function compactCount(count) {
    if (count > 999) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    if (count > 99) {
        return '99+';
    }
    return String(count);
}

/**
 * @param {object} props
 * @param {string} props.value opción activa ('' = todas)
 * @param {(value: string) => void} props.onChange
 * @param {Array<{value: string, label: import('react').ReactNode, count?: number}>} [props.options]
 * @param {import('react').ReactNode} [props.caption]
 * @param {string} [props.ariaLabel]
 * @param {import('react').ReactNode} [props.extra] al final de la tira (p. ej. un rango de fechas)
 * @param {object} [props.texts] los textos que cambian, con la forma de `table` en los textos del paquete
 */
export default function QuickFilters(props) {
    // lo que el proyecto puso en su tema (components.CalcitaQuickFilters.defaultProps) y encima lo que llega aquí
    const {value, onChange, options = [], caption, ariaLabel, extra, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('table', texts);
    const activeChip = useRef(null);
    const isFirstRender = useRef(true);

    // al cambiar la selección desde fuera (alguien limpió los filtros) el chip activo se trae a la vista; en el primer
    // render sin animación: una tira que se mueve sola al abrir la pantalla se siente rota
    useEffect(() => {
        if (!activeChip.current) {
            return;
        }
        const behavior = isFirstRender.current ? 'instant' : 'smooth';
        isFirstRender.current = false;
        activeChip.current.scrollIntoView({behavior, block: 'nearest', inline: 'center'});
    }, [value]);

    // guard clause: con una sola opción no hay entre qué saltar
    if (options.length <= 1) {
        return null;
    }

    return (
        <QuickRoot ownSx={{mb: 1}}>
            {caption && (
                <QuickCaption variant="caption" color="text.secondary" ownSx={{px: 0.25}}>{caption}</QuickCaption>
            )}
            <ScrollableRow role="tablist" aria-label={ariaLabel}>
                {options.map((option) => {
                    const isActive = option.value === value;
                    return (
                        <QuickChip
                            key={option.value || '__all__'}
                            ref={isActive ? activeChip : null}
                            role="tab"
                            aria-selected={isActive}
                            clickable
                            onClick={() => onChange(isActive ? '' : option.value)}
                            // el elegido trae su ×: "volver a Todas" no se descubre solo
                            onDelete={isActive && option.value ? () => onChange('') : undefined}
                            variant={isActive ? 'filled' : 'outlined'}
                            color={isActive ? 'primary' : 'default'}
                            label={(
                                <QuickChipLabel component="span" ownSx={{display: 'inline-flex', alignItems: 'center', gap: 0.75}}>
                                    <span>{option.label}</span>
                                    {option.count !== null && option.count !== undefined && (
                                        <QuickChipCount component="span"
                                             aria-label={t('quickFilters.countAriaLabel', {count: option.count})}
                                             // velo del color del texto base (negro en claro, blanco en oscuro) y no rgba fijo
                                             ownSx={(theme) => ({
                                                 px: 0.75, borderRadius: '6px', fontSize: 11, fontWeight: 700, minWidth: 18,
                                                 textAlign: 'center', color: 'inherit',
                                                 bgcolor: isActive ? activeCountVeilOf(theme) : 'action.selected',
                                             })}>
                                            {compactCount(option.count)}
                                        </QuickChipCount>
                                    )}
                                </QuickChipLabel>
                            )}
                            ownSx={{flex: '0 0 auto', height: 32}}
                        />
                    );
                })}
                {extra}
            </ScrollableRow>
        </QuickRoot>
    );
}
