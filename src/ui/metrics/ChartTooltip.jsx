// El tooltip de las gráficas de Recharts con el look de la app. Se exporta para las gráficas propias del proyecto con
// recharts (una de pastel, una de área): <Tooltip content={<ChartTooltip render={(row) => …} />} />.
//
// El de Recharts trae su propio estilo (fondo blanco, borde gris); este usa el Paper del tema y habla igual que los
// tooltips del resto de la app (y se voltea solo cuando llegue el modo oscuro). Con el vidrio del tema
// (createToolkitTheme({glass: true})) es de vidrio: flota sobre la gráfica.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaChartTooltip con defaultProps y
// styleOverrides de sus partes: root.
//
// Genérico del paquete: function (regla de la casa).
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import {glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaChartTooltip)
const THEME_NAME = 'CalcitaChartTooltip';
const TooltipRoot = piecePart(THEME_NAME, 'Root', Paper);

// el vidrio del cuadrito, casi opaco (el material «grueso»): es para leer una cifra encima de la gráfica; con el vidrio de
// los controles (60 %) se veía la barra de atrás a través del texto (lo reportaron)
const CHART_TOOLTIP_OPACITY = 0.92;

/**
 * @param {{active?: boolean, payload?: Array<{payload: any}>, render: (item: any) => import('react').ReactNode}} props
 *     active y payload los pone recharts; render recibe el renglón de data del punto o la columna
 */
export default function ChartTooltip(props) {
    // lo que el proyecto puso en su tema (components.CalcitaChartTooltip.defaultProps) y encima lo que llega aquí
    // OJO: sin aviso de opciones desconocidas (warnUnknownProps) a propósito: recharts le pasa al globo todas las suyas
    // (offset, wrapperStyle, coordinate…) y el aviso salía con unas veinte opciones que el globo no necesita
    const {active, payload, render} = usePieceProps(props, THEME_NAME);
    // guard clause: Recharts lo monta siempre; solo se pinta sobre una barra
    if (!active || !payload?.length) {
        return null;
    }
    return (
        <TooltipRoot elevation={3} ownSx={[{px: 1.5, py: 1, pointerEvents: 'none'}, (theme) => (isGlassTheme(theme) ? glassStylesOf(theme, {opacity: CHART_TOOLTIP_OPACITY}) : {})]}>
            {/* div: el globo puede llevar varios renglones (una serie por renglón) */}
            <Typography variant="body2" component="div">{render(payload[0].payload)}</Typography>
        </TooltipRoot>
    );
}
