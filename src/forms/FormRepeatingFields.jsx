// Renglones que se repiten en formik: RepeatingFields (inputs/) conectado a una lista del formulario por name. Agregar,
// quitar y limpiar cambian la lista; cada campo de adentro se conecta solo con su nombre (nameOf('email') →
// 'contacts.2.email') y enseña su error de yup.
//
//   <FormRepeatingFields name="contacts" label="Contactos" emptyRow={{name: '', email: ''}} maxRows={5}
//                        renderRow={({nameOf}) => (<>
//                            <FormTextField name={nameOf('name')} label="Nombre" />
//                            <FormTextField name={nameOf('email')} label="Correo" />
//                        </>)} />
//
// Lo que dice si un renglón se puede quitar (removeBlockedReason, confirmRemove) y los avisos (onAdd, onRemove) reciben el
// renglón con sus valores. El error de toda la lista (la suma se pasa del tope) sale abajo de «Agregar».
//
// OJO, de formik: guarda en el mismo lugar el error de la lista y los de sus renglones, y si hay de los dos se queda con
// los de los renglones. El de la lista sale en cuanto los renglones ya no tienen errores (mientras, no se guarda). Para
// que se vea mientras se escribe, un resumen en vivo en `footer` (listTotalOf). Con react-hook-form salen los dos.
//
// Genérico del paquete: function (regla de la casa).
import {getIn, useFormikContext} from 'formik';

import RepeatingFields from '@/inputs/RepeatingFields.jsx';
import {useRowKeys} from '@/inputs/useRowKeys.js';

const EMPTY_ROWS = Object.freeze([]);

/**
 * Los errores de los campos de un renglón ({email: …}); null si no tiene. Ojo: el error de toda la lista también vive en
 * errors[name] (como {key, values}), junto a los de cada renglón.
 *
 * @param {object} errors los de formik
 * @param {string} name
 * @param {number} index
 * @returns {object|null}
 */
function rowErrorsOf(errors, name, index) {
    const rowErrors = getIn(errors, `${name}.${index}`);
    return rowErrors && typeof rowErrors === 'object' ? rowErrors : null;
}

/**
 * @param {{
 *   name: string,
 *   emptyRow: object,
 *   renderRow: (row: {index: number, row: any, nameOf: (field: string) => string}) => import('react').ReactNode,
 *   removeBlockedReason?: (row: any, index: number) => string|null,
 *   confirmRemove?: (row: any, index: number) => boolean,
 *   onAdd?: (index: number) => void,
 *   onRemove?: (row: any, index: number) => void,
 * } & Omit<Parameters<typeof import('@/inputs/RepeatingFields.jsx').default>[0], 'rowKeys'|'renderRow'|'onAdd'|'onRemove'|'onClear'|'removeBlockedReasonOf'|'confirmRemoveOf'|'rowHasErrorOf'|'error'>} props
 *     name: la lista del formulario; emptyRow: cómo empieza un renglón nuevo; lo demás, lo de RepeatingFields
 */
export default function FormRepeatingFields({name, emptyRow, renderRow, removeBlockedReason, confirmRemove, onAdd, onRemove, ...viewProps}) {
    const {values, errors, touched, submitCount, setFieldValue} = useFormikContext();
    const rows = getIn(values, name) ?? EMPTY_ROWS;
    const rowKeys = useRowKeys(rows.length);
    const listError = getIn(errors, name);
    // el error de toda la lista: un texto o {key, values} (los de los renglones vienen en sus campos)
    const isListLevelError = typeof listError === 'string' || Boolean(listError?.key);
    const wasTouched = submitCount > 0 || Boolean(getIn(touched, name));

    const add = () => {
        rowKeys.added();
        setFieldValue(name, [...rows, {...emptyRow}]);
        onAdd?.(rows.length);
    };
    const remove = (index) => {
        const removedRow = rows[index];
        rowKeys.removed(index);
        setFieldValue(name, rows.filter((unused, rowIndex) => rowIndex !== index));
        onRemove?.(removedRow, index);
    };
    const clear = (index) => {
        const clearedRow = rows[index];
        rowKeys.renewed(index);
        setFieldValue(name, rows.map((row, rowIndex) => (rowIndex === index ? {...emptyRow} : row)));
        onRemove?.(clearedRow, index);
    };

    return (
        <RepeatingFields
            {...viewProps}
            rowKeys={rowKeys.keys}
            renderRow={(index) => renderRow({index, row: rows[index], nameOf: (field) => `${name}.${index}.${field}`})}
            onAdd={add}
            onRemove={remove}
            onClear={clear}
            removeBlockedReasonOf={removeBlockedReason ? (index) => removeBlockedReason(rows[index], index) : undefined}
            confirmRemoveOf={confirmRemove ? (index) => confirmRemove(rows[index], index) : undefined}
            rowHasErrorOf={(index) => wasTouched && rowErrorsOf(errors, name, index) !== null}
            error={wasTouched && isListLevelError ? listError : undefined}
        />
    );
}
