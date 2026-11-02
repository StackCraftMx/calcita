// El editor de texto con formato (Tiptap), con la etiqueta arriba como los demás campos del paquete: negrita, cursiva,
// títulos, listas, cita, código, ligas seguras, alineación, deshacer y rehacer, y el contador de caracteres si hay tope.
//
// Viaja HTML ('<p>Hola <strong>mundo</strong></p>'); '' si no hay nada escrito (así required() funciona). Para ENSEÑAR lo
// guardado va RichTextView, que solo deja pasar lo que el editor entiende: un <script> o un onclick pegado no llegan a la
// página.
//
// Extensible sin tocar el paquete: features (qué botones trae; lo que no se pide tampoco entra al documento), extensions
// (extensiones de Tiptap del proyecto: menciones, tablas…), toolbarActions (botones propios al final de la barra) y
// onEditorReady (el editor de Tiptap, para lo que la barra no trae). Con formik: FormRichTextField; con react-hook-form, dentro
// de un Controller.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaRichTextEditor con defaultProps y
// styleOverrides de sus partes: root, toolbar, content, footer.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useId, useRef} from 'react';
import {EditorContent, useEditor, useEditorState} from '@tiptap/react';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {richTextContentSxOf} from '@/richText/richTextContentSx.js';
import {richTextExtensionsOf} from '@/richText/richTextExtensions.js';
import {DEFAULT_RICH_TEXT_FEATURES, normalizedHtmlOf} from '@/richText/richTextRules.js';
import RichTextToolbar from '@/richText/RichTextToolbar.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaRichTextEditor)
const THEME_NAME = 'CalcitaRichTextEditor';
const EditorRoot = piecePart(THEME_NAME, 'Root', Paper);
const EditorToolbar = piecePart(THEME_NAME, 'Toolbar', Stack);
const EditorContentArea = piecePart(THEME_NAME, 'Content', Box);
const EditorFooter = piecePart(THEME_NAME, 'Footer', Stack);

const DEFAULT_MIN_HEIGHT = 160;

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {import('react').ReactNode} props.label ya traducida
 * @param {string|null|undefined} props.value el HTML guardado ('' sin texto)
 * @param {(html: string) => void} props.onChange recibe el HTML ('' si se borra todo)
 * @param {() => void} [props.onBlur]
 * @param {string} [props.placeholder] ya traducido: lo que se ve con el editor vacío
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ya traducida
 * @param {number} [props.maxLength] el tope de caracteres (con su contador abajo)
 * @param {string[]} [props.features] los botones de la barra (RICH_TEXT_FEATURE); por omisión todos
 * @param {Array<object>} [props.extensions] extensiones de Tiptap del proyecto
 * @param {import('react').ReactNode} [props.toolbarActions] botones propios al final de la barra
 * @param {(editor: import('@tiptap/react').Editor) => void} [props.onEditorReady] el editor de Tiptap, al estar listo
 * @param {number} [props.minHeight] el alto mínimo del texto en px; por omisión 160
 * @param {boolean} [props.disabled]
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `richText` en los textos del paquete
 */
export default function RichTextEditor(props) {
    const {
        name, label, value, onChange, onBlur, placeholder, error, helperText = ' ', maxLength, features = DEFAULT_RICH_TEXT_FEATURES, extensions,
        toolbarActions, onEditorReady, minHeight = DEFAULT_MIN_HEIGHT, disabled = false, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('richText', texts);
    const generatedId = useId();
    const contentId = `${name ?? 'rich-text'}-${generatedId}`;
    const labelId = `${contentId}-label`;
    const errorText = translateValidationMessage(t, error);
    // lo último de afuera, sin rearmar el editor cada vez que la pantalla pinta otra función
    const latest = useRef({onChange, onBlur, onEditorReady});
    latest.current = {onChange, onBlur, onEditorReady};

    const editor = useEditor({
        extensions: richTextExtensionsOf({features, placeholder, maxLength, extensions}),
        content: value ?? '',
        editable: !disabled,
        // OJO: sin esto, al pintar en el servidor (Next) el editor avisa que no hay documento todavía
        immediatelyRender: false,
        editorProps: {
            attributes: {id: contentId, role: 'textbox', 'aria-multiline': 'true', 'aria-labelledby': labelId, ...(errorText && {'aria-invalid': 'true'})},
        },
        onUpdate: ({editor: current}) => latest.current.onChange(normalizedHtmlOf(current.getHTML())),
        onBlur: () => latest.current.onBlur?.(),
        onCreate: ({editor: current}) => latest.current.onEditorReady?.(current),
    }, [features.join(','), placeholder, maxLength, Boolean(errorText)]);

    // lo que llega de afuera (el formulario se reinició, llegó del servidor) entra sin avisar otro cambio
    useEffect(() => {
        if (editor && normalizedHtmlOf(editor.getHTML()) !== (value ?? '')) {
            editor.commands.setContent(value ?? '', {emitUpdate: false});
        }
    }, [editor, value]);
    useEffect(() => {
        editor?.setEditable(!disabled);
    }, [editor, disabled]);

    const characters = useEditorState({editor, selector: ({editor: current}) => current?.storage.characterCount?.characters() ?? 0});

    return (
        <FieldFrame inputId={contentId} labelId={labelId} label={label}>
            <div>
                <EditorRoot variant="outlined" ownSx={(theme) => ({
                    borderRadius: 2, overflow: 'hidden', opacity: disabled ? 0.6 : 1,
                    borderColor: errorText ? 'error.main' : 'divider',
                    '&:focus-within': {borderColor: errorText ? 'error.main' : 'primary.main', boxShadow: `0 0 0 1px ${(theme.vars ?? theme).palette[errorText ? 'error' : 'primary'].main}`},
                })} sx={sx}>
                    <EditorToolbar role="toolbar" aria-label={t('toolbar.label')} aria-controls={contentId} direction="row"
                                   ownSx={{alignItems: 'center', flexWrap: 'wrap', gap: 0.25, px: 0.5, py: 0.5, borderBottom: 1, borderColor: 'divider'}}>
                        <RichTextToolbar editor={editor} features={features} disabled={disabled} t={t} actions={toolbarActions} />
                    </EditorToolbar>
                    <EditorContentArea ownSx={(theme) => {
                        const content = richTextContentSxOf(theme);
                        return {...content, px: 2, py: 1.5, cursor: 'text', '& .tiptap': {...content['& .tiptap'], minHeight}};
                    }} onClick={() => editor?.commands.focus()}>
                        <EditorContent editor={editor} />
                    </EditorContentArea>
                </EditorRoot>
                <EditorFooter direction="row" ownSx={{justifyContent: 'space-between', gap: 2}}>
                    <FormHelperText error={Boolean(errorText)}>{errorText ?? helperText}</FormHelperText>
                    {maxLength && (
                        <FormHelperText sx={{fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
                            {t('counter', {count: characters, max: maxLength})}
                        </FormHelperText>
                    )}
                </EditorFooter>
            </div>
        </FieldFrame>
    );
}
