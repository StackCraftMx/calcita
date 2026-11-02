// Un PDF en una ventana: el aviso de privacidad, un contrato, un estado de cuenta. Lo pinta el visor del navegador (sin
// librerías: nada que descargar ni que actualizar) en la hoja de lectura de la casa (ContentDialog), con «Abrir en otra
// pestaña» y «Descargar» arriba.
//
// OJO: en el iPhone el visor dentro de la página enseña solo la primera hoja y en algunos navegadores no se pinta; por eso
// los dos botones siempre están a la vista: abrirlo aparte o bajarlo funciona en todos.
//
// src es la dirección del PDF o el archivo mismo (un Blob que mandó el API, un File elegido): del archivo se arma una
// dirección en el navegador, sin subirlo, y se libera al cerrar.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaPdfViewerDialog con defaultProps y
// styleOverrides de sus partes: actions, frame.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import ContentDialog from '@/ui/layout/ContentDialog.jsx';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaPdfViewerDialog)
const THEME_NAME = 'CalcitaPdfViewerDialog';
const ViewerActions = piecePart(THEME_NAME, 'Actions', Stack);
const ViewerFrame = piecePart(THEME_NAME, 'Frame', 'iframe');

/**
 * La dirección del PDF: la que llega tal cual, o una del navegador para un archivo (se libera al cambiarlo o al cerrar).
 *
 * @param {string|Blob|null|undefined} src
 * @returns {string|null}
 */
function usePdfUrl(src) {
    const [blobUrl, setBlobUrl] = useState(null);
    const isBlob = typeof Blob !== 'undefined' && src instanceof Blob;

    useEffect(() => {
        if (!isBlob) {
            setBlobUrl(null);
            return undefined;
        }
        const url = URL.createObjectURL(src);
        setBlobUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [isBlob, src]);

    if (isBlob) {
        return blobUrl;
    }
    return typeof src === 'string' && src ? src : null;
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title ya traducido: qué documento es
 * @param {string|Blob|null} props.src la dirección del PDF o el archivo (Blob o File)
 * @param {string} [props.fileName] con qué nombre se descarga (por omisión, el título con .pdf)
 * @param {import('react').ReactNode} [props.actions] botones suyos junto a «Abrir en otra pestaña» y «Descargar»
 * @param {() => void} [props.onDownload] al descargar (para registrarlo, por ejemplo)
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function PdfViewerDialog(props) {
    const {open, onClose, title, src, fileName, actions, onDownload, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const pdfUrl = usePdfUrl(open ? src : null);

    return (
        <ContentDialog open={open} onClose={onClose} title={title} texts={texts}>
            <ViewerActions direction="row" ownSx={{gap: 1, flexWrap: 'wrap', mb: 2}}>
                <Button size="small" variant="outlined" startIcon={<OpenInNewRoundedIcon />} href={pdfUrl ?? undefined} target="_blank"
                        rel="noopener noreferrer" disabled={!pdfUrl}>
                    {t('pdfViewer.openInTab')}
                </Button>
                <Button size="small" variant="outlined" startIcon={<FileDownloadOutlinedIcon />} href={pdfUrl ?? undefined}
                        download={fileName ?? `${title}.pdf`} disabled={!pdfUrl} onClick={onDownload}>
                    {t('pdfViewer.download')}
                </Button>
                {actions}
            </ViewerActions>
            {pdfUrl ? (
                <ViewerFrame src={pdfUrl} title={title}
                             ownSx={{display: 'block', width: '100%', height: {xs: '62vh', md: '72vh'}, border: 0, borderRadius: 1, bgcolor: 'action.hover'}} />
            ) : (
                <Box sx={{height: {xs: '62vh', md: '72vh'}, borderRadius: 1, bgcolor: 'action.hover'}} />
            )}
        </ContentDialog>
    );
}
