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
// En escritorio los campos de un renglón van lado a lado (columns); en el teléfono, uno debajo de otro, como tarjetas.
// Dentro de un renglón los campos van con su etiqueta arriba aunque la lista esté dentro de una FormSection.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaRepeatingFields con defaultProps y
// styleOverrides de sus partes: root, row, rowHeader, rowContent, addButton, helper.
//
// Genérico del paquete: function (regla de la casa).
import {useId, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import ConfirmDialog from '@/feedback/ConfirmDialog.jsx';
import {translateValidationMessage} from '@/forms/validationMessages.js';
import {FormSectionContext} from '@/inputs/formLayoutContext.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// por omisión: uno en el teléfono, dos en tableta, tres en escritorio
const DEFAULT_COLUMNS = Object.freeze({xs: 1, sm: 2, md: 3});

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaRepeatingFields)
const THEME_NAME = 'CalcitaRepeatingFields';
const RepeatingRoot = piecePart(THEME_NAME, 'Root', Stack);
const RepeatingRow = piecePart(THEME_NAME, 'Row', Paper);
const RepeatingRowHeader = piecePart(THEME_NAME, 'RowHeader', Stack);
const RepeatingRowContent = piecePart(THEME_NAME, 'RowContent', Box);
const RepeatingAddButton = piecePart(THEME_NAME, 'AddButton', Button);
const RepeatingHelper = piecePart(THEME_NAME, 'Helper', FormHelperText);

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
 * @param {(index: number) => import('react').ReactNode} props.renderRow los campos del renglón
 * @param {(index: number) => string} [props.rowLabelOf] el título de cada renglón; por omisión «Renglón 1», «Renglón 2»…
 * @param {(index: number) => import('react').ReactNode} [props.rowActionsOf] botones suyos en el título del renglón
 * @param {number|Record<string, number>} [props.columns] cuántos campos lado a lado: 2 o {xs: 1, sm: 2, md: 3}
 * @param {number} [props.minRows] cuántos renglones quedan siempre (por omisión 1); con 0 se puede quedar vacía
 * @param {number|null} [props.maxRows] hasta cuántos; sin él, los que quiera
 * @param {() => void} props.onAdd agrega un renglón vacío al final
 * @param {(index: number) => void} props.onRemove quita ese renglón
 * @param {(index: number) => void} props.onClear deja ese renglón vacío (cuando ya no se puede quitar por el mínimo)
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
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function RepeatingFields(props) {
    const {
        label, rowKeys, renderRow, rowLabelOf, rowActionsOf, columns = DEFAULT_COLUMNS, minRows = 1, maxRows = null, onAdd, onRemove,
        onClear, removeBlockedReasonOf, confirmRemoveOf, rowHasErrorOf, error, helperText, footer, addLabel, disabled = false, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    // el renglón que se va a quitar y por qué se pregunta: {index, kind: 'confirm' | 'blocked', reason}
    const [pendingRemoval, setPendingRemoval] = useState(null);
    const blockedTitleId = `${useId()}-blocked-title`;
    const rowCount = rowKeys.length;
    const isAtMinimum = rowCount <= minRows;
    const isAtMaximum = maxRows != null && rowCount >= maxRows;
    const errorText = translateValidationMessage(t, error);
    const titleOf = (index) => rowLabelOf?.(index) ?? t('repeating.row', {number: index + 1});

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
        if (isAtMinimum) {
            onClear(index);
        } else {
            onRemove(index);
        }
    };

    return (
        <RepeatingRoot spacing={1.5} ownSx={{minWidth: 0}} sx={sx}>
            {label && <Typography variant="subtitle2" component="h3">{label}</Typography>}
            {rowKeys.map((rowKey, index) => {
                const removeText = isAtMinimum ? t('repeating.clear', {row: titleOf(index)}) : t('repeating.remove', {row: titleOf(index)});
                return (
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
                            {rowActionsOf?.(index)}
                            <Button size="small" color="inherit" disabled={disabled} onClick={() => requestRemove(index)} aria-label={removeText}
                                    startIcon={isAtMinimum ? <RestartAltRoundedIcon /> : <DeleteOutlineRoundedIcon />}>
                                {isAtMinimum ? t('repeating.clearShort') : t('repeating.removeShort')}
                            </Button>
                        </RepeatingRowHeader>
                        {/* los campos del renglón llevan su etiqueta arriba aunque la lista esté dentro de una FormSection */}
                        <FormSectionContext.Provider value={false}>
                            <RepeatingRowContent ownSx={{display: 'grid', gap: 2, gridTemplateColumns: gridColumnsOf(columns), alignItems: 'start'}}>
                                {renderRow(index)}
                            </RepeatingRowContent>
                        </FormSectionContext.Provider>
                    </RepeatingRow>
                );
            })}
            <Stack direction="row" sx={{alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
                <RepeatingAddButton variant="outlined" startIcon={<AddRoundedIcon />} onClick={onAdd} disabled={disabled || isAtMaximum}
                                    ownSx={{alignSelf: 'flex-start'}}>
                    {addLabel ?? t('repeating.add')}
                </RepeatingAddButton>
                {maxRows != null && (
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
                description={t('repeating.confirmText')}
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
