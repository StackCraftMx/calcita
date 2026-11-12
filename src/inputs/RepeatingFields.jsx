// Renglones de campos que se repiten (los contactos de un cliente, los precios por volumen, el reparto de un presupuesto):
// cada renglón con su número y «Quitar», y «Agregar» al final. Es solo la VISTA: los renglones los guarda el formulario
// (FormRepeatingFields de formik o de react-hook-form los conecta por name).
//
// Reglas de la vista:
//   - minRows (por omisión 1): con el mínimo, «Quitar» se vuelve «Limpiar» y deja el renglón vacío (nunca queda la
//     lista sin renglones para escribir);
//   - maxRows: con el máximo, «Agregar» se apaga y dice hasta cuántos;
//   - quitar un renglón lo decide la pantalla: removeBlockedReasonOf(index) da el motivo si NO se puede (sale en una
//     ventana con «Entendido»), y confirmRemoveOf(index) pide confirmar antes (un renglón ya guardado);
//   - el renglón con un error se marca en rojo, para encontrarlo en una lista larga.
//
// Dos formas de pintarlos (layout, REPEATING_LAYOUT):
//   - cards (por omisión, lo de siempre): una tarjeta por renglón con su título; en escritorio los campos van lado a lado
//     (columns) y en el teléfono uno debajo de otro. Los campos llevan su etiqueta arriba aunque la lista esté dentro de
//     una FormSection;
//   - table: una tabla, un renglón por renglón y una columna por campo (tableColumns, con su encabezado). Cada campo que
//     regresa renderRow va en su columna, EN ORDEN: así una pantalla pasa de tarjetas a tabla con una prop, sin tocar
//     renderRow. Los campos toman la forma de la casa sin tarjeta ni etiqueta a la vista (como una FormSection bare con
//     labelWidth 0): el encabezado de la columna ya dice qué es y el lector de pantalla sigue leyendo la etiqueta. Un texto
//     también puede ir en su columna (un dato calculado, de solo lectura). Quitar va en la última columna, con su ícono.
//     En el teléfono (por debajo de `sm`) quien programa escoge (phoneLayout, REPEATING_PHONE_LAYOUT): tarjetas (por
//     omisión; una tabla de seis campos no cabe) o la misma tabla, que se desliza de lado.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaRepeatingFields con defaultProps y
// styleOverrides de sus partes: root, row, rowHeader, rowContent, addButton, helper y, con la tabla, table, headerCell,
// cell y numberCell.
//
// Genérico del paquete: function (regla de la casa).
import {Fragment, isValidElement, useId, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import ConfirmDialog from '@/feedback/ConfirmDialog.jsx';
import {useValidationText} from '@/forms/useValidationText.js';
import {TABLE_CELL_FIELD_LAYOUT} from '@/inputs/FormSection.jsx';
import {FormSectionContext} from '@/inputs/formLayoutContext.js';
import {createLogger} from '@/observability/logger.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/** Cómo se pintan los renglones: una tarjeta por renglón (cards, lo de siempre) o una tabla (table). */
export const REPEATING_LAYOUT = Object.freeze({cards: 'cards', table: 'table'});

/** La tabla en el teléfono: se vuelve tarjetas (cards, por omisión) o se queda tabla y se desliza de lado (scroll). */
export const REPEATING_PHONE_LAYOUT = Object.freeze({cards: 'cards', scroll: 'scroll'});

const log = createLogger('RepeatingFields');

// por omisión: uno en el teléfono, dos en tableta, tres en escritorio
const DEFAULT_COLUMNS = Object.freeze({xs: 1, sm: 2, md: 3});

// lo que baja el número y los botones de un renglón para quedar a la altura del texto del campo (el campo mide 40 px)
const CELL_TEXT_TOP_PIXELS = 14;

// el encabezado que solo lee el lector de pantalla (el del número y el de las acciones)
const VISUALLY_HIDDEN_SX = Object.freeze({
    position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
});

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaRepeatingFields)
const THEME_NAME = 'CalcitaRepeatingFields';
const RepeatingRoot = piecePart(THEME_NAME, 'Root', Stack);
const RepeatingRow = piecePart(THEME_NAME, 'Row', Paper);
const RepeatingRowHeader = piecePart(THEME_NAME, 'RowHeader', Stack);
const RepeatingRowContent = piecePart(THEME_NAME, 'RowContent', Box);
const RepeatingAddButton = piecePart(THEME_NAME, 'AddButton', Button);
const RepeatingHelper = piecePart(THEME_NAME, 'Helper', FormHelperText);
const RepeatingTable = piecePart(THEME_NAME, 'Table', TableContainer);
const RepeatingHeaderCell = piecePart(THEME_NAME, 'HeaderCell', TableCell);
const RepeatingCell = piecePart(THEME_NAME, 'Cell', TableCell);
const RepeatingNumberCell = piecePart(THEME_NAME, 'NumberCell', TableCell);

