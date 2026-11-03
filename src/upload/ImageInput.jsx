// Una imagen con su vista previa: la foto de un perfil (círculo) o la de un producto o una sucursal (recuadro). Se pica la
// vista previa o «Elegir imagen» para abrir la ventana de archivos, o se suelta la imagen encima; «Quitar la imagen» la
// borra. Dentro de una FormSection se vuelve renglón, como los demás campos.
//
// Solo ELIGE (controlado), con las reglas de los demás cargadores (accept, por omisión imágenes; maxSize; useFilePicker).
// value es la imagen nueva (File), la que ya está guardada (su dirección, en texto) o null; onChange recibe File o null.
// Enviarla es de la pantalla.
//
// La vista previa de un archivo nuevo se pinta en el navegador, sin subirlo (URL.createObjectURL); se libera al cambiarla.
//
// Huecos: shape (IMAGE_SHAPE), size, placeholder (lo que se ve sin imagen: las iniciales de la persona, por ejemplo), alt,
// los textos de los botones y texts. Con formik: FormImageField; con react-hook-form, el del mismo nombre.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaImageInput con defaultProps y
// styleOverrides de sus partes: root, preview, image, placeholder, actions.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useId, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';

import {useValidationText} from '@/forms/useValidationText.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {useFilePicker} from '@/upload/useFilePicker.js';

/** La forma de la vista previa: círculo para una persona, recuadro para lo demás. */
export const IMAGE_SHAPE = Object.freeze({circle: 'circle', rounded: 'rounded'});

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaImageInput)
const THEME_NAME = 'CalcitaImageInput';
const ImageRoot = piecePart(THEME_NAME, 'Root', Stack);
const ImagePreview = piecePart(THEME_NAME, 'Preview', ButtonBase);
const ImagePicture = piecePart(THEME_NAME, 'Image', 'img');
const ImagePlaceholder = piecePart(THEME_NAME, 'Placeholder', Box);
const ImageActions = piecePart(THEME_NAME, 'Actions', Stack);

// el tamaño de la vista previa si la pantalla no dice otro (como un avatar grande de perfil)
const DEFAULT_PREVIEW_SIZE = 96;

/**
 * La dirección de la vista previa: la de un archivo nuevo se crea en el navegador y se libera al cambiar; la guardada se
 * usa tal cual.
 *
 * @param {File|string|null} value
 * @returns {string|null}
 */
function usePreviewUrl(value) {
    const [fileUrl, setFileUrl] = useState(null);
    const isFile = typeof File !== 'undefined' && value instanceof File;

    useEffect(() => {
        if (!isFile) {
            setFileUrl(null);
            return undefined;
        }
        const url = URL.createObjectURL(value);
        setFileUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [isFile, value]);

    if (isFile) {
        return fileUrl;
    }
    return typeof value === 'string' && value ? value : null;
}

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {import('react').ReactNode} [props.label] ya traducida
 * @param {File|string|null} [props.value] la imagen nueva, la dirección de la que ya está guardada o null
 * @param {(file: File|null) => void} props.onChange null al quitarla
 * @param {() => void} [props.onBlur] se llama al elegir o quitar (para que el formulario lo marque como tocado)
 * @param {'circle'|'rounded'} [props.shape] IMAGE_SHAPE; por omisión, círculo
 * @param {number} [props.size] el lado de la vista previa en px; por omisión 96
 * @param {string} [props.alt] ya traducido: qué se ve en la imagen (por omisión, la etiqueta)
 * @param {import('react').ReactNode} [props.placeholder] lo que se ve sin imagen; por omisión, un ícono
 * @param {string|string[]} [props.accept] por omisión, cualquier imagen
 * @param {number|string} [props.maxSize] bytes o '2 MB'
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ya traducida (p. ej. «JPG o PNG, cuadrada, hasta 2 MB»)
 * @param {string} [props.chooseLabel] ya traducido; por omisión «Elegir imagen» (o «Cambiar la imagen» si ya hay una)
 * @param {string} [props.removeLabel] ya traducido; por omisión «Quitar la imagen»
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.busy] candado mientras se sube
 * @param {(file: File, reason: string) => void} [props.onReject] reason es uno de FILE_REJECTION; sin él, un aviso
 * @param {object} [props.sx]
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Escriba el RFC', matches: 'El RFC lleva 12 o 13 caracteres'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function ImageInputContent(props) {
    const {
        name, label, value = null, onChange, onBlur, shape = IMAGE_SHAPE.circle, size = DEFAULT_PREVIEW_SIZE, alt, placeholder,
        accept = 'image', maxSize, error, helperText = ' ', chooseLabel, removeLabel, disabled = false, busy = false, onReject, sx, messages, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    // el texto del error: el de la pantalla (messages), el del proyecto para este campo o el de Calcita
    const validationTextOf = useValidationText({name, label, messages});
    const generatedId = useId();
    const previewId = `${name ?? 'image'}-${generatedId}`;
    const errorText = validationTextOf(error);
    const isLocked = disabled || busy;
    const previewUrl = usePreviewUrl(value);
    const change = (file) => {
        onChange(file);
        onBlur?.();
    };
    const picker = useFilePicker({accept, maxSize, disabled: isLocked, onAccept: change, onReject, texts});
    const pickText = chooseLabel ?? t(value ? 'upload.changeImage' : 'upload.chooseImage');

    return (
        <FieldFrame inputId={previewId} label={label}>
            <div>
                <ImageRoot direction="row" aria-busy={busy} ownSx={{alignItems: 'center', gap: 2}} sx={sx}>
                    <input {...picker.inputProps} name={name} aria-hidden="true" tabIndex={-1} />
                    <ImagePreview
                        id={previewId}
                        onClick={picker.open}
                        disabled={isLocked}
                        aria-label={pickText}
                        {...picker.dropHandlers}
                        ownSx={{
                            width: size, height: size, flexShrink: 0, overflow: 'hidden',
                            borderRadius: shape === IMAGE_SHAPE.circle ? '50%' : 2,
                            bgcolor: 'action.hover', color: 'text.secondary',
                            outline: picker.isDragging ? 2 : 0, outlineStyle: 'dashed', outlineColor: 'primary.main', outlineOffset: 2,
                            '&.Mui-focusVisible': {outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main', outlineOffset: 2},
                        }}
                    >
                        {previewUrl ? (
                            <ImagePicture src={previewUrl} alt={alt ?? (typeof label === 'string' ? label : '')}
                                          ownSx={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
                        ) : (
                            <ImagePlaceholder ownSx={{display: 'grid', placeItems: 'center', width: '100%', height: '100%'}}>
                                {placeholder ?? <AddPhotoAlternateOutlinedIcon />}
                            </ImagePlaceholder>
                        )}
                    </ImagePreview>
                    <ImageActions ownSx={{alignItems: 'flex-start', gap: 0.5}}>
                        <Button size="small" variant="outlined" onClick={picker.open} disabled={isLocked}>{pickText}</Button>
                        {value && (
                            <Button size="small" color="error" onClick={() => change(null)} disabled={isLocked}>
                                {removeLabel ?? t('upload.removeImage')}
                            </Button>
                        )}
                    </ImageActions>
                </ImageRoot>
                <FormHelperText error={Boolean(errorText)}>{errorText ?? helperText}</FormHelperText>
            </div>
        </FieldFrame>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const ImageInput = withPieceSlots(ImageInputContent, THEME_NAME);
export default ImageInput;
