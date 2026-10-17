// El reporte «Pedidos y ventas por mes»: de las cifras que manda el servidor a la hoja que se ve en pantalla y se
// descarga en Excel o CSV (reportSheetOf del paquete). Pantalla y archivo salen de la misma hoja, así dicen lo mismo.
//
// Los Totales se calculan aquí: las sumas de importes con Money (al centavo) y lo que no es suma (la tasa de cancelación
// y el ticket promedio) se recalcula con los totales, nunca se suma por mes.
//
// Funciones puras, sin React: function (regla de la casa).
import {formatMonthName} from '@stackcraftmx/calcita';
import {VALUE_FORMAT, reportSheetOf} from '@stackcraftmx/calcita/excel';
import {Money} from '@stackcraftmx/calcita/money';

const PERCENT = 100;
// la tasa se escribe con dos decimales: es un porcentaje que se lee, no dinero
const RATE_DECIMALS = 2;

/**
 * Lo cancelado de lo recibido, en porcentaje con dos decimales; null si no hubo pedidos (no aplica, no es 0 %).
 *
 * @param {number} canceled
 * @param {number} received
 * @returns {number|null}
 */
function cancellationRateOf(canceled, received) {
    if (received === 0) {
        return null;
    }
    return Number(((canceled * PERCENT) / received).toFixed(RATE_DECIMALS));
}

/**
 * Lo vendido entre los pedidos vendidos, al centavo; null si no se vendió nada.
 *
 * @param {Money} soldAmount
 * @param {number} soldOrders
 * @returns {string|null}
 */
function averageTicketOf(soldAmount, soldOrders) {
    if (soldOrders === 0) {
        return null;
    }
    return soldAmount.dividedBy(soldOrders).amount();
}

/**
 * La hoja del reporte, con los textos en el idioma activo.
 *
 * @param {{months: Array<{month: string, received: number, delivered: number, canceled: number, sold_amount: string}>, currency: string}} metrics
 *     lo que manda el servidor (getOrderMetrics)
 * @param {(key: string, values?: object) => string} t el traductor del namespace reports
 * @returns {object} la hoja de reportSheetOf
 */
export function monthlyReportSheetOf(metrics, t) {
    const {months, currency} = metrics;
    const moneyOf = (amount) => Money.fromString(amount, {currency});
    const soldOrdersOf = (figures) => figures.received - figures.canceled;

    // los Totales de todo el periodo
    const totals = months.reduce((sum, figures) => ({
        received: sum.received + figures.received,
        delivered: sum.delivered + figures.delivered,
        canceled: sum.canceled + figures.canceled,
        soldAmount: sum.soldAmount.plus(moneyOf(figures.sold_amount)),
    }), {received: 0, delivered: 0, canceled: 0, soldAmount: Money.zero({currency})});

    const periodLabels = months.map(({month}) => {
        const [year, monthNumber] = month.split('-').map(Number);
        return formatMonthName(year, monthNumber, {style: 'short', capitalize: true});
    });

    return reportSheetOf({
        conceptLabel: t('sheet.concept'),
        howColumnLabel: t('sheet.how'),
        periodLabels,
        totalsLabel: t('sheet.totals'),
        dataLabels: {section: t('sheet.section'), period: t('sheet.period')},
        sections: [
            {
                label: t('sheet.ordersSection'),
                rows: [
                    {
                        label: t('sheet.received'), howLabel: t('sheet.howSum'), format: VALUE_FORMAT.count,
                        values: [...months.map((figures) => figures.received), totals.received],
                    },
                    {
                        label: t('sheet.delivered'), howLabel: t('sheet.howSum'), format: VALUE_FORMAT.count,
                        values: [...months.map((figures) => figures.delivered), totals.delivered],
                    },
                    {
                        label: t('sheet.canceled'), howLabel: t('sheet.howSum'), format: VALUE_FORMAT.count,
                        values: [...months.map((figures) => figures.canceled), totals.canceled],
                    },
                    {
                        label: t('sheet.cancellationRate'), howLabel: t('sheet.howRecalculated'), format: VALUE_FORMAT.percent, isTotal: true,
                        values: [
                            ...months.map((figures) => cancellationRateOf(figures.canceled, figures.received)),
                            cancellationRateOf(totals.canceled, totals.received),
                        ],
                    },
                ],
            },
            {
                label: t('sheet.salesSection'),
                rows: [
                    {
                        label: t('sheet.soldAmount'), howLabel: t('sheet.howSum'), format: VALUE_FORMAT.money,
                        values: [...months.map((figures) => moneyOf(figures.sold_amount).amount()), totals.soldAmount.amount()],
                    },
                    {
                        label: t('sheet.averageTicket'), howLabel: t('sheet.howRecalculated'), format: VALUE_FORMAT.money, isTotal: true,
                        values: [
                            ...months.map((figures) => averageTicketOf(moneyOf(figures.sold_amount), soldOrdersOf(figures))),
                            averageTicketOf(totals.soldAmount, totals.received - totals.canceled),
                        ],
                    },
                ],
            },
        ],
    });
}
