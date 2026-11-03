// Enseña el texto con formato que guardó RichTextEditor, sin poder editarlo. Pasa por el mismo esquema del editor: solo entra
// lo que el editor entiende (párrafos, títulos, listas, ligas seguras…) y lo demás se queda afuera. Un <script>, un
// onclick o una liga javascript: pegados en el HTML no llegan a la página (XSS), sin otra librería para limpiarlo.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaRichTextView con defaultProps y
// styleOverrides de su parte root.
//
// Genérico del paquete: function (regla de la casa).
import {EditorContent, useEditor} from '@tiptap/react';
import Box from '@mui/material/Box';

import {richTextContentSxOf} from '@/richText/richTextContentSx.js';
import {richTextExtensionsOf} from '@/richText/richTextExtensions.js';
import {DEFAULT_RICH_TEXT_FEATURES} from '@/richText/richTextRules.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaRichTextView)
const THEME_NAME = 'CalcitaRichTextView';
const ViewRoot = piecePart(THEME_NAME, 'Root', Box);

/**
 * @param {object} props
 * @param {string|null|undefined} props.value el HTML guardado
 * @param {string[]} [props.features] lo que se deja pasar (por omisión, lo de un editor completo)
 * @param {Array<object>} [props.extensions] las extensiones de Tiptap del proyecto (las mismas que tiene su editor)
 * @param {object} [props.sx]
 */
function RichTextViewContent(props) {
    const {value, features = DEFAULT_RICH_TEXT_FEATURES, extensions, sx, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const editor = useEditor({
        extensions: richTextExtensionsOf({features, extensions}),
        content: value ?? '',
        editable: false,
        immediatelyRender: false,
    }, [value, features.join(',')]);

    return (
        <ViewRoot ownSx={richTextContentSxOf} sx={sx}>
            <EditorContent editor={editor} />
        </ViewRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const RichTextView = withPieceSlots(RichTextViewContent, THEME_NAME);
export default RichTextView;
