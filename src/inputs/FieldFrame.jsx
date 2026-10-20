// El marco de todos los campos del paquete. Fuera de una FormSection, la etiqueta va ARRIBA del campo, ligada a él por su
// id; dentro de una FormSection (el formulario agrupado de Apple), el campo se vuelve un renglón: la etiqueta a la
// izquierda y el valor a la derecha (FormRow).
//
// La etiqueta va afuera y no flotando adentro del campo: se lee igual con el campo vacío o lleno, y no brinca al escribir.
//
// Genérico del paquete: function (regla de la casa).
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {FormRow} from '@/inputs/FormSection.jsx';
import {useIsInsideFormSection} from '@/inputs/formLayoutContext.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {string} props.inputId el id del campo (la etiqueta lo nombra para el lector de pantalla)
 * @param {string} [props.labelId] el id de la etiqueta, para un campo que no es un <input> (la lista desplegable de MUI es un
 *     div: `for` no la une con su etiqueta y el campo la nombra con aria-labelledby)
 * @param {import('react').ReactNode} props.label ya traducida
 * @param {import('react').ReactNode} props.children el campo
 */
export default function FieldFrame({inputId, labelId, label, children, ...unknownProps}) {
    warnUnknownProps('FieldFrame', unknownProps);
    const isRow = useIsInsideFormSection();

    if (isRow) {
        return <FormRow label={label} htmlFor={inputId} labelId={labelId}>{children}</FormRow>;
    }

    return (
        <Stack spacing={0.75}>
            <Typography component="label" id={labelId} htmlFor={inputId} variant="overline" color="text.secondary">{label}</Typography>
            {children}
        </Stack>
    );
}
