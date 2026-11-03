// Un archivo del tamaño de un campo, para un formulario (la constancia fiscal de un cliente, el contrato firmado): la
// etiqueta como los demás campos, el botón «Elegir archivo», el elegido en su chip con la × y abajo su ayuda o su error.
// Dentro de una FormSection se vuelve renglón, como los demás campos. También se puede soltar el archivo encima.
//
// Solo ELIGE (controlado: value / onChange), con las mismas reglas que la zona grande (accept, maxSize; useFilePicker):
// enviarlo es de la pantalla. value puede ser un archivo nuevo (File) o uno que ya está guardado ({name, size?}), para
// editar un registro que ya lo tiene.
//
// Huecos: template («Descargar la plantilla» junto al botón), actions (botones suyos en el mismo renglón), emptyText,
// buttonLabel y texts. Con formik: FormFileField (/forms); con react-hook-form, el del mismo nombre (/react-hook-form).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaFileInput con defaultProps y
// styleOverrides de sus partes: root, button, fileChip, empty.
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import FileChip from '@/upload/FileChip.jsx';
import TemplateDownloadButton from '@/upload/TemplateDownloadButton.jsx';
import {useFilePicker} from '@/upload/useFilePicker.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaFileInput)
const THEME_NAME = 'CalcitaFileInput';
const FileInputRoot = piecePart(THEME_NAME, 'Root', Stack);
const FileInputButton = piecePart(THEME_NAME, 'Button', Button);
const FileInputChip = piecePart(THEME_NAME, 'FileChip', Chip);
const FileInputEmpty = piecePart(THEME_NAME, 'Empty', Typography);

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {import('react').ReactNode} [props.label] ya traducida
 * @param {File|{name: string, size?: number}|null} [props.value] el archivo nuevo o el que ya está guardado
 * @param {(file: File|null) => void} props.onChange null al quitarlo
 * @param {() => void} [props.onBlur] se llama al elegir o quitar (para que el formulario lo marque como tocado)
 * @param {string|string[]} [props.accept] 'excel' | ['pdf', 'image'] | '.xlsx,.xls' | 'image/*'
 * @param {number|string} [props.maxSize] bytes o '10 MB'
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ya traducida
 * @param {string} [props.buttonLabel] ya traducido; por omisión «Elegir archivo»
 * @param {string} [props.emptyText] ya traducido; por omisión «Ningún archivo elegido»
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.busy] candado mientras se sube: no se puede elegir, soltar ni quitar
 * @param {(file: File, reason: string) => void} [props.onReject] reason es uno de FILE_REJECTION; sin él, un aviso
 * @param {Parameters<typeof import('@/upload/TemplateDownloadButton.jsx').default>[0]} [props.template] «Descargar la
 *     plantilla» junto al botón
 * @param {import('react').ReactNode} [props.actions] botones suyos en el mismo renglón
 * @param {object} [props.sx] ajustes del renglón
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function FileInput(props) {
    const {
        name, label, value = null, onChange, onBlur, accept, maxSize, error, helperText = ' ', buttonLabel, emptyText, disabled = false,
        busy = false, onReject, template, actions, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const generatedId = useId();
    const buttonId = `${name ?? 'file'}-${generatedId}`;
    const errorText = translateValidationMessage(t, error);
    const isLocked = disabled || busy;
    const change = (file) => {
        onChange(file);
        onBlur?.();
    };
    const picker = useFilePicker({accept, maxSize, disabled: isLocked, onAccept: change, onReject, texts});

    return (
        <FieldFrame inputId={buttonId} label={label}>
            <div>
                <FileInputRoot
                    direction="row"
                    aria-busy={busy}
                    {...picker.dropHandlers}
                    ownSx={{
                        alignItems: 'center', flexWrap: 'wrap', gap: 1, minHeight: 40, borderRadius: 1, px: 0.5, mx: -0.5,
                        outline: picker.isDragging ? 2 : 0, outlineStyle: 'dashed', outlineColor: 'primary.main',
                        bgcolor: picker.isDragging ? 'action.hover' : 'transparent',
                    }}
                    sx={sx}
                >
                    <input {...picker.inputProps} name={name} aria-hidden="true" tabIndex={-1} />
                    <FileInputButton id={buttonId} variant="outlined" size="small" startIcon={<AttachFileRoundedIcon />} onClick={picker.open}
                                     disabled={isLocked} ownSx={{flexShrink: 0}}>
                        {buttonLabel ?? t('upload.choose')}
                    </FileInputButton>
                    {value ? (
                        <FileChip file={value} ChipComponent={FileInputChip} removeLabel={t('upload.remove', {name: value.name})}
                                  onRemove={isLocked ? undefined : () => change(null)} />
                    ) : (
                        <FileInputEmpty variant="body2" color="text.secondary">{emptyText ?? t('upload.empty')}</FileInputEmpty>
                    )}
                    {template && <TemplateDownloadButton size="small" texts={texts} {...template} />}
                    {actions}
                </FileInputRoot>
                <FormHelperText error={Boolean(errorText)}>{errorText ?? helperText}</FormHelperText>
            </div>
        </FieldFrame>
    );
}
