// Los formatos: cada número, fecha y tamaño se pinta en el idioma y la zona del producto (ToolkitProvider: timeZone y
// currency), sin armar textos a mano. Un instante (con hora, en UTC) se pinta en la zona del producto; un día del calendario
// («2026-10-17», sin hora) se pinta tal cual, sin moverlo de zona. Un valor vacío sale como «—», nunca como 0.
import {
    DefinitionList, HOUR_CYCLE, ToolkitProvider, formatCurrency, formatDate, formatDateTime, formatFileSize, formatList, formatMonthName, formatNumber,
    formatPercent, formatTime, useFormatters,
} from '@stackcraftmx/calcita';

// La hora de 12 horas: con hourCycle en ToolkitProvider (aquí uno de adentro, solo para esta parte; en la app va en el de la
// raíz). Dentro, useFormatters() escribe con el proveedor más cercano.
const TwelveHourTime = () => {
    const {formatDateTime: formatWithTwelveHours} = useFormatters();
    return <>{formatWithTwelveHours('2026-10-17T18:00:00Z')}</>;
};

const FormatsDemo = () => (
    <DefinitionList entries={[
        {label: 'formatCurrency(2899.88)', value: formatCurrency(2899.88)},
        {label: 'formatNumber(1382)', value: formatNumber(1382)},
        {label: 'formatPercent(13.5)', value: formatPercent(13.5)},
        {label: 'formatPercent(0.135, {isRatio: true})', value: formatPercent(0.135, {isRatio: true})},
        {label: "formatDateTime('2026-10-17T18:00:00Z')", value: formatDateTime('2026-10-17T18:00:00Z')},
        {label: "formatTime('2026-10-17T18:00:00Z')", value: formatTime('2026-10-17T18:00:00Z')},
        {
            label: 'hourCycle={HOUR_CYCLE.twelveHours}',
            value: <ToolkitProvider hourCycle={HOUR_CYCLE.twelveHours}><TwelveHourTime /></ToolkitProvider>,
        },
        {label: "formatDate('2026-10-17')", value: formatDate('2026-10-17')},
        {label: 'formatMonthName(2026, 10, {capitalize: true})', value: formatMonthName(2026, 10, {capitalize: true})},
        {label: 'formatFileSize(2_400_000)', value: formatFileSize(2_400_000)},
        {label: "formatList(['Ana', 'Luis', 'Bruno'])", value: formatList(['Ana', 'Luis', 'Bruno'])},
        {label: 'formatNumber(null)', value: formatNumber(null)},
    ]} />
);

export default FormatsDemo;
