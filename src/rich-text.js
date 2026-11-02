// El editor de texto con formato (@stackcraftmx/calcita/rich-text), con Tiptap: el campo suelto (RichTextEditor), el de formik
// (FormRichTextField) y la vista de solo lectura (RichTextView) que enseña lo guardado sin dejar pasar código. Viaja HTML.
// Pide @tiptap/react, @tiptap/pm, @tiptap/starter-kit, @tiptap/extensions y @tiptap/extension-text-align (3).
//
// Con react-hook-form:
//   <Controller name="notes" control={control} render={({field, fieldState}) => (
//       <RichTextEditor label="Notas" value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
//   )} />
export {default as FormRichTextField} from '@/richText/FormRichTextField.jsx';
export {default as RichTextEditor} from '@/richText/RichTextEditor.jsx';
export {default as RichTextView} from '@/richText/RichTextView.jsx';
export {DEFAULT_RICH_TEXT_FEATURES, RICH_TEXT_FEATURE, SAFE_LINK_PROTOCOLS, isSafeLinkUrl, linkUrlOf, normalizedHtmlOf} from '@/richText/richTextRules.js';
export {RICH_TEXT_HEADING_LEVELS, richTextExtensionsOf} from '@/richText/richTextExtensions.js';
