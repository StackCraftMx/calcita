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
// Lo renderiza la app: arrow (regla de la casa).
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {GLASS_PANEL_RADIUS_PIXELS, ambientBackgroundOf, glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';
import GlassLensFilter from '@/ui/layout/GlassLensFilter.jsx';
import DocumentTitle from '@/ui/navigation/DocumentTitle.jsx';
import ColorSchemeToggle from '@/ui/navigation/ColorSchemeToggle.jsx';
import LanguageToggle from '@/ui/navigation/LanguageToggle.jsx';

// lo ancho de la tarjeta: lo que cabe cómodo un correo largo
const CARD_MAX_WIDTH_PIXELS = 440;

/**
 * La tarjeta: de vidrio si el tema lo trae; si no, con borde.
 *
 * @param {object} theme
 * @returns {object}
 */
const cardSurfaceOf = (theme) => (isGlassTheme(theme)
    ? {...glassStylesOf(theme), borderColor: 'transparent', borderRadius: `${GLASS_PANEL_RADIUS_PIXELS}px`}
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
export const AuthLayout = ({logo, brandName, title, description, children, footer, showLanguageToggle = true, showColorSchemeToggle = true}) => {
    const {appName} = useToolkitSettings();
    return (
        <Box sx={[{minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default'},
            (theme) => (isGlassTheme(theme) ? ambientBackgroundOf(theme) : {})]}>
            <DocumentTitle title={title} />
            <GlassLensFilter />
            <Stack direction="row" spacing={1} sx={{justifyContent: 'flex-end', p: 2, pt: 'max(16px, env(safe-area-inset-top))'}}>
                {showLanguageToggle && <LanguageToggle />}
                {showColorSchemeToggle && <ColorSchemeToggle />}
            </Stack>
            <Box component="main" sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2, pb: 6}}>
                <Stack direction="row" spacing={1.25} sx={{alignItems: 'center', mb: 3}}>
                    {logo && <Box sx={{width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{logo}</Box>}
                    <Typography variant="subtitle1" component="p" sx={{fontWeight: 600}}>{brandName ?? appName}</Typography>
                </Stack>
                <Paper variant="outlined" sx={[{width: '100%', maxWidth: CARD_MAX_WIDTH_PIXELS, p: {xs: 3, sm: 4}}, cardSurfaceOf]}>
                    <Typography variant="h5" component="h1">{title}</Typography>
                    {description && <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>{description}</Typography>}
                    <Box sx={{mt: 3}}>{children}</Box>
                </Paper>
                {footer && <Box sx={{width: '100%', maxWidth: CARD_MAX_WIDTH_PIXELS, mt: 2}}>{footer}</Box>}
            </Box>
        </Box>
    );
};
