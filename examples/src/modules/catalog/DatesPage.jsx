// Hecho en Calcita · fechas y horas: la fecha, la fecha con hora (un instante en UTC, rotulado con su zona), la hora del día
// y el mes, sueltos y en un formulario de formik o de react-hook-form; y la cuenta regresiva hasta un momento.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import DateField from '@/modules/catalog/demos/dates/DateField.tsx';
import DateTimeField from '@/modules/catalog/demos/dates/DateTimeField.tsx';
import FormikDates from '@/modules/catalog/demos/dates/FormikDates.tsx';
import HookFormDates from '@/modules/catalog/demos/dates/HookFormDates.tsx';
import MonthField from '@/modules/catalog/demos/dates/MonthField.tsx';
import PublishWindow from '@/modules/catalog/demos/dates/PublishWindow.tsx';
import TimeField from '@/modules/catalog/demos/dates/TimeField.tsx';
import CountdownField from '@/modules/catalog/demos/dates/CountdownField.tsx';

const loadDate = () => import('@/modules/catalog/demos/dates/DateField.tsx?demo-source');
const loadDateTime = () => import('@/modules/catalog/demos/dates/DateTimeField.tsx?demo-source');
const loadTime = () => import('@/modules/catalog/demos/dates/TimeField.tsx?demo-source');
const loadMonth = () => import('@/modules/catalog/demos/dates/MonthField.tsx?demo-source');
const loadFormik = () => import('@/modules/catalog/demos/dates/FormikDates.tsx?demo-source');
const loadHookForm = () => import('@/modules/catalog/demos/dates/HookFormDates.tsx?demo-source');
const loadPublishWindow = () => import('@/modules/catalog/demos/dates/PublishWindow.tsx?demo-source');
const loadCountdown = () => import('@/modules/catalog/demos/dates/CountdownField.tsx?demo-source');

// lo que aceptan los cuatro campos por igual
const SHARED_EXTENSIONS = [
    {id: 'helperText', option: 'helperText · error', example: 'helperText="La de su identificación" error={errors.birthDate}'},
    {id: 'pickerProps', option: 'pickerProps', example: 'pickerProps={{shouldDisableDate: (day) => day.day() === 0}}'},
    {id: 'calendarTexts', option: 'pickerProps.localeText', example: "pickerProps={{localeText: {cancelButtonLabel: 'Cerrar'}}}"},
];

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogPageTexts
// (dates.<sección>.extend.<id>)
const DATE_EXTENSIONS = [
    {id: 'limits', option: 'minDate · maxDate · disableFuture · disablePast', example: 'minDate="2026-01-01" disablePast'},
    {id: 'openTo', option: 'openTo', example: 'openTo="year"  // un nacimiento'},
    ...SHARED_EXTENSIONS,
];
const DATE_TIME_EXTENSIONS = [
    {id: 'limits', option: 'minDateTime · maxDateTime · disableFuture · disablePast', example: 'minDateTime={order.created_at} disablePast'},
    {id: 'minutesStep', option: 'minutesStep', example: 'minutesStep={15}  // por omisión, de uno en uno'},
    {id: 'timeZone', option: 'timeZone', example: 'timeZone={branch.time_zone}  // America/Tijuana'},
    {id: 'zoneLabel', option: 'showTimeZone · timeZoneLabel', example: 'timeZoneLabel="Hora de la sucursal"'},
    {id: 'hourCycle', option: 'ToolkitProvider hourCycle', example: '<ToolkitProvider hourCycle={HOUR_CYCLE.twelveHours}>'},
    ...SHARED_EXTENSIONS,
];
const TIME_EXTENSIONS = [
    {id: 'limits', option: 'minTime · maxTime', example: 'minTime={opensAt} maxTime="22:00"'},
    {id: 'minutesStep', option: 'minutesStep', example: 'minutesStep={30}  // por omisión, de uno en uno'},
    {id: 'hourCycle', option: 'ToolkitProvider hourCycle', example: '<ToolkitProvider hourCycle={HOUR_CYCLE.twelveHours}>'},
    ...SHARED_EXTENSIONS,
];
const MONTH_EXTENSIONS = [
    {id: 'limits', option: 'minMonth · maxMonth · disableFuture · disablePast', example: 'minMonth="2025-01" disableFuture'},
    ...SHARED_EXTENSIONS,
];
const FORMIK_EXTENSIONS = [
    {id: 'fields', option: 'FormDateField · FormDateTimeField · FormTimeField · FormMonthField', example: '<FormDateTimeField name="visitAt" label="Fecha y hora" disablePast />'},
    {id: 'section', option: '<FormSection>', example: '<FormSection title="Visita">…</FormSection>'},
];
const HOOK_FORM_EXTENSIONS = [
    {id: 'controller', option: 'Controller', example: '<Controller name="pickupAt" control={form.control} render={({field, fieldState}) => <DateTimeInput … />} />'},
];

