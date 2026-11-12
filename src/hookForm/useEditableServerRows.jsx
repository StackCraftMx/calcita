// Campos en los renglones de la tabla del servidor (ServerTable de /table) con react-hook-form: cada renglón es su propio
// useForm. Se usa igual que el useEditableServerRows de formik (@stackcraftmx/calcita/forms): tableProps, fieldColumn,
// actionsColumn y unsavedBar, con rowSchema, validateRow, onSaveRow, onSaveRows y unsavedRows. Cambia lo que recibe la
// pantalla: el useForm de cada renglón (form.setValue en renderField; applyServerProblem(error, form) en onSaveRow).
//
// Lo de siempre de esta pieza (dónde vive lo capturado, «Guardar todos», preguntar antes de cambiar de página, las teclas
// que no le llegan a la cuadrícula) está explicado en el de formik: src/forms/useEditableServerRows.jsx.
//
// OJO: lo capturado regresa al volver a la página con setValue(…, {shouldDirty: true}) y no con reset: reset lo volvería el
// valor de inicio y el renglón ya no tendría cambios que guardar.
//
// Hook de formularios: function (regla de la casa).
import {createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore} from 'react';
import {FormProvider, useForm, useFormContext, useFormState, useWatch} from 'react-hook-form';
import Box from '@mui/material/Box';

import RowSaveActions from '@/hookForm/RowSaveActions.jsx';
import {rowResolverOf} from '@/hookForm/rowResolver.js';
import {TABLE_CELL_FIELD_LAYOUT} from '@/inputs/FormSection.jsx';
import {FormSectionContext} from '@/inputs/formLayoutContext.js';
import {UNSAVED_ROWS, createRowDraftsStore} from '@/inputs/rowDrafts.js';
import UnsavedRowsBar from '@/inputs/UnsavedRowsBar.jsx';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

const ROW_ACTIONS_FIELD = 'calcitaRowActions';
const ROW_ACTIONS_WIDTH_PIXELS = 96;
const FIELD_CELL_PADDING_PIXELS = 6;
const AUTO_ROW_HEIGHT = () => 'auto';

// cómo guardar el renglón donde está la celda de ✓ (lo pone su renglón)
const RowSaveContext = createContext(null);

/** Las teclas de un campo no le llegan a la cuadrícula: el espacio y las flechas son para escribir. */
const keepKeysInField = (event) => event.stopPropagation();

/** Lo de react-hook-form para un renglón que no se ve (otra página): no hay campos donde enseñar errores. */
const hiddenRowFormOf = (values) => ({setError: () => {}, clearErrors: () => {}, getValues: () => values, reset: () => {}});

