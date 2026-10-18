// Instalar la app (PWA, sin modo sin conexión): InstallAppSetting es el renglón «Instalar la app» del menú de la cuenta (en
// Chrome abre el aviso del navegador; en iPhone, iPad y Firefox de Android enseña los pasos de su equipo) y
// InstallPromptBanner la invitación de abajo al centro, que sale una vez y se puede descartar. Ya instalada, no sale nada.
import Paper from '@mui/material/Paper';
import {InstallAppSetting} from '@stackcraftmx/calcita';

const InstallDemo = () => (
    <Paper variant="outlined" sx={{p: 1, maxWidth: 420}}>
        <InstallAppSetting />
    </Paper>
);

export default InstallDemo;
