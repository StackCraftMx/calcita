// Encabezado de una página de detalle (un solo registro: un pedido, un usuario...): eyebrow con el contexto, el título
// que dice QUÉ registro es, sus insignias a un lado del título (estatus, intento...) y las acciones a la derecha.
//
// Por qué aparte de PageHeader: ese es el encabezado centrado de un listado. En un detalle lo primero que se lee es qué
// registro se está viendo y en qué estado está; por eso el título y sus insignias van juntos, arriba a la izquierda.
//
// También pone el título de la pestaña (DocumentTitle) y, dentro de AppLayout, sube el título a la barra al deslizar.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: todo llega por props, ya traducido.
import {useRef} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {useRegisterPageTitle} from '@/appShell/pageTitle.jsx';
import DocumentTitle from '@/ui/navigation/DocumentTitle.jsx';

/**
 * @param {object} props
 * @param {string} props.title texto ya traducido
 * @param {string} [props.eyebrow] contexto arriba del título (p. ej. el producto)
 * @param {import('react').ReactNode} [props.badges] insignias junto al título (chips de estatus, intento...)
 * @param {import('react').ReactNode} [props.actions] botones a la derecha
 * @param {string} [props.documentTitle] título de la pestaña si difiere del visible
 */
export default function DetailHeader({title, eyebrow, badges, actions, documentTitle}) {
    const titleRef = useRef(null);
    useRegisterPageTitle(title, titleRef);
    return (
        <Box component="header" sx={{display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 2.5}}>
            <DocumentTitle title={documentTitle ?? title} />
            <Box sx={{minWidth: 0}}>
                {/* el contexto se lee de un vistazo (en overline se veía
                    muy chico); text.secondary y no text.disabled: se lee (WCAG no lo exime) */}
                {eyebrow && <Typography variant="subtitle1" color="text.secondary" component="p" sx={{fontWeight: 700}}>{eyebrow}</Typography>}
                <Stack direction="row" spacing={1.5} useFlexGap sx={{alignItems: 'center', flexWrap: 'wrap'}}>
                    <Typography ref={titleRef} variant="h5" component="h1">{title}</Typography>
                    {badges}
                </Stack>
            </Box>
            {actions && <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}}>{actions}</Stack>}
        </Box>
    );
}
