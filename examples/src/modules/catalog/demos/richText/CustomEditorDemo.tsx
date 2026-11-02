// Un editor a la medida sin tocar el paquete: solo los botones que pide la pantalla (features) y uno propio al final de la
// barra (toolbarActions) que usa el editor de Tiptap (onEditorReady) para insertar la fecha de hoy.
import {useRef, useState} from 'react';
import Button from '@mui/material/Button';
import {formatDate} from '@stackcraftmx/calcita';
import {RICH_TEXT_FEATURE, RichTextEditor} from '@stackcraftmx/calcita/rich-text';
import type {Editor} from '@tiptap/react';

// 1. Solo lo que sirve aquí: negrita, cursiva, listas y deshacer
const COMMENT_FEATURES = [RICH_TEXT_FEATURE.bold, RICH_TEXT_FEATURE.italic, RICH_TEXT_FEATURE.bulletList, RICH_TEXT_FEATURE.history];

const CustomEditorDemo = () => {
    const [comment, setComment] = useState('');
    const editorRef = useRef<Editor | null>(null);

    return (
        <RichTextEditor
            label="Comentario"
            value={comment}
            onChange={setComment}
            features={COMMENT_FEATURES}
            minHeight={80}
            // 2. El editor de Tiptap, para lo que la barra no trae
            onEditorReady={(editor) => {
                editorRef.current = editor;
            }}
            // 3. Un botón propio al final de la barra
            toolbarActions={(
                <Button size="small" onMouseDown={(event) => event.preventDefault()}
                        onClick={() => editorRef.current?.chain().focus().insertContent(formatDate(new Date().toISOString())).run()}>
                    Insertar la fecha
                </Button>
            )}
        />
    );
};

export default CustomEditorDemo;
