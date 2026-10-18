// Las preguntas de «calcita new»: qué se pregunta, sus opciones (la primera es la recomendada) y cómo cada respuesta
// prende o apaga partes de las plantillas. Las mismas respuestas se pueden dar con banderas (--forms=react-hook-form) o
// aceptar todas las recomendadas con --yes.
//
// Funciones puras: function (regla de la casa). Pruebas en projectAnswers.test.js.
import {CliError} from './templateFiles.js';

/** Los colores de fábrica de cada opción (el principal): el tema de la app y el color de la barra del sistema al instalarla. */
export const PRIMARY_COLOR_OF = Object.freeze({
    // el naranja Forge de Stackcraft (STACKCRAFT.forge del paquete)
    stackcraft: '#FF6B1A',
    // el azul de MUI (su primary.main por omisión)
    mui: '#1976D2',
});

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
// el nombre de la app va en el código (un texto entre comillas), en el HTML y en el manifiesto: sin comillas, sin < ni &
const APP_TITLE_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} .,·-]*$/u;

/** Las preguntas, en orden. `options`: [valor, texto]; la primera es la recomendada. */
export const QUESTIONS = Object.freeze([
    {key: 'appTitle', text: 'Nombre de la app (en la barra y en la pestaña)'},
    {key: 'menuPosition', text: '¿Dónde va el menú?', options: [['side', 'A un lado (se encoge a íconos)'], ['top', 'Arriba, en la barra']]},
    {
        key: 'style', text: 'Estilo',
        options: [['glass', 'Vidrio líquido en lo que flota (menús, barra, avisos)'], ['plain', 'Sin vidrio'], ['minimal', 'Minimalista: plano, sin bordes ni sombras']],
    },
    {key: 'colorModes', text: 'Modos de color', options: [['lightAndDark', 'Claro y oscuro (con su botón)'], ['lightOnly', 'Solo claro']]},
    {key: 'colors', text: 'Colores', options: [['stackcraft', 'Los de Stackcraft (naranja)'], ['mui', 'Los de MUI (azul)'], ['custom', 'Uno propio']]},
    {key: 'primaryColor', text: 'Color principal (#RRGGBB)', when: (answers) => answers.colors === 'custom'},
    {key: 'forms', text: 'Formularios', options: [['formik', 'formik (viene con Calcita)'], ['react-hook-form', 'react-hook-form']]},
    {key: 'texts', text: 'Textos de la app', options: [['calcita', 'Los de Calcita (archivos JS por módulo)'], ['i18next', 'Con i18next']]},
    {key: 'auth', text: 'Pantallas de entrar, «¿Olvidó su contraseña?» y Mi perfil, con un servidor de mentira', options: [['yes', 'Sí'], ['no', 'No']]},
    {key: 'pwa', text: 'Que se pueda instalar como app (PWA, sin modo sin conexión)', options: [['yes', 'Sí'], ['no', 'No']]},
]);

/**
 * Las respuestas recomendadas.
 *
 * @param {string} folderName el nombre de la carpeta: de ahí sale el nombre de la app por omisión
 * @returns {Record<string, string>}
 */
export function defaultAnswersOf(folderName) {
    const answers = {appTitle: titleOfFolder(folderName)};
    for (const question of QUESTIONS) {
        if (question.options) {
            answers[question.key] = question.options[0][0];
        }
    }
    return answers;
}

/** «mi-tienda» → «Mi tienda». */
function titleOfFolder(folderName) {
    const words = folderName.split(/[-_\s]+/).filter(Boolean);
    const title = words.join(' ');
    return title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Mi app';
}

/**
 * ¿La respuesta sirve? Regresa el motivo si no, en palabras de la persona.
 *
 * @param {string} key
 * @param {string} value
 * @returns {string|null}
 */
export function problemWithAnswer(key, value) {
    const question = QUESTIONS.find((candidate) => candidate.key === key);
    if (!question) {
        return `No hay una opción «${key}».`;
    }
    if (question.options && !question.options.some(([optionValue]) => optionValue === value)) {
        return `«${value}» no es una opción de ${key}: use ${question.options.map(([optionValue]) => optionValue).join(', ')}.`;
    }
    if (key === 'primaryColor' && !HEX_COLOR.test(value)) {
        return 'El color va como #RRGGBB, por ejemplo #2563EB.';
    }
    if (key === 'appTitle' && !APP_TITLE_PATTERN.test(value)) {
        return 'El nombre lleva letras, números, espacios, puntos, comas o guiones (sin comillas).';
    }
    return null;
}

/**
 * Las respuestas recomendadas con lo que vino en banderas encima; truena con el motivo si una no sirve.
 *
 * @param {string} folderName
 * @param {Record<string, string|undefined>} flagValues
 * @returns {Record<string, string>}
 */
export function answersFromFlags(folderName, flagValues) {
    const answers = defaultAnswersOf(folderName);
    for (const question of QUESTIONS) {
        const value = flagValues[question.key];
        if (value !== undefined) {
            answers[question.key] = value;
        }
    }
    return checkedAnswers(answers);
}

/**
 * Revisa todas: cada valor y que el color propio venga si se eligió.
 *
 * @param {Record<string, string>} answers
 * @returns {Record<string, string>}
 */
export function checkedAnswers(answers) {
    for (const [key, value] of Object.entries(answers)) {
        const problem = problemWithAnswer(key, value);
        if (problem) {
            throw new CliError(problem);
        }
    }
    if (answers.colors === 'custom' && !answers.primaryColor) {
        throw new CliError('Con colores propios hace falta el color principal: --primaryColor=#2563EB.');
    }
    return answers;
}

/**
 * Las opciones que leen las plantillas («//#if pwa»), sacadas de las respuestas.
 *
 * @param {Record<string, string>} answers
 * @returns {Record<string, boolean>}
 */
export function templateFlagsOf(answers) {
    return {
        auth: answers.auth === 'yes',
        pwa: answers.pwa === 'yes',
        i18next: answers.texts === 'i18next',
        hookForm: answers.forms === 'react-hook-form',
        darkMode: answers.colorModes === 'lightAndDark',
    };
}

/**
 * El color principal elegido.
 *
 * @param {Record<string, string>} answers
 * @returns {string}
 */
export function primaryColorOf(answers) {
    return answers.colors === 'custom' ? answers.primaryColor.toUpperCase() : PRIMARY_COLOR_OF[answers.colors];
}
