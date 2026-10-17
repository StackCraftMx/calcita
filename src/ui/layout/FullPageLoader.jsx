// Indicador de carga a pantalla completa, mientras se sabe si hay sesión.
// Sin él, el formulario de login parpadea medio segundo antes de que aparezca la pantalla de quien ya entró.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function FullPageLoader() {
    const {t} = useToolkitTranslation('common');

    return (
        <Box role="status" aria-live="polite" sx={{display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: 'background.default'}}>
            <CircularProgress aria-label={t('status.loading')} />
        </Box>
    );
}
