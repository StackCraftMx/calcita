// Hecho en Calcita · instalar la app (PWA, sin modo sin conexión): el renglón del menú de la cuenta, la invitación, lo que
// lleva el proyecto y cómo se publica detrás de un proxy con prefijo (sin subdominio).
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import InstallDemo from '@/modules/catalog/demos/pwa/InstallDemo.tsx';

const loadSetting = () => import('@/modules/catalog/demos/pwa/InstallDemo.tsx?demo-source');
const loadSetup = () => import('@/modules/catalog/demos/pwa/InstallSetup.tsx?demo-source');
const loadBehindProxy = () => import('@/modules/catalog/demos/pwa/BehindProxySetup.ts?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (installApp.<sección>.extend.<id>)
const SETTING_EXTENSIONS = [
    {id: 'setting', option: '<InstallAppSetting />', example: '<AppLayout accountSettings={<InstallAppSetting />} …>'},
    {id: 'banner', option: '<InstallPromptBanner message>', example: '<InstallPromptBanner message="Instale Mi tienda para abrirla más rápido" />'},
    {id: 'hook', option: 'useInstallPrompt()', example: 'const {variant, isInstalled, promptInstall, dismiss} = useInstallPrompt();'},
    {id: 'dialog', option: '<InstallInstructionsDialog variant open onClose>', example: '<InstallInstructionsDialog variant={variant} open={isOpen} onClose={close} />'},
];
const SETUP_EXTENSIONS = [
    {id: 'manifest', option: 'manifest.webmanifest', example: "icons: [{src: 'icons/icon-512-maskable.png', sizes: '512x512', purpose: 'maskable'}]"},
    {id: 'links', option: 'index.html', example: '<link rel="manifest" href="/manifest.webmanifest" />'},
    {id: 'update', option: 'usePublishedBuildWatch', example: 'usePublishedBuildWatch({url: `${import.meta.env.BASE_URL}version.json`, buildId})'},
];
const PROXY_EXTENSIONS = [
    {id: 'assetUrl', option: 'ASSET_URL', example: 'ASSET_URL=/ventas pnpm run build'},
    {id: 'base', option: 'vite.config base', example: 'base: basePathOf(process.env.ASSET_URL)'},
    {id: 'basename', option: 'createBrowserRouter basename', example: 'createBrowserRouter(routes, {basename: ROUTER_BASENAME})'},
    {id: 'publicUrl', option: 'import.meta.env.BASE_URL', example: '<img src={`${import.meta.env.BASE_URL}branding/logo.svg`} alt="" />'},
    {id: 'indexHtml', option: 'index.html', example: '<link rel="icon" href="/favicon.svg" />  // Vite le pone el prefijo'},
    {id: 'manifest', option: 'manifest.webmanifest', example: '"start_url": "./", "scope": "./"'},
    {id: 'server', option: 'nginx', example: 'location /ventas/ { try_files $uri $uri/ /ventas/index.html; }'},
    {id: 'next', option: 'Next.js basePath', example: "const nextConfig = {basePath: '/ventas'};"},
];

export const InstallAppPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `installApp.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('installApp.title')} description={t('installApp.description')} />
            <DemoSection title={t('installApp.setting.title')} description={t('installApp.setting.description')}
                         extensions={rowsOf('setting', SETTING_EXTENSIONS)} Demo={InstallDemo} loadSource={loadSetting} />
            <CodeSection title={t('installApp.setup.title')} description={t('installApp.setup.description')}
                         extensions={rowsOf('setup', SETUP_EXTENSIONS)} loadSource={loadSetup} />
            <CodeSection title={t('installApp.behindProxy.title')} description={t('installApp.behindProxy.description')}
                         extensions={rowsOf('behindProxy', PROXY_EXTENSIONS)} loadSource={loadBehindProxy} />
        </Stack>
    );
};
