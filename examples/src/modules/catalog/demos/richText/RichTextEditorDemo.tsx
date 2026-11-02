// El editor de texto con formato: estilo, negrita, cursiva, subrayado, tachado, listas, cita, código, ligas seguras,
// alineación, quitar el formato y deshacer o rehacer, con el contador si hay tope. Viaja HTML ('' si no hay nada escrito).
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {RichTextEditor} from '@stackcraftmx/calcita/rich-text';

const RichTextEditorDemo = () => {
    const [notes, setNotes] = useState('<p>Pruebe a <strong>darle formato</strong> y a poner una <a href="https://www.example.com">liga</a>.</p>');

    return (
        <Stack spacing={1.5} sx={{maxWidth: 720}}>
            {/* 1. Todos los botones, con tope de caracteres */}
            <RichTextEditor label="Notas del pedido" value={notes} onChange={setNotes} placeholder="Escriba aquí…" maxLength={500} />
            {/* 2. Lo que viaja al servidor */}
            <Typography variant="body2" color="text.secondary" sx={{fontFamily: 'monospace', overflowWrap: 'anywhere'}}>Viaja: {notes || "''"}</Typography>
        </Stack>
    );
};

export default RichTextEditorDemo;
