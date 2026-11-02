// Renglones que se repiten en react-hook-form: RepeatingFields (inputs/) conectado con useFieldArray. Se usa igual que el
// FormRepeatingFields de formik (@stackcraftmx/calcita/forms): name, emptyRow, renderRow con nameOf, y lo mismo para decidir
// si un renglón se puede quitar.
//
// El error de toda la lista llega de yup (yupResolver lo pone en errors.<name>.root) o de las reglas del campo.
//
// Genérico del paquete: function (regla de la casa).
import {useFieldArray, useFormContext, useFormState, useWatch} from 'react-hook-form';

import RepeatingFields from '@/inputs/RepeatingFields.jsx';

const EMPTY_ROWS = Object.freeze([]);

/**
 * @param {{
 *   name: string,
 *   control?: object,
 *   emptyRow: object,
 *   renderRow: (row: {index: number, row: any, nameOf: (field: string) => string}) => import('react').ReactNode,
 *   removeBlockedReason?: (row: any, index: number) => string|null,
 *   confirmRemove?: (row: any, index: number) => boolean,
 *   onAdd?: (index: number) => void,
 *   onRemove?: (row: any, index: number) => void,
 * } & Omit<Parameters<typeof import('@/inputs/RepeatingFields.jsx').default>[0], 'rowKeys'|'renderRow'|'onAdd'|'onRemove'|'onClear'|'removeBlockedReasonOf'|'confirmRemoveOf'|'rowHasErrorOf'|'error'>} props
 *     control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormRepeatingFields({name, control, emptyRow, renderRow, removeBlockedReason, confirmRemove, onAdd, onRemove, ...viewProps}) {
    const formContext = useFormContext();
    const formControl = control ?? formContext?.control;
    const {fields, append, remove: removeAt, update} = useFieldArray({name, control: formControl});
    const rows = useWatch({name, control: formControl}) ?? EMPTY_ROWS;
    const {errors} = useFormState({name, control: formControl});
    const listErrors = name.split('.').reduce((branch, part) => branch?.[part], errors);
    const listErrorMessage = listErrors?.root?.message ?? listErrors?.message;

    return (
        <RepeatingFields
            {...viewProps}
            rowKeys={fields.map((field) => field.id)}
            renderRow={(index) => renderRow({index, row: rows[index] ?? emptyRow, nameOf: (field) => `${name}.${index}.${field}`})}
            onAdd={() => {
                append({...emptyRow});
                onAdd?.(fields.length);
            }}
            onRemove={(index) => {
                const removedRow = rows[index];
                removeAt(index);
                onRemove?.(removedRow, index);
            }}
            onClear={(index) => {
                const clearedRow = rows[index];
                update(index, {...emptyRow});
                onRemove?.(clearedRow, index);
            }}
            removeBlockedReasonOf={removeBlockedReason ? (index) => removeBlockedReason(rows[index], index) : undefined}
            confirmRemoveOf={confirmRemove ? (index) => confirmRemove(rows[index], index) : undefined}
            rowHasErrorOf={(index) => Boolean(listErrors?.[index])}
            error={listErrorMessage}
        />
    );
}
