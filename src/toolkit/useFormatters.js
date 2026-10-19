// Los formatos de fecha, hora, número, moneda y tamaño de archivo con la configuración del ToolkitProvider MÁS CERCANO.
//
// Es lo que usan los componentes del paquete, y lo que conviene en los del proyecto: con dos proveedores (una parte de la app
// en otro idioma, o dos islas de React en una página que no es de React) cada parte escribe con el suyo. Los formatos sueltos
// (formatDate…) usan el de la raíz: sirven para lo que no es componente.
//
//   const {formatDate, formatCurrency} = useFormatters();
//   <Typography>{formatDate(order.created_at)} · {formatCurrency(order.total)}</Typography>
//
// Hook genérico: function (regla de la casa).
import {useMemo} from 'react';

import {formattersOf} from '@/formatting.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';

/**
 * @returns {ReturnType<typeof formattersOf>} formatNumber, formatList, formatCurrency, formatFileSize, formatPercent,
 *     formatDateTime, formatDate, formatTime, formatMonthName, formatMonthShortName y formatWeekdayShortName
 */
export function useFormatters() {
    const settings = useToolkitSettings();
    return useMemo(() => formattersOf(() => settings), [settings]);
}
