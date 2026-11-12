// Campos en los renglones de la tabla del servidor (ServerTable de /table), cada renglón su propio formulario de formik:
// valida en su celda, se guarda con su ✓ y, al cambiar de página, de filtro o de orden, lo capturado no se pierde.
//
//   const editing = useEditableServerRows({rowSchema, onSaveRow: (values, {row}) => updateRule(row.id, values)});
//   <>{editing.unsavedBar}
//     <ServerTable {...editing.tableProps} fetchPage={fetchRules} queryKey="rules" columns={[
//         textColumn({field: 'folio', label: 'Folio'}),
//         editing.fieldColumn({field: 'amount', label: 'Presupuesto', width: 170,
//             renderField: ({nameOf}) => <FormNumberField name={nameOf('amount')} label="Presupuesto" prefix="$" />}),
//         editing.actionsColumn(),
//     ]} /></>
//
// Lo que hace:
//   - cada renglón de la cuadrícula va dentro de su propio formulario (tableProps.rowWrapper): sus campos (fieldColumn) y
//     su ✓ y «Deshacer» (actionsColumn) son de ESE renglón;
//   - lo capturado y sin guardar vive fuera de la tabla (rowDrafts.js): con UNSAVED_ROWS.keep (por omisión) regresa al
//     volver a esa página y la barra (unsavedBar) dice cuántos renglones tienen cambios, con «Guardar todos» (toda la tabla
//     como UN formulario) y «Descartar»; con UNSAVED_ROWS.confirm, antes de cambiar de página, filtro u orden se pregunta;
//   - «Guardar todos»: los renglones que se ven se guardan como con su ✓ (sus errores salen en sus celdas); los de otras
//     páginas se revisan con rowSchema y se guardan con onSaveRow (isVisible: false: lo de formik no hace nada, el renglón
//     no se ve). Con onSaveRows, todos van juntos en una sola llamada;
//   - los renglones crecen con lo que traen (getRowHeight 'auto'): el aviso de un error no se corta.
//
// OJO: las teclas dentro de un campo no le llegan a la cuadrícula (moverse con flechas, la barra espaciadora): si no, el
// espacio y las flechas de un campo de texto movían la celda en lugar de escribir.
//
// Hook de formularios: function (regla de la casa).
import {useEffect, useMemo, useRef, useState, useSyncExternalStore} from 'react';
import {useFormikContext} from 'formik';
import Box from '@mui/material/Box';

import CalcitaFormik from '@/forms/CalcitaFormik.jsx';
import RowSaveActions from '@/forms/RowSaveActions.jsx';
import {TABLE_CELL_FIELD_LAYOUT} from '@/inputs/FormSection.jsx';
import {FormSectionContext} from '@/inputs/formLayoutContext.js';
import {UNSAVED_ROWS, createRowDraftsStore} from '@/inputs/rowDrafts.js';
import UnsavedRowsBar from '@/inputs/UnsavedRowsBar.jsx';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

// la columna de ✓ y «Deshacer»: su llave en la cuadrícula y su ancho
const ROW_ACTIONS_FIELD = 'calcitaRowActions';
const ROW_ACTIONS_WIDTH_PIXELS = 96;
// el aire de una celda con campo, arriba y abajo (la densidad de la tabla no cuenta con alto automático)
const FIELD_CELL_PADDING_PIXELS = 6;
const AUTO_ROW_HEIGHT = () => 'auto';
// lo de formik para un renglón que no se ve (otra página): no hace nada, no hay campos donde enseñar
const HIDDEN_ROW_HELPERS = Object.freeze({
    setFieldError: () => {}, setFieldTouched: () => {}, setStatus: () => {}, setErrors: () => {}, setSubmitting: () => {}, resetForm: () => {},
});

/** Las teclas de un campo no le llegan a la cuadrícula: el espacio y las flechas son para escribir. */
const keepKeysInField = (event) => event.stopPropagation();

/**
 * Lo que guarda y recuerda un renglón: lo capturado va al almacén mientras tenga cambios, y regresa al volver a su página.
 * También le dice al hook cómo guardar o deshacer este renglón (para «Guardar todos» y «Descartar»).
 */
function RowDraftKeeper({rowId, store, visibleRows}) {
    const {values, dirty, initialValues, setValues, submitForm, resetForm} = useFormikContext();
    // al volver a esta página: lo que se había capturado
    useEffect(() => {
        const draft = store.get(rowId);
        if (draft) {
            setValues(draft.values, true);
        }
        // solo al montarse: después manda lo que se escribe
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // OJO: la primera vez todavía no llegan los valores recuperados (dirty false): si se escuchara, se borraría lo capturado
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        if (dirty) {
            store.set(rowId, {values, row: initialValues});
        } else {
            store.remove(rowId);
        }
    }, [values, dirty]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        visibleRows.set(rowId, {submitForm, resetForm});
        return () => visibleRows.delete(rowId);
    }, [rowId, visibleRows, submitForm, resetForm]);
    return null;
}

