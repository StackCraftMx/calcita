// Qué decir cuando la tabla no tiene filas.
//
// Son dos situaciones distintas y confundirlas hace daño:
//   - sin filtros puestos, la lista vacía es el RESULTADO y se dice tal cual (label);
//   - con filtros puestos, la lista vacía NO dice nada del conjunto: dice que lo filtrado no existe dentro de él. Ahí
//     sí hay algo que hacer, y el botón lo hace.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

/**
 * @param {object} [props]
 * @param {boolean} [props.filtered]
 * @param {string} [props.label] ya traducido
 * @param {() => void} [props.onClearFilters]
 * @param {object} [props.texts] los textos que cambian, con la forma de `table` en los textos del paquete
 */
export default function EmptyState({filtered = false, label, onClearFilters, texts}) {
    const {t} = useToolkitTranslation('table', texts);
    const Icon = filtered ? FilterListOffIcon : InboxOutlinedIcon;

    return (
        <Stack spacing={1} sx={{height: '100%', px: 3, textAlign: 'center', alignItems: 'center', justifyContent: 'center'}}>
            <Box sx={{color: 'text.disabled', display: 'flex'}}>
                <Icon fontSize="large" />
            </Box>
            <Typography variant="body2" color="text.secondary">
                {filtered ? t('empty.filtered') : (label ?? t('empty.default'))}
            </Typography>
            {filtered && onClearFilters && (
                <Button size="small" onClick={onClearFilters}>{t('empty.clearFilters')}</Button>
            )}
        </Stack>
    );
}
