// Encabezado con orden y filtro.
//
// El que ordena es el TÍTULO, no un botón aparte: es el gesto que ya tiene aprendido quien usa tablas. La flecha solo
// aparece cuando la columna está ordenando, y su × quita ese orden sin tener que ciclar hasta el tercer clic.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import HeaderFilterPopover from '@/DataTable/ColumnFilters/HeaderFilterPopover.jsx';

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
export default function SortableFilterHeader({
    label, sortable = true, sortEntry, onSort, onClearSort, filterable = true, activeCount, onClear, children,
}) {
    const {t} = useToolkitTranslation('table');
    const title = <Typography variant="caption" sx={{fontWeight: 700, whiteSpace: 'nowrap'}}>{label}</Typography>;

    return (
        <Stack direction="row" spacing={0.25} sx={{alignItems: 'center'}}>
            {sortable ? (
                <Tooltip title={t('sort.tooltip')}>
                    <ButtonBase onClick={onSort} sx={{gap: 0.25, borderRadius: 0.5}}>
                        {title}
                        {sortEntry && (
                            <Box component="span" sx={{display: 'inline-flex', alignItems: 'center', color: 'primary.main', fontWeight: 700}}
                                 aria-label={sortEntry.direction === 'asc' ? t('sort.ascending') : t('sort.descending')}>
                                {sortEntry.direction === 'asc' ? '↑' : '↓'}
                            </Box>
                        )}
                    </ButtonBase>
                </Tooltip>
            ) : title}

            {sortEntry && onClearSort && (
                <Tooltip title={t('sort.clear')}>
                    <ButtonBase aria-label={t('sort.clear')}
                                // sin opacidad: la × es un control y al 70% daba 2.90:1 sobre el encabezado de la tabla
                                sx={{fontSize: 12, lineHeight: 1, color: 'primary.main', '&:hover': {color: 'primary.dark'}}}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onClearSort();
                                }}>
                        ×
                    </ButtonBase>
                </Tooltip>
            )}

            {filterable && (
                <HeaderFilterPopover activeCount={activeCount} onClear={onClear}>{children}</HeaderFilterPopover>
            )}
        </Stack>
    );
}
