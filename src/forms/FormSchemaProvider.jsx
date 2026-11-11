// El esquema de yup del formulario, a la vista de los campos de Calcita: con él, y ToolkitProvider requiredFromSchema, cada
// campo de formik sabe si es obligatorio y pone su asterisco (schemaRequired.js).
//
// OJO, por qué hace falta: formik NO comparte su validationSchema con los campos (su contexto trae valores, errores y
// funciones, no el esquema; revisado en formik 2.4.9). El Formik de Calcita (@stackcraftmx/calcita/forms) ya lo pone solo;
// con el Formik importado directo de 'formik', y con react-hook-form (que lo guarda dentro del resolver), la pantalla
// envuelve sus campos:
//
//   <Formik validationSchema={schema} …>
//       <Form noValidate>
//           <FormSchemaProvider schema={schema}>…los campos…</FormSchemaProvider>
//       </Form>
//   </Formik>
//
// Genérico del paquete: function (regla de la casa).
import {createContext, useContext} from 'react';

/** El esquema del formulario más cercano (o la función que lo da, como en formik); null sin él. */
export const FormSchemaContext = createContext(/** @type {unknown} */ (null));

/** El esquema del formulario más cercano; null sin él. */
export const useFormSchema = () => useContext(FormSchemaContext);

/**
 * @param {object} props
 * @param {unknown} props.schema el mismo validationSchema que recibe Formik
 * @param {import('react').ReactNode} props.children los campos
 */
export function FormSchemaProvider({schema, children}) {
    return <FormSchemaContext value={schema ?? null}>{children}</FormSchemaContext>;
}
