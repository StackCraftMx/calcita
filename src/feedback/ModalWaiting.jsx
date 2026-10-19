// Bloqueo general "espere un momento" como diálogo modal, para una acción que no se puede interrumpir (p. ej. generar
// un archivo grande).
//
// OJO zIndex: HASTA ARRIBA de todo, encima de modal (1300), snackbar (1400) y tooltip (1500), para que ningún elemento
// de la interfaz se le monte mientras bloquea. No se cierra con Escape a propósito.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaModalWaiting con defaultProps y
// styleOverrides de sus partes: root, title, body, text.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaModalWaiting)
const THEME_NAME = 'CalcitaModalWaiting';
const WaitingRoot = piecePart(THEME_NAME, 'Root', Dialog);
const WaitingTitle = piecePart(THEME_NAME, 'Title', DialogTitle);
const WaitingBody = piecePart(THEME_NAME, 'Body', Stack);
const WaitingText = piecePart(THEME_NAME, 'Text', DialogContentText);

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} [props.title] ya traducido; por omisión common:waiting.title
 * @param {string} [props.text] ya traducido; por omisión common:waiting.text
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function ModalWaiting(props) {
    // lo que el proyecto puso en su tema (components.CalcitaModalWaiting.defaultProps) y encima lo que llega aquí
    const {open, title, text, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('common', texts);

    return (
        <WaitingRoot open={open} disableEscapeKeyDown aria-busy="true" ownSx={{zIndex: (theme) => theme.zIndex.tooltip + 10}}>
            <WaitingTitle ownSx={{textAlign: 'center'}}>{title ?? t('waiting.title')}</WaitingTitle>
            <DialogContent>
                <WaitingBody spacing={2} ownSx={{alignItems: 'center'}}>
                    <CircularProgress size={28} />
                    <WaitingText ownSx={{textAlign: 'center'}}>{text ?? t('waiting.text')}</WaitingText>
                </WaitingBody>
            </DialogContent>
        </WaitingRoot>
    );
}
