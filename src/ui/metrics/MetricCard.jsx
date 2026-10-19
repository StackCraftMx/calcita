// Tarjeta de métrica: etiqueta en versalitas, número grande (h5 en seminegritas, con cifras del mismo ancho) y una nota abajo, con un borde superior de
// color según el tono (p. ej. REGISTROS LEÍDOS / ÍNTEGROS / DESCARTADOS).
//
// Con `to` la tarjeta entera es una liga a la pantalla que explica el número, ya filtrada: un KPI que no lleva a
// ningún lado obliga a buscar a mano de dónde salió.
//
// Con `trend` lleva junto al número cuánto cambió contra el periodo anterior («▲ 12 %», como los tableros de MUI). El
// color dice si es bueno o malo, no si subió: más cancelaciones es subir y es malo (isGood: false). La flecha y el texto
// oculto dicen la dirección, para quien no distingue el color.
//
// Se extiende sin tocar el framework: un ícono junto al título (icon, del color del tono en un cuadro suave, como los
// resúmenes de Salud de Apple), contenido propio debajo de la nota (children: una barra de avance, un desglose), onClick
// cuando no lleva a otra pantalla, y texts para los textos de la tendencia.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {alpha} from '@mui/material/styles';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RemoveIcon from '@mui/icons-material/Remove';

const TONES = ['info', 'success', 'warning', 'error'];

/** Hacia dónde se movió el número. */
export const TREND_DIRECTION = Object.freeze({up: 'up', down: 'down', flat: 'flat'});

const TREND_ICONS = Object.freeze({
    [TREND_DIRECTION.up]: ArrowUpwardIcon,
    [TREND_DIRECTION.down]: ArrowDownwardIcon,
    [TREND_DIRECTION.flat]: RemoveIcon,
});

// el renglón del título: del alto de la píldora de tendencia, para que las tarjetas con y sin tendencia queden parejas
const TITLE_ROW_MIN_HEIGHT_PIXELS = 24;
// el cuadro del ícono junto al título y el tamaño del ícono adentro (px)
const ICON_BOX_PIXELS = 28;
const ICON_PIXELS = 18;

/**
 * El cambio contra el periodo anterior: verde si es bueno, rojo si es malo, gris si no cambió.
 *
 * @param {{trend: {label: string, direction: string, isGood?: boolean}, texts?: object}} props
 */
function TrendChip({trend, texts}) {
    const {t} = useToolkitTranslation('metricCard', texts);
    const direction = TREND_ICONS[trend.direction] ? trend.direction : TREND_DIRECTION.flat;
    const TrendIcon = TREND_ICONS[direction];
    // por omisión subir es bueno; quien cuente algo malo (cancelaciones, quejas) lo dice con isGood
    const isGood = trend.isGood ?? direction === TREND_DIRECTION.up;
    const color = direction === TREND_DIRECTION.flat ? 'default' : (isGood ? 'success' : 'error');
    return (
        <Chip size="small" color={color} variant="outlined" icon={<TrendIcon />} label={trend.label}
              aria-label={`${t(`trend.${direction}`)} ${trend.label}`} sx={{fontWeight: 600, '& .MuiChip-icon': {fontSize: 16}}} />
    );
}

/**
 * @param {object} props
 * @param {string} props.label texto ya traducido
 * @param {import('react').ReactNode} props.value ya formateado (formatNumber)
 * @param {import('react').ReactNode} [props.caption]
 * @param {'info'|'success'|'warning'|'error'} [props.tone]
 * @param {string} [props.valueColor] color del número si no debe ir del tono (p. ej. un total en texto normal)
 * @param {boolean} [props.isLoading]
 * @param {string} [props.to] ruta interna a la que lleva la tarjeta
 * @param {{label: string, direction: 'up'|'down'|'flat', isGood?: boolean}} [props.trend] cuánto cambió (TREND_DIRECTION)
 * @param {import('react').ReactNode} [props.icon] junto al título, del color del tono (<ShoppingBagOutlinedIcon />)
 * @param {import('react').ReactNode} [props.children] contenido propio debajo de la nota (una barra de avance, un desglose)
 * @param {() => void} [props.onClick] la tarjeta entera como botón, cuando no lleva a otra pantalla (to)
 * @param {object} [props.texts] los textos que cambian, con la forma de `metricCard`: {trend: {up: 'subió'}}
 */
export default function MetricCard({
    label, value, caption, tone = 'info', valueColor, isLoading = false, to, trend, icon, children, onClick, texts,
}) {
    // el enlace del router que conectó el proyecto (ToolkitProvider)
    const {Link} = useToolkitNavigation();
    const paletteTone = TONES.includes(tone) ? tone : 'info';

    const content = (
        <>
            {/* la tendencia va en el renglón del título, a la derecha: en el mismo lugar en todas las tarjetas aunque la cifra
                sea larga (junto a la cifra, con un importe largo se bajaba a otro renglón y no quedaban parejas; lo reportaron) */}
            <Stack direction="row" spacing={1} sx={{alignItems: 'center', justifyContent: 'space-between', minHeight: TITLE_ROW_MIN_HEIGHT_PIXELS}}>
                <Stack direction="row" spacing={1} sx={{alignItems: 'center', minWidth: 0}}>
                    {icon && (
                        <Box aria-hidden="true" sx={(theme) => ({
                            width: ICON_BOX_PIXELS, height: ICON_BOX_PIXELS, flexShrink: 0, display: 'grid', placeItems: 'center',
                            borderRadius: 1.5, color: `${paletteTone}.main`, '& svg': {fontSize: ICON_PIXELS},
                            // el tono al 14 %: se distingue del papel sin competir con la cifra
                            backgroundColor: theme.vars
                                ? `rgba(${theme.vars.palette[paletteTone].mainChannel} / 0.14)`
                                : alpha(theme.palette[paletteTone].main, 0.14),
                        })}>
                            {icon}
                        </Box>
                    )}
                    <Typography variant="overline" color="text.secondary" component="p" sx={{minWidth: 0}}>{label}</Typography>
                </Stack>
                {trend && !isLoading && <TrendChip trend={trend} texts={texts} />}
            </Stack>
            <Typography variant="h5" component="p" sx={{mt: 0.75, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: valueColor ?? `${paletteTone}.dark`}}>
                {isLoading ? <Skeleton width={120} /> : value}
            </Typography>
            {caption && (
                <Typography variant="caption" color="text.secondary" component="p" sx={{mt: 0.5}}>
                    {isLoading ? <Skeleton width={160} /> : caption}
                </Typography>
            )}
            {children && <Box sx={{mt: 1.5}}>{children}</Box>}
        </>
    );
    // una liga a la pantalla que explica el número, o un botón (onClick); sin ninguno, solo se lee
    const isClickable = Boolean(to || onClick);

    return (
        <Paper variant="outlined" sx={{
            borderTop: 3,
            borderTopColor: `${paletteTone}.light`,
            height: '100%',
            overflow: 'hidden',
            ...(isClickable ? {} : {p: 2.5}),
        }}>
            {isClickable ? (
                <CardActionArea {...(to ? {component: Link, to} : {onClick})} sx={{p: 2.5, height: '100%', alignItems: 'flex-start', display: 'block'}}>
                    {content}
                </CardActionArea>
            ) : content}
        </Paper>
    );
}
