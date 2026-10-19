// La zona para soltar UN archivo, con puro MUI (sin librerías): se suelta o se elige, se revisa su tipo y su peso, y el
// elegido se ve con su ícono, su nombre y su peso, con la × para quitarlo sin volver a abrir la ventana de archivos.
//
// Hay otra con el mismo uso y FilePond por dentro (@stackcraftmx/calcita/filepond): animaciones, varios archivos y
// avance por archivo. Cambiar de una a otra es cambiar el import.
//
// Solo ELIGE el archivo (controlado: value / onChange). Enviarlo es de la pantalla: arma su FormData con los campos que
// pida su backend y lo sube (uploadWithProgress + uploadMachine). Para eso están los huecos:
//   actions   botones junto a «Elegir archivo» (p. ej. el de enviar)
//   children  lo que va abajo (campos del formulario, el avance de la subida)
//
// Configuración: accept y maxSize (upload/fileRules.js); busy pone el candado mientras se sube (no se puede quitar ni
// cambiar el archivo a media subida) y busyModal además bloquea toda la pantalla con ModalWaiting.
//
// Lo que se rechaza se avisa con toastError y los textos del paquete; con onReject la pantalla decide qué hacer.
//
// Mobile primero: en el teléfono no hay arrastrar; el botón es el camino y los botones se apilan a lo ancho.
//
// Genérico del paquete: function (regla de la casa).
import {useRef, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';

import ModalWaiting from '@/feedback/ModalWaiting.jsx';
import {toastError} from '@/feedback/toast.jsx';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {FILE_REJECTION, matchesAccept, parseFileSize, resolveAccept} from '@/upload/fileRules.js';

// el ícono según el tipo del archivo elegido, con el mismo color que el panel de descargas
const FILE_APPEARANCES = [
    {pattern: /\.(xlsx?|csv)$/, Icon: TableViewOutlinedIcon, color: 'success'},
    {pattern: /\.pdf$/, Icon: PictureAsPdfOutlinedIcon, color: 'error'},
    {pattern: /\.(png|jpe?g|gif|webp|svg|avif)$/, Icon: ImageOutlinedIcon, color: 'info'},
    {pattern: /\.(docx?|txt|md)$/, Icon: DescriptionOutlinedIcon, color: 'primary'},
];
const DEFAULT_FILE_APPEARANCE = {Icon: InsertDriveFileOutlinedIcon, color: 'action'};

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
 * @param {import('react').ReactNode} [props.actions]
 * @param {import('react').ReactNode} [props.children]
 * @param {object} [props.sx] ajustes del recuadro
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function FileDropzone({
    value = null, onChange, accept, maxSize, hint, buttonLabel, disabled = false, busy = false, busyModal = false, onReject, actions,
    children, sx, texts,
}) {
    const {t} = useToolkitTranslation('common', texts);
    const {formatFileSize} = useFormatters();
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const isLocked = disabled || busy;
    const resolvedAccept = resolveAccept(accept);
    const maxBytes = parseFileSize(maxSize);
    const hintText = hint ?? t('upload.hint');

    const reject = (file, reason) => {
        if (onReject) {
            onReject(file, reason);
            return;
        }
        const message = reason === FILE_REJECTION.size
            ? t('upload.tooLarge', {name: file.name, max: formatFileSize(maxBytes)})
            : t('upload.invalidType', {name: file.name, accept: resolvedAccept});
        toastError(message);
    };

    const pick = (file) => {
        // guard clause: se cerró la ventana sin elegir, o el candado está puesto
        if (!file || isLocked) {
            return;
        }
        if (!matchesAccept(file, resolvedAccept)) {
            reject(file, FILE_REJECTION.type);
            return;
        }
        if (maxBytes && file.size > maxBytes) {
            reject(file, FILE_REJECTION.size);
            return;
        }
        onChange(file);
    };

    const openPicker = () => {
        // OJO: se limpia el valor del input para poder volver a elegir EL MISMO archivo (corregido en disco); sin esto
        // el navegador no avisa el cambio
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        inputRef.current?.click();
    };

    const appearance = value
        ? FILE_APPEARANCES.find(({pattern}) => pattern.test(value.name.toLowerCase())) ?? DEFAULT_FILE_APPEARANCE
        : null;

    return (
        <Paper
            variant="outlined"
            aria-busy={busy}
            onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(!isLocked);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                pick(event.dataTransfer.files?.[0]);
            }}
            sx={{
                p: {xs: 3, sm: 5},
                textAlign: 'center',
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: isDragging ? 'primary.main' : 'divider',
                bgcolor: isDragging ? 'action.hover' : 'background.paper',
                transition: 'border-color .15s ease, background-color .15s ease',
                opacity: disabled ? 0.6 : 1,
                ...sx,
            }}
        >
            <input ref={inputRef} type="file" accept={resolvedAccept} hidden disabled={isLocked} aria-label={hintText}
                   onChange={(event) => pick(event.target.files?.[0])} />
            {value ? (
                <Box sx={{mb: 2}}>
                    <Chip
                        icon={<appearance.Icon fontSize="small" color={appearance.color} />}
                        label={`${value.name} · ${formatFileSize(value.size)}`}
                        variant="outlined"
                        onDelete={isLocked ? undefined : () => onChange(null)}
                        deleteIcon={<CancelIcon aria-label={t('upload.remove', {name: value.name})} />}
                        sx={{maxWidth: '100%', height: 'auto', py: 0.5, '& .MuiChip-label': {whiteSpace: 'normal', overflowWrap: 'anywhere'}}}
                    />
                </Box>
            ) : (
                <Typography variant="body1" sx={{mb: 2, overflowWrap: 'anywhere'}}>{hintText}</Typography>
            )}
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{justifyContent: 'center', alignItems: {xs: 'stretch', sm: 'center'}}}>
                <Button variant="outlined" onClick={openPicker} disabled={isLocked}>{buttonLabel ?? t('upload.choose')}</Button>
                {actions}
            </Stack>
            {/* el límite, discreto, solo si hay límite */}
            {maxBytes && (
                <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 1.5}}>
                    {t('upload.maxSizeHint', {max: formatFileSize(maxBytes)})}
                </Typography>
            )}
            {children && <Box sx={{mt: 3, textAlign: 'left'}}>{children}</Box>}
            {busyModal && <ModalWaiting open={busy} title={busyModal.title} text={busyModal.text} />}
        </Paper>
    );
}
