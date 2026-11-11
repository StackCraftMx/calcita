// Fechas y horas con los selectores de MUI X (@stackcraftmx/calcita/date-pickers): cada campo suelto y su versión de formik.
// Pide @mui/x-date-pickers (8) y dayjs. Todos viajan en texto:
//   DateInput      / FormDateField       fecha            'AAAA-MM-DD'
//   DateTimeInput  / FormDateTimeField   fecha con hora   instante en UTC '2026-11-01T18:30:00Z', pintado en la zona del proveedor
//   TimeInput      / FormTimeField       hora del día     'HH:mm'
//   MonthInput     / FormMonthField      mes              'AAAA-MM'
//
// Los minutos van de uno en uno. Para lo que depende del reloj o de otro campo (publicar con anticipación, algo que dura un
// mínimo): minimumMinutesFromNow e instantPlusMinutes en el campo, y minutesFromNowRule / minutesAfterRule en yup.
//
// Con react-hook-form (cualquiera de los cuatro, igual):
//   <Controller name="birthDate" control={control} render={({field, fieldState}) => (
//       <DateInput label="Fecha de nacimiento" value={field.value} onChange={field.onChange} onBlur={field.onBlur}
//                  inputRef={field.ref} error={fieldState.error?.message} />
//   )} />
export {default as DateInput} from '@/datePickers/DateInput.jsx';
export {default as FormDateField} from '@/datePickers/FormDateField.jsx';
export {default as DateTimeInput} from '@/datePickers/DateTimeInput.jsx';
export {default as FormDateTimeField} from '@/datePickers/FormDateTimeField.jsx';
export {default as TimeInput} from '@/datePickers/TimeInput.jsx';
export {default as FormTimeField} from '@/datePickers/FormTimeField.jsx';
export {default as MonthInput} from '@/datePickers/MonthInput.jsx';
export {default as FormMonthField} from '@/datePickers/FormMonthField.jsx';
export {
    CALENDAR_DATE_FORMAT, CALENDAR_MONTH_FORMAT, DEFAULT_MINUTES_STEP, INSTANT_FORMAT, TIME_OF_DAY_FORMAT, earliestInstantFromNow,
    instantPlusMinutes, latestInstantOf, timeZoneNameOf,
} from '@/datePickers/pickerValues.js';
export {minutesAfterRule, minutesFromNowRule} from '@/datePickers/dateTimeRules.js';
export {useCurrentMinute} from '@/datePickers/useCurrentMinute.js';
// el tope de una fecha tecleada (LIMIT_MODE para avisar o corregir sale de la puerta principal)
export {PICKER_KIND, fixedPickerText, pickerBoundsOf, pickerLimitProblemOf} from '@/datePickers/pickerLimits.js';
export {usePickerLimits} from '@/datePickers/usePickerLimits.js';
