// Los diccionarios: un código del API ('pending') → su texto en el idioma activo, su explicación (al pasar el cursor) y su
// color. Se escriben UNA vez por catálogo (no en cada componente) y el color es información: verde lo que terminó bien,
// ámbar lo que espera, rojo lo que no siguió. Un código que el diccionario no conoce se pinta tal cual, en gris.
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {DictionaryText, StatusChip, Tag, dictionaryEntryOf, labelOf, lookup, useToolkitTranslation} from '@stackcraftmx/calcita';

// 1. El diccionario, UNA vez por catálogo: cada código del API con dónde están sus textos y su color. Los textos van en el
//    namespace dictionaries: orderStatus.pending.label, .shortLabel y .tooltip (sección 2, su archivo)
export const ORDER_STATUS = {
    pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning', {hasShortLabel: true}),
    paid: dictionaryEntryOf('paid', 'orderStatus.paid', 'default'),
    shipped: dictionaryEntryOf('shipped', 'orderStatus.shipped', 'info'),
    delivered: dictionaryEntryOf('delivered', 'orderStatus.delivered', 'success'),
    canceled: dictionaryEntryOf('canceled', 'orderStatus.canceled', 'error'),
};

const OrderStatusDictionary = () => {
    const {t} = useToolkitTranslation();
    // 2. Pintarlo: como punto, como etiqueta, dentro de una frase o como texto para un Excel
    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap'}}>
                {Object.keys(ORDER_STATUS).map((status) => <StatusChip key={status} dictionary={ORDER_STATUS} value={status} />)}
                <StatusChip dictionary={ORDER_STATUS} value="returned" />
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}}>
                {Object.keys(ORDER_STATUS).map((status) => <StatusChip key={status} dictionary={ORDER_STATUS} value={status} variant="chip" />)}
                <StatusChip dictionary={ORDER_STATUS} value="pending" variant="chip" short suffix="13" />
            </Stack>
            <Typography variant="body2">
                En un texto: <DictionaryText dictionary={ORDER_STATUS} value="shipped" />. En código (un Excel, un correo):{' '}
                «{labelOf(lookup(ORDER_STATUS, 'delivered'), t)}».
            </Typography>
            <Stack direction="row" spacing={1}>
                <Tag label="Mayoreo" color="info" tooltip="Compra por caja, con precio de mayoreo" />
                <Tag label="Menudeo" tooltip="Compra por pieza" variant="outlined" />
            </Stack>
        </Stack>
    );
};

export default OrderStatusDictionary;
