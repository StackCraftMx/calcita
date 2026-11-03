// Varios archivos como en un correo: el botón «Adjuntar» con su clip y cada archivo en un chip con su × (Excel en verde,
// PDF en rojo…). También se pueden soltar encima. Volver a elegir un archivo con el mismo nombre lo reemplaza (se corrigió en
// disco) y no cuenta doble.
//
// Solo ELIGE (controlado: value / onChange recibe la lista completa), con las reglas de los demás cargadores (accept,
// maxSize por archivo, maxFiles y maxTotalSize; useFilePicker). La lista puede mezclar archivos nuevos (File) con los que ya
// están guardados ({id?, name, size?}): al editar un registro, los de antes se ven igual y también se quitan.
//
// Huecos: showButton={false} + pickerRef para abrir la ventana desde un botón suyo (el clip de la barra de un correo);
// template («Descargar la plantilla»); actions (botones suyos junto a «Adjuntar»); onRemove (avisar al API que se quitó uno
// que ya estaba guardado); label, buttonLabel y texts. Con formik: FormAttachmentsField; con react-hook-form, el del mismo
// nombre.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaAttachmentsInput con defaultProps y
// styleOverrides de sus partes: root, actions, button, list, fileChip, limits.
//
// Genérico del paquete: function (regla de la casa).
import {useId, useImperativeHandle} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import FileChip from '@/upload/FileChip.jsx';
import TemplateDownloadButton from '@/upload/TemplateDownloadButton.jsx';
import {useFilePicker} from '@/upload/useFilePicker.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaAttachmentsInput)
const THEME_NAME = 'CalcitaAttachmentsInput';
const AttachmentsRoot = piecePart(THEME_NAME, 'Root', Box);
const AttachmentsActions = piecePart(THEME_NAME, 'Actions', Stack);
const AttachmentsButton = piecePart(THEME_NAME, 'Button', Button);
const AttachmentsList = piecePart(THEME_NAME, 'List', Stack);
const AttachmentsChip = piecePart(THEME_NAME, 'FileChip', Chip);
const AttachmentsLimits = piecePart(THEME_NAME, 'Limits', Typography);

