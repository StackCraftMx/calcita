// Diálogo de contenido: la «hoja de lectura» (la «page sheet» de Apple) para una vista grande que se lee, como un historial
// con su tabla. Las confirmaciones y los formularios cortos siguen en su recuadro al centro (ConfirmDialog): esto es para
// leer, no para contestar una pregunta.
//
// Cómo se ve, como en el iPad y en la Mac: una hoja SÓLIDA (para leer no va vidrio) con esquinas redondas, que sube desde
// abajo; en escritorio centrada, de un ancho que se lee cómodo (SHEET_MAX_WIDTH_PIXELS) y debajo de la barra de arriba, que se
// queda a la vista (atenuada) para no perder dónde se está; en el teléfono, separada de las orillas y casi de alto completo.
// Antes ocupaba la pantalla de orilla a orilla: un rectángulo gris plano con renglones larguísimos (lo reportaron).
//
// Cómo se arma: un encabezado que no se mueve (el título y la X para cerrar) y un cuerpo que se desliza si no cabe.
//
// OJO: el alto de la barra superior no es fijo (con un aviso adentro mide más): se usa el que publica el layout
// (APP_BAR_HEIGHT), no un número.
//
// Solo abre una vista: se cierra con la X, con Escape o con un clic afuera, sin confirmación.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaContentDialog con defaultProps y
// styleOverrides de sus partes: header, title, closeButton, body.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: el título y el contenido llegan ya traducidos.
import {useId} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import {APP_BAR_HEIGHT} from '@/ui/layout/appBarHeight.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaContentDialog)
const THEME_NAME = 'CalcitaContentDialog';
const DialogHeader = piecePart(THEME_NAME, 'Header', Box);
const DialogTitle = piecePart(THEME_NAME, 'Title', Typography);
const DialogCloseButton = piecePart(THEME_NAME, 'CloseButton', IconButton);
const DialogBody = piecePart(THEME_NAME, 'Body', Box);

// la hoja: lo ancho máximo en escritorio (un texto de 16 px se lee cómodo y cabe una tabla), su separación de las orillas y
// la de su encabezado
const SHEET_MAX_WIDTH_PIXELS = 880;
const SHEET_GAP_PIXELS = 8;
const SHEET_PHONE_TOP_PIXELS = 24;
const SHEET_RADIUS_PIXELS = 20;

/**
 * La hoja: fija a la ventana y centrada. Va como diálogo fullScreen (así el vidrio del tema la deja sólida y el fondo de
 * atrás no se desenfoca: la barra se sigue leyendo), con su tamaño y sus esquinas propios.
 * OJO: el alto del fullScreen de MUI es 100 %, que con top y bottom se saldría por abajo: va 'auto'.
 *
 * @param {object} theme
 * @returns {object}
 */
function sheetSxOf(theme) {
    const palette = (theme.vars ?? theme).palette;
    return {
        position: 'fixed',
        m: 0,
        height: 'auto',
        maxHeight: 'none',
        borderRadius: `${SHEET_RADIUS_PIXELS}px`,
        // el que se desliza es el cuerpo, no la hoja: así el encabezado se queda quieto
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: palette.background.paper,
        backgroundImage: 'none',
        boxShadow: `0 0 0 1px ${palette.divider}, 0 24px 64px rgba(0, 0, 0, 0.28)`,
        // en oscuro, un poco más clara que lo de atrás: lo que va al frente se aclara (HIG «Dark Mode»)
        ...theme.applyStyles('dark', {backgroundColor: `color-mix(in srgb, ${palette.background.paper}, white 6%)`}),
        // escritorio: centrada, debajo de la barra
        top: `calc(${APP_BAR_HEIGHT} + ${SHEET_GAP_PIXELS}px)`,
        bottom: SHEET_GAP_PIXELS,
        left: 0,
        right: 0,
        mx: 'auto',
        width: `min(${SHEET_MAX_WIDTH_PIXELS}px, calc(100% - ${SHEET_GAP_PIXELS * 4}px))`,
        maxWidth: 'none',
        // teléfono: separada de las orillas y casi de alto completo (la barra está abajo o es de MUI arriba: la hoja la tapa)
        [theme.breakpoints.down('md')]: {
            top: `calc(env(safe-area-inset-top) + ${SHEET_PHONE_TOP_PIXELS}px)`,
            bottom: `calc(env(safe-area-inset-bottom) + ${SHEET_GAP_PIXELS}px)`,
            width: `calc(100% - ${SHEET_GAP_PIXELS * 2}px)`,
        },
    };
}

/**
 * La animación de la hoja: entra desde abajo y sale por donde entró.
 *
 * @param {object} props lo que MUI le pasa a la animación de un diálogo (si está abierto, su contenido, sus tiempos)
 */
function SlideUp(props) {
    return <Slide direction="up" {...props} />;
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title texto ya traducido
 * @param {import('react').ReactNode} props.children
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function ContentDialog(props) {
    // lo que el proyecto puso en su tema (components.CalcitaContentDialog.defaultProps) y encima lo que llega aquí
    const {open, onClose, title, children, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const titleId = useId();

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby={titleId} fullScreen
                slots={{transition: SlideUp}} slotProps={{paper: {sx: sheetSxOf}}}>
            <DialogHeader ownSx={{
                display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, minHeight: 60, pl: {xs: 2.5, md: 4}, pr: {xs: 1.5, md: 2}, py: 1,
                borderBottom: 1, borderColor: 'divider',
            }}>
                <DialogTitle id={titleId} variant="h6" component="h2" ownSx={{flex: 1, minWidth: 0}}>{title}</DialogTitle>
                {/* la X de Apple: en un círculo gris tenue, no suelta */}
                <DialogCloseButton onClick={onClose} aria-label={t('actions.close')} size="small"
                            ownSx={{bgcolor: 'action.hover', '&:hover': {bgcolor: 'action.selected'}}}>
                    <CloseIcon fontSize="small" />
                </DialogCloseButton>
            </DialogHeader>
            <DialogBody ownSx={{flex: 1, minHeight: 0, overflow: 'auto', px: {xs: 2.5, md: 4}, py: {xs: 2, md: 3}}}>
                {children}
            </DialogBody>
        </Dialog>
    );
}
