// El logo de la app (public/favicon.svg) en la barra y en las pantallas de entrar: cámbielo por el suyo aquí, en un solo
// lugar.
//
// Genérico, sin estado: function (regla de la casa).
import Box from '@mui/material/Box';

// el tamaño que piden la barra y la tarjeta de entrar
const LOGO_SIZE_PIXELS = 28;

export function AppLogo() {
    return <Box component="img" src="/favicon.svg" alt="" sx={{width: LOGO_SIZE_PIXELS, height: LOGO_SIZE_PIXELS}} />;
}
