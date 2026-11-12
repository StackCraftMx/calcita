// Renglones que se editan y se guardan UNO POR UNO en react-hook-form: cada renglón es su propio useForm, con su «Guardar»
// y su «Deshacer». Se usa igual que el EditableRows de formik (@stackcraftmx/calcita/forms): rows, rowKeyOf, renderRow,
// onSaveRow, rowSchema (el yup de UN renglón), validateRow (las reglas con los demás renglones), emptyRow, onRemoveRow.
// formOptions va tal cual a useForm de cada renglón para lo demás ({mode: 'onBlur'}); un resolver ahí gana a rowSchema.
//
// renderRow recibe {index, row, savedRow, isNew, nameOf, form}: row son los valores de ahora, nameOf(campo) el campo tal cual
// (cada renglón es su propio formulario) y form el useForm de ESE renglón (setValue para llenar o limpiar el de al lado).
// onSaveRow recibe los valores y {form, index, row, isNew}: con form, applyServerProblem(error, form) pone los errores del
// servidor en sus campos. Si truena, el renglón se queda como está.
//
// OJO: un renglón vuelve a su valor de inicio cuando la pantalla le manda otro (rows cambió): se compara por su contenido,
// no por ser otro objeto, para que una pantalla que arma rows en cada pintada no le borre a la persona lo que escribe.
//
// Genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FormProvider, useForm, useFormState, useWatch} from 'react-hook-form';

import RowSaveActions from '@/hookForm/RowSaveActions.jsx';
import {rowResolverOf} from '@/hookForm/rowResolver.js';
import RepeatingFields from '@/inputs/RepeatingFields.jsx';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

// la llave de un renglón nuevo, mientras no se guarda (no choca con las del servidor: llevan otra forma)
const NEW_ROW_KEY_PREFIX = 'calcita-new-row-';

/** Un renglón con su propio useForm: le da a la vista sus valores de ahora, su form y cómo guardarse. */
function RowForm({entry, index, rowSchema, validateRow, otherRowsOf, formOptions, onSaveRow, onSaved, onStateChange, buildRow}) {
    // OJO: useForm puede quedarse con el resolver del primer pintado; por eso la regla y los demás renglones se leen de aquí
    // al validar (si no, un renglón agregado después no contaría como repetido)
    const latest = useRef({});
    latest.current = {validateRow, context: {index, otherRows: otherRowsOf()}};
    const hasOwnRules = Boolean(rowSchema || validateRow);
    const ownResolver = useMemo(
        () => (hasOwnRules ? rowResolverOf(rowSchema, () => latest.current.validateRow, () => latest.current.context) : undefined),
        [hasOwnRules, rowSchema],
    );
    const form = useForm({...formOptions, resolver: formOptions?.resolver ?? ownResolver, defaultValues: entry.row});
    const values = useWatch({control: form.control});
    const {isDirty, errors} = useFormState({control: form.control});
    const hasError = Object.keys(errors).length > 0;
    useEffect(() => {
        onStateChange(entry.key, {hasError, isDirty});
    }, [entry.key, hasError, isDirty, onStateChange]);
    // la pantalla le mandó otro valor de inicio (lo guardó y lo volvió a pedir): se compara por contenido
    const rowContent = JSON.stringify(entry.row ?? {});
    const shownContent = useRef(rowContent);
    useEffect(() => {
        if (shownContent.current !== rowContent) {
            shownContent.current = rowContent;
            form.reset(entry.row);
        }
    }, [rowContent, entry.row, form]);

    const save = form.handleSubmit(async (formValues) => {
        await onSaveRow(formValues, {form, index, row: entry.row, isNew: entry.isNew});
        onSaved(entry, formValues, form);
    });
    return <FormProvider {...form}>{buildRow({form, values: {...entry.row, ...values}, save})}</FormProvider>;
}

