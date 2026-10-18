// La raíz de la app: el ÚNICO lugar donde se conecta el framework. ToolkitProvider recibe el idioma, los textos, la zona, la
// moneda y el router; los avisos (Toaster) se montan aquí una vez, para todas las pantallas. Aquí también se vigila si ya se
// publicó otra versión (usePublishedBuildWatch): una pestaña abierta desde ayer, o la app anclada al inicio del iPhone, se
// actualiza sola si estuvo fuera 15 minutos o más; si no, sale el aviso «Versión nueva» con su botón.
//#if auth
//
// AccountProvider carga la sesión con el conector de la cuenta (core/accountConnector.js) y le pasa a ToolkitProvider la regla
// de permisos de quien está dentro.
//#endif
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
    usePublishedBuildWatch,
} from '@stackcraftmx/calcita';
//#if auth
import {AccountProvider} from '@stackcraftmx/calcita/account';
//#endif
//#if i18next
import {translateWithI18next} from '@stackcraftmx/calcita/i18next';
//#endif
import {reactRouterNavigation} from '@stackcraftmx/calcita/react-router';

import {APP_BUILD_ID, APP_LANGUAGES, APP_NAME, BUILD_VERSION_URL, PRODUCT_CURRENCY, PRODUCT_TIME_ZONE} from '@/app/appSettings.js';
//#if !i18next
import {APP_TEXTS} from '@/app/appTexts.js';
//#endif
//#if i18next
import {i18n} from '@/app/i18n.js';
//#endif
//#if auth
import {accountConnector} from '@/core';
//#endif
//#if i18next

// se arma una sola vez: lee de la instancia de i18next, no de una copia
const translate = translateWithI18next(i18n);
//#endif

export const AppProviders = () => {
    const [language, setLanguage] = useState(APP_LANGUAGES.spanish);
    usePublishedBuildWatch({url: BUILD_VERSION_URL, buildId: APP_BUILD_ID});

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
        <AccountProvider connector={accountConnector}>
            {(canAccess) => (
                <ToolkitProvider language={language}
//#if !i18next
                                 onLanguageChange={setLanguage} texts={APP_TEXTS}
//#endif
//#if i18next
                                 onLanguageChange={changeLanguage} translate={translate}
//#endif
                                 timeZone={PRODUCT_TIME_ZONE} currency={PRODUCT_CURRENCY} appName={APP_NAME} navigation={reactRouterNavigation}
                                 buildId={APP_BUILD_ID} canAccess={canAccess}>
                    <Outlet />
                    <Toaster />
//#if pwa
                    <InstallPromptBanner />
//#endif
                </ToolkitProvider>
            )}
        </AccountProvider>
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
                         timeZone={PRODUCT_TIME_ZONE} currency={PRODUCT_CURRENCY} appName={APP_NAME} navigation={reactRouterNavigation}
                         buildId={APP_BUILD_ID}>
            <Outlet />
            <Toaster />
//#if pwa
            <InstallPromptBanner />
//#endif
        </ToolkitProvider>
    );
//#endif
};
