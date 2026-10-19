// Hecho en Calcita · formatos, fechas y dinero: cada número, fecha y tamaño en el idioma y la zona del producto, y Money
// (de /money) para operar importes sin errores de decimales.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import FormatsDemo from '@/modules/catalog/demos/formats/FormatsDemo.tsx';
import MoneyDemo from '@/modules/catalog/demos/formats/MoneyDemo.tsx';

const loadFormats = () => import('@/modules/catalog/demos/formats/FormatsDemo.tsx?demo-source');
const loadMoney = () => import('@/modules/catalog/demos/formats/MoneyDemo.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (formats.<sección>.extend.<id>)
const FORMATS_EXTENSIONS = [
    {id: 'number', option: 'formatNumber', example: 'formatNumber(1382)  // 1,382'},
    {id: 'currency', option: 'formatCurrency', example: "formatCurrency('2899.88')  // $2,899.88"},
    {id: 'percent', option: 'formatPercent', example: 'formatPercent(0.135, {isRatio: true, fractionDigits: 1})'},
    {id: 'dateTime', option: 'formatDateTime · formatTime', example: "formatDateTime(order.createdAt)  // '2026-10-17T18:00:00Z' → 17 oct 2026, 12:00"},
    {id: 'date', option: 'formatDate', example: "formatDate('2026-10-17')"},
    {id: 'month', option: 'formatMonthName · formatMonthShortName', example: "formatMonthName(2026, 10, {style: 'short', capitalize: true})"},
    {id: 'fileSize', option: 'formatFileSize', example: 'formatFileSize(file.size)'},
    {id: 'list', option: 'formatList', example: "formatList(['Ana', 'Luis', 'Bruno'])"},
    {id: 'fallback', option: 'fallback', example: "formatNumber(value, 'Sin dato')"},
    {id: 'settings', option: 'ToolkitProvider timeZone · currency', example: '<ToolkitProvider timeZone="America/Mexico_City" currency="MXN">'},
    {id: 'hook', option: 'useFormatters()', example: 'const {formatDate, formatCurrency} = useFormatters();'},
];
const MONEY_EXTENSIONS = [
    {id: 'read', option: 'Money.fromString · fromNumber · fromMinorUnits · zero', example: 'Money.fromString(order.total)'},
    {id: 'currency', option: '{currency, decimals}', example: "Money.fromString('99.90', {currency: 'USD'})"},
    {id: 'operate', option: 'plus · minus · times · dividedBy', example: "subtotal.plus(shipping).times('0.16')"},
    {id: 'rounding', option: 'rounding', example: 'total.dividedBy(3, {rounding: MONEY_ROUNDING.halfEven})'},
    {id: 'powers', option: 'pow · sqrt', example: "Money.fromString('1.05').pow(12)"},
    {id: 'compare', option: 'equals · isGreaterThan · isZeroOrLess', example: 'if (payment.isGreaterThan(balance)) { … }'},
    {id: 'show', option: 'format()', example: 'total.format()  // $2,899.88'},
    {id: 'send', option: 'toJSON · amount()', example: 'api.post(\'/payments\', {amount: total})  // "2899.88"'},
];

export const FormatsAndMoneyPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `formats.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('formats.title')} description={t('formats.description')} />
            <DemoSection title={t('formats.formats.title')} description={t('formats.formats.description')}
                         extensions={rowsOf('formats', FORMATS_EXTENSIONS)} Demo={FormatsDemo} loadSource={loadFormats} />
            <DemoSection title={t('formats.money.title')} description={t('formats.money.description')}
                         extensions={rowsOf('money', MONEY_EXTENSIONS)} Demo={MoneyDemo} loadSource={loadMoney} />
        </Stack>
    );
};
