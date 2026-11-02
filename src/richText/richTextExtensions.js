// Las extensiones de Tiptap del editor de la casa, armadas según los botones que se piden (features). Lo que no se pide se
// quita también del documento: si la barra no trae código, un bloque de código pegado llega como texto normal.
//
// Las ligas solo con protocolos seguros (richTextRules.js) y con rel="noopener noreferrer nofollow": la página que se abre no
// puede tocar la de la app ni sumar puntos de búsqueda.
//
// Genérico del paquete: function (regla de la casa).
import TextAlign from '@tiptap/extension-text-align';
import {CharacterCount, Placeholder} from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';

import {RICH_TEXT_FEATURE, isSafeLinkUrl} from '@/richText/richTextRules.js';

// los títulos que ofrece la barra: el de la página ya es h1, el texto va de h2 para abajo
export const RICH_TEXT_HEADING_LEVELS = Object.freeze([2, 3]);
const ALIGNABLE_NODES = Object.freeze(['heading', 'paragraph']);

/**
 * @param {object} options
 * @param {string[]} options.features los botones de la barra (RICH_TEXT_FEATURE)
 * @param {string} [options.placeholder] ya traducido: lo que se ve con el editor vacío
 * @param {number} [options.maxLength] el tope de caracteres; sin él, sin tope
 * @param {Array<object>} [options.extensions] extensiones de Tiptap del proyecto, al final
 * @returns {Array<object>}
 */
export function richTextExtensionsOf({features, placeholder, maxLength, extensions = []}) {
    const has = (feature) => features.includes(feature);
    const onlyIf = (feature, options = {}) => (has(feature) ? options : false);

    return [
        StarterKit.configure({
            heading: onlyIf(RICH_TEXT_FEATURE.textStyle, {levels: [...RICH_TEXT_HEADING_LEVELS]}),
            bold: onlyIf(RICH_TEXT_FEATURE.bold),
            italic: onlyIf(RICH_TEXT_FEATURE.italic),
            underline: onlyIf(RICH_TEXT_FEATURE.underline),
            strike: onlyIf(RICH_TEXT_FEATURE.strike),
            bulletList: onlyIf(RICH_TEXT_FEATURE.bulletList),
            orderedList: onlyIf(RICH_TEXT_FEATURE.orderedList),
            // sin listas tampoco hay renglones de lista
            listItem: has(RICH_TEXT_FEATURE.bulletList) || has(RICH_TEXT_FEATURE.orderedList) ? {} : false,
            blockquote: onlyIf(RICH_TEXT_FEATURE.blockquote),
            codeBlock: onlyIf(RICH_TEXT_FEATURE.codeBlock),
            // el código dentro de un renglón lo pide solo el bloque de código
            code: onlyIf(RICH_TEXT_FEATURE.codeBlock),
            undoRedo: onlyIf(RICH_TEXT_FEATURE.history),
            link: onlyIf(RICH_TEXT_FEATURE.link, {
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                isAllowedUri: (url) => isSafeLinkUrl(url),
                HTMLAttributes: {rel: 'noopener noreferrer nofollow', target: '_blank'},
            }),
        }),
        ...(has(RICH_TEXT_FEATURE.align) ? [TextAlign.configure({types: [...ALIGNABLE_NODES]})] : []),
        ...(placeholder ? [Placeholder.configure({placeholder})] : []),
        CharacterCount.configure({limit: maxLength ?? null}),
        ...extensions,
    ];
}
