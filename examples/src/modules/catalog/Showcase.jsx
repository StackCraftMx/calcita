// Las piezas de las páginas del catálogo: una sección por componente (su nombre, para qué sirve y sus variantes) y cada
// variante con su nombre en palabras y, debajo, cómo se pide en el código (lo que se copia).
//
// Lo renderiza la app: arrow (regla de la casa).
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {SectionCard} from '@stackcraftmx/calcita';

/**
 * Una sección del catálogo: el componente, una línea de para qué sirve y sus variantes lado a lado.
 *
 * @param {object} props
 * @param {string} props.title ya traducido
 * @param {string} [props.description] ya traducido
 * @param {import('react').ReactNode} props.children las variantes (Specimen)
 */
export const ShowcaseSection = ({title, description, children}) => (
    <SectionCard title={title}>
        {description && <Typography variant="body2" color="text.secondary" sx={{mb: 2.5}}>{description}</Typography>}
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start'}}>{children}</Box>
    </SectionCard>
);

/**
 * Una variante: la pieza (o varias del mismo tipo) y debajo su nombre y su código.
 *
 * @param {object} props
 * @param {string} props.label el nombre en palabras, ya traducido
 * @param {string} [props.code] cómo se pide (p. ej. 'variant="outlined"'); va tal cual, no se traduce
 * @param {boolean} [props.wide] ocupa todo el renglón (una tabla, un grupo largo)
 * @param {import('react').ReactNode} props.children
 */
export const Specimen = ({label, code, wide = false, children}) => (
    <Stack spacing={1} sx={{minWidth: 0, maxWidth: '100%', ...(wide && {width: '100%'})}}>
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center'}}>{children}</Box>
        <Box>
            <Typography variant="caption" component="p" sx={{fontWeight: 600}}>{label}</Typography>
            {code && (
                <Typography variant="caption" component="code" color="text.secondary" sx={{fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'}}>
                    {code}
                </Typography>
            )}
        </Box>
    </Stack>
);
