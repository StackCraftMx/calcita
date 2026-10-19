// El logo ancho de la app (la marca con su nombre en una sola imagen, como el de muchas empresas) en la barra y arriba del
// menú del teléfono: a 24 px de alto y lo ancho que pida, sin deformarse. Una imagen o un svg sueltos toman ese alto solos.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaWordmark con defaultProps y
// styleOverrides de sus partes: root.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaWordmark)
const THEME_NAME = 'CalcitaWordmark';
const WordmarkRoot = piecePart(THEME_NAME, 'Root', Box);

// el alto del logo ancho: el de la letra del nombre con su renglón, para que la barra no crezca
const WORDMARK_HEIGHT_PIXELS = 24;

/**
 * @param {{children: import('react').ReactNode}} props el logo (una <img>, un <svg> o lo que pinte el proyecto)
 */
export default function Wordmark(props) {
    // lo que el proyecto puso en su tema (components.CalcitaWordmark.defaultProps) y encima lo que llega aquí
    const {children} = usePieceProps(props, THEME_NAME);
    return (
        <WordmarkRoot ownSx={{height: WORDMARK_HEIGHT_PIXELS, display: 'flex', alignItems: 'center', flex: '0 0 auto', '& > img, & > svg': {height: '100%', width: 'auto', display: 'block'}}}>
            {children}
        </WordmarkRoot>
    );
}
