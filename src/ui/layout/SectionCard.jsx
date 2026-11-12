// Tarjeta de una sección de una página de detalle: su título, una acción opcional a la derecha del título y el contenido.
//
// Por qué una tarjeta por sección y no una sola hoja larga con divisiones: en pantalla ancha las secciones se acomodan en
// columnas (lo principal a la izquierda, los datos de apoyo a la derecha) y cada una se encuentra por su título.
//
// Dónde va el título (titlePlacement, SECTION_TITLE_PLACEMENT):
//   - inside (por omisión, lo de siempre): adentro de la tarjeta, en versalitas y gris;
//   - outside: ENCIMA de la tarjeta, con el mismo estilo que el título de una FormSection, y la acción a su derecha. Así
//     el nombre de la sección no pesa menos que los datos de adentro, y una sección de datos y una de formulario en la
//     misma pantalla se leen como hermanas. Para toda la app va en el tema:
//     components.CalcitaSectionCard.defaultProps.titlePlacement.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSectionCard con defaultProps y
// styleOverrides de sus partes: root, header, title y, con el título afuera, card. OJO: root es siempre lo de más afuera.
// Con el título adentro es la tarjeta misma; con el título afuera es lo que envuelve al título y a la tarjeta, y la
// tarjeta es card. Lo que el proyecto le pone a root para lo de adentro (los botones del contenido) sigue llegando igual.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: el título y el contenido llegan ya traducidos.
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/** Dónde va el título de la sección: adentro de la tarjeta (inside, lo de siempre) o encima de ella (outside). */
export const SECTION_TITLE_PLACEMENT = Object.freeze({inside: 'inside', outside: 'outside'});

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaSectionCard)
const THEME_NAME = 'CalcitaSectionCard';
const SectionRoot = piecePart(THEME_NAME, 'Root', Paper);
// con el título afuera: root envuelve al encabezado y a la tarjeta, que es su propia parte
const SectionOutsideRoot = piecePart(THEME_NAME, 'Root', Box);
const SectionCardPart = piecePart(THEME_NAME, 'Card', Paper);
const SectionHeader = piecePart(THEME_NAME, 'Header', Box);
const SectionTitle = piecePart(THEME_NAME, 'Title', Typography);

// el relleno de la tarjeta, igual con el título adentro o afuera
const CARD_PADDING = Object.freeze({xs: 2, md: 2.5});

/**
 * @param {object} props
 * @param {string} props.title texto ya traducido
 * @param {import('react').ReactNode} [props.action] botón o liga a la derecha del título
 * @param {'inside'|'outside'} [props.titlePlacement] uno de SECTION_TITLE_PLACEMENT: adentro de la tarjeta (por omisión) o
 *     encima de ella. También desde el tema: components.CalcitaSectionCard.defaultProps
 * @param {import('react').ReactNode} props.children
 */
function SectionCardContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSectionCard.defaultProps) y encima lo que llega aquí
    const {title, action, titlePlacement = SECTION_TITLE_PLACEMENT.inside, children, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    if (!Object.values(SECTION_TITLE_PLACEMENT).includes(titlePlacement)) {
        throw new Error(`SectionCard: titlePlacement «${titlePlacement}» no existe; use uno de SECTION_TITLE_PLACEMENT (${Object.values(SECTION_TITLE_PLACEMENT).join(', ')}).`);
    }

    if (titlePlacement === SECTION_TITLE_PLACEMENT.outside) {
        // el título como el de una FormSection: arriba de la tarjeta, alineado con el texto de adentro
        return (
            <SectionOutsideRoot component="section" ownSx={{minWidth: 0}}>
                <SectionHeader ownSx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75}}>
                    <SectionTitle variant="subtitle2" color="text.secondary" component="h2" ownSx={{px: 2, fontWeight: 600}}>{title}</SectionTitle>
                    {action}
                </SectionHeader>
                <SectionCardPart variant="outlined" ownSx={{p: CARD_PADDING, minWidth: 0}}>
                    {children}
                </SectionCardPart>
            </SectionOutsideRoot>
        );
    }

    return (
        <SectionRoot component="section" variant="outlined" ownSx={{p: CARD_PADDING, minWidth: 0}}>
            <SectionHeader ownSx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5}}>
                <SectionTitle variant="overline" color="text.secondary" component="h2" ownSx={{lineHeight: 1.6}}>{title}</SectionTitle>
                {action}
            </SectionHeader>
            {children}
        </SectionRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const SectionCard = withPieceSlots(SectionCardContent, THEME_NAME);
export default SectionCard;
