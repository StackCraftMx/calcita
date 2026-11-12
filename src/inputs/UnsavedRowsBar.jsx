// La barra de lo capturado sin guardar en una tabla del servidor con campos (useEditableServerRows): cuántos renglones
// tienen cambios, «Guardar todos» y «Descartar», y si alguno no se pudo guardar. No sale si no hay nada pendiente. Con
// UNSAVED_ROWS.confirm también lleva la pregunta de antes de cambiar de página.
//
// Es solo la vista: lo que guarda y lo que descarta lo hace el hook de formik o de react-hook-form.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaUnsavedRowsBar con defaultProps y
// styleOverrides de su parte root.
//
// Genérico del paquete: function (regla de la casa).
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import ConfirmDialog from '@/feedback/ConfirmDialog.jsx';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

const THEME_NAME = 'CalcitaUnsavedRowsBar';
const UnsavedRowsRoot = piecePart(THEME_NAME, 'Root', Alert);

/**
 * @param {object} props
 * @param {number} props.count cuántos renglones tienen cambios sin guardar
 * @param {number} [props.notSavedCount] cuántos no se pudieron guardar con «Guardar todos» (sus errores)
 * @param {boolean} [props.isSaving]
 * @param {() => void} props.onSaveAll
 * @param {() => void} props.onDiscardAll
 * @param {boolean} [props.isConfirmOpen] la pregunta de antes de cambiar de página
 * @param {() => void} [props.onConfirmDiscard] «Descartar y seguir»
 * @param {() => void} [props.onConfirmClose] se queda donde está
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos de esta pantalla, encima de los del tema (en su parte root)
 */
function UnsavedRowsBarContent(props) {
    const {
        count, notSavedCount = 0, isSaving = false, onSaveAll, onDiscardAll, isConfirmOpen = false, onConfirmDiscard, onConfirmClose, texts,
        sx, ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    return (
        <>
            {count > 0 && (
                <UnsavedRowsRoot sx={sx}
                    severity={notSavedCount > 0 ? 'error' : 'warning'}
                    role="status"
                    action={(
                        <Stack direction="row" sx={{gap: 1, flexWrap: 'wrap'}}>
                            <Button size="small" color="inherit" disabled={isSaving} onClick={onDiscardAll}>{t('editableTable.discardAll')}</Button>
                            <Button size="small" variant="contained" disabled={isSaving} loading={isSaving} onClick={onSaveAll}>{t('editableTable.saveAll')}</Button>
                        </Stack>
                    )}
                >
                    {notSavedCount > 0 ? t('editableTable.notSaved', {count: notSavedCount}) : t('editableTable.pending', {count})}
                </UnsavedRowsRoot>
            )}
            <ConfirmDialog
                open={isConfirmOpen}
                title={t('editableTable.confirmTitle')}
                description={t('editableTable.confirmText', {count})}
                confirmLabel={t('editableTable.discardAndContinue')}
                tone="error"
                onConfirm={onConfirmDiscard}
                onClose={onConfirmClose}
                texts={texts}
            />
        </>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const UnsavedRowsBar = withPieceSlots(UnsavedRowsBarContent, THEME_NAME);
export default UnsavedRowsBar;
