// El panel se monta UNA sola vez, en la raíz de la app (junto a los avisos): las pantallas solo llaman startDownload. Sale
// abajo a la derecha solo mientras hay descargas, se pliega a su barra y se va solo cuando todo terminó bien; si algo falló
// o se canceló, se queda hasta que la persona lo cierra para que vea el motivo.
import type {ReactNode} from 'react';
import {DownloadManager, Toaster, ToolkitProvider} from '@stackcraftmx/calcita';

export const AppProviders = ({children}: {children: ReactNode}) => (
    <ToolkitProvider appName="Mi tienda">
        {children}
        <Toaster />
        <DownloadManager />
    </ToolkitProvider>
);
