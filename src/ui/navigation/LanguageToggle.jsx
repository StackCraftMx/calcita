// Cambio de idioma español / inglés.
//
// Solo avisa el idioma nuevo (onLanguageChange de ToolkitProvider). Lo demás lo hace el proyecto: su i18n, el header
// Accept-Language de las peticiones y volver a pedir los datos del servidor, que traen textos traducidos.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Button from '@mui/material/Button';

/** Los idiomas que traen los textos del paquete. */
export const LANGUAGES = Object.freeze(['es', 'en']);

/**
 * @param {{inverted?: boolean}} props inverted = texto blanco para fondos oscuros
 */
export default function LanguageToggle({inverted = false}) {
    const {t, language, changeLanguage} = useToolkitTranslation('common');
    const currentLanguage = LANGUAGES.includes(language) ? language : 'es';
    const nextLanguage = currentLanguage === 'es' ? 'en' : 'es';

    return (
        <Button size="small" variant="text" onClick={() => changeLanguage(nextLanguage)}
                lang={nextLanguage} aria-label={t(`language.switchTo.${nextLanguage}`)}
                sx={{minWidth: 0, fontWeight: 700, letterSpacing: '0.08em', color: inverted ? 'common.white' : 'text.secondary'}}>
            {nextLanguage.toUpperCase()}
        </Button>
    );
}
