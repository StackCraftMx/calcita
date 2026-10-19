// Tarjeta de una sección de una página de detalle: título en versalitas, una acción opcional a la derecha y el contenido.
//
// Por qué una tarjeta por sección y no una sola hoja larga con divisiones: en pantalla ancha las secciones se acomodan en
// columnas (lo principal a la izquierda, los datos de apoyo a la derecha) y cada una se encuentra por su título.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSectionCard con defaultProps y
// styleOverrides de sus partes: root, header, title.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: el título y el contenido llegan ya traducidos.
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaSectionCard)
const THEME_NAME = 'CalcitaSectionCard';
const SectionRoot = piecePart(THEME_NAME, 'Root', Paper);
const SectionHeader = piecePart(THEME_NAME, 'Header', Box);
const SectionTitle = piecePart(THEME_NAME, 'Title', Typography);

/**
 * @param {object} props
 * @param {string} props.title texto ya traducido
 * @param {import('react').ReactNode} [props.action] botón o liga a la derecha del título
 * @param {import('react').ReactNode} props.children
 */
export default function SectionCard(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSectionCard.defaultProps) y encima lo que llega aquí
    const {title, action, children} = usePieceProps(props, THEME_NAME);
    return (
        <SectionRoot component="section" variant="outlined" ownSx={{p: {xs: 2, md: 2.5}, minWidth: 0}}>
            <SectionHeader ownSx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5}}>
                <SectionTitle variant="overline" color="text.secondary" component="h2" ownSx={{lineHeight: 1.6}}>{title}</SectionTitle>
                {action}
            </SectionHeader>
            {children}
        </SectionRoot>
    );
}
