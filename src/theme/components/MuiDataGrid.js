// La tabla (MUI X Data Grid, la de ServerTable): bordes con el divisor del tema, encabezados con fondo y en negrita, el
// renglón bajo el cursor marcado y el contorno de foco del teclado en el color principal.
//
// OJO: walk-ot además escondía los íconos de ordenar y del menú de columna; aquí NO, porque ServerTable ordena con el
// encabezado y sin la flecha no se ve por qué columna está ordenada.
//
// Funciones puras, sin React: function (regla de la casa). No importa @mui/x-data-grid: es solo un nombre de llave.
import {paletteOf} from '@/theme/components/paletteOf.js';

export function MuiDataGrid() {
    return {
        MuiDataGrid: {
            styleOverrides: {
                root: ({theme}) => ({
                    '--DataGrid-rowBorderColor': paletteOf(theme).divider,
                    border: `1px solid ${paletteOf(theme).divider}`,
                }),
                columnHeaders: ({theme}) => ({backgroundColor: paletteOf(theme).action.hover}),
                columnHeader: ({theme}) => ({
                    fontWeight: 600,
                    color: paletteOf(theme).text.primary,
                    '&:focus, &:focus-within': {outline: `2px solid ${paletteOf(theme).primary.main}`, outlineOffset: -2},
                }),
                row: ({theme}) => ({
                    '&:hover': {backgroundColor: paletteOf(theme).action.hover},
                    '&.Mui-selected, &.Mui-selected:hover': {backgroundColor: paletteOf(theme).action.selected},
                }),
                cell: ({theme}) => ({
                    '&:focus, &:focus-within': {outline: `2px solid ${paletteOf(theme).primary.main}`, outlineOffset: -2},
                }),
            },
        },
    };
}
