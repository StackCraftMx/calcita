// Encabezado con orden y filtro.
//
// El que ordena es el TÍTULO, no un botón aparte: es el gesto que ya tiene aprendido quien usa tablas. La flecha solo
// aparece cuando la columna está ordenando, y su × quita ese orden sin tener que ciclar hasta el tercer clic.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSortableFilterHeader con defaultProps y
// styleOverrides de sus partes: title, root, sortButton, sortIndicator, clearButton.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import HeaderFilterPopover from '@/DataTable/ColumnFilters/HeaderFilterPopover.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaSortableFilterHeader)
const THEME_NAME = 'CalcitaSortableFilterHeader';
const SortableTitle = piecePart(THEME_NAME, 'Title', Typography);
const SortableRoot = piecePart(THEME_NAME, 'Root', Stack);
const SortableSortButton = piecePart(THEME_NAME, 'SortButton', ButtonBase);
const SortableSortIndicator = piecePart(THEME_NAME, 'SortIndicator', Box);
const SortableClearButton = piecePart(THEME_NAME, 'ClearButton', ButtonBase);

/**
 * @param {object} props
 * @param {string} props.label
 * @param {boolean} [props.sortable]
 * @param {{column: string, direction: 'asc'|'desc'}} [props.sortEntry]
 * @param {() => void} [props.onSort]
 * @param {() => void} [props.onClearSort]
 * @param {boolean} [props.filterable]
 * @param {number} [props.activeCount]
 * @param {() => void} [props.onClear]
 * @param {import('react').ReactNode} [props.children] el filtro de la columna
 */
export default function SortableFilterHeader(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSortableFilterHeader.defaultProps) y encima lo que llega aquí
    const {
    label, sortable = true, sortEntry, onSort, onClearSort, filterable = true, activeCount, onClear, children,
} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('table');
    const title = <SortableTitle variant="caption" ownSx={{fontWeight: 700, whiteSpace: 'nowrap'}}>{label}</SortableTitle>;

    return (
        <SortableRoot direction="row" spacing={0.25} ownSx={{alignItems: 'center'}}>
            {sortable ? (
                <Tooltip title={t('sort.tooltip')}>
                    <SortableSortButton onClick={onSort} ownSx={{gap: 0.25, borderRadius: 0.5}}>
                        {title}
                        {sortEntry && (
                            <SortableSortIndicator component="span" ownSx={{display: 'inline-flex', alignItems: 'center', color: 'primary.main', fontWeight: 700}}
                                 aria-label={sortEntry.direction === 'asc' ? t('sort.ascending') : t('sort.descending')}>
                                {sortEntry.direction === 'asc' ? '↑' : '↓'}
                            </SortableSortIndicator>
                        )}
                    </SortableSortButton>
                </Tooltip>
            ) : title}

            {sortEntry && onClearSort && (
                <Tooltip title={t('sort.clear')}>
                    <SortableClearButton aria-label={t('sort.clear')}
                                // sin opacidad: la × es un control y al 70% daba 2.90:1 sobre el encabezado de la tabla
                                ownSx={{fontSize: 12, lineHeight: 1, color: 'primary.main', '&:hover': {color: 'primary.dark'}}}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onClearSort();
                                }}>
                        ×
                    </SortableClearButton>
                </Tooltip>
            )}

            {filterable && (
                <HeaderFilterPopover activeCount={activeCount} onClear={onClear}>{children}</HeaderFilterPopover>
            )}
        </SortableRoot>
    );
}
