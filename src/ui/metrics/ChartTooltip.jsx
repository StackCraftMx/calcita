// El tooltip de las gráficas de Recharts con el look de la app.
//
// El de Recharts trae su propio estilo (fondo blanco, borde gris); este usa el Paper del tema y habla igual que los
// tooltips del resto de la app (y se voltea solo cuando llegue el modo oscuro). Con el vidrio del tema
// (createToolkitTheme({glass: true})) es de vidrio: flota sobre la gráfica.
//
// Genérico del paquete: function (regla de la casa).
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import {glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';

/**
 * @param {{active?: boolean, payload?: Array<{payload: object}>, render: (item: object) => import('react').ReactNode}} props
 */
// el vidrio del cuadrito, casi opaco (el material «grueso»): es para leer una cifra encima de la gráfica; con el vidrio de
// los controles (60 %) se veía la barra de atrás a través del texto (lo reportaron)
const CHART_TOOLTIP_OPACITY = 0.92;

export default function ChartTooltip({active, payload, render}) {
    // guard clause: Recharts lo monta siempre; solo se pinta sobre una barra
    if (!active || !payload?.length) {
        return null;
    }
    return (
        <Paper elevation={3} sx={[{px: 1.5, py: 1, pointerEvents: 'none'}, (theme) => (isGlassTheme(theme) ? glassStylesOf(theme, {opacity: CHART_TOOLTIP_OPACITY}) : {})]}>
            <Typography variant="body2">{render(payload[0].payload)}</Typography>
        </Paper>
    );
}
