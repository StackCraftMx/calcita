// El minuto de ahora, que se actualiza solo al empezar cada minuto: para una regla como «al menos 5 minutos después de
// ahora», que se va recorriendo mientras la pantalla está abierta (si la persona deja el formulario abierto diez minutos,
// el mínimo ya no es el de cuando lo abrió).
//
// Un solo temporizador, hasta el siguiente minuto en punto; se apaga al salir de la pantalla o si enabled es false.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useState} from 'react';

import {MILLISECONDS_PER_MINUTE} from '@/datePickers/pickerValues.js';

const startOfMinuteOf = (milliseconds) => Math.floor(milliseconds / MILLISECONDS_PER_MINUTE) * MILLISECONDS_PER_MINUTE;

/**
 * @param {boolean} enabled sin regla que dependa de la hora no hace falta el temporizador
 * @returns {number} el inicio del minuto de ahora, en milisegundos
 */
export function useCurrentMinute(enabled) {
    const [currentMinute, setCurrentMinute] = useState(() => startOfMinuteOf(Date.now()));

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }
        let timer;
        const waitForNextMinute = () => {
            const untilNextMinute = MILLISECONDS_PER_MINUTE - (Date.now() % MILLISECONDS_PER_MINUTE);
            timer = setTimeout(() => {
                setCurrentMinute(startOfMinuteOf(Date.now()));
                waitForNextMinute();
            }, untilNextMinute);
        };
        // al volver a encender, el minuto puede haber cambiado mientras estaba apagado
        setCurrentMinute(startOfMinuteOf(Date.now()));
        waitForNextMinute();
        return () => clearTimeout(timer);
    }, [enabled]);

    return currentMinute;
}
