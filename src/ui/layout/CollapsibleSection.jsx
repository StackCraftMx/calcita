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
// Genérico del paquete: function (regla de la casa). No sabe de negocio: sus textos llegan ya traducidos.
import {useState} from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
 * @param {import('react').ReactNode} props.children
 */
export default function CollapsibleSection({collapsedTitle, expandedTitle, hint = '', defaultExpanded = false, children}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <Box sx={{minWidth: 0}}>
            <Accordion expanded={isExpanded} onChange={(changeEvent, nextIsExpanded) => setIsExpanded(nextIsExpanded)}
                       disableGutters elevation={0} square sx={{bgcolor: 'transparent', '&::before': {display: 'none'}}}>
                {/* NOTA: el acordeón ya envuelve este renglón en un encabezado (h3); los textos van como span para no anidar dos */}
                <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />} sx={HEADER_SX}>
                    <Box sx={{minWidth: 0}}>
                        <Typography variant="subtitle2" component="span" color="primary" sx={{display: 'block'}}>
                            {isExpanded ? expandedTitle : collapsedTitle}
                        </Typography>
                        {!isExpanded && hint && (
                            <Typography variant="caption" component="span" color="text.secondary" sx={{display: 'block'}}>{hint}</Typography>
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{p: 0, pt: 2}}>{children}</AccordionDetails>
            </Accordion>
        </Box>
    );
}
