// La raíz de la app: el ÚNICO lugar donde se conecta el framework. ToolkitProvider recibe el idioma, los textos de los
// módulos, la zona, la moneda, el router y la regla de permisos de la sesión (AccountProvider, con el conector de la cuenta); NuqsAdapter guarda en la
// URL el estado de las tablas. Los avisos (Toaster), el panel de descargas y la invitación a instalar la app
// (InstallPromptBanner) se montan aquí UNA vez, para las pantallas con sesión y para las de entrar. Aquí también se vigila
// si ya se publicó otra versión (usePublishedBuildWatch): la app anclada al inicio del iPhone se actualiza sola.
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
import {DownloadManager, InstallPromptBanner, Toaster, ToolkitProvider, usePublishedBuildWatch} from '@stackcraftmx/calcita';
import {AccountProvider} from '@stackcraftmx/calcita/account';
import {reactRouterNavigation} from '@stackcraftmx/calcita/react-router';

import {
    APP_BUILD_ID, APP_FILE_TYPES, APP_LANGUAGES, APP_NAME, BUILD_VERSION_URL, PRODUCT_CURRENCY, PRODUCT_TIME_ZONE,
} from '@/app/appSettings.js';
import {accountConnector} from '@/app/accountConnector.js';
import {APP_TEXTS} from '@/app/appTexts.js';

export const AppProviders = () => {
    const [language, setLanguage] = useState(APP_LANGUAGES.spanish);
    // si estuvo fuera 15 minutos o más se recarga sola con la versión nueva; si no, sale el aviso con «Actualizar»
    usePublishedBuildWatch({url: BUILD_VERSION_URL, buildId: APP_BUILD_ID});

    // el idioma de la página, para el lector de pantalla y el corrector del navegador
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return (
        <AccountProvider connector={accountConnector} refreshKey={language}>
            {(canAccess) => (
                <ToolkitProvider language={language} onLanguageChange={setLanguage} texts={APP_TEXTS} timeZone={PRODUCT_TIME_ZONE}
                                 currency={PRODUCT_CURRENCY} appName={APP_NAME} navigation={reactRouterNavigation} buildId={APP_BUILD_ID}
                                 canAccess={canAccess} fileTypes={APP_FILE_TYPES}>
                    <NuqsAdapter>
                        <Outlet />
                    </NuqsAdapter>
                    <Toaster />
                    <DownloadManager />
                    <InstallPromptBanner />
                </ToolkitProvider>
            )}
        </AccountProvider>
    );
};
