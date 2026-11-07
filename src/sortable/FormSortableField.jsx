// La tabla que se ordena arrastrando, en un formulario de formik: el valor del campo es la lista en su orden. Al soltar un
// renglón el campo cambia (el formulario queda «cambiado», dirty) y se guarda con el botón del formulario. El error de la
// lista (de yup o el 422 del servidor con applyServerProblem) sale abajo de la tabla.
//
// OJO trampa pagada: al soltar se marca el campo como tocado SIN revisar y luego se cambia el valor (que sí revisa). Con
// las dos revisiones (tocado y valor) en el mismo instante, la del tocado corría con el orden viejo y borraba el error del
// nuevo: la regla de la lista nunca salía.
//
//   <FormSortableField name="stops" columns={[{field: 'name', headerName: 'Sucursal', flex: 1}]} ariaLabel="Ruta de reparto" />
//   al guardar: values.stops.map((stop, index) => ({branch_id: stop.id, stop: index + 1}))
//
// Con react-hook-form no hay uno listo (esta puerta no pide react-hook-form): SortableTable va dentro de un Controller.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikContext} from 'formik';

import {useFormikField} from '@/forms/useFormikField.js';
import SortableTable from '@/sortable/SortableTable.jsx';

/**
 * @template {object} Row
 * @param {{name: string, onReorder?: (change: {rows: Row[], rowId: string|number, fromIndex: number, toIndex: number}) => void} & Omit<Parameters<typeof SortableTable<Row>>[0], 'rows'|'onReorder'|'error'>} props
 *     las de SortableTable (columns, ariaLabel, getRowId…) sin rows ni error; su onReorder corre después del cambio del campo
 */
export default function FormSortableField({name, onReorder, disabled, ...tableProps}) {
    const {value, onChange, error} = useFormikField(name);
    const {isSubmitting, setFieldTouched} = useFormikContext();

    return (
        <SortableTable {...tableProps} rows={value ?? []} disabled={disabled || isSubmitting}
                       // la lista con renglones adentro puede traer errores por renglón (un arreglo): aquí solo el de la lista
                       error={typeof error === 'string' ? error : undefined}
                       onReorder={(change) => {
                           setFieldTouched(name, true, false);
                           onChange(change.rows);
                           onReorder?.(change);
                       }} />
    );
}
