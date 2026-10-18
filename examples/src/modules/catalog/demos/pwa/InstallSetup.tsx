// Lo que lleva el proyecto para que se pueda instalar:
//   1. public/manifest.webmanifest con el nombre, los colores y los íconos (192 y 512, y uno «maskable»);
//   2. en index.html: <link rel="manifest" href="/manifest.webmanifest" /> y <link rel="apple-touch-icon" …>;
//   3. la invitación una vez en la raíz y el renglón en el menú de la cuenta.
// El modo sin conexión (guardar datos en el navegador) NO va aquí: es de cada proyecto.
import type {ReactNode} from 'react';
import {AppLayout, InstallAppSetting, InstallPromptBanner, Toaster, ToolkitProvider} from '@stackcraftmx/calcita';

export const AppProviders = ({children}: {children: ReactNode}) => (
    <ToolkitProvider appName="Mi tienda">
        {children}
        <Toaster />
        <InstallPromptBanner />
    </ToolkitProvider>
);

export const Shell = ({children}: {children: ReactNode}) => (
    <AppLayout accountSettings={<InstallAppSetting />}>{children}</AppLayout>
);

export const MANIFEST = {
    name: 'Mi tienda',
    short_name: 'Mi tienda',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#2563EB',
    icons: [
        {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
        {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
        {src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
    ],
};
