// __ComponentName__ de __module__: lo armó el CLI de Calcita (make:component) con un título y su contenido; cámbielo a lo
// que pida. Es solo de este módulo; si otro módulo lo necesita, sube a src/core.
//
// Lo renderiza la app: arrow (regla de la casa).
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * @param {object} props
 * @param {string} props.title ya traducido
 * @param {import('react').ReactNode} [props.children]
 */
export const __ComponentName__ = ({title, children}) => (
    <Paper variant="outlined" sx={{p: 2}}>
        <Stack spacing={1}>
            <Typography variant="subtitle2" component="h3">{title}</Typography>
            {children}
        </Stack>
    </Paper>
);
