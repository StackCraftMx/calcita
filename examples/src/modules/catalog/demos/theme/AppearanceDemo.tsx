// La apariencia que elige cada persona: tamaño de letra, idioma y claro u oscuro (AppearanceSettings, lo mismo que el
// menú de la cuenta), y GlassPanel: una superficie de vidrio propia que respeta «reducir transparencia» del sistema.
// Cambiarlo aquí cambia toda la app, y se recuerda en este navegador.
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {AppearanceSettings, GlassPanel} from '@stackcraftmx/calcita';

const AppearanceDemo = () => (
    <Stack spacing={2} sx={{maxWidth: 560}}>
        <AppearanceSettings />
        <GlassPanel sx={{p: 2}}>
            <Typography variant="subtitle2">GlassPanel</Typography>
            <Typography variant="body2" color="text.secondary">Vidrio para lo que flota sobre el contenido (con el tema de vidrio).</Typography>
        </GlassPanel>
    </Stack>
);

export default AppearanceDemo;
