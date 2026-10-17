// La conexión de un campo suelto (inputs/) con formik: lo que la vista necesita, sacado del campo de formik.
//
// Una sola regla vive aquí: el error se enseña cuando el campo ya se tocó (o ya se intentó enviar, que formik marca como
// tocados todos). Marcar en rojo lo que nadie ha llenado regaña a alguien por no adivinar.
//
// Hook genérico del paquete: function (regla de la casa).
import {useField} from 'formik';

/**
 * @param {string} name el campo del formulario
 * @returns {{name: string, value: unknown, onChange: (value: unknown) => void, onBlur: () => void, error: unknown}}
 */
export function useFormikField(name) {
    const [field, meta, helpers] = useField(name);

    return {
        name,
        value: field.value,
        onChange: (value) => helpers.setValue(value),
        onBlur: () => helpers.setTouched(true),
        error: meta.touched ? meta.error : undefined,
    };
}
