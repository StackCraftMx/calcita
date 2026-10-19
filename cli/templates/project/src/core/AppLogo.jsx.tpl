// El logo de la app (public/favicon.svg) en la barra y en las pantallas de entrar: cámbielo por el suyo aquí, en un solo
// lugar.
//
// Genérico, sin estado: function (regla de la casa).
import Box from '@mui/material/Box';

import {publicUrlOf} from '@/core/publicPaths.js';

// el tamaño que piden la barra y la tarjeta de entrar
const LOGO_SIZE_PIXELS = 28;

export function AppLogo() {
    return <Box component="img" src={publicUrlOf('favicon.svg')} alt="" sx={{width: LOGO_SIZE_PIXELS, height: LOGO_SIZE_PIXELS}} />;
}
