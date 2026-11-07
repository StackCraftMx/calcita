// El esqueleto de DefinitionList mientras llegan los datos de una ficha: la misma rejilla (el dato a la izquierda y su valor
// a la derecha, o uno arriba del otro), así nada brinca cuando aparecen los de verdad.
//
// Cuándo sí y cuándo no: el esqueleto es para ESPERAR información (abrir una ficha, cambiar de pestaña). Una acción en
// curso (guardar, enviar, subir) conserva su rueda: ahí el dato ya existe y lo que corre es el guardado; una forma gris
// diría «esto todavía no llega», que no es cierto.
//
// Sin texto a la vista (la forma gris se entiende en cualquier idioma); para el lector de pantalla dice «Cargando», ya
// traducido. Los anchos cambian de renglón a renglón a propósito: una columna de barras del mismo largo se lee como una
// tabla rara, y variándolos se parece a texto de verdad.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaDefinitionListSkeleton con defaultProps
// y styleOverrides de su parte root.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaDefinitionListSkeleton)
const THEME_NAME = 'CalcitaDefinitionListSkeleton';
const DefinitionSkeletonRoot = piecePart(THEME_NAME, 'Root', Box);

// cuántos renglones si nadie dice: los que llenan lo que se ve sin inventar una ficha larguísima que luego se encoge
const DEFAULT_ROWS = 6;
// los anchos del dato y de su valor, que se van repitiendo: distintos entre renglones para que parezca texto
const LABEL_WIDTHS = Object.freeze(['70%', '55%', '82%', '60%', '75%', '50%']);
const VALUE_WIDTHS = Object.freeze(['62%', '48%', '70%', '55%', '66%', '44%']);

/**
 * @param {object} props
 * @param {number} [props.rows] cuántos renglones; por omisión 6
 * @param {'columns'|'stacked'} [props.layout] el mismo de DefinitionList
 * @param {number} [props.labelWidth] el mismo de DefinitionList (px, solo columns)
 * @param {import('@mui/material').SxProps} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function DefinitionListSkeletonContent(props) {
    const {rows = DEFAULT_ROWS, layout = 'columns', labelWidth = 150, sx, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const isStacked = layout === 'stacked';

    return (
        <DefinitionSkeletonRoot role="status" aria-label={t('skeleton.loading')} sx={sx}
                                ownSx={{
                                    display: 'grid', columnGap: 2, rowGap: isStacked ? 0.25 : 1,
                                    gridTemplateColumns: isStacked ? 'minmax(0, 1fr)' : `${labelWidth}px minmax(0, 1fr)`,
                                }}>
            {Array.from({length: rows}, (unused, position) => (
                <Box key={position} sx={{display: 'contents'}}>
                    {/* dentro de su Typography: la barra mide lo mismo que el renglón de texto que va a llegar */}
                    <Typography component="div" variant={isStacked ? 'caption' : 'body2'} sx={isStacked && position > 0 ? {mt: 1.25} : undefined}>
                        <Skeleton width={LABEL_WIDTHS[position % LABEL_WIDTHS.length]} />
                    </Typography>
                    <Typography component="div" variant="body2">
                        <Skeleton width={VALUE_WIDTHS[position % VALUE_WIDTHS.length]} />
                    </Typography>
                </Box>
            ))}
        </DefinitionSkeletonRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const DefinitionListSkeleton = withPieceSlots(DefinitionListSkeletonContent, THEME_NAME);
export default DefinitionListSkeleton;
