// Las páginas de error: no existe (404), sin permiso (403), falla del servidor (500, con «Intentar de nuevo») y versión
// nueva publicada (con «Recargar»). Cada una con su ícono, su color y el código chico como referencia técnica.
// La de «no existe» lleva lo que suma el proyecto: un botón suyo junto a los de la casa (extraActions) y una línea debajo del
// texto (children).
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {ERROR_PAGE_KIND, ErrorPage, toastInfo} from '@stackcraftmx/calcita';

// lo que el proyecto le suma a una página (aquí a «no existe»)
const projectExtrasOf = (kind: string) => (kind !== ERROR_PAGE_KIND.notFound ? {} : {
    extraActions: <Button variant="outlined" onClick={() => toastInfo('Se abrió el chat de soporte.')}>Contactar a soporte</Button>,
    children: <Typography variant="body2" color="text.secondary">¿Llegó por una liga? Avísenos y la corregimos.</Typography>,
});

const ErrorPages = () => (
    <Grid container spacing={2}>
        {[ERROR_PAGE_KIND.notFound, ERROR_PAGE_KIND.forbidden, ERROR_PAGE_KIND.serverError, ERROR_PAGE_KIND.newVersion].map((kind) => (
            <Grid key={kind} size={{xs: 12, md: 6}}>
                <Paper variant="outlined" sx={{p: 1}}>
                    <ErrorPage kind={kind} onRetry={kind === ERROR_PAGE_KIND.serverError ? () => window.location.reload() : undefined}
                               {...projectExtrasOf(kind)} />
                </Paper>
            </Grid>
        ))}
    </Grid>
);

export default ErrorPages;
