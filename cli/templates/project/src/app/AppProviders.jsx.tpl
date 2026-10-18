// La raíz de la app: el ÚNICO lugar donde se conecta el framework. ToolkitProvider recibe el idioma, los textos, la zona, la
// moneda y el router; los avisos (Toaster) se montan aquí una vez, para todas las pantallas.
//
// Va como elemento de la ruta raíz y no afuera del router porque usa sus hooks (useNavigate, useLocation).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import {Outlet} from 'react-router';
import {
//#if pwa
    InstallPromptBanner,
//#endif
    Toaster,
    ToolkitProvider,
} from '@stackcraftmx/calcita';
//#if i18next
import {translateWithI18next} from '@stackcraftmx/calcita/i18next';
//#endif
import {reactRouterNavigation} from '@stackcraftmx/calcita/react-router';

import {APP_LANGUAGES, APP_NAME, PRODUCT_CURRENCY, PRODUCT_TIME_ZONE} from '@/app/appSettings.js';
//#if !i18next
import {APP_TEXTS} from '@/app/appTexts.js';
//#endif
//#if i18next
import {i18n} from '@/app/i18n.js';
//#endif
//#if auth
import {SessionProvider} from '@/app/SessionProvider.jsx';
//#endif
//#if i18next

// se arma una sola vez: lee de la instancia de i18next, no de una copia
const translate = translateWithI18next(i18n);
//#endif

export const AppProviders = () => {
    const [language, setLanguage] = useState(APP_LANGUAGES.spanish);

    // el idioma de la página, para el lector de pantalla y el corrector del navegador
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);
//#if i18next

    // primero i18next y luego la app: así la pantalla se vuelve a pintar ya con los textos del idioma nuevo
    const changeLanguage = async (nextLanguage) => {
        await i18n.changeLanguage(nextLanguage);
        setLanguage(nextLanguage);
    };
//#endif

//#if auth
    return (
        <SessionProvider>
            {(canAccess) => (
                <ToolkitProvider language={language}
//#if !i18next
                                 onLanguageChange={setLanguage} texts={APP_TEXTS}
//#endif
//#if i18next
                                 onLanguageChange={changeLanguage} translate={translate}
//#endif
                                 timeZone={PRODUCT_TIME_ZONE} currency={PRODUCT_CURRENCY} appName={APP_NAME} navigation={reactRouterNavigation}
                                 canAccess={canAccess}>
                    <Outlet />
                    <Toaster />
//#if pwa
                    <InstallPromptBanner />
//#endif
                </ToolkitProvider>
            )}
        </SessionProvider>
    );
//#endif
//#if !auth
    return (
        <ToolkitProvider language={language}
//#if !i18next
                         onLanguageChange={setLanguage} texts={APP_TEXTS}
//#endif
//#if i18next
                         onLanguageChange={changeLanguage} translate={translate}
//#endif
                         timeZone={PRODUCT_TIME_ZONE} currency={PRODUCT_CURRENCY} appName={APP_NAME} navigation={reactRouterNavigation}>
            <Outlet />
            <Toaster />
//#if pwa
            <InstallPromptBanner />
//#endif
        </ToolkitProvider>
    );
//#endif
};
