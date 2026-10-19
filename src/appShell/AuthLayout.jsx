// La pantalla de entrada (iniciar sesión, «¿olvidó su contraseña?», elegir una contraseña nueva): el logo y el nombre de
// la app, una tarjeta al centro con su título y lo que lleve adentro, y arriba a la derecha el idioma y claro u oscuro
// (quien no ha entrado también los necesita). Como la plantilla «Sign in» de MUI.
//
//   <AuthLayout logo={<Logo />} title={t('auth:signIn.title')} description={t('auth:signIn.subtitle')}>
//       <SignInForm onSubmit={signIn} forgotPasswordPath="/forgot-password" />
//   </AuthLayout>
//
// Con el vidrio del tema (createToolkitTheme({glass: true})), el lienzo lleva sus manchas de color y la tarjeta es de
// vidrio; sin vidrio, una tarjeta con borde sobre el lienzo.
//
// También pinta el aviso de versión nueva (cápsula flotante), como el marco: quien abre la app sin sesión (o la deja abierta
// en esta pantalla) también debe enterarse; antes solo salía en las pantallas con sesión.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaAuthLayout con defaultProps y
// styleOverrides de sus partes: root, tools, body, brand, logo, brandName, card, description, content, footer.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {PANEL_RADIUS, ambientBackgroundOf, glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';
import NewBuildNotice, {NEW_BUILD_NOTICE_VARIANT} from '@/feedback/NewBuildNotice.jsx';
import GlassLensFilter from '@/ui/layout/GlassLensFilter.jsx';
import DocumentTitle from '@/ui/navigation/DocumentTitle.jsx';
import ColorSchemeToggle from '@/ui/navigation/ColorSchemeToggle.jsx';
import LanguageToggle from '@/ui/navigation/LanguageToggle.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaAuthLayout)
const THEME_NAME = 'CalcitaAuthLayout';
const AuthRoot = piecePart(THEME_NAME, 'Root', Box);
const AuthTools = piecePart(THEME_NAME, 'Tools', Stack);
const AuthBody = piecePart(THEME_NAME, 'Body', Box);
const AuthBrand = piecePart(THEME_NAME, 'Brand', Stack);
const AuthLogo = piecePart(THEME_NAME, 'Logo', Box);
const AuthBrandName = piecePart(THEME_NAME, 'BrandName', Typography);
const AuthCard = piecePart(THEME_NAME, 'Card', Paper);
const AuthDescription = piecePart(THEME_NAME, 'Description', Typography);
const AuthContent = piecePart(THEME_NAME, 'Content', Box);
const AuthFooter = piecePart(THEME_NAME, 'Footer', Box);

// lo ancho de la tarjeta: lo que cabe cómodo un correo largo
const CARD_MAX_WIDTH_PIXELS = 440;

/**
 * La tarjeta: de vidrio si el tema lo trae; si no, con borde.
 *
 * @param {object} theme
 * @returns {object}
 */
const cardSurfaceOf = (theme) => (isGlassTheme(theme)
    ? {...glassStylesOf(theme), borderColor: 'transparent', borderRadius: PANEL_RADIUS}
    : {});

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.logo] el logo chico (28 px)
 * @param {string} [props.brandName] por omisión el appName de ToolkitProvider
 * @param {string} props.title el título de la tarjeta y de la pestaña, ya traducido
 * @param {import('react').ReactNode} [props.description] el renglón debajo del título
 * @param {import('react').ReactNode} props.children el formulario
 * @param {import('react').ReactNode} [props.footer] debajo de la tarjeta (los botones de prueba, el aviso de privacidad…)
 * @param {boolean} [props.showLanguageToggle] por omisión sí
 * @param {boolean} [props.showColorSchemeToggle] por omisión sí
 */
export const AuthLayout = (props) => {
    // lo que el proyecto puso en su tema (components.CalcitaAuthLayout.defaultProps) y encima lo que llega aquí
    const {logo, brandName, title, description, children, footer, showLanguageToggle = true, showColorSchemeToggle = true} = usePieceProps(props, THEME_NAME);
    const {appName} = useToolkitSettings();
    return (
        <AuthRoot ownSx={[{minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default'},
            (theme) => (isGlassTheme(theme) ? ambientBackgroundOf(theme) : {})]}>
            <DocumentTitle title={title} />
            <GlassLensFilter />
            <NewBuildNotice variant={NEW_BUILD_NOTICE_VARIANT.floating} />
            <AuthTools direction="row" spacing={1} ownSx={{justifyContent: 'flex-end', p: 2, pt: 'max(16px, env(safe-area-inset-top))'}}>
                {showLanguageToggle && <LanguageToggle />}
                {showColorSchemeToggle && <ColorSchemeToggle />}
            </AuthTools>
            <AuthBody component="main" ownSx={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2, pb: 6}}>
                <AuthBrand direction="row" spacing={1.25} ownSx={{alignItems: 'center', mb: 3}}>
                    {logo && <AuthLogo ownSx={{width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{logo}</AuthLogo>}
                    <AuthBrandName variant="subtitle1" component="p" ownSx={{fontWeight: 600}}>{brandName ?? appName}</AuthBrandName>
                </AuthBrand>
                <AuthCard variant="outlined" ownSx={[{width: '100%', maxWidth: CARD_MAX_WIDTH_PIXELS, p: {xs: 3, sm: 4}}, cardSurfaceOf]}>
                    <Typography variant="h5" component="h1">{title}</Typography>
                    {description && <AuthDescription variant="body2" color="text.secondary" ownSx={{mt: 1}}>{description}</AuthDescription>}
                    <AuthContent ownSx={{mt: 3}}>{children}</AuthContent>
                </AuthCard>
                {footer && <AuthFooter ownSx={{width: '100%', maxWidth: CARD_MAX_WIDTH_PIXELS, mt: 2}}>{footer}</AuthFooter>}
            </AuthBody>
        </AuthRoot>
    );
};