/** La celda con su campo: la forma de la casa, la etiqueta solo para el lector y las teclas para el campo. */
function FieldCell({renderField, rowId, savedRow}) {
    const form = useFormikContext();
    return (
        <FormSectionContext.Provider value={TABLE_CELL_FIELD_LAYOUT}>
            <Box onKeyDown={keepKeysInField} sx={{width: '100%', py: `${FIELD_CELL_PADDING_PIXELS}px`}}>
                {renderField({rowId, row: form.values, savedRow, nameOf: (field) => field, form})}
            </Box>
        </FormSectionContext.Provider>
    );
}

/**
 * @param {object} options
 * @param {object} [options.rowSchema] el yup de UN renglón
 * @param {(values: any, context: {rowId: string|number, row: any}) => object|Promise<object>} [options.validateRow] reglas
 *     propias del renglón ({campo: 'mensaje'}), además de rowSchema
 * @param {(values: any, helpers: import('formik').FormikHelpers<any> & {rowId: string|number, row: any, isVisible: boolean}) => Promise<unknown>|unknown} options.onSaveRow
 *     guarda un renglón (row: como lo mandó el servidor). Si truena, el renglón se queda con sus cambios (la pantalla dice
 *     el problema: applyServerProblem con lo que recibe, si el renglón se ve, o toastProblem)
 * @param {(changes: Array<{rowId: string|number, row: any, values: any}>) => Promise<unknown>|unknown} [options.onSaveRows]
 *     «Guardar todos» en UNA llamada (toda la tabla como un formulario); sin ella, uno por uno con onSaveRow
 * @param {'keep'|'confirm'} [options.unsavedRows] UNSAVED_ROWS: recordar lo capturado al cambiar de página (por omisión) o
 *     preguntar antes
 * @param {(row: any) => string} [options.rowLabelOf] el nombre de un renglón para el lector («Folio F-1042»); por omisión
 *     «Renglón N»
 * @param {object} [options.texts] los textos que cambian, con la forma de `common`
 * @returns {{
 *   tableProps: {rowWrapper: import('react').ComponentType<any>, getRowHeight: () => 'auto', beforeQueryChange?: (applyChange: () => void) => void},
 *   fieldColumn: (column: {field: string, label: string, renderField: (row: {rowId: string|number, row: any, savedRow: any, nameOf: (field: string) => string, form: import('formik').FormikProps<any>}) => import('react').ReactNode} & Record<string, any>) => object,
 *   actionsColumn: (column?: Record<string, any>) => object,
 *   unsavedBar: import('react').ReactNode,
 *   pendingCount: number,
 *   saveAll: () => Promise<void>,
 *   discardAll: () => void,
 * }}
 */
