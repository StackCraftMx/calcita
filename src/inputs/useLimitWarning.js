// Lo que comparten todos los campos con tope (fieldLimits.js) dentro de un componente:
//   - el modo que manda: el del campo (o el de su pieza en el tema), si no el de ToolkitProvider, si no avisar;
//   - cuándo se enseña el aviso del tope: después de que la persona sale del campo una vez (o, en una lista, después de
//     elegir algo). No se regaña lo que apenas se empieza a llenar;
//   - qué error se enseña: el del formulario gana; si no hay, el del tope. Así el tope avisa también sin formulario;
//   - con fix, lo que se corrigió solo se dice: una nota en el campo («Se ajustó al mínimo: 5,000.»), que no va en rojo y
//     se va en cuanto la persona escribe otra cosa, y onLimitFix con el objeto de la corrección para la pantalla (un aviso
//     propio, una bitácora), como hacen muchos formularios que ya existen.
//
//   const limit = useLimitWarning({limitMode, error, value, onLimitFix, limitProblem: numberLimitProblemOf(value, {min, max}), validationTextOf});
//   …helperText={limit.errorText ?? limit.noticeText ?? helperText}
//   al salir: limit.markLeft(); y si se corrigió: limit.noteFix(limitFixOf(problem, typed, fixed));
//
// Hook genérico: function (regla de la casa).
import {useState} from 'react';

import {limitModeOf} from '@/inputs/fieldLimits.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';

/**
 * @param {object} field
 * @param {string} [field.limitMode] el del campo (LIMIT_MODE)
 * @param {unknown} [field.error] el error del formulario (o de la pantalla)
 * @param {object|null} field.limitProblem el tope que rompe el valor de hoy (fieldLimits.js); null si ninguno
 * @param {(error: unknown) => string|undefined} field.validationTextOf el de useValidationText del campo
 * @param {unknown} [field.value] el valor de hoy: la nota de la corrección se ve mientras siga siendo el corregido
 * @param {(fix: ReturnType<typeof import('@/inputs/fieldLimits.js').limitFixOf>) => void} [field.onLimitFix] el de la pantalla
 * @returns {{mode: 'warn'|'fix', errorText: string|undefined, noticeText: string|undefined, markLeft: () => void, noteFix: (fix: object) => void}}
 */
export function useLimitWarning({limitMode, error, limitProblem, validationTextOf, value, onLimitFix}) {
    const settings = useToolkitSettings();
    const [wasLeft, setWasLeft] = useState(false);
    const [lastFix, setLastFix] = useState(null);
    const isFixShown = lastFix !== null && value === lastFix.fixedValue;
    return {
        mode: limitModeOf(limitMode, settings.limitMode),
        errorText: validationTextOf(error) ?? (wasLeft && limitProblem ? validationTextOf(limitProblem) : undefined),
        noticeText: isFixShown ? validationTextOf(lastFix.message) : undefined,
        markLeft: () => setWasLeft(true),
        noteFix: (fix) => {
            setLastFix(fix);
            onLimitFix?.(fix);
        },
    };
}