/** Un renglón de la cuadrícula con su useForm; lo capturado va y viene del almacén. */
function ServerHookRow({rowId, row, children, latest, store, visibleRows}) {
    const {rowSchema, formOptions} = latest.current;
    const hasOwnRules = Boolean(rowSchema || latest.current.validateRow);
    const ownResolver = useMemo(
        () => (hasOwnRules ? rowResolverOf(rowSchema, () => latest.current.validateRow, () => ({rowId, row})) : undefined),
        [hasOwnRules, rowSchema, latest, rowId, row],
    );
    const form = useForm({...formOptions, resolver: formOptions?.resolver ?? ownResolver, defaultValues: row});
    const values = useWatch({control: form.control});
    const {isDirty} = useFormState({control: form.control});

    // al volver a esta página: lo capturado, como cambios (no como valor de inicio)
    useEffect(() => {
        const draft = store.get(rowId);
        if (draft) {
            Object.entries(draft.values).forEach(([field, value]) => form.setValue(field, value, {shouldDirty: true}));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // lo que se escribe va al almacén mientras tenga cambios (la primera vez todavía no llega lo recuperado)
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        if (isDirty) {
            store.set(rowId, {values: form.getValues(), row});
        } else {
            store.remove(rowId);
        }
    }, [values, isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

    const save = form.handleSubmit(async (formValues) => {
        await latest.current.onSaveRow(formValues, {form, rowId, row, isVisible: true});
        store.remove(rowId);
        form.reset(formValues);
    });
    useEffect(() => {
        visibleRows.set(rowId, {save, reset: () => form.reset()});
        return () => visibleRows.delete(rowId);
    });
    return (
        <FormProvider {...form}>
            <RowSaveContext.Provider value={save}>{children}</RowSaveContext.Provider>
        </FormProvider>
    );
}

/** La celda con su campo: la forma de la casa, la etiqueta solo para el lector y las teclas para el campo. */
function FieldCell({renderField, rowId, savedRow}) {
    const form = useFormContext();
    const values = useWatch({control: form.control});
    return (
        <FormSectionContext.Provider value={TABLE_CELL_FIELD_LAYOUT}>
            <Box onKeyDown={keepKeysInField} sx={{width: '100%', py: `${FIELD_CELL_PADDING_PIXELS}px`}}>
                {renderField({rowId, row: {...savedRow, ...values}, savedRow, nameOf: (field) => field, form})}
            </Box>
        </FormSectionContext.Provider>
    );
}

/** El ✓ y «Deshacer» de la celda de acciones, con el guardar de su renglón. */
function ActionsCell({title, texts}) {
    const save = useContext(RowSaveContext);
    return <RowSaveActions title={title} save={save} texts={texts} />;
}

/**
 * @param {object} options
 * @param {object} [options.rowSchema] el yup de UN renglón
 * @param {(values: any, context: {rowId: string|number, row: any}) => object|Promise<object>} [options.validateRow] reglas
 *     propias del renglón ({campo: 'mensaje'}), además de rowSchema
 * @param {(values: any, context: {form: import('react-hook-form').UseFormReturn<any>, rowId: string|number, row: any, isVisible: boolean}) => Promise<unknown>|unknown} options.onSaveRow
 *     guarda un renglón. Si truena, el renglón se queda con sus cambios (applyServerProblem(error, form) pone los errores del
 *     servidor en sus celdas si el renglón se ve)
 * @param {(changes: Array<{rowId: string|number, row: any, values: any}>) => Promise<unknown>|unknown} [options.onSaveRows]
 *     «Guardar todos» en UNA llamada; sin ella, uno por uno con onSaveRow
 * @param {object} [options.formOptions] lo demás que va a useForm de cada renglón (mode…; un resolver ahí gana a rowSchema)
 * @param {'keep'|'confirm'} [options.unsavedRows] UNSAVED_ROWS: recordar lo capturado (por omisión) o preguntar antes
 * @param {(row: any) => string} [options.rowLabelOf] el nombre de un renglón para el lector; por omisión «Renglón N»
 * @param {object} [options.texts] los textos que cambian, con la forma de `common`
 * @returns {{
 *   tableProps: {rowWrapper: import('react').ComponentType<any>, getRowHeight: () => 'auto', beforeQueryChange?: (applyChange: () => void) => void},
 *   fieldColumn: (column: {field: string, label: string, renderField: (row: {rowId: string|number, row: any, savedRow: any, nameOf: (field: string) => string, form: import('react-hook-form').UseFormReturn<any>}) => import('react').ReactNode} & Record<string, any>) => object,
 *   actionsColumn: (column?: Record<string, any>) => object,
 *   unsavedBar: import('react').ReactNode,
 *   pendingCount: number,
 *   saveAll: () => Promise<void>,
 *   discardAll: () => void,
 * }}
 */
export function useEditableServerRows({
    rowSchema, validateRow, onSaveRow, onSaveRows, formOptions, unsavedRows = UNSAVED_ROWS.keep, rowLabelOf, texts,
} = {}) {
    if (!Object.values(UNSAVED_ROWS).includes(unsavedRows)) {
        throw new Error(`useEditableServerRows: unsavedRows «${unsavedRows}» no existe; use uno de UNSAVED_ROWS (${Object.values(UNSAVED_ROWS).join(', ')}).`);
    }
    const {t} = useToolkitTranslation('common', texts);
    const storeRef = useRef(null);
    storeRef.current ??= createRowDraftsStore();
    const store = storeRef.current;
    const pendingCount = useSyncExternalStore(store.subscribe, store.size, store.size);
    const visibleRowsRef = useRef(new Map());
    const latest = useRef({});
    latest.current = {rowSchema, validateRow, onSaveRow, formOptions};
    const [pendingChange, setPendingChange] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notSavedCount, setNotSavedCount] = useState(0);

    // cada renglón dentro de su propio useForm: el MISMO componente siempre (la tabla lo arma una vez)
    const rowWrapper = useMemo(() => function EditableServerHookRow({rowId, row, children}) {
        return (
            <ServerHookRow rowId={rowId} row={row} latest={latest} store={storeRef.current} visibleRows={visibleRowsRef.current}>
                {children}
            </ServerHookRow>
        );
    }, []);

    const discardAll = () => {
        store.clear();
        visibleRowsRef.current.forEach(({reset}) => reset());
        setNotSavedCount(0);
    };

    const saveAll = async () => {
        setIsSaving(true);
        let notSaved = 0;
        const drafts = store.entries();
        try {
            if (onSaveRows) {
                const checks = await Promise.all(drafts.map(([, draft]) => (rowSchema ? rowSchema.isValid(draft.values) : true)));
                notSaved = checks.filter((isValid) => !isValid).length;
                if (notSaved === 0) {
                    await onSaveRows(drafts.map(([rowId, draft]) => ({rowId, row: draft.row, values: draft.values})));
                    discardAll();
                } else {
                    await Promise.all([...visibleRowsRef.current.values()].map(({save}) => save().catch(() => {})));
                }
                return;
            }
            for (const [rowId, draft] of drafts) {
                const visibleRow = visibleRowsRef.current.get(rowId);
                try {
                    if (visibleRow) {
                        // como su ✓: con errores no guarda y los enseña en sus celdas
                        await visibleRow.save();
                    } else {
                        if (rowSchema) {
                            await rowSchema.validate(draft.values);
                        }
                        await onSaveRow(draft.values, {form: hiddenRowFormOf(draft.values), rowId, row: draft.row, isVisible: false});
                        store.remove(rowId);
                    }
                } catch {
                    // el renglón se queda con sus cambios
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
            <ActionsCell
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
