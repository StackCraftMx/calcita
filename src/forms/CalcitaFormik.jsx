// El Formik de formik, tal cual, con una sola cosa más: les enseña a los campos de Calcita el esquema de yup del formulario
// (FormSchemaProvider), para que con ToolkitProvider requiredFromSchema cada campo obligatorio ponga su asterisco solo.
// Lo demás (valores, errores, envío, innerRef, children como función) es el de formik sin tocar: los campos encuentran el
// mismo formulario que con el Formik de 'formik'.
//
// Genérico del paquete: function (regla de la casa).
import {Formik as FormikBase} from 'formik';

import {FormSchemaProvider} from '@/forms/FormSchemaProvider.jsx';

/**
 * @template {import('formik').FormikValues} Values
 * @param {import('formik').FormikConfig<Values>} props las de Formik de formik
 * @returns {import('react').JSX.Element}
 */
export default function Formik(props) {
    return (
        <FormSchemaProvider schema={props.validationSchema}>
            <FormikBase {...props} />
        </FormSchemaProvider>
    );
}
