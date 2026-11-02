// Hecho en Calcita · texto con formato: el editor (RichTextEditor, con Tiptap), la vista que enseña lo guardado sin dejar
// pasar código (RichTextView), el campo de formik y un editor a la medida (features, toolbarActions, onEditorReady).
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import CustomEditorDemo from '@/modules/catalog/demos/richText/CustomEditorDemo.tsx';
import FormikRichText from '@/modules/catalog/demos/richText/FormikRichText.tsx';
import RichTextEditorDemo from '@/modules/catalog/demos/richText/RichTextEditorDemo.tsx';
import RichTextViewDemo from '@/modules/catalog/demos/richText/RichTextViewDemo.tsx';

const loadEditor = () => import('@/modules/catalog/demos/richText/RichTextEditorDemo.tsx?demo-source');
const loadView = () => import('@/modules/catalog/demos/richText/RichTextViewDemo.tsx?demo-source');
const loadFormik = () => import('@/modules/catalog/demos/richText/FormikRichText.tsx?demo-source');
const loadCustom = () => import('@/modules/catalog/demos/richText/CustomEditorDemo.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogPageTexts
// (richText.<sección>.extend.<id>)
const EDITOR_EXTENSIONS = [
    {id: 'value', option: 'value · onChange', example: "onChange={(html) => setNotes(html)}  // '' si se borra todo"},
    {id: 'limits', option: 'maxLength · minHeight', example: 'maxLength={500} minHeight={120}'},
    {id: 'texts', option: 'label · placeholder · helperText · error', example: 'placeholder="Escriba aquí…" error={errors.notes}'},
    {id: 'links', option: 'linkUrlOf · SAFE_LINK_PROTOCOLS', example: "linkUrlOf('calcita.mx')  // 'https://calcita.mx'"},
    {id: 'theme', option: 'theme.components.CalcitaRichTextEditor', example: 'styleOverrides: {toolbar: {bgcolor: \'background.default\'}}'},
];
const VIEW_EXTENSIONS = [
    {id: 'value', option: 'value', example: '<RichTextView value={order.notes} />'},
    {id: 'features', option: 'features · extensions', example: 'extensions={[Mention]}  // las mismas que su editor'},
];
const FORMIK_EXTENSIONS = [
    {id: 'field', option: 'FormRichTextField', example: '<FormRichTextField name="notes" label="Notas" />'},
    {id: 'hookForm', option: 'Controller (react-hook-form)', example: '<Controller name="notes" render={({field}) => <RichTextEditor … />} />'},
];
const CUSTOM_EXTENSIONS = [
    {id: 'features', option: 'features · RICH_TEXT_FEATURE', example: 'features={[RICH_TEXT_FEATURE.bold, RICH_TEXT_FEATURE.link]}'},
    {id: 'actions', option: 'toolbarActions', example: '<Button onClick={insertTemplate}>Plantilla</Button>'},
    {id: 'editor', option: 'onEditorReady', example: 'onEditorReady={(editor) => (editorRef.current = editor)}'},
    {id: 'extensions', option: 'extensions', example: "import Mention from '@tiptap/extension-mention';  extensions={[Mention.configure(…)]}"},
];

export const RichTextPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `richText.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('richText.title')} description={t('richText.description')} />
            <DemoSection title={t('richText.editor.title')} description={t('richText.editor.description')}
                         extensions={rowsOf('editor', EDITOR_EXTENSIONS)} Demo={RichTextEditorDemo} loadSource={loadEditor} />
            <DemoSection title={t('richText.view.title')} description={t('richText.view.description')}
                         extensions={rowsOf('view', VIEW_EXTENSIONS)} Demo={RichTextViewDemo} loadSource={loadView} />
            <DemoSection title={t('richText.formik.title')} description={t('richText.formik.description')}
                         extensions={rowsOf('formik', FORMIK_EXTENSIONS)} Demo={FormikRichText} loadSource={loadFormik} />
            <DemoSection title={t('richText.custom.title')} description={t('richText.custom.description')}
                         extensions={rowsOf('custom', CUSTOM_EXTENSIONS)} Demo={CustomEditorDemo} loadSource={loadCustom} />
        </Stack>
    );
};
