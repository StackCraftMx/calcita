// La raíz de la app: el ÚNICO lugar donde se conecta el framework. ToolkitProvider recibe el idioma, los textos de los
// módulos, la zona, la moneda, el router y la regla de permisos de la sesión (SessionProvider); NuqsAdapter guarda en la
// URL el estado de las tablas. Los avisos (Toaster), el panel de descargas y la invitación a instalar la app
// (InstallPromptBanner) se montan aquí UNA vez, para las pantallas con sesión y para las de entrar.
//
// Va como elemento de la ruta raíz y no afuera del router porque los dos usan sus hooks (useNavigate, useLocation).
//
// El idioma vive aquí: LanguageToggle solo avisa el idioma nuevo (onLanguageChange) y la app decide qué hacer con él. Al
// cambiarlo se vuelve a leer la sesión: el servidor manda el nombre del perfil en el idioma que se pide.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import {Outlet} from 'react-router';
import {NuqsAdapter} from 'nuqs/adapters/react-router/v7';
import {DownloadManager, InstallPromptBanner, Toaster, ToolkitProvider} from '@stackcraftmx/calcita';
import {reactRouterNavigation} from '@stackcraftmx/calcita/react-router';

import {APP_BUILD_ID, APP_LANGUAGES, APP_NAME, PRODUCT_CURRENCY, PRODUCT_TIME_ZONE} from '@/app/appSettings.js';
import {APP_TEXTS} from '@/app/appTexts.js';
import {SessionProvider} from '@/app/SessionProvider.jsx';

export const AppProviders = () => {
    const [language, setLanguage] = useState(APP_LANGUAGES.spanish);

    // el idioma de la página, para el lector de pantalla y el corrector del navegador
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return (
        <SessionProvider language={language}>
            {(canAccess) => (
                <ToolkitProvider language={language} onLanguageChange={setLanguage} texts={APP_TEXTS} timeZone={PRODUCT_TIME_ZONE}
                                 currency={PRODUCT_CURRENCY} appName={APP_NAME} navigation={reactRouterNavigation} buildId={APP_BUILD_ID}
                                 canAccess={canAccess}>
                    <NuqsAdapter>
                        <Outlet />
                    </NuqsAdapter>
                    <Toaster />
                    <DownloadManager />
                    <InstallPromptBanner />
                </ToolkitProvider>
            )}
        </SessionProvider>
    );
};