/**
 * @param {{
 *   rows: object[],
 *   rowKeyOf: (row: any) => string|number,
 *   renderRow: (row: {index: number, row: any, savedRow: any, isNew: boolean, nameOf: (field: string) => string, form: import('react-hook-form').UseFormReturn<any>}) => import('react').ReactNode,
 *   onSaveRow: (values: any, context: {form: import('react-hook-form').UseFormReturn<any>, index: number, row: any, isNew: boolean}) => Promise<unknown>|unknown,
 *   rowSchema?: object,
 *   validateRow?: (values: any, context: {index: number, otherRows: any[]}) => object|Promise<object>,
 *   formOptions?: object,
 *   emptyRow?: object,
 *   onAdd?: (index: number) => void,
 *   onRemoveRow?: (row: any, index: number) => Promise<unknown>|unknown,
 *   confirmRemove?: (row: any, index: number) => boolean,
 *   removeBlockedReason?: (row: any, index: number) => string|null,
 * } & Omit<Parameters<typeof import('@/inputs/RepeatingFields.jsx').default>[0], 'rowKeys'|'renderRow'|'onAdd'|'onRemove'|'onClear'|'canRemoveOf'|'removeIsImmediate'|'rowWrapperOf'|'removeBlockedReasonOf'|'confirmRemoveOf'|'rowHasErrorOf'|'minRows'>} props
 *     rowSchema: el yup de un renglón; validateRow: reglas con los demás renglones; formOptions: lo demás que va a useForm de
 *     cada renglón (mode…; un resolver ahí gana a rowSchema); lo demás, como el EditableRows de formik
 */
export default function EditableRows({
    rows, rowKeyOf, renderRow, onSaveRow, rowSchema, validateRow, formOptions, emptyRow, onAdd, onRemoveRow, confirmRemove, removeBlockedReason, rowLabelOf,
    disabled = false, texts, ...viewProps
}) {
    const {t} = useToolkitTranslation('common', texts);
    const [newRowKeys, setNewRowKeys] = useState([]);
    const nextNewRowNumber = useRef(0);
    const [rowStates, setRowStates] = useState({});
    const onStateChange = useCallback((rowKey, state) => {
        setRowStates((all) => (all[rowKey]?.hasError === state.hasError && all[rowKey]?.isDirty === state.isDirty ? all : {...all, [rowKey]: state}));
    }, []);

    const entries = [
        ...rows.map((row) => ({key: String(rowKeyOf(row)), row, isNew: false})),
        ...newRowKeys.map((key) => ({key, row: emptyRow, isNew: true})),
    ];
    const titleOf = (index) => rowLabelOf?.(index) ?? t('repeating.row', {number: index + 1});
    const forgetNewRow = (key) => setNewRowKeys((keys) => keys.filter((newKey) => newKey !== key));
    // guardado: uno nuevo sale de aquí (la pantalla ya lo agrega a rows); uno de antes queda con lo guardado como inicio
    const onSaved = (entry, savedValues, form) => {
        if (entry.isNew) {
            forgetNewRow(entry.key);
            return;
        }
        form.reset(savedValues);
    };

    const add = () => {
        const key = `${NEW_ROW_KEY_PREFIX}${nextNewRowNumber.current}`;
        nextNewRowNumber.current += 1;
        setNewRowKeys((keys) => [...keys, key]);
        onAdd?.(entries.length);
    };
    const remove = (index) => {
        const entry = entries[index];
        if (entry.isNew) {
            forgetNewRow(entry.key);
            return;
        }
        onRemoveRow?.(entry.row, index);
    };

    return (
        <RepeatingFields
            {...viewProps}
            texts={texts}
            disabled={disabled}
            rowLabelOf={rowLabelOf}
            minRows={0}
            rowKeys={entries.map((entry) => entry.key)}
            renderRow={(index, rowContext) => {
                const entry = entries[index];
                return renderRow({index, row: rowContext?.values ?? entry.row, savedRow: entry.row, isNew: entry.isNew, nameOf: (field) => field, form: rowContext?.form});
            }}
            rowWrapperOf={(index, buildRow) => (
                <RowForm entry={entries[index]} index={index} rowSchema={rowSchema} validateRow={validateRow} formOptions={formOptions}
                         otherRowsOf={() => entries.filter((other) => other !== entries[index]).map((other) => other.row)} onSaveRow={onSaveRow} onSaved={onSaved}
                         onStateChange={onStateChange} buildRow={buildRow} />
            )}
            rowActionsOf={(index, rowContext) => <RowSaveActions title={titleOf(index)} disabled={disabled} texts={texts} save={rowContext.save} />}
            onAdd={emptyRow ? add : undefined}
            onRemove={remove}
            canRemoveOf={(index) => entries[index].isNew || Boolean(onRemoveRow)}
            removeIsImmediate
            removeBlockedReasonOf={removeBlockedReason ? (index) => (entries[index].isNew ? null : removeBlockedReason(entries[index].row, index)) : undefined}
            confirmRemoveOf={(index) => !entries[index].isNew && (confirmRemove ? confirmRemove(entries[index].row, index) : true)}
            rowHasErrorOf={(index) => Boolean(rowStates[entries[index].key]?.hasError)}
        />
    );
}
