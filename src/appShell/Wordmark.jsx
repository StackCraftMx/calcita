// El logo ancho de la app (la marca con su nombre en una sola imagen, como el de muchas empresas) en la barra y arriba del
// menú del teléfono: a 24 px de alto y lo ancho que pida, sin deformarse. Una imagen o un svg sueltos toman ese alto solos.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';

// el alto del logo ancho: el de la letra del nombre con su renglón, para que la barra no crezca
const WORDMARK_HEIGHT_PIXELS = 24;

/**
 * @param {{children: import('react').ReactNode}} props el logo (una <img>, un <svg> o lo que pinte el proyecto)
 */
export default function Wordmark({children}) {
    return (
        <Box sx={{height: WORDMARK_HEIGHT_PIXELS, display: 'flex', alignItems: 'center', flex: '0 0 auto', '& > img, & > svg': {height: '100%', width: 'auto', display: 'block'}}}>
            {children}
        </Box>
    );
}
