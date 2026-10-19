// Sección que se pliega: un encabezado que se toca y, debajo, el contenido, que se abre y se cierra.
//
// Para qué: en una página de detalle las cifras quedan a la vista y lo demás se guarda aquí; quien quiere más, lo abre.
//
// El encabezado se ve como lo que es, un botón a todo lo ancho: recuadro, la flecha ADELANTE del texto y otro fondo al pasar
// el cursor. Su texto dice lo que va a pasar al tocarlo («Ver el detalle…» plegada, «Ocultar el detalle…» abierta) y,
// plegada, un renglón más chico dice qué hay adentro: así nadie tiene que abrirla para saber si ahí está lo que busca.
// No dice «dé clic»: en el teléfono no hay clic, y un tooltip tampoco se ve ahí.
//
// El contenido va sin fondo ni borde propios: adentro van tarjetas (SectionCard) y un recuadro alrededor se vería como
// tarjeta dentro de tarjeta.
//
// OJO: el acordeón de MUI se quita el margen de arriba cuando está abierto y es el primero de su tipo entre sus hermanos.
// Dentro de un Stack, que separa a sus hijos con margen, eso hacía brincar el encabezado 16 px al abrir y al cerrar. Por eso
// va envuelto en una caja: el margen del Stack cae en la caja y el encabezado se queda quieto.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaCollapsibleSection con defaultProps y
// styleOverrides de sus partes: root, accordion, summary, titleArea, collapsedTitle, expandedTitle, details.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: sus textos llegan ya traducidos.
import {useState} from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaCollapsibleSection)
const THEME_NAME = 'CalcitaCollapsibleSection';
const CollapsibleRoot = piecePart(THEME_NAME, 'Root', Box);
const CollapsibleAccordion = piecePart(THEME_NAME, 'Accordion', Accordion);
const CollapsibleSummary = piecePart(THEME_NAME, 'Summary', AccordionSummary);
const CollapsibleTitleArea = piecePart(THEME_NAME, 'TitleArea', Box);
const CollapsibleCollapsedTitle = piecePart(THEME_NAME, 'CollapsedTitle', Typography);
const CollapsibleExpandedTitle = piecePart(THEME_NAME, 'ExpandedTitle', Typography);
const CollapsibleDetails = piecePart(THEME_NAME, 'Details', AccordionDetails);

// el mismo radio de las tarjetas (theme/components/surfaces.js): el encabezado se lee como una pieza más de la página
const CARD_BORDER_RADIUS_PIXELS = 10;

const HEADER_SX = {
    // la flecha adelante del texto: al final del renglón quedaba lejos de lo que se lee y pasaba inadvertida
    flexDirection: 'row-reverse', gap: 1, px: 1.5, minHeight: 44,
    border: 1, borderColor: 'divider', borderRadius: `${CARD_BORDER_RADIUS_PIXELS}px`, bgcolor: 'background.paper',
    '&:hover': {bgcolor: 'action.hover'},
    '& .MuiAccordionSummary-content': {my: 0.75, minWidth: 0},
};

/**
 * @param {object} props
 * @param {string} props.collapsedTitle lo que dice plegada, ya traducido («Ver el detalle de la validación»)
 * @param {string} props.expandedTitle lo que dice abierta («Ocultar el detalle de la validación»)
 * @param {string} [props.hint] plegada, qué hay adentro («Incluye resumen, motivos de rechazo y descargas.»)
 * @param {boolean} [props.defaultExpanded] si empieza abierta; por omisión empieza plegada
 * @param {(isExpanded: boolean) => void} [props.onExpandedChange] la persona la abrió o la plegó (por ejemplo, para pedir lo de
 *     adentro hasta que se abre)
 * @param {import('react').ReactNode} props.children
 */
export default function CollapsibleSection(props) {
    // lo que el proyecto puso en su tema (components.CalcitaCollapsibleSection.defaultProps) y encima lo que llega aquí
    const {collapsedTitle, expandedTitle, hint = '', defaultExpanded = false, onExpandedChange, children} = usePieceProps(props, THEME_NAME);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const changeExpanded = (nextIsExpanded) => {
        setIsExpanded(nextIsExpanded);
        onExpandedChange?.(nextIsExpanded);
    };

    return (
        <CollapsibleRoot ownSx={{minWidth: 0}}>
            <CollapsibleAccordion expanded={isExpanded} onChange={(changeEvent, nextIsExpanded) => changeExpanded(nextIsExpanded)}
                       disableGutters elevation={0} square ownSx={{bgcolor: 'transparent', '&::before': {display: 'none'}}}>
                {/* NOTA: el acordeón ya envuelve este renglón en un encabezado (h3); los textos van como span para no anidar dos */}
                <CollapsibleSummary expandIcon={<ExpandMoreIcon color="primary" />} ownSx={HEADER_SX}>
                    <CollapsibleTitleArea ownSx={{minWidth: 0}}>
                        <CollapsibleCollapsedTitle variant="subtitle2" component="span" color="primary" ownSx={{display: 'block'}}>
                            {isExpanded ? expandedTitle : collapsedTitle}
                        </CollapsibleCollapsedTitle>
                        {!isExpanded && hint && (
                            <CollapsibleExpandedTitle variant="caption" component="span" color="text.secondary" ownSx={{display: 'block'}}>{hint}</CollapsibleExpandedTitle>
                        )}
                    </CollapsibleTitleArea>
                </CollapsibleSummary>
                <CollapsibleDetails ownSx={{p: 0, pt: 2}}>{children}</CollapsibleDetails>
            </CollapsibleAccordion>
        </CollapsibleRoot>
    );
}
