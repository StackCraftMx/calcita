// La cuenta regresiva ya pintada: «02:14:30» hasta un momento (el cierre de una subasta, el inicio de una cita, el fin de
// una oferta), con días cuando faltan («3 d 02:14:30»), y lo que dice al llegar a cero («Ya terminó»). Avisa con onComplete
// una sola vez.
//
// Para un lector de pantalla es un temporizador (role="timer"): no anuncia cada segundo, sí el final (role="status").
// Con children como función se pinta a su manera: children(parts) recibe {days, hours, minutes, seconds, isOver}.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaCountdown con defaultProps y
// styleOverrides de su parte root.
//
// Genérico del paquete: function (regla de la casa).
import Typography from '@mui/material/Typography';

import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {countdownClockOf} from '@/ui/countdown/countdownParts.js';
import {useCountdown} from '@/ui/countdown/useCountdown.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaCountdown)
const THEME_NAME = 'CalcitaCountdown';
const CountdownRoot = piecePart(THEME_NAME, 'Root', Typography);

/**
 * @param {object} props
 * @param {string|number|Date} props.until el momento: un instante en texto, un Date o milisegundos
 * @param {string} [props.label] ya traducido: qué se cuenta («Tiempo para que cierre la subasta»), para un lector de pantalla
 * @param {() => void} [props.onComplete] al llegar a cero (una vez)
 * @param {import('react').ReactNode} [props.completedText] lo que dice al terminar; por omisión «Ya terminó»
 * @param {boolean} [props.showSeconds] por omisión, sí
 * @param {(parts: {days: number, hours: number, minutes: number, seconds: number, totalSeconds: number, isOver: boolean}) => import('react').ReactNode} [props.children]
 *     para pintarla a su manera
 * @param {import('@mui/material/Typography').TypographyProps['variant']} [props.variant] por omisión body1
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function Countdown(props) {
    const {
        until, label, onComplete, completedText, showSeconds = true, children, variant = 'body1', sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {parts, isOver} = useCountdown(until, {onComplete});

    if (typeof children === 'function') {
        return children(parts);
    }
    if (isOver) {
        return (
            <CountdownRoot variant={variant} role="status" ownSx={{fontVariantNumeric: 'tabular-nums'}} sx={sx}>
                {completedText ?? t('countdown.done')}
            </CountdownRoot>
        );
    }
    return (
        <CountdownRoot variant={variant} role="timer" aria-label={label} ownSx={{fontVariantNumeric: 'tabular-nums'}} sx={sx}>
            {countdownClockOf(parts, {daysLabel: t('countdown.daysShort'), showSeconds})}
        </CountdownRoot>
    );
}