const PUBLISH_WINDOW_EXTENSIONS = [
    {id: 'fromNow', option: 'minimumMinutesFromNow', example: 'minimumMinutesFromNow={settings.publish_lead_minutes}'},
    {id: 'afterStart', option: 'minDateTime · instantPlusMinutes', example: 'minDateTime={instantPlusMinutes(values.startsAt, 30)}'},
    {id: 'rules', option: 'minutesFromNowRule · minutesAfterRule', example: "endsAt: Yup.string().test(minutesAfterRule('startsAt', 30))"},
    {id: 'clock', option: 'useCurrentMinute · earliestInstantFromNow', example: 'const minute = useCurrentMinute(true);'},
];

const COUNTDOWN_EXTENSIONS = [
    {id: 'until', option: 'until', example: 'until={registration.closes_at}  // instante, Date o milisegundos'},
    {id: 'onComplete', option: 'onComplete · completedText', example: 'onComplete={reloadRegistration} completedText="Cerradas"'},
    {id: 'look', option: 'showSeconds · variant · sx', example: 'showSeconds={false} variant="h6"'},
    {id: 'render', option: 'children(parts)', example: '{({days, hours, minutes}) => <MyClock … />}'},
    {id: 'hook', option: 'useCountdown · countdownPartsOf', example: 'const {parts, isOver} = useCountdown(closesAt, {onComplete});'},
];

export const DatesPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `dates.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('dates.title')} description={t('dates.description')} />
            <DemoSection title={t('dates.date.title')} description={t('dates.date.description')}
                         extensions={rowsOf('date', DATE_EXTENSIONS)} Demo={DateField} loadSource={loadDate} />
            <DemoSection title={t('dates.dateTime.title')} description={t('dates.dateTime.description')}
                         extensions={rowsOf('dateTime', DATE_TIME_EXTENSIONS)} Demo={DateTimeField} loadSource={loadDateTime} />
            <DemoSection title={t('dates.time.title')} description={t('dates.time.description')}
                         extensions={rowsOf('time', TIME_EXTENSIONS)} Demo={TimeField} loadSource={loadTime} />
            <DemoSection title={t('dates.month.title')} description={t('dates.month.description')}
                         extensions={rowsOf('month', MONTH_EXTENSIONS)} Demo={MonthField} loadSource={loadMonth} />
            <DemoSection title={t('dates.formik.title')} description={t('dates.formik.description')}
                         extensions={rowsOf('formik', FORMIK_EXTENSIONS)} Demo={FormikDates} loadSource={loadFormik} />
            <DemoSection title={t('dates.hookForm.title')} description={t('dates.hookForm.description')}
                         extensions={rowsOf('hookForm', HOOK_FORM_EXTENSIONS)} Demo={HookFormDates} loadSource={loadHookForm} />
            <DemoSection title={t('dates.publishWindow.title')} description={t('dates.publishWindow.description')}
                         extensions={rowsOf('publishWindow', PUBLISH_WINDOW_EXTENSIONS)} Demo={PublishWindow} loadSource={loadPublishWindow} />
            <DemoSection title={t('dates.countdown.title')} description={t('dates.countdown.description')}
                         extensions={rowsOf('countdown', COUNTDOWN_EXTENSIONS)} Demo={CountdownField} loadSource={loadCountdown} />
        </Stack>
    );
};
