// Renglones que se editan y se guardan UNO POR UNO: cada renglón es su propio formulario de formik, con su «Guardar» y su
// «Deshacer», sus errores en sus campos y los del servidor en su renglón. En tarjetas o en tabla, con las mismas columnas
// y el mismo renderRow que FormRepeatingFields (la tabla en la que todos los renglones son UN formulario): la pantalla
// escoge la que le toca.
//
//   <EditableRows rows={rules} rowKeyOf={(rule) => rule.id} rowSchema={ruleSchema} layout={REPEATING_LAYOUT.table}
//                 tableColumns={COLUMNS} onSaveRow={(values, {isNew}) => (isNew ? createRule(values) : updateRule(values))}
//                 renderRow={({nameOf, row}) => (<>
//                     <FormSelectField name={nameOf('branch_id')} label="Sucursal" options={BRANCHES} />
//                     <FormNumberField name={nameOf('amount')} label="Presupuesto" prefix="$" />
//                 </>)} />
//
// Lo que decide la pantalla:
//   - los renglones llegan del servidor (rows) con su llave (rowKeyOf). Al guardar uno, la pantalla actualiza rows (o no:
//     el renglón se queda con lo guardado como su valor de inicio);
//   - con emptyRow sale «Agregar»: el renglón nuevo vive aquí hasta que se guarda (onSaveRow con isNew) y entonces la
//     pantalla lo agrega a rows. Sin emptyRow solo se editan los que hay;
//   - con onRemoveRow sale «Quitar» en los guardados y se borra EN ESE MOMENTO (la confirmación lo dice). Uno nuevo sin
//     guardar siempre se puede quitar;
//   - si onSaveRow truena, el renglón se queda como está: la pantalla dice el problema (applyServerProblem con lo que
//     recibe, que trae lo de formik, o toastProblem);
//   - las reglas de cada campo van en rowSchema (el yup de UN renglón). Las de entre renglones (que no se repita) van en
//     validateRow, que recibe los demás renglones, o las revisa el servidor.
//
// renderRow recibe {index, row, savedRow, isNew, nameOf, form}: row son los valores de ahora (para una lista que depende de
// otra), savedRow los de inicio, nameOf(campo) da el nombre del campo (en su propio formulario es el campo tal cual) y form
// lo de formik de ESE renglón (setFieldValue para llenar o limpiar el de al lado).
//
// Genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useRef, useState} from 'react';
import {useFormikContext} from 'formik';

import CalcitaFormik from '@/forms/CalcitaFormik.jsx';
import RowSaveActions from '@/forms/RowSaveActions.jsx';
import RepeatingFields from '@/inputs/RepeatingFields.jsx';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

// la llave de un renglón nuevo, mientras no se guarda (no choca con las del servidor: llevan otra forma)
const NEW_ROW_KEY_PREFIX = 'calcita-new-row-';

/** Lo que un renglón le avisa a la lista: si enseña un error y si tiene cambios sin guardar. */
function RowStateReporter({rowKey, onStateChange}) {
    const {errors, touched, submitCount, dirty} = useFormikContext();
    // un error cuenta cuando ya se ve: el campo se tocó o se intentó guardar
    const hasError = Object.keys(errors).some((field) => submitCount > 0 || Boolean(touched[field]));
    useEffect(() => {
        onStateChange(rowKey, {hasError, isDirty: dirty});
    }, [rowKey, hasError, dirty, onStateChange]);
    return null;
}

/**
 * @param {{
 *   rows: object[],
 *   rowKeyOf: (row: any) => string|number,
 *   renderRow: (row: {index: number, row: any, savedRow: any, isNew: boolean, nameOf: (field: string) => string, form: import('formik').FormikProps<any>}) => import('react').ReactNode,
 *   onSaveRow: (values: any, helpers: import('formik').FormikHelpers<any> & {index: number, row: any, isNew: boolean}) => Promise<unknown>|unknown,
 *   rowSchema?: object,
 *   validateRow?: (values: any, context: {index: number, otherRows: any[]}) => object|Promise<object>,
 *   emptyRow?: object,
 *   onAdd?: (index: number) => void,
 *   onRemoveRow?: (row: any, index: number) => Promise<unknown>|unknown,
 *   confirmRemove?: (row: any, index: number) => boolean,
 *   removeBlockedReason?: (row: any, index: number) => string|null,
 * } & Omit<Parameters<typeof import('@/inputs/RepeatingFields.jsx').default>[0], 'rowKeys'|'renderRow'|'onAdd'|'onRemove'|'onClear'|'canRemoveOf'|'removeIsImmediate'|'rowWrapperOf'|'removeBlockedReasonOf'|'confirmRemoveOf'|'rowHasErrorOf'|'minRows'>} props
 *     rows: los renglones del servidor; rowKeyOf: la llave de cada uno; onSaveRow: guarda uno (isNew si es nuevo) y recibe
 *     lo de formik para los errores del servidor; rowSchema: el yup de un renglón; validateRow: reglas con los demás
 *     renglones; emptyRow: con él sale «Agregar»; onRemoveRow: con él sale «Quitar» en los guardados (se borra en ese
 *     momento); lo demás, lo de RepeatingFields (layout, tableColumns, phoneLayout, label…)
 */
export default function EditableRows({
    rows, rowKeyOf, renderRow, onSaveRow, rowSchema, validateRow, emptyRow, onAdd, onRemoveRow, confirmRemove, removeBlockedReason, rowLabelOf,
    disabled = false, texts, ...viewProps
}) {
    const {t} = useToolkitTranslation('common', texts);
    // los renglones nuevos que todavía no se guardan: solo su llave (empiezan como emptyRow)
    const [newRowKeys, setNewRowKeys] = useState([]);
    const nextNewRowNumber = useRef(0);
    // lo que avisa cada renglón ({llave: {hasError, isDirty}}), para marcar en rojo el que tiene un error
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

    // cada renglón dentro de su propio formulario, que lo arma con sus valores de ahora
    const rowWrapperOf = (index, buildRow) => {
        const entry = entries[index];
        return (
            <CalcitaFormik
                initialValues={entry.row}
                enableReinitialize
                validationSchema={rowSchema}
                validate={validateRow ? (values) => validateRow(values, {index, otherRows: entries.filter((other) => other !== entry).map((other) => other.row)}) : undefined}
                onSubmit={async (values, helpers) => {
                    await onSaveRow(values, {...helpers, index, row: entry.row, isNew: entry.isNew});
                    if (entry.isNew) {
                        forgetNewRow(entry.key);
                        return;
                    }
                    // lo guardado es el nuevo inicio: sin cambios pendientes aunque la pantalla no actualice rows
                    helpers.resetForm({values});
                }}
            >
                {(form) => (
                    <>
                        <RowStateReporter rowKey={entry.key} onStateChange={onStateChange} />
                        {buildRow({form})}
                    </>
                )}
            </CalcitaFormik>
        );
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
                return renderRow({
                    index, row: rowContext?.form.values ?? entry.row, savedRow: entry.row, isNew: entry.isNew, nameOf: (field) => field, form: rowContext?.form,
                });
            }}
            rowWrapperOf={rowWrapperOf}
            rowActionsOf={(index) => <RowSaveActions title={titleOf(index)} disabled={disabled} texts={texts} />}
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
