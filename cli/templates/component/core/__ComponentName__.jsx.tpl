// __ComponentName__: lo armó el CLI de Calcita (make:component) con un título y su contenido; cámbielo a lo que pida. Vive
// en core porque lo usan dos o más módulos: se importa de '@/core'.
//
// Genérico y sin estado: function (regla de la casa). Recibe los textos ya traducidos.
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * @param {object} props
 * @param {string} props.title ya traducido
 * @param {import('react').ReactNode} [props.children]
 */
export function __ComponentName__({title, children}) {
    return (
        <Paper variant="outlined" sx={{p: 2}}>
            <Stack spacing={1}>
                <Typography variant="subtitle2" component="h3">{title}</Typography>
                {children}
            </Stack>
        </Paper>
    );
}