/**
 * Lo que regresó renderRow, separado en lo de cada columna y en orden: un fragmento (<>…</>) o una lista dan uno por
 * elemento; un solo campo, uno. OJO: un {condición && <Campo />} que da false también ocupa su columna (queda vacía): si se
 * quitara, los campos de la derecha se correrían de columna.
 *
 * @param {import('react').ReactNode} rowContent
 * @returns {import('react').ReactNode[]}
 */
function cellsOf(rowContent) {
    if (isValidElement(rowContent) && rowContent.type === Fragment) {
        return cellsOf(rowContent.props.children);
    }
    return Array.isArray(rowContent) ? rowContent.flat(Infinity) : [rowContent];
}

/** Lo menos que mide una columna: un número son px. */
function columnWidthOf(width) {
    return typeof width === 'number' ? `${width}px` : width;
}

/**
 * El número de columnas de la rejilla como CSS: {xs: 1, md: 3} → {xs: 'repeat(1, minmax(0, 1fr))', …}.
 *
 * @param {number|Record<string, number>} columns
 * @returns {string|Record<string, string>}
 */
function gridColumnsOf(columns) {
    const templateOf = (count) => `repeat(${count}, minmax(0, 1fr))`;
    if (typeof columns === 'number') {
        return templateOf(columns);
    }
    return Object.fromEntries(Object.entries(columns).map(([breakpoint, count]) => [breakpoint, templateOf(count)]));
}

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.label] ya traducido: el título de la lista («Contactos»)
 * @param {string[]} props.rowKeys una llave estable por renglón (no el índice: al quitar uno, los de abajo no deben
 *     confundirse con el que se fue)
 * @param {(index: number, rowContext?: object) => import('react').ReactNode} props.renderRow los campos del renglón (rowContext:
 *     lo que da rowWrapperOf, si lo hay)
 * @param {(index: number) => string} [props.rowLabelOf] el título de cada renglón; por omisión «Renglón 1», «Renglón 2»…
 * @param {(index: number, rowContext?: object) => import('react').ReactNode} [props.rowActionsOf] botones suyos en el título del
 *     renglón (en la tabla, en la columna de acciones); rowContext: lo que da rowWrapperOf, si lo hay
 * @param {number|Record<string, number>} [props.columns] con tarjetas, cuántos campos lado a lado: 2 o {xs: 1, sm: 2, md: 3}
 * @param {'cards'|'table'} [props.layout] uno de REPEATING_LAYOUT: una tarjeta por renglón (por omisión) o una tabla
 * @param {Array<{key: string, header: import('react').ReactNode, width?: number|string, align?: 'left'|'right'|'center'}>} [props.tableColumns]
 *     con la tabla, sus columnas en el orden de los campos de renderRow: su llave, su encabezado ya traducido, lo menos
 *     que mide (un número son px) y cómo se alinea
 * @param {'cards'|'scroll'} [props.phoneLayout] con la tabla, qué hace en el teléfono (REPEATING_PHONE_LAYOUT): tarjetas
 *     (por omisión) o la tabla que se desliza de lado
 * @param {number} [props.minRows] cuántos renglones quedan siempre (por omisión 1); con 0 se puede quedar vacía
 * @param {number|null} [props.maxRows] hasta cuántos; sin él, los que quiera
 * @param {() => void} [props.onAdd] agrega un renglón vacío al final; sin él no sale «Agregar» (solo se editan los que hay)
 * @param {(index: number) => void} [props.onRemove] quita ese renglón; sin él no sale «Quitar»
 * @param {(index: number) => void} [props.onClear] deja ese renglón vacío (cuando ya no se puede quitar por el mínimo)
 * @param {(index: number) => boolean} [props.canRemoveOf] false si ese renglón no lleva «Quitar» (un renglón que solo se edita)
 * @param {boolean} [props.removeIsImmediate] quitar borra en ese momento (no al guardar el formulario): la confirmación lo dice
 * @param {(index: number, buildRow: (rowContext?: object) => import('react').ReactNode) => import('react').ReactNode} [props.rowWrapperOf]
 *     envuelve cada renglón (la tarjeta o el renglón de la tabla) con lo suyo: su propio formulario, en EditableRows. Arma el
 *     renglón desde adentro con buildRow(rowContext), y rowContext le llega a renderRow como segundo dato (los valores de ese
 *     formulario). Lo que envuelve no pinta nada (un proveedor de contexto), para no romper la tabla
 * @param {(index: number) => string|null} [props.removeBlockedReasonOf] si ese renglón NO se puede quitar, el motivo ya
 *     traducido (sale en una ventana)
 * @param {(index: number) => boolean} [props.confirmRemoveOf] true si hay que confirmar antes de quitarlo
 * @param {(index: number) => boolean} [props.rowHasErrorOf] true si el renglón tiene un error (se marca en rojo)
 * @param {string|{key: string, values?: object}} [props.error] el error de toda la lista (la suma no alcanza, faltan renglones)
 * @param {import('react').ReactNode} [props.helperText] ya traducida
 * @param {import('react').ReactNode} [props.footer] lo que va junto a «Agregar» (p. ej. «Suman $40,000 de $50,000»)
 * @param {string} [props.addLabel] ya traducido; por omisión «Agregar»
 * @param {boolean} [props.disabled]
 * @param {object} [props.sx]
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Escriba el RFC', matches: 'El RFC lleva 12 o 13 caracteres'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function RepeatingFieldsContent(props) {
    const {
        label, rowKeys, renderRow, rowLabelOf, rowActionsOf, columns = DEFAULT_COLUMNS, layout = REPEATING_LAYOUT.cards, tableColumns,
        phoneLayout = REPEATING_PHONE_LAYOUT.cards, minRows = 1, maxRows = null, onAdd, onRemove, onClear, canRemoveOf, removeIsImmediate = false,
        rowWrapperOf, removeBlockedReasonOf, confirmRemoveOf, rowHasErrorOf, error, helperText, footer, addLabel, disabled = false, sx, messages, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    if (!Object.values(REPEATING_LAYOUT).includes(layout)) {
        throw new Error(`RepeatingFields: layout «${layout}» no existe; use uno de REPEATING_LAYOUT (${Object.values(REPEATING_LAYOUT).join(', ')}).`);
    }
    if (!Object.values(REPEATING_PHONE_LAYOUT).includes(phoneLayout)) {
        throw new Error(`RepeatingFields: phoneLayout «${phoneLayout}» no existe; use uno de REPEATING_PHONE_LAYOUT (${Object.values(REPEATING_PHONE_LAYOUT).join(', ')}).`);
    }
    if (layout === REPEATING_LAYOUT.table && !tableColumns?.length) {
        throw new Error('RepeatingFields: con layout table hacen falta tableColumns (la llave y el encabezado de cada columna).');
    }
    // el teléfono: por debajo de `sm` en el tema. Se sabe hasta montar (en el servidor se pinta la tabla)
    const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const showsTable = layout === REPEATING_LAYOUT.table && !(isPhone && phoneLayout === REPEATING_PHONE_LAYOUT.cards);
    const {t} = useToolkitTranslation('common', texts);
    // el texto del error: el de la pantalla (messages), el del proyecto para este campo o el de Calcita
    const validationTextOf = useValidationText({label, messages});
    // el renglón que se va a quitar y por qué se pregunta: {index, kind: 'confirm' | 'blocked', reason}
    const [pendingRemoval, setPendingRemoval] = useState(null);
    const blockedTitleId = `${useId()}-blocked-title`;
    const rowCount = rowKeys.length;
    const isAtMinimum = rowCount <= minRows;
    const isAtMaximum = maxRows != null && rowCount >= maxRows;
    const errorText = validationTextOf(error);
    const titleOf = (index) => rowLabelOf?.(index) ?? t('repeating.row', {number: index + 1});
    // «Quitar» sale si la pantalla sabe quitar y ese renglón se deja quitar
    const showsRemoveOf = (index) => Boolean(onRemove) && canRemoveOf?.(index) !== false;
    // cada renglón dentro de lo de la pantalla (su propio formulario), que lo arma desde adentro; la llave va afuera
    const wrappedRow = (index, rowKey, buildRow) => (rowWrapperOf ? <Fragment key={rowKey}>{rowWrapperOf(index, buildRow)}</Fragment> : buildRow());

    // quitar (o limpiar, si ya está en el mínimo): primero lo que diga la pantalla
    const requestRemove = (index) => {
        const blockedReason = removeBlockedReasonOf?.(index) ?? null;
        if (blockedReason) {
            setPendingRemoval({index, kind: 'blocked', reason: blockedReason});
            return;
        }
        if (confirmRemoveOf?.(index)) {
            setPendingRemoval({index, kind: 'confirm'});
            return;
        }
        removeOrClear(index);
    };
    const removeOrClear = (index) => {
        if (isAtMinimum && onClear) {
            onClear(index);
        } else {
            onRemove(index);
        }
    };

    return (
        <RepeatingRoot spacing={1.5} ownSx={{minWidth: 0}} sx={sx}>
            {label && <Typography variant="subtitle2" component="h3">{label}</Typography>}
            {showsTable ? (
                // position relative: los encabezados que solo lee el lector van fuera de la vista con position absolute y se
                // medían contra algo de afuera de esta caja; el de «Acciones», hasta la derecha, ensanchaba la página en el
                // teléfono (521 px de más, medido en Chrome y WebKit). Así quedan dentro de lo que se desliza
                <RepeatingTable component={Paper} variant="outlined" ownSx={{overflowX: 'auto', position: 'relative'}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <RepeatingHeaderCell ownSx={{width: '1%'}}><Box component="span" sx={VISUALLY_HIDDEN_SX}>{t('repeating.rowHeader')}</Box></RepeatingHeaderCell>
                                {tableColumns.map((column) => (
                                    <RepeatingHeaderCell key={column.key} align={column.align} ownSx={{minWidth: columnWidthOf(column.width), whiteSpace: 'nowrap'}}>
                                        {column.header}
                                    </RepeatingHeaderCell>
                                ))}
                                <RepeatingHeaderCell ownSx={{width: '1%'}}><Box component="span" sx={VISUALLY_HIDDEN_SX}>{t('repeating.actionsHeader')}</Box></RepeatingHeaderCell>
                            </TableRow>
                        </TableHead>
                        {/* los campos de cada celda, con la forma de la casa y sin etiqueta a la vista */}
                        <FormSectionContext.Provider value={TABLE_CELL_FIELD_LAYOUT}>
                            <TableBody>
                                {rowKeys.map((rowKey, index) => {
                                    const hasError = Boolean(rowHasErrorOf?.(index));
                                    const removeText = isAtMinimum ? t('repeating.clear', {row: titleOf(index)}) : t('repeating.remove', {row: titleOf(index)});
                                    return wrappedRow(index, rowKey, (rowContext) => {
                                        const cells = cellsOf(renderRow(index, rowContext));
                                        if (cells.length !== tableColumns.length) {
                                            log.warn(`renderRow dio ${cells.length} campos y tableColumns tiene ${tableColumns.length} columnas: cada campo va en su columna, en orden.`);
                                        }
                                        return (
                                            <TableRow key={rowKey}>
                                                {/* el número del renglón; en rojo si tiene un error, para encontrarlo en una lista larga */}
                                                <RepeatingNumberCell ownSx={{verticalAlign: 'top', pt: `${CELL_TEXT_TOP_PIXELS}px`, fontWeight: hasError ? 600 : undefined,
                                                    color: hasError ? 'error.main' : 'text.secondary'}}>
                                                    {index + 1}
                                                </RepeatingNumberCell>
                                                {tableColumns.map((column, columnIndex) => (
                                                    <RepeatingCell key={column.key} align={column.align} ownSx={{verticalAlign: 'top', minWidth: columnWidthOf(column.width)}}>
                                                        {cells[columnIndex]}
                                                    </RepeatingCell>
                                                ))}
                                                <RepeatingCell ownSx={{verticalAlign: 'top', whiteSpace: 'nowrap'}}>
                                                    <Stack direction="row" sx={{alignItems: 'center', gap: 0.5}}>
                                                        {rowActionsOf?.(index, rowContext)}
                                                        {showsRemoveOf(index) && (
                                                            <Tooltip title={removeText}>
                                                                <span>
                                                                    <IconButton size="small" disabled={disabled} onClick={() => requestRemove(index)} aria-label={removeText}>
                                                                        {isAtMinimum ? <RestartAltRoundedIcon fontSize="small" /> : <DeleteOutlineRoundedIcon fontSize="small" />}
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                </RepeatingCell>
                                            </TableRow>
                                        );
                                    });
                                })}
                            </TableBody>
                        </FormSectionContext.Provider>
                    </Table>
                </RepeatingTable>
            ) : rowKeys.map((rowKey, index) => {
                const removeText = isAtMinimum ? t('repeating.clear', {row: titleOf(index)}) : t('repeating.remove', {row: titleOf(index)});
                return wrappedRow(index, rowKey, (rowContext) => (
                    <RepeatingRow
                        key={rowKey}
                        variant="outlined"
                        role="group"
                        aria-label={titleOf(index)}
                        ownSx={{p: {xs: 1.5, sm: 2}, ...(rowHasErrorOf?.(index) && {borderColor: 'error.main'})}}
                    >
                        <RepeatingRowHeader direction="row" ownSx={{alignItems: 'center', gap: 1, mb: 1.5}}>
                            <Typography variant="subtitle2" sx={{flexGrow: 1, minWidth: 0}} color={rowHasErrorOf?.(index) ? 'error' : 'text.primary'}>
                                {titleOf(index)}
                            </Typography>
                            {rowActionsOf?.(index, rowContext)}
                            {showsRemoveOf(index) && (
                                <Button size="small" color="inherit" disabled={disabled} onClick={() => requestRemove(index)} aria-label={removeText}
                                        startIcon={isAtMinimum ? <RestartAltRoundedIcon /> : <DeleteOutlineRoundedIcon />}>
                                    {isAtMinimum ? t('repeating.clearShort') : t('repeating.removeShort')}
                                </Button>
                            )}
                        </RepeatingRowHeader>
                        {/* los campos del renglón llevan su etiqueta arriba aunque la lista esté dentro de una FormSection */}
                        <FormSectionContext.Provider value={false}>
                            <RepeatingRowContent ownSx={{display: 'grid', gap: 2, gridTemplateColumns: gridColumnsOf(columns), alignItems: 'start'}}>
                                {renderRow(index, rowContext)}
                            </RepeatingRowContent>
                        </FormSectionContext.Provider>
                    </RepeatingRow>
                ));
            })}
            <Stack direction="row" sx={{alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
                {onAdd && (
                    <RepeatingAddButton variant="outlined" startIcon={<AddRoundedIcon />} onClick={onAdd} disabled={disabled || isAtMaximum}
                                        ownSx={{alignSelf: 'flex-start'}}>
                        {addLabel ?? t('repeating.add')}
                    </RepeatingAddButton>
                )}
                {onAdd && maxRows != null && (
                    <Typography variant="caption" color="text.secondary">{t('repeating.maxRows', {count: maxRows})}</Typography>
                )}
                {footer}
            </Stack>
            {(errorText || helperText) && (
                <RepeatingHelper error={Boolean(errorText)} role={errorText ? 'alert' : undefined} ownSx={{mx: 0}}>
                    {errorText ?? helperText}
                </RepeatingHelper>
            )}

            <ConfirmDialog
                open={pendingRemoval?.kind === 'confirm'}
                title={t('repeating.confirmTitle', {row: pendingRemoval ? titleOf(pendingRemoval.index) : ''})}
                description={removeIsImmediate ? t('repeating.confirmTextNow') : t('repeating.confirmText')}
                confirmLabel={t('repeating.removeShort')}
                tone="error"
                onConfirm={() => {
                    removeOrClear(pendingRemoval.index);
                    setPendingRemoval(null);
                }}
                onClose={() => setPendingRemoval(null)}
                texts={texts}
            />
            <Dialog open={pendingRemoval?.kind === 'blocked'} onClose={() => setPendingRemoval(null)} maxWidth="xs" fullWidth
                    aria-labelledby={blockedTitleId}>
                <DialogTitle id={blockedTitleId}>{t('repeating.blockedTitle')}</DialogTitle>
                <DialogContent><Typography>{pendingRemoval?.reason}</Typography></DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setPendingRemoval(null)} autoFocus>{t('repeating.understood')}</Button>
                </DialogActions>
            </Dialog>
        </RepeatingRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const RepeatingFields = withPieceSlots(RepeatingFieldsContent, THEME_NAME);
export default RepeatingFields;
