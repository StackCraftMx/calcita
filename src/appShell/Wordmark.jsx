// El logo ancho de la app (la marca con su nombre en una sola imagen, como el de muchas empresas) en la barra y arriba del
// menú del teléfono: a 24 px de alto y lo ancho que pida, sin deformarse. Una imagen o un svg toman ese alto solos.
//
// Con una imagen para cada modo ({light: <img …/>, dark: <img …/>}: el de color en claro y el blanco en oscuro) se pintan
// las dos y el modo decide cuál se ve, sin parpadeo al cambiar ni al cargar.
//
// OJO, trampa pagada (la prueba en un sistema que ya existía): la regla de la imagen («height 100 %, display block») iba
// como «& > img» y le ganaba al sx de la imagen del proyecto; quien escondía una de sus dos imágenes con CSS no podía. Ahora
// va con :where(), que no suma peso: lo que el proyecto le ponga a su imagen gana.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaWordmark con defaultProps y
// styleOverrides de sus partes: root y mode (la imagen de cada modo).
//
// Genérico del paquete: function (regla de la casa).
import {isValidElement} from 'react';
import Box from '@mui/material/Box';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaWordmark)
const THEME_NAME = 'CalcitaWordmark';
const WordmarkRoot = piecePart(THEME_NAME, 'Root', Box);
const WordmarkMode = piecePart(THEME_NAME, 'Mode', 'span');

// el alto del logo ancho: el de la letra del nombre con su renglón, para que la barra no crezca
const WORDMARK_HEIGHT_PIXELS = 24;

/**
 * ¿Llegó una imagen para cada modo ({light, dark}) y no un logo solo?
 *
 * @param {unknown} wordmark
 * @returns {boolean}
 */
export function isWordmarkPair(wordmark) {
    return wordmark !== null && typeof wordmark === 'object' && !isValidElement(wordmark) && !Array.isArray(wordmark)
        && ('light' in wordmark || 'dark' in wordmark);
}

/**
 * @param {object} props
 * @param {import('react').ReactNode | {light?: import('react').ReactNode, dark?: import('react').ReactNode}} props.children el
 *     logo (una <img>, un <svg> o lo que pinte el proyecto) o uno para cada modo: {light, dark}
 */
export default function Wordmark(props) {
    // lo que el proyecto puso en su tema (components.CalcitaWordmark.defaultProps) y encima lo que llega aquí
    const {children} = usePieceProps(props, THEME_NAME);
    return (
        <WordmarkRoot ownSx={{
            height: WORDMARK_HEIGHT_PIXELS, display: 'flex', alignItems: 'center', flex: '0 0 auto',
            '& :where(img, svg)': {height: '100%', width: 'auto', display: 'block'},
        }}>
            {isWordmarkPair(children) ? (
                <>
                    {/* las dos se pintan y el modo decide cuál se ve: display contents deja a la imagen tomar el alto */}
                    <WordmarkMode ownSx={(theme) => ({display: 'contents', ...theme.applyStyles('dark', {display: 'none'})})}>{children.light ?? children.dark}</WordmarkMode>
                    <WordmarkMode ownSx={(theme) => ({display: 'none', ...theme.applyStyles('dark', {display: 'contents'})})}>{children.dark ?? children.light}</WordmarkMode>
                </>
            ) : children}
        </WordmarkRoot>
    );
}
