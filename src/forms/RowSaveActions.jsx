// «Guardar» y «Deshacer» de un renglón que es su propio formulario de formik (EditableRows, la tabla del servidor con
// useEditableServerRows): van DENTRO de su formulario. Sin cambios, apagados; guardando, la rueda en lugar de la palomita.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikContext} from 'formik';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/** «Guardar» y «Deshacer» de un renglón: van dentro de su formulario. Sin cambios, apagados. */
/**
 * @param {object} props
 * @param {string} props.title el nombre del renglón ya traducido («Renglón 3»), para lo que lee el lector
 * @param {boolean} [props.disabled]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`
 */
export default function RowSaveActions({title, disabled = false, texts}) {
    const {dirty, isSubmitting, submitForm, resetForm} = useFormikContext();
    const {t} = useToolkitTranslation('common', texts);
    const saveText = t('repeating.saveRow', {row: title});
    const discardText = t('repeating.discardRow', {row: title});
    const isOff = disabled || !dirty || isSubmitting;
    return (
        <>
            <Tooltip title={saveText}>
                <span>
                    {/* si guardar truena, el renglón se queda como está y la pantalla ya dijo el problema (onSaveRow) */}
                    <IconButton size="small" color="primary" disabled={isOff} onClick={() => submitForm().catch(() => {})} aria-label={saveText}>
                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : <CheckRoundedIcon fontSize="small" />}
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title={discardText}>
                <span>
                    <IconButton size="small" disabled={isOff} onClick={() => resetForm()} aria-label={discardText}>
                        <UndoRoundedIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </>
    );
}