/**
 * La lista conserva el tipo que usa la pantalla para lo ya guardado (T): onChange regresa esos mismos y los File nuevos.
 *
 * @template {File|{id?: string, name: string, size?: number}} T
 * @param {object} props
 * @param {string} [props.name]
 * @param {import('react').ReactNode} [props.label] ya traducida; sin ella, va sin etiqueta (dentro de un correo, por ejemplo)
 * @param {T[]} [props.value] los nuevos y los que ya están guardados
 * @param {(files: Array<T|File>) => void} props.onChange la lista completa
 * @param {() => void} [props.onBlur] se llama al agregar o quitar (para que el formulario lo marque como tocado)
 * @param {(file: T) => void} [props.onRemove] al quitar uno (antes de onChange)
 * @param {string|string[]} [props.accept] 'excel' | ['pdf', 'image'] | '.xlsx,.xls' | 'image/*'
 * @param {number|string} [props.maxSize] el peso máximo de cada archivo: bytes o '10 MB'
 * @param {number} [props.maxFiles] cuántos como máximo
 * @param {number|string} [props.maxTotalSize] cuánto pueden pesar todos juntos
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ya traducida
 * @param {string} [props.buttonLabel] ya traducido; por omisión «Adjuntar»
 * @param {boolean} [props.showButton] false esconde «Adjuntar» (la ventana se abre con pickerRef desde un botón suyo)
 * @param {import('react').Ref<{open: () => void}>} [props.pickerRef] recibe {open} para abrir la ventana de archivos
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.busy] candado mientras se sube: no se puede agregar ni quitar
 * @param {(file: File, reason: string) => void} [props.onReject] reason es uno de FILE_REJECTION; sin él, un aviso
 * @param {Parameters<typeof import('@/upload/TemplateDownloadButton.jsx').default>[0]} [props.template] «Descargar la
 *     plantilla» junto a «Adjuntar»
 * @param {import('react').ReactNode} [props.actions] botones suyos junto a «Adjuntar»
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function AttachmentsInput(props) {
    const {
        name, label, value = [], onChange, onBlur, onRemove, accept, maxSize, maxFiles, maxTotalSize, error, helperText, buttonLabel,
        showButton = true, pickerRef, disabled = false, busy = false, onReject, template, actions, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {formatFileSize} = useFormatters();
    const generatedId = useId();
    const buttonId = `${name ?? 'attachments'}-${generatedId}`;
    const errorText = translateValidationMessage(t, error);
    const isLocked = disabled || busy;
    const change = (files) => {
        onChange(files);
        onBlur?.();
    };
    const picker = useFilePicker({
        accept, maxSize, multiple: true, maxFiles, maxTotalSize, keptFiles: value, disabled: isLocked, onAccept: change, onReject, texts,
    });
    useImperativeHandle(pickerRef, () => ({open: picker.open}), [picker.open]);

    const remove = (file) => {
        onRemove?.(file);
        change(value.filter((item) => item !== file));
    };
    const totalBytes = value.reduce((sum, file) => sum + (file.size ?? 0), 0);
    // cuántos y cuánto pesan, solo si hay algún tope que cuidar
    const limitsText = maxFiles || picker.maxTotalBytes
        ? t(picker.maxTotalBytes ? 'upload.summaryOf' : 'upload.summary', {
            count: value.length, total: formatFileSize(totalBytes), max: picker.maxTotalBytes ? formatFileSize(picker.maxTotalBytes) : undefined,
        })
        : null;
    const bottomText = errorText ?? helperText;

    const content = (
        <AttachmentsRoot aria-busy={busy} {...picker.dropHandlers}
                         ownSx={{
                             borderRadius: 1, outline: picker.isDragging ? 2 : 0, outlineStyle: 'dashed', outlineColor: 'primary.main',
                             bgcolor: picker.isDragging ? 'action.hover' : 'transparent',
                         }}
                         sx={sx}>
            <input {...picker.inputProps} name={name} aria-hidden="true" tabIndex={-1} />
            {(showButton || template || actions) && (
                <AttachmentsActions direction="row" ownSx={{alignItems: 'center', flexWrap: 'wrap', gap: 1}}>
                    {showButton && (
                        <AttachmentsButton id={buttonId} size="small" startIcon={<AttachFileRoundedIcon />} onClick={picker.open} disabled={isLocked}>
                            {buttonLabel ?? t('upload.attach')}
                        </AttachmentsButton>
                    )}
                    {template && <TemplateDownloadButton size="small" texts={texts} {...template} />}
                    {actions}
                </AttachmentsActions>
            )}
            {value.length > 0 && (
                <AttachmentsList direction="row" role="list" ownSx={{flexWrap: 'wrap', gap: 1, mt: showButton ? 1 : 0}}>
                    {value.map((file) => (
                        <Box key={file.id ?? file.name} role="listitem" sx={{maxWidth: '100%'}}>
                            <FileChip file={file} ChipComponent={AttachmentsChip} removeLabel={t('upload.remove', {name: file.name})}
                                      onRemove={isLocked ? undefined : () => remove(file)} />
                        </Box>
                    ))}
                </AttachmentsList>
            )}
            {limitsText && (
                <AttachmentsLimits variant="caption" color="text.secondary" ownSx={{display: 'block', mt: 0.5}}>{limitsText}</AttachmentsLimits>
            )}
            {bottomText && <FormHelperText error={Boolean(errorText)}>{bottomText}</FormHelperText>}
        </AttachmentsRoot>
    );

    return label ? <FieldFrame inputId={buttonId} label={label}>{content}</FieldFrame> : content;
}
