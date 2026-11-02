// Aceptar los términos (o el aviso de privacidad) antes de seguir: la ventana enseña el texto de ESA versión, pide leerlo
// hasta el final, marcar «He leído y acepto» y picar «Acepto»; «No acepto» es la otra salida. No se cierra con Escape ni con
// un clic afuera: es una decisión, no un aviso.
//
// Quién lo registra es la pantalla: onAccept recibe la versión y manda al API quién aceptó qué y cuándo (lo que vale ante
// un reclamo). Si onAccept regresa una promesa, la ventana espera con el botón ocupado; si truena, enseña el motivo y deja
// intentar otra vez.
//
// El texto va como children (se sabe si ya se leyó hasta el final) o como un PDF (pdfSrc, con el visor del navegador; ahí no
// se puede saber hasta dónde se leyó y basta la casilla).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTermsAcceptanceDialog con defaultProps y
// styleOverrides de sus partes: content, frame, footer.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useId, useState} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaTermsAcceptanceDialog)
const THEME_NAME = 'CalcitaTermsAcceptanceDialog';
const TermsContent = piecePart(THEME_NAME, 'Content', DialogContent);
const TermsFrame = piecePart(THEME_NAME, 'Frame', 'iframe');
const TermsFooter = piecePart(THEME_NAME, 'Footer', Stack);

// cuánto antes del final ya cuenta como leído (el último renglón medio a la vista)
const READ_TO_END_SLACK_PIXELS = 16;
// los cierres que se ignoran: aceptar o no es una decisión con sus botones
const IGNORED_CLOSE_REASONS = new Set(['backdropClick', 'escapeKeyDown']);

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.version la de los términos que se enseñan (la que recibe onAccept)
 * @param {(acceptance: {version: string}) => void|Promise<void>} props.onAccept la pantalla lo registra en su API
 * @param {() => void} props.onDecline «No acepto» (salir, por ejemplo)
 * @param {string} [props.title] ya traducido; por omisión «Términos y condiciones»
 * @param {import('react').ReactNode} [props.children] el texto de los términos
 * @param {string} [props.pdfSrc] en lugar del texto: la dirección del PDF
 * @param {boolean} [props.requireReading] pedir que se lea hasta el final antes de poder aceptar (por omisión, sí; con PDF no
 *     aplica)
 * @param {string} [props.checkboxLabel] ya traducido; por omisión «He leído y acepto los términos»
 * @param {string} [props.acceptLabel] ya traducido; por omisión «Acepto»
 * @param {string} [props.declineLabel] ya traducido; por omisión «No acepto»
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function TermsAcceptanceDialog(props) {
    const {
        open, version, onAccept, onDecline, title, children, pdfSrc, requireReading = true, checkboxLabel, acceptLabel, declineLabel, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const titleId = useId();
    // el contenido que se lee: se guarda al aparecer (la ventana lo pinta en un portal, DESPUÉS de este componente)
    const [contentNode, setContentNode] = useState(null);
    const mustRead = requireReading && !pdfSrc;
    const [hasReadToEnd, setHasReadToEnd] = useState(!mustRead);
    const [isChecked, setIsChecked] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const checkReadToEnd = () => {
        if (contentNode && contentNode.scrollTop + contentNode.clientHeight >= contentNode.scrollHeight - READ_TO_END_SLACK_PIXELS) {
            setHasReadToEnd(true);
        }
    };
    // un texto que cabe completo ya está leído. OJO: se revisa cuando el contenido aparece y cada vez que cambia de tamaño;
    // revisarlo al abrir no sirve: el portal todavía no lo pinta y, si no hay que deslizar, la casilla se quedaba apagada
    // para siempre
    useEffect(() => {
        if (!contentNode || !mustRead) {
            return undefined;
        }
        checkReadToEnd();
        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const observer = new ResizeObserver(checkReadToEnd);
        observer.observe(contentNode);
        return () => observer.disconnect();
    }, [contentNode, mustRead]);

    const accept = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            await onAccept({version});
        } catch (error) {
            setSaveError(error?.message ?? t('legal.terms.saveFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={titleId}
                onClose={(event, reason) => !IGNORED_CLOSE_REASONS.has(reason) && onDecline()}>
            <DialogTitle id={titleId}>
                {title ?? t('legal.terms.title')}
                <Typography component="span" variant="body2" color="text.secondary" sx={{display: 'block'}}>
                    {t('legal.terms.version', {version})}
                </Typography>
            </DialogTitle>
            <TermsContent dividers ref={setContentNode} onScroll={mustRead ? checkReadToEnd : undefined} tabIndex={0}
                          ownSx={{maxHeight: {xs: '55vh', md: '60vh'}}}>
                {pdfSrc ? (
                    <TermsFrame src={pdfSrc} title={title ?? t('legal.terms.title')}
                                ownSx={{display: 'block', width: '100%', height: {xs: '50vh', md: '56vh'}, border: 0}} />
                ) : children}
            </TermsContent>
            <TermsFooter ownSx={{px: 3, pt: 2}}>
                {saveError && <Alert severity="error" role="alert" sx={{mb: 1.5}}>{saveError}</Alert>}
                <FormControlLabel
                    control={<Checkbox checked={isChecked} onChange={(event) => setIsChecked(event.target.checked)} disabled={!hasReadToEnd || isSaving} />}
                    label={checkboxLabel ?? t('legal.terms.checkbox')}
                />
                {!hasReadToEnd && <Typography variant="caption" color="text.secondary">{t('legal.terms.readToEnd')}</Typography>}
            </TermsFooter>
            <DialogActions sx={{px: 3, pb: 2}}>
                <Button onClick={onDecline} disabled={isSaving}>{declineLabel ?? t('legal.terms.decline')}</Button>
                <Button variant="contained" onClick={accept} disabled={!isChecked || isSaving} loading={isSaving}>
                    {acceptLabel ?? t('legal.terms.accept')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
