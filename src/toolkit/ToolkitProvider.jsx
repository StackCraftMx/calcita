// El proveedor del paquete: el único lugar donde cada aplicación conecta su idioma, sus textos, su zona horaria y su
// router. Va por encima de la aplicación, dentro del ThemeProvider de MUI (el tema lo arma cada proyecto; sin tema,
// los componentes usan los colores por omisión de MUI).
//
//   <ToolkitProvider language="es" navigation={reactRouterNavigation} texts={{es: {common: {actions: {back: 'Volver'}}}}}>
//
// Sin proveedor todo funciona en español, con la zona del navegador y la navegación del navegador.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo} from 'react';
import {allowOnlyUnrestricted} from '@/access/accessRules.js';
import {browserNavigation} from '@/toolkit/browserNavigation.js';
import {ToolkitContext} from '@/toolkit/toolkitContext.js';
import {useFontSize} from '@/ui/navigation/useFontSize.js';
import {DEFAULT_CURRENCY, DEFAULT_LANGUAGE, DEFAULT_LANGUAGES, browserTimeZone, configureToolkit} from '@/toolkit/toolkitSettings.js';

/**
 * @param {object} props
 * @param {string} [props.language] idioma activo, uno de `languages` (por omisión es)
 * @param {Array<{code: string, label: string, locale?: string}>} [props.languages] los idiomas que ofrece la app: su código,
 *     su nombre en su propio idioma («Português») y su locale de Intl ('pt-BR'). Por omisión español e inglés
 *     (DEFAULT_LANGUAGES). Sus traducciones van en `texts`
 * @param {(language: string) => void} [props.onLanguageChange] lo llama LanguageToggle; el proyecto cambia su idioma
 * @param {object} [props.texts] textos propios por idioma, con la forma de locales/ ({es: {table: {...}}})
 * @param {(namespace: string, key: string, values?: object) => string|undefined} [props.translate] traductor del
 *     proyecto (por ejemplo i18next); undefined deja el texto del paquete
 * @param {string} [props.timeZone] zona de las fechas (por omisión la del navegador)
 * @param {string} [props.currency] moneda de los montos, código ISO 4217 (por omisión MXN)
 * @param {string} [props.appName] nombre de la aplicación para el título de la pestaña
 * @param {object} [props.navigation] {useNavigate, useLocation, Link}; por omisión la del navegador
 * @param {string} [props.buildId] la compilación del front que corre en esta pestaña; con ella NewBuildNotice sabe si el
 *     servidor ya publicó otra (reportPublishedBuild). Vacía (en desarrollo) nunca avisa
 * @param {(access: object|undefined|null) => boolean} [props.canAccess] quién ve qué (menú, rutas, botones): la regla del
 *     proyecto, normalmente createAccessChecker({abilities, roles, policies, context}). Sin ella solo se ve lo que no
 *     tiene regla
 * @param {import('react').ReactNode} props.children
 */
export const ToolkitProvider = ({
    language = DEFAULT_LANGUAGE, languages = DEFAULT_LANGUAGES, onLanguageChange, texts, translate, timeZone, currency = DEFAULT_CURRENCY, appName = '',
    navigation = browserNavigation, buildId = '', canAccess = allowOnlyUnrestricted, children,
}) => {
    const settings = useMemo(() => ({
        language,
        languages,
        onLanguageChange: onLanguageChange ?? null,
        texts: texts ?? {},
        translate: translate ?? null,
        timeZone: timeZone ?? browserTimeZone(),
        currency,
        appName,
        navigation,
        buildId,
        canAccess,
    }), [language, languages, onLanguageChange, texts, translate, timeZone, currency, appName, navigation, buildId, canAccess]);

    // OJO: se configura durante el render (no en un efecto) para que los formatos y avisos que se llaman en este mismo
    // render ya vean el idioma y la zona nuevos
    configureToolkit({
        language: settings.language, texts: settings.texts, translate: settings.translate, timeZone: settings.timeZone, currency, appName,
        buildId, languages,
    });

    // el tamaño de letra que la persona guardó: se aplica aquí, que siempre está montado. Antes lo aplicaba su botón en la
    // barra; al pasar los ajustes al menú de la cuenta, al recargar se perdía hasta abrir el menú (error pagado)
    useFontSize();

    return <ToolkitContext.Provider value={settings}>{children}</ToolkitContext.Provider>;
};
