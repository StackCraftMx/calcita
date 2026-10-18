// Los nombres en pantalla (español e inglés) de un módulo o de una pantalla nueva: con --label-es y --label-en, o
// preguntados en la terminal; sin respuesta, el nombre en palabras («Purchase orders»), para cambiarlo después en su
// archivo de textos.
//
// Funciones de node, sin React: function (regla de la casa).
import {createInterface} from 'node:readline/promises';
import {stdin, stdout} from 'node:process';

import {CliError} from './templateFiles.js';

// va dentro de un texto entre comillas en el código: sin comillas ni diagonales
const SCREEN_LABEL_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} .,·()-]*$/u;

/**
 * @param {object} options
 * @param {string} options.defaultLabel el nombre en palabras
 * @param {string} [options.labelEs] el de la bandera --label-es
 * @param {string} [options.labelEn] el de la bandera --label-en
 * @param {boolean} options.canAsk si se puede preguntar (terminal y sin --yes)
 * @param {string} options.what «el módulo», «la pantalla»: para la pregunta
 * @returns {Promise<{es: string, en: string}>}
 */
export async function screenLabelsOf({defaultLabel, labelEs, labelEn, canAsk, what}) {
    const labels = {es: labelEs, en: labelEn};
    if (canAsk && (!labels.es || !labels.en)) {
        const terminal = createInterface({input: stdin, output: stdout});
        try {
            labels.es ??= (await terminal.question(`¿Cómo se llama ${what} en pantalla, en español? [${defaultLabel}]: `)).trim() || undefined;
            labels.en ??= (await terminal.question(`¿Y en inglés? [${defaultLabel}]: `)).trim() || undefined;
        } finally {
            terminal.close();
        }
    }
    const result = {es: labels.es ?? defaultLabel, en: labels.en ?? defaultLabel};
    for (const label of Object.values(result)) {
        if (!SCREEN_LABEL_PATTERN.test(label)) {
            throw new CliError(`«${label}» no sirve como nombre en pantalla: letras, números, espacios, puntos, comas o guiones (sin comillas).`);
        }
    }
    return result;
}
