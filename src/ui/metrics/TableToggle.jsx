// "Ver como tabla": toda gráfica tiene su versión en tabla, para quien no distingue el color, usa lector de pantalla o
// quiere copiar los números.
//
// Los textos salen de i18n.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

/**
 * @param {{asTable: boolean, onToggle: () => void, texts?: object}} props texts: los textos que cambian, con la forma de
 *     `common` ({charts: {viewAsTable, viewAsChart}})
 */
export default function TableToggle({asTable, onToggle, texts}) {
    const {t} = useToolkitTranslation('common', texts);

    return (
        <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 1}}>
            <Button size="small" onClick={onToggle} sx={{textTransform: 'none'}}>
                {asTable ? t('charts.viewAsChart') : t('charts.viewAsTable')}
            </Button>
        </Box>
    );
}
