// Lista de dato → valor (<dl>).
//
// Dos acomodos:
//   columns (por omisión)  el dato en gris a la izquierda y su valor a la derecha; para tarjetas anchas
//   stacked                el dato chico arriba de su valor; para columnas angostas, donde un nombre largo
//                          («Codificación del archivo») se partiría en dos renglones al lado de su valor
//
// Genérico del paquete: function (regla de la casa). Los textos llegan ya traducidos y el valor puede ser cualquier nodo (un
// chip, un texto en monoespaciada...).
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * @param {object} props
 * @param {Array<{label: string, value: import('react').ReactNode}>} props.entries en el orden en que se pintan; el label es la
 *     llave
 * @param {'columns'|'stacked'} [props.layout]
 * @param {number} [props.labelWidth] ancho en px de la columna del dato (solo columns)
 */
export default function DefinitionList({entries, layout = 'columns', labelWidth = 150}) {
    const isStacked = layout === 'stacked';

    return (
        <Box component="dl" sx={{
            m: 0, display: 'grid',
            gridTemplateColumns: isStacked ? 'minmax(0, 1fr)' : `${labelWidth}px minmax(0, 1fr)`,
            columnGap: 2, rowGap: isStacked ? 0.25 : 1,
        }}>
            {entries.map(({label, value}, entryPosition) => (
                <Box key={label} sx={{display: 'contents'}}>
                    <Typography component="dt" variant={isStacked ? 'caption' : 'body2'} color="text.secondary"
                                sx={isStacked && entryPosition > 0 ? {mt: 1.25} : undefined}>
                        {label}
                    </Typography>
                    <Typography component="dd" variant="body2" sx={{m: 0, overflowWrap: 'anywhere'}}>{value}</Typography>
                </Box>
            ))}
        </Box>
    );
}
