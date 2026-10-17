// Campo de fecha de formik: DateInput conectado a su campo. Al formulario llega 'AAAA-MM-DD'.
//
// Con react-hook-form no hay uno listo (esta puerta no pide react-hook-form): DateInput va dentro de un Controller.
//
// Genérico del paquete: function (regla de la casa).
import DateInput from '@/datePickers/DateInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {object} props las de DateInput (minDate, maxDate, disableFuture, openTo…), sin value / onChange / onBlur / error
 * @param {string} props.name el campo del formulario
 * @param {string} props.label ya traducido
 */
export default function FormDateField({name, ...dateInputProps}) {
    const fieldProps = useFormikField(name);
    return <DateInput {...dateInputProps} {...fieldProps} />;
}
