// El esqueleto de una tabla mientras llegan sus renglones: la tira del encabezado y los renglones con sus columnas, la
// primera más ancha (el nombre o el folio). Para una tabla que NO es ServerTable: esa ya trae su propia espera (una barra
// delgada arriba con renglones ya pintados y renglones grises con la tabla vacía).
//
// Para esperar información, no acciones (ver DefinitionListSkeleton). Sin texto a la vista; para el lector de pantalla,
// «Cargando». Los anchos cambian de renglón a renglón para que parezca texto.
//
// Se cambia desde el tema del proyecto: components.CalcitaTableSkeleton con defaultProps y styleOverrides de su parte root.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaTableSkeleton)
const THEME_NAME = 'CalcitaTableSkeleton';
const TableSkeletonRoot = piecePart(THEME_NAME, 'Root', Stack);

const DEFAULT_ROWS = 6;
const DEFAULT_COLUMNS = 4;
// el alto de la tira del encabezado (px): el de una tabla de MUI
const HEADER_HEIGHT = 40;
// qué tanto de su columna llena cada barra (por ciento), que se va repitiendo para que no salgan todas iguales
const CELL_FILL_PERCENTS = Object.freeze([85, 60, 75, 50, 90, 65, 70]);

/**
 * @param {object} props
 * @param {number} [props.rows] cuántos renglones; por omisión 6
 * @param {number} [props.columns] cuántas columnas; por omisión 4 (la primera, el doble de ancha)
 * @param {import('@mui/material').SxProps} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function TableSkeletonContent(props) {
    const {rows = DEFAULT_ROWS, columns = DEFAULT_COLUMNS, sx, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);

    return (
        <TableSkeletonRoot role="status" aria-label={t('skeleton.loading')} sx={sx} ownSx={{gap: 1.25, py: 1}}>
            <Skeleton variant="rounded" height={HEADER_HEIGHT} />
            {Array.from({length: rows}, (unused, row) => (
                <Box key={row} sx={{display: 'flex', gap: 2}}>
                    {Array.from({length: columns}, (unusedColumn, column) => (
                        <Typography key={column} component="div" variant="body2" sx={{flex: column === 0 ? 2 : 1, minWidth: 0}}>
                            <Skeleton width={`${CELL_FILL_PERCENTS[(row + column) % CELL_FILL_PERCENTS.length]}%`} />
                        </Typography>
                    ))}
                </Box>
            ))}
        </TableSkeletonRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const TableSkeleton = withPieceSlots(TableSkeletonContent, THEME_NAME);
export default TableSkeleton;
