// El aviso de cookies: un recuadro abajo con el texto, la liga a la política y «Aceptar». Sale hasta que la persona acepta
// ESA versión del aviso en este navegador; al cambiar la versión vuelve a salir. No tapa la pantalla ni la bloquea: se puede
// seguir trabajando.
//
// La política se abre con su dirección (policyHref, en otra pestaña) o con lo que diga la pantalla (onPolicyClick: un
// PdfViewerDialog, por ejemplo). El texto, los botones y dónde se recuerda se cambian desde afuera; para uno a su manera está
// useCookieConsent.
//
// Con la barra de pestañas abajo del teléfono, se sube para no quedar encima (FLOATING_BOTTOM_SPACE del marco).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaCookieNotice con defaultProps y
// styleOverrides de sus partes: root, text, actions.
//
// Genérico del paquete: function (regla de la casa).
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {FLOATING_BOTTOM_SPACE_CSS_VARIABLE} from '@/appShell/shellSizes.js';
import {DEFAULT_COOKIE_CONSENT_KEY, useCookieConsent} from '@/legal/useCookieConsent.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaCookieNotice)
const THEME_NAME = 'CalcitaCookieNotice';
const NoticeRoot = piecePart(THEME_NAME, 'Root', Paper);
const NoticeText = piecePart(THEME_NAME, 'Text', Typography);
const NoticeActions = piecePart(THEME_NAME, 'Actions', Stack);

// lo ancho del recuadro en escritorio: un párrafo cómodo, no toda la orilla
const NOTICE_MAX_WIDTH = 420;
// por encima de la app, debajo de los diálogos (MUI: modal 1300)
const NOTICE_Z_INDEX = 1200;

/**
 * @param {object} props
 * @param {string} [props.version] la del aviso; al cambiarla se vuelve a preguntar (por omisión '1')
 * @param {string} [props.storageKey] dónde se recuerda en este navegador (por omisión 'calcita:cookieConsent')
 * @param {import('react').ReactNode} [props.text] ya traducido; por omisión el del paquete
 * @param {string} [props.policyHref] la dirección de la política (se abre en otra pestaña)
 * @param {() => void} [props.onPolicyClick] en lugar de la dirección: la pantalla la abre a su manera
 * @param {string} [props.policyLabel] ya traducido; por omisión «Política de cookies»
 * @param {string} [props.acceptLabel] ya traducido; por omisión «Aceptar»
 * @param {(acceptance: {version: string, acceptedAt: string}) => void} [props.onAccept] al aceptar (para registrarlo en su API)
 * @param {import('react').ReactNode} [props.actions] botones suyos junto a «Aceptar» («Configurar»)
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function CookieNoticeContent(props) {
    const {
        version = '1', storageKey = DEFAULT_COOKIE_CONSENT_KEY, text, policyHref, onPolicyClick, policyLabel, acceptLabel, onAccept, actions, sx,
        texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {hasAccepted, accept} = useCookieConsent({version, storageKey});

    // guard clause: ya aceptó esta versión
    if (hasAccepted) {
        return null;
    }

    const policyText = policyLabel ?? t('legal.cookies.policy');
    const policyLink = onPolicyClick
        ? <Link component="button" type="button" onClick={onPolicyClick} sx={{verticalAlign: 'baseline'}}>{policyText}</Link>
        : policyHref && <Link href={policyHref} target="_blank" rel="noopener noreferrer">{policyText}</Link>;

    return (
        <NoticeRoot
            role="region"
            aria-label={t('legal.cookies.region')}
            elevation={8}
            ownSx={{
                position: 'fixed', zIndex: NOTICE_Z_INDEX, left: {xs: 16, sm: 24}, right: {xs: 16, sm: 'auto'}, maxWidth: {sm: NOTICE_MAX_WIDTH},
                bottom: `calc(16px + env(safe-area-inset-bottom, 0px) + var(${FLOATING_BOTTOM_SPACE_CSS_VARIABLE}, 0px))`,
                p: 2.5, borderRadius: 3,
            }}
            sx={sx}
        >
            <NoticeText variant="body2" ownSx={{mb: 2}}>
                {text ?? t('legal.cookies.text')} {policyLink}
            </NoticeText>
            <NoticeActions direction="row" ownSx={{gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                {actions}
                <Button variant="contained" onClick={() => {
                    accept();
                    onAccept?.({version, acceptedAt: new Date().toISOString()});
                }}>
                    {acceptLabel ?? t('legal.cookies.accept')}
                </Button>
            </NoticeActions>
        </NoticeRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const CookieNotice = withPieceSlots(CookieNoticeContent, THEME_NAME);
export default CookieNotice;