export function useEditableServerRows({rowSchema, validateRow, onSaveRow, onSaveRows, unsavedRows = UNSAVED_ROWS.keep, rowLabelOf, texts} = {}) {
    if (!Object.values(UNSAVED_ROWS).includes(unsavedRows)) {
        throw new Error(`useEditableServerRows: unsavedRows «${unsavedRows}» no existe; use uno de UNSAVED_ROWS (${Object.values(UNSAVED_ROWS).join(', ')}).`);
    }
    const {t} = useToolkitTranslation('common', texts);
    const storeRef = useRef(null);
    storeRef.current ??= createRowDraftsStore();
    const store = storeRef.current;
    // solo el conteo: así la pantalla no se vuelve a pintar con cada tecla, solo cuando un renglón gana o pierde cambios
    const pendingCount = useSyncExternalStore(store.subscribe, store.size, store.size);
    // los renglones que se ven: cómo guardar o deshacer cada uno
    const visibleRowsRef = useRef(new Map());
    // lo de la pantalla de ahora, leído al guardar (el renglón se arma una vez)
    const latest = useRef({});
    latest.current = {rowSchema, validateRow, onSaveRow};
    const [pendingChange, setPendingChange] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notSavedCount, setNotSavedCount] = useState(0);

    // cada renglón dentro de su propio formulario: el MISMO componente siempre (la tabla lo arma una vez)
    const rowWrapper = useMemo(() => function EditableServerRow({rowId, row, children}) {
        const {rowSchema: schema, validateRow: ownRules} = latest.current;
        return (
            <CalcitaFormik
                initialValues={row}
                enableReinitialize
                validationSchema={schema}
                validate={ownRules ? (values) => latest.current.validateRow(values, {rowId, row}) : undefined}
                onSubmit={async (values, helpers) => {
                    await latest.current.onSaveRow(values, {...helpers, rowId, row, isVisible: true});
                    storeRef.current.remove(rowId);
                    // lo guardado es su nuevo inicio, aunque la pantalla no vuelva a pedir la página
                    helpers.resetForm({values});
                }}
            >
                <>
                    <RowDraftKeeper rowId={rowId} store={storeRef.current} visibleRows={visibleRowsRef.current} />
                    {children}
                </>
            </CalcitaFormik>
        );
    }, []);

    const discardAll = () => {
        store.clear();
        visibleRowsRef.current.forEach(({resetForm}) => resetForm());
        setNotSavedCount(0);
    };

    const saveAll = async () => {
        setIsSaving(true);
        let notSaved = 0;
        const drafts = store.entries();
        try {
            if (onSaveRows) {
                // todos juntos: primero se revisan todos; con uno mal, no se manda nada
                const checks = await Promise.all(drafts.map(([, draft]) => (rowSchema ? rowSchema.isValid(draft.values) : true)));
                notSaved = checks.filter((isValid) => !isValid).length;
                if (notSaved === 0) {
                    await onSaveRows(drafts.map(([rowId, draft]) => ({rowId, row: draft.row, values: draft.values})));
                    discardAll();
                } else {
                    // los que se ven enseñan sus errores en sus celdas
                    await Promise.all([...visibleRowsRef.current.values()].map(({submitForm}) => submitForm().catch(() => {})));
                }
                return;
            }
            for (const [rowId, draft] of drafts) {
                const visibleRow = visibleRowsRef.current.get(rowId);
                try {
                    if (visibleRow) {
                        // como su ✓: con errores, formik no guarda y los enseña en sus celdas
                        await visibleRow.submitForm();
                    } else {
                        if (rowSchema) {
                            await rowSchema.validate(draft.values);
                        }
                        await onSaveRow(draft.values, {...HIDDEN_ROW_HELPERS, rowId, row: draft.row, isVisible: false});
                        store.remove(rowId);
                    }
                } catch {
                    // el renglón se queda con sus cambios: la pantalla ya dijo el problema (o es un error de rowSchema)
                }
                if (store.get(rowId)) {
                    notSaved += 1;
                }
            }
        } finally {
            setNotSavedCount(notSaved);
            setIsSaving(false);
        }
    };

    // con confirm: cambiar de página, filtro u orden con cambios sin guardar primero pregunta
    const beforeQueryChange = unsavedRows === UNSAVED_ROWS.confirm
        ? (applyChange) => (store.size() === 0 ? applyChange() : setPendingChange(() => applyChange))
        : undefined;

    const fieldColumn = ({field, label, renderField, width, ...gridColumnProps}) => ({
        field,
        headerName: label,
        width,
        sortable: false,
        filterable: false,
        ...gridColumnProps,
        renderCell: (params) => <FieldCell renderField={renderField} rowId={params.id} savedRow={params.row} />,
    });

    const actionsColumn = (gridColumnProps = {}) => ({
        field: ROW_ACTIONS_FIELD,
        headerName: t('repeating.actionsHeader'),
        width: ROW_ACTIONS_WIDTH_PIXELS,
        sortable: false,
        filterable: false,
        align: 'right',
        headerAlign: 'right',
        ...gridColumnProps,
        renderCell: (params) => (
            <RowSaveActions
                title={rowLabelOf?.(params.row) ?? t('repeating.row', {number: (params.api.getRowIndexRelativeToVisibleRows?.(params.id) ?? 0) + 1})}
                texts={texts}
            />
        ),
    });

    const unsavedBar = (
        <UnsavedRowsBar
            count={pendingCount}
            notSavedCount={notSavedCount}
            isSaving={isSaving}
            onSaveAll={saveAll}
            onDiscardAll={discardAll}
            isConfirmOpen={pendingChange !== null}
            onConfirmDiscard={() => {
                const applyChange = pendingChange;
                setPendingChange(null);
                discardAll();
                applyChange?.();
            }}
            onConfirmClose={() => setPendingChange(null)}
            texts={texts}
        />
    );

    return {
        tableProps: {rowWrapper, getRowHeight: AUTO_ROW_HEIGHT, ...(beforeQueryChange && {beforeQueryChange})},
        fieldColumn,
        actionsColumn,
        unsavedBar,
        pendingCount,
        saveAll,
        discardAll,
    };
}
