// Tarjeta de una sección de una página de detalle: título en versalitas, una acción opcional a la derecha y el contenido.
//
// Por qué una tarjeta por sección y no una sola hoja larga con divisiones: en pantalla ancha las secciones se acomodan en
// columnas (lo principal a la izquierda, los datos de apoyo a la derecha) y cada una se encuentra por su título.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: el título y el contenido llegan ya traducidos.
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * @param {object} props
 * @param {string} props.title texto ya traducido
 * @param {import('react').ReactNode} [props.action] botón o liga a la derecha del título
 * @param {import('react').ReactNode} props.children
 */
export default function SectionCard({title, action, children}) {
    return (
        <Paper component="section" variant="outlined" sx={{p: {xs: 2, md: 2.5}, minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5}}>
                <Typography variant="overline" color="text.secondary" component="h2" sx={{lineHeight: 1.6}}>{title}</Typography>
                {action}
            </Box>
            {children}
        </Paper>
    );
}
