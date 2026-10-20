// El proveedor del paquete: el único lugar donde cada aplicación conecta su idioma, sus textos, su zona horaria y su
// router. Va por encima de la aplicación, dentro del ThemeProvider de MUI (el tema lo arma cada proyecto; sin tema,
// los componentes usan los colores por omisión de MUI).
//
//   <ToolkitProvider language="es" navigation={reactRouterNavigation} texts={{es: {common: {actions: {back: 'Volver'}}}}}>
//
// Sin proveedor todo funciona en español, con la zona del navegador y la navegación del navegador.
//
// Un proveedor dentro de otro (una parte de la app en otro idioma, una vista previa) toma del de afuera lo que no le digan, y
// sus componentes leen el suyo: el más cercano. Solo el de la raíz pone la configuración que leen las funciones sueltas
// (avisos, errores, formatos sueltos): antes el de adentro se la cambiaba a toda la app. Dos islas de React en una página
// vieja son dos raíces: cada isla pinta con la suya, y las funciones sueltas usan la última que se pintó (en ese caso los
// componentes de la casa ya formatean con su proveedor; para un aviso, mándelo con el texto ya traducido).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useContext, useMemo} from 'react';
import {allowOnlyUnrestricted} from '@/access/accessRules.js';
import {browserNavigation} from '@/toolkit/browserNavigation.js';
import {ToolkitContext} from '@/toolkit/toolkitContext.js';
import {useFontSize} from '@/ui/navigation/useFontSize.js';
import {DEFAULT_CURRENCY, DEFAULT_HOUR_CYCLE, DEFAULT_LANGUAGE, DEFAULT_LANGUAGES, browserTimeZone, configureToolkit} from '@/toolkit/toolkitSettings.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {string} [props.language] idioma activo, uno de `languages` (por omisión es)
 * @param {Array<{code: string, label: string, locale?: string}>} [props.languages] los idiomas que ofrece la app: su código,
 *     su nombre en su propio idioma («Português») y su locale de Intl ('pt-BR'). Por omisión español e inglés
 *     (DEFAULT_LANGUAGES). Sus traducciones van en `texts`
 * @param {Record<string, {Icon: import('react').ElementType, color?: string, label?: string, hint?: string}>} [props.fileTypes]
 *     tipos de archivo del proyecto para las descargas, además de Excel, CSV y PDF (downloads/fileTypes.js)
 * @param {(language: string) => void} [props.onLanguageChange] lo llama LanguageToggle; el proyecto cambia su idioma
 * @param {object} [props.texts] textos propios por idioma, con la forma de locales/ ({es: {table: {...}}})
 * @param {(namespace: string, key: string, values?: object) => string|undefined} [props.translate] traductor del
 *     proyecto (por ejemplo i18next); undefined deja el texto del paquete
 * @param {string} [props.timeZone] zona de las fechas (por omisión la del navegador)
 * @param {string} [props.currency] moneda de los montos, código ISO 4217 (por omisión MXN)
 * @param {'h23'|'h12'} [props.hourCycle] la hora de 24 horas («15:10», por omisión) o de 12 con a.m. y p.m. («3:10 p.m.»):
 *     HOUR_CYCLE.twentyFourHours o HOUR_CYCLE.twelveHours
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
    language, languages, onLanguageChange, texts, translate, timeZone, currency, hourCycle, appName, navigation, buildId, canAccess, fileTypes,
    children,
    ...unknownProps
}) => {
    warnUnknownProps('ToolkitProvider', unknownProps);
    // el proveedor de afuera, si este va dentro de otro: de él sale lo que este no diga
    const parent = useContext(ToolkitContext);
    const settings = useMemo(() => ({
        language: language ?? parent?.language ?? DEFAULT_LANGUAGE,
        languages: languages ?? parent?.languages ?? DEFAULT_LANGUAGES,
        onLanguageChange: onLanguageChange ?? parent?.onLanguageChange ?? null,
        texts: texts ?? parent?.texts ?? {},
        translate: translate ?? parent?.translate ?? null,
        timeZone: timeZone ?? parent?.timeZone ?? browserTimeZone(),
        currency: currency ?? parent?.currency ?? DEFAULT_CURRENCY,
        hourCycle: hourCycle ?? parent?.hourCycle ?? DEFAULT_HOUR_CYCLE,
        appName: appName ?? parent?.appName ?? '',
        navigation: navigation ?? parent?.navigation ?? browserNavigation,
        buildId: buildId ?? parent?.buildId ?? '',
        canAccess: canAccess ?? parent?.canAccess ?? allowOnlyUnrestricted,
        fileTypes: fileTypes ?? parent?.fileTypes ?? null,
    }), [parent, language, languages, onLanguageChange, texts, translate, timeZone, currency, hourCycle, appName, navigation, buildId, canAccess,
        fileTypes]);

    // solo el de la raíz: un proveedor de adentro le cambiaba el idioma y la zona a las funciones sueltas de toda la app.
    // OJO: se configura durante el render (no en un efecto) para que los formatos y avisos que se llaman en este mismo
    // render ya vean el idioma y la zona nuevos
    if (!parent) {
        configureToolkit({
            language: settings.language, texts: settings.texts, translate: settings.translate, timeZone: settings.timeZone, currency: settings.currency,
            hourCycle: settings.hourCycle, appName: settings.appName, buildId: settings.buildId, languages: settings.languages,
        });
    }

    // el tamaño de letra que la persona guardó: se aplica aquí, que siempre está montado. Antes lo aplicaba su botón en la
    // barra; al pasar los ajustes al menú de la cuenta, al recargar se perdía hasta abrir el menú (error pagado)
    useFontSize();

    return <ToolkitContext.Provider value={settings}>{children}</ToolkitContext.Provider>;
};
