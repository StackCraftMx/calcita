// Lista de dato → valor (<dl>).
//
// Dos acomodos:
//   columns (por omisión)  el dato en gris a la izquierda y su valor a la derecha; para tarjetas anchas
//   stacked                el dato chico arriba de su valor; para columnas angostas, donde un nombre largo
//                          («Codificación del archivo») se partiría en dos renglones al lado de su valor
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaDefinitionList con defaultProps y
// styleOverrides de sus partes: root, entry, label, value.
//
// Genérico del paquete: function (regla de la casa). Los textos llegan ya traducidos y el valor puede ser cualquier nodo (un
// chip, un texto en monoespaciada...).
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaDefinitionList)
const THEME_NAME = 'CalcitaDefinitionList';
const DefinitionRoot = piecePart(THEME_NAME, 'Root', Box);
const DefinitionEntry = piecePart(THEME_NAME, 'Entry', Box);
const DefinitionLabel = piecePart(THEME_NAME, 'Label', Typography);
const DefinitionValue = piecePart(THEME_NAME, 'Value', Typography);

/**
 * @param {object} props
 * @param {Array<{label: string, value: import('react').ReactNode}>} props.entries en el orden en que se pintan; el label es la
 *     llave
 * @param {'columns'|'stacked'} [props.layout]
 * @param {number} [props.labelWidth] ancho en px de la columna del dato (solo columns)
 */
export default function DefinitionList(props) {
    // lo que el proyecto puso en su tema (components.CalcitaDefinitionList.defaultProps) y encima lo que llega aquí
    const {entries, layout = 'columns', labelWidth = 150} = usePieceProps(props, THEME_NAME);
    const isStacked = layout === 'stacked';

    return (
        <DefinitionRoot component="dl" ownSx={{
            m: 0, display: 'grid',
            gridTemplateColumns: isStacked ? 'minmax(0, 1fr)' : `${labelWidth}px minmax(0, 1fr)`,
            columnGap: 2, rowGap: isStacked ? 0.25 : 1,
        }}>
            {entries.map(({label, value}, entryPosition) => (
                <DefinitionEntry key={label} ownSx={{display: 'contents'}}>
                    <DefinitionLabel component="dt" variant={isStacked ? 'caption' : 'body2'} color="text.secondary"
                                ownSx={isStacked && entryPosition > 0 ? {mt: 1.25} : undefined}>
                        {label}
                    </DefinitionLabel>
                    <DefinitionValue component="dd" variant="body2" ownSx={{m: 0, overflowWrap: 'anywhere'}}>{value}</DefinitionValue>
                </DefinitionEntry>
            ))}
        </DefinitionRoot>
    );
}
