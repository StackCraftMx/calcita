// «Descargar la plantilla»: el botón que va junto a un cargador para bajar el formato que el archivo debe seguir (el Excel
// con sus columnas, el CSV de ejemplo). Los cargadores del paquete lo ponen en su lugar con su prop `template`; también se
// usa suelto.
//
// Dos formas de bajarlo:
//   href      un archivo fijo (public/plantillas/inventario.xlsx): un enlace de descarga, sin pasar por el panel.
//   request   lo arma o lo da el API: va por startDownload, así sale en el panel de descargas con su avance y, si el
//             servidor dice que no, su motivo.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTemplateDownloadButton con defaultProps y
// styleOverrides de su parte root.
//
// Genérico del paquete: function (regla de la casa).
import Button from '@mui/material/Button';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import {startDownload} from '@/downloads/downloadQueue.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaTemplateDownloadButton)
const THEME_NAME = 'CalcitaTemplateDownloadButton';
const TemplateButtonRoot = piecePart(THEME_NAME, 'Root', Button);

/**
 * @param {object} props
 * @param {string} [props.href] un archivo fijo; se baja con un enlace
 * @param {string} [props.fileName] con href: con qué nombre se guarda (por omisión, el del archivo)
 * @param {(transferOptions: {signal: AbortSignal, onDownloadProgress: (progress: {loaded: number, total?: number|null}) => void}) => Promise<{blob: Blob, fileName: string}>} [props.request]
 *     lo pide al API y va al panel de descargas (startDownload)
 * @param {string} [props.format] con request: el tipo de archivo, para su ícono en el panel (xlsx, csv…)
 * @param {string} [props.label] ya traducido; por omisión «Descargar la plantilla»
 * @param {() => void} [props.onDownload] al empezar la descarga (para medir cuántos la bajan, por ejemplo)
 * @param {'text'|'outlined'|'contained'} [props.variant]
 * @param {'small'|'medium'|'large'} [props.size]
 * @param {boolean} [props.disabled]
 * @param {import('react').ReactNode} [props.startIcon] por omisión, la flecha de descarga
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`
 */
function TemplateDownloadButtonContent(props) {
    const {
        href, fileName, request, format, label, onDownload, variant = 'text', size, disabled = false, startIcon, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const text = label ?? t('upload.template');
    const icon = startIcon ?? <FileDownloadOutlinedIcon />;

    // un archivo fijo: el enlace del navegador (download con su nombre)
    if (href) {
        return (
            <TemplateButtonRoot component="a" href={href} download={fileName ?? true} variant={variant} size={size} disabled={disabled} startIcon={icon}
                                onClick={onDownload} sx={sx}>
                {text}
            </TemplateButtonRoot>
        );
    }

    return (
        <TemplateButtonRoot
            variant={variant}
            size={size}
            disabled={disabled || !request}
            startIcon={icon}
            sx={sx}
            onClick={() => {
                onDownload?.();
                startDownload({label: text, format, request});
            }}
        >
            {text}
        </TemplateButtonRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const TemplateDownloadButton = withPieceSlots(TemplateDownloadButtonContent, THEME_NAME);
export default TemplateDownloadButton;
