// Las páginas de error: no existe (404), sin permiso (403), falla del servidor (500, con «Intentar de nuevo») y versión
// nueva publicada (con «Recargar»). Cada una con su ícono, su color y el código chico como referencia técnica.
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import {ERROR_PAGE_KIND, ErrorPage} from '@stackcraftmx/calcita';

const ErrorPages = () => (
    <Grid container spacing={2}>
        {[ERROR_PAGE_KIND.notFound, ERROR_PAGE_KIND.forbidden, ERROR_PAGE_KIND.serverError, ERROR_PAGE_KIND.newVersion].map((kind) => (
            <Grid key={kind} size={{xs: 12, md: 6}}>
                <Paper variant="outlined" sx={{p: 1}}>
                    <ErrorPage kind={kind} onRetry={kind === ERROR_PAGE_KIND.serverError ? () => window.location.reload() : undefined} />
                </Paper>
            </Grid>
        ))}
    </Grid>
);

export default ErrorPages;
