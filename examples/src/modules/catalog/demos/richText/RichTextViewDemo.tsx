// Enseñar lo guardado con RichTextView: pasa por el mismo esquema del editor y solo entra lo que el editor entiende. Abajo, un
// HTML con un <script>, un onclick y una liga javascript: (como llegaría de alguien con malas intenciones): en la vista no
// queda nada que se ejecute.
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {RichTextView} from '@stackcraftmx/calcita/rich-text';

// ─── Un HTML con trampas (en su proyecto es lo que guardó el servidor) ───
const SAVED_HTML = '<h2>Instrucciones de entrega</h2><p onclick="alert(1)">Llamar <strong>antes</strong> de llegar.</p>'
    + '<script>alert("XSS")</script><p><a href="javascript:alert(2)">liga con trampa</a> · <a href="https://www.example.com">liga buena</a></p>'
    + '<ul><li><p>Puerta trasera</p></li><li><p>Horario de 9 a 14</p></li></ul>';

const RichTextViewDemo = () => (
    <Stack spacing={1.5} sx={{maxWidth: 720}}>
        {/* 1. La vista: el texto con su formato, sin el script, sin el onclick y sin la liga javascript: */}
        <RichTextView value={SAVED_HTML} sx={{p: 2, borderRadius: 2, bgcolor: 'action.hover'}} />
        {/* 2. Lo que llegó del servidor, tal cual */}
        <Typography variant="caption" color="text.secondary" sx={{fontFamily: 'monospace', overflowWrap: 'anywhere'}}>Llegó: {SAVED_HTML}</Typography>
    </Stack>
);

export default RichTextViewDemo;
