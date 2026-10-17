// Fechas con el DatePicker de MUI X (@stackcraftmx/calcita/date-pickers): el campo suelto (DateInput) y el de formik
// (FormDateField). Viaja 'AAAA-MM-DD'. Pide @mui/x-date-pickers (8) y dayjs.
//
// Con react-hook-form:
//   <Controller name="birthDate" control={control} render={({field, fieldState}) => (
//       <DateInput label="Fecha de nacimiento" value={field.value} onChange={field.onChange} onBlur={field.onBlur}
//                  inputRef={field.ref} error={fieldState.error?.message} />
//   )} />
export {CALENDAR_DATE_FORMAT, default as DateInput} from '@/datePickers/DateInput.jsx';
export {default as FormDateField} from '@/datePickers/FormDateField.jsx';
