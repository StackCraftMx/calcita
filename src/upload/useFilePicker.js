// Lo que necesita cualquier cargador para ELEGIR archivos: la ventana de archivos del sistema, soltar encima, revisar tipo,
// peso, cuántos y cuánto pesan juntos (screenFiles), y avisar lo que no pasó. Lo usan los cargadores del paquete (la zona,
// el compacto, «Adjuntar» y la imagen) y queda suelto para que un proyecto arme el suyo con su propio botón:
//
//   const picker = useFilePicker({accept: 'pdf', maxSize: '5 MB', onAccept: setFile});
//   <input {...picker.inputProps} />
//   <Button onClick={picker.open} {...picker.dropHandlers}>Subir el contrato</Button>
//
// Solo elige: enviarlo es de la pantalla (uploadWithProgress). Lo rechazado se avisa con toastError y los textos del
// paquete; con onReject la pantalla decide qué hacer.
//
// Hook genérico: function (regla de la casa).
import {useRef, useState} from 'react';

import {toastError} from '@/feedback/toast.jsx';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {FILE_REJECTION, parseFileSize, resolveAccept, screenFiles} from '@/upload/fileRules.js';

/**
 * @param {object} options
 * @param {string|string[]} [options.accept] 'excel' | ['excel', 'pdf'] | '.xlsx,.xls' | 'image/*'
 * @param {number|string} [options.maxSize] el peso máximo de cada archivo: bytes o '10 MB'
 * @param {boolean} [options.multiple] varios a la vez; sin él, solo el primero que se elija o se suelte
 * @param {number} [options.maxFiles] con multiple: cuántos como máximo, contando los que ya estaban
 * @param {number|string} [options.maxTotalSize] con multiple: cuánto pueden pesar todos juntos
 * @param {Array<{name: string, size?: number}>} [options.keptFiles] con multiple: los que ya estaban (cuentan en los topes)
 * @param {boolean} [options.disabled] no se puede elegir ni soltar (también mientras se sube)
 * @param {(picked: any) => void} options.onAccept sin multiple, el archivo; con multiple, la lista completa (los que ya
 *     estaban y los nuevos), lista para guardarse
 * @param {(file: File, reason: string) => void} [options.onReject] reason es uno de FILE_REJECTION; sin él, un aviso
 * @param {object} [options.texts] los textos que cambian, con la forma de `common`
 * @returns {{inputProps: object, open: () => void, pickFiles: (fileList: FileList|File[]|null|undefined) => void, isDragging: boolean, dropHandlers: object, resolvedAccept: string|undefined, maxBytes: number|null, maxTotalBytes: number|null}}
 */
export function useFilePicker({
    accept, maxSize, multiple = false, maxFiles, maxTotalSize, keptFiles = [], disabled = false, onAccept, onReject, texts,
}) {
    const {t} = useToolkitTranslation('common', texts);
    const {formatFileSize} = useFormatters();
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const resolvedAccept = resolveAccept(accept);
    const maxBytes = parseFileSize(maxSize);
    const maxTotalBytes = multiple ? parseFileSize(maxTotalSize) : null;

    // el aviso de cada motivo, con el nombre del archivo y el límite que no cumplió
    const rejectionTextOf = (file, reason) => {
        switch (reason) {
            case FILE_REJECTION.size:
                return t('upload.tooLarge', {name: file.name, max: formatFileSize(maxBytes)});
            case FILE_REJECTION.count:
                return t('upload.tooManyFiles', {count: maxFiles});
            case FILE_REJECTION.total:
                return t('upload.totalTooLarge', {name: file.name, max: formatFileSize(maxTotalBytes)});
            default:
                return t('upload.invalidType', {name: file.name, accept: resolvedAccept});
        }
    };

    const pickFiles = (fileList) => {
        // se cerró la ventana sin elegir, o el candado está puesto
        const picked = [...(fileList ?? [])].slice(0, multiple ? undefined : 1);
        if (!picked.length || disabled) {
            return;
        }
        const {files, accepted, rejected} = screenFiles(picked, {
            resolvedAccept, maxBytes, maxFiles: multiple ? maxFiles : undefined, maxTotalBytes, keptFiles: multiple ? keptFiles : [],
        });
        for (const {file, reason} of rejected) {
            if (onReject) {
                onReject(file, reason);
            } else {
                toastError(rejectionTextOf(file, reason));
            }
        }
        if (accepted.length) {
            onAccept(multiple ? files : accepted[0]);
        }
    };

    const open = () => {
        if (disabled || !inputRef.current) {
            return;
        }
        // OJO: se limpia el valor del input para poder volver a elegir EL MISMO archivo (corregido en disco); sin esto el
        // navegador no avisa el cambio
        inputRef.current.value = '';
        inputRef.current.click();
    };

    return {
        open,
        pickFiles,
        isDragging,
        resolvedAccept,
        maxBytes,
        maxTotalBytes,
        inputProps: {
            ref: inputRef, type: 'file', accept: resolvedAccept, multiple, hidden: true, disabled,
            onChange: (event) => pickFiles(event.target.files),
        },
        dropHandlers: {
            onDragOver: (event) => {
                event.preventDefault();
                setIsDragging(!disabled);
            },
            onDragLeave: () => setIsDragging(false),
            onDrop: (event) => {
                event.preventDefault();
                setIsDragging(false);
                pickFiles(event.dataTransfer?.files);
            },
        },
    };
}
