// Cuánto falta para un momento, al día cada segundo, y avisar una sola vez al llegar a cero (onComplete). Para pintar la
// cuenta a su manera; Countdown es la que ya viene pintada.
//
//   const {parts, isOver} = useCountdown(auction.closes_at, {onComplete: reloadAuction});
//
// Mientras ya terminó no corre ningún reloj de fondo, y al desmontar se apaga.
//
// Hook genérico: function (regla de la casa).
import {useEffect, useRef, useState} from 'react';

import {countdownPartsOf} from '@/ui/countdown/countdownParts.js';

const TICK_MILLISECONDS = 1000;

/**
 * @param {string|number|Date} until el momento: un instante en texto, un Date o milisegundos
 * @param {{onComplete?: () => void, now?: () => number}} [options] onComplete: al llegar a cero (una vez); now: el reloj
 *     (para probar con una hora fija)
 * @returns {{parts: ReturnType<typeof countdownPartsOf>, isOver: boolean}}
 */
export function useCountdown(until, {onComplete, now = Date.now} = {}) {
    const [parts, setParts] = useState(() => countdownPartsOf(until, now()));
    // lo último de afuera, sin rearmar el reloj cada vez que la pantalla pinta otra función
    const latest = useRef({onComplete, now});
    latest.current = {onComplete, now};

    useEffect(() => {
        let hasCompleted = false;
        const tick = () => {
            const current = countdownPartsOf(until, latest.current.now());
            setParts(current);
            if (current.isOver && !hasCompleted) {
                hasCompleted = true;
                latest.current.onComplete?.();
            }
            return current.isOver;
        };
        // ya terminó al llegar: se avisa y no se arma el reloj
        if (tick()) {
            return undefined;
        }
        const timer = setInterval(() => {
            if (tick()) {
                clearInterval(timer);
            }
        }, TICK_MILLISECONDS);
        return () => clearInterval(timer);
    }, [until]);

    return {parts, isOver: parts.isOver};
}
