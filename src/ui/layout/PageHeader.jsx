// Encabezado centrado de una pantalla: eyebrow en versalitas, título, subtítulo y una acción en píldora
// (p. ej. VENTAS · MÓDULO 1 / Pedidos del mes / ... / Nuevo pedido).
//
// También pone el título de la pestaña (DocumentTitle) y, dentro de AppLayout, sube el título a la barra al deslizar.
// Para una pantalla de trabajo (lista, formulario) se ve mejor PageHeading, el de las plantillas de MUI.
//
// Genérico del paquete: function (regla de la casa).
import {useRef} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {useRegisterPageTitle} from '@/appShell/pageTitle.jsx';
import DocumentTitle from '@/ui/navigation/DocumentTitle.jsx';

/**
 * @param {object} props
 * @param {string} props.title texto ya traducido
 * @param {string} [props.eyebrow]
 * @param {import('react').ReactNode} [props.subtitle]
 * @param {import('react').ReactNode} [props.action] normalmente un <Button variant="contained" shape="pill">
 * @param {string} [props.documentTitle] título de la pestaña si difiere del visible
 */
export default function PageHeader({title, eyebrow, subtitle, action, documentTitle}) {
    const titleRef = useRef(null);
    useRegisterPageTitle(title, titleRef);
    return (
        <Stack component="header" spacing={1.25} sx={{alignItems: 'center', textAlign: 'center', py: {xs: 3, md: 4}}}>
            <DocumentTitle title={documentTitle ?? title} />
            {/* text.secondary y no text.disabled: el eyebrow se lee, WCAG no lo exime (disabled daba 2.57:1 sobre el lienzo) */}
            {eyebrow && (
                <Typography variant="overline" color="text.secondary">{eyebrow}</Typography>
            )}
            <Typography ref={titleRef} variant="h4" component="h1">{title}</Typography>
            {subtitle && (
                <Typography variant="body1" color="text.secondary" sx={{maxWidth: 640}}>{subtitle}</Typography>
            )}
            {action && <Box sx={{pt: 1.5}}>{action}</Box>}
        </Stack>
    );
}
