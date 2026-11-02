// La zona para soltar UN archivo, con puro MUI (sin librerías): se suelta o se elige, se revisa su tipo y su peso, y el
// elegido se ve con su ícono, su nombre y su peso, con la × para quitarlo sin volver a abrir la ventana de archivos.
//
// Hay otra con el mismo uso y FilePond por dentro (@stackcraftmx/calcita/filepond): animaciones, varios archivos y
// avance por archivo. Cambiar de una a otra es cambiar el import. Para un formulario, del tamaño de un campo: FileInput;
// para varios como en un correo: AttachmentsInput; para una foto: ImageInput.
//
// Solo ELIGE el archivo (controlado: value / onChange). Enviarlo es de la pantalla: arma su FormData con los campos que
// pida su backend y lo sube (uploadWithProgress + uploadMachine). Para eso están los huecos:
//   actions   botones junto a «Elegir archivo» (p. ej. el de enviar)
//   template  «Descargar la plantilla» junto a «Elegir archivo» (las props de TemplateDownloadButton)
//   children  lo que va abajo (campos del formulario, el avance de la subida)
//
// Configuración: accept y maxSize (upload/fileRules.js); busy pone el candado mientras se sube (no se puede quitar ni
// cambiar el archivo a media subida) y busyModal además bloquea toda la pantalla con ModalWaiting.
//
// Lo que se rechaza se avisa con toastError y los textos del paquete; con onReject la pantalla decide qué hacer
// (useFilePicker, el mismo de los demás cargadores).
//
// Mobile primero: en el teléfono no hay arrastrar; el botón es el camino y los botones se apilan a lo ancho.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaFileDropzone con defaultProps y
// styleOverrides de sus partes: root, fileArea, fileChip, hint, actions, limits, extra.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ModalWaiting from '@/feedback/ModalWaiting.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import FileChip from '@/upload/FileChip.jsx';
import TemplateDownloadButton from '@/upload/TemplateDownloadButton.jsx';
import {useFilePicker} from '@/upload/useFilePicker.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaFileDropzone)
const THEME_NAME = 'CalcitaFileDropzone';
const DropzoneRoot = piecePart(THEME_NAME, 'Root', Paper);
const DropzoneFileArea = piecePart(THEME_NAME, 'FileArea', Box);
const DropzoneFileChip = piecePart(THEME_NAME, 'FileChip', Chip);
const DropzoneHint = piecePart(THEME_NAME, 'Hint', Typography);
const DropzoneActions = piecePart(THEME_NAME, 'Actions', Stack);
const DropzoneLimits = piecePart(THEME_NAME, 'Limits', Typography);
const DropzoneExtra = piecePart(THEME_NAME, 'Extra', Box);

/**
 * @param {object} props
 * @param {File|null} [props.value] el archivo elegido
 * @param {(file: File|null) => void} props.onChange null al quitarlo
 * @param {string|string[]} [props.accept] 'excel' | ['excel', 'pdf'] | '.xlsx,.xls' | 'image/*'
 * @param {number|string} [props.maxSize] bytes o '10 MB'
 * @param {string} [props.hint] ya traducido; por omisión «Arrastre aquí su archivo»
 * @param {string} [props.buttonLabel] ya traducido; por omisión «Elegir archivo»
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.busy] candado mientras se sube: no se puede soltar, elegir ni quitar
 * @param {boolean|{title?: string, text?: string}} [props.busyModal] además bloquea la pantalla mientras busy
 * @param {(file: File, reason: string) => void} [props.onReject] reason es uno de FILE_REJECTION; sin él, un aviso
 * @param {Parameters<typeof import('@/upload/TemplateDownloadButton.jsx').default>[0]} [props.template] «Descargar la
 *     plantilla» junto a «Elegir archivo»: {href} de un archivo fijo o {request} al API
 * @param {import('react').ReactNode} [props.actions]
 * @param {import('react').ReactNode} [props.children]
 * @param {object} [props.sx] ajustes del recuadro
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function FileDropzone(props) {
    // lo que el proyecto puso en su tema (components.CalcitaFileDropzone.defaultProps) y encima lo que llega aquí
    const {
        value = null, onChange, accept, maxSize, hint, buttonLabel, disabled = false, busy = false, busyModal = false, onReject, template,
        actions, children, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {formatFileSize} = useFormatters();
    const isLocked = disabled || busy;
    const hintText = hint ?? t('upload.hint');
    const picker = useFilePicker({accept, maxSize, disabled: isLocked, onAccept: onChange, onReject, texts});

    return (
        <DropzoneRoot
            variant="outlined"
            aria-busy={busy}
            {...picker.dropHandlers}
            ownSx={{
                p: {xs: 3, sm: 5},
                textAlign: 'center',
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: picker.isDragging ? 'primary.main' : 'divider',
                bgcolor: picker.isDragging ? 'action.hover' : 'background.paper',
                transition: 'border-color .15s ease, background-color .15s ease',
                opacity: disabled ? 0.6 : 1,
                ...sx,
            }}
        >
            <input {...picker.inputProps} aria-label={hintText} />
            {value ? (
                <DropzoneFileArea ownSx={{mb: 2}}>
                    <FileChip file={value} ChipComponent={DropzoneFileChip} removeLabel={t('upload.remove', {name: value.name})}
                              onRemove={isLocked ? undefined : () => onChange(null)} />
                </DropzoneFileArea>
            ) : (
                <DropzoneHint variant="body1" ownSx={{mb: 2, overflowWrap: 'anywhere'}}>{hintText}</DropzoneHint>
            )}
            <DropzoneActions direction={{xs: 'column', sm: 'row'}} spacing={2} ownSx={{justifyContent: 'center', alignItems: {xs: 'stretch', sm: 'center'}}}>
                <Button variant="outlined" onClick={picker.open} disabled={isLocked}>{buttonLabel ?? t('upload.choose')}</Button>
                {template && <TemplateDownloadButton texts={texts} {...template} />}
                {actions}
            </DropzoneActions>
            {/* el límite, discreto, solo si hay límite */}
            {picker.maxBytes && (
                <DropzoneLimits variant="caption" color="text.secondary" ownSx={{display: 'block', mt: 1.5}}>
                    {t('upload.maxSizeHint', {max: formatFileSize(picker.maxBytes)})}
                </DropzoneLimits>
            )}
            {children && <DropzoneExtra ownSx={{mt: 3, textAlign: 'left'}}>{children}</DropzoneExtra>}
            {busyModal && <ModalWaiting open={busy} title={busyModal.title} text={busyModal.text} />}
        </DropzoneRoot>
    );
}
