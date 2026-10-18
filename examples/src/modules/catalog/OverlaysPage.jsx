// Catálogo · diálogos y menús: lo que se abre encima del contenido. Diálogo simple, confirmación (ConfirmDialog del
// framework, también la que borra), con formulario, con contenido largo, la hoja de lectura (ContentDialog), la hoja de
// abajo y el panel de la derecha (Drawer); menús con íconos y con la opción actual; la ventanita (Popover) y los tooltips.
//
// Con el vidrio del tema (HIG de Apple): todo esto flota de vidrio; los diálogos llevan «Cancelar» a la izquierda y la
// acción a la derecha (HIG «Alerts»), los cajones flotan separados de la orilla (Adopting Liquid Glass: «half sheets are
// inset») y el menú marca la opción actual con su palomita (HIG «Menus»). La hoja de lectura se queda sólida: es para leer.
//
// Cada sección pinta su ejemplo de demos/overlays y lo enseña con «Ver código» (DemoSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import DialogKinds from '@/modules/catalog/demos/overlays/DialogKinds.tsx';
import MenuKinds from '@/modules/catalog/demos/overlays/MenuKinds.tsx';
import SheetKinds from '@/modules/catalog/demos/overlays/SheetKinds.tsx';
import TooltipPlacements from '@/modules/catalog/demos/overlays/TooltipPlacements.tsx';

export const OverlaysPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('overlays.title')} description={t('overlays.description')} />

            <DemoSection title={t('overlays.dialogs.title')} description={t('overlays.dialogs.description')}
                         Demo={DialogKinds} loadSource={() => import('@/modules/catalog/demos/overlays/DialogKinds.tsx?demo-source')} />
            <DemoSection title={t('overlays.sheets.title')} description={t('overlays.sheets.description')}
                         Demo={SheetKinds} loadSource={() => import('@/modules/catalog/demos/overlays/SheetKinds.tsx?demo-source')} />
            <DemoSection title={t('overlays.menus.title')} description={t('overlays.menus.description')}
                         Demo={MenuKinds} loadSource={() => import('@/modules/catalog/demos/overlays/MenuKinds.tsx?demo-source')} />
            <DemoSection title={t('overlays.tooltips.title')} description={t('overlays.tooltips.description')}
                         Demo={TooltipPlacements} loadSource={() => import('@/modules/catalog/demos/overlays/TooltipPlacements.tsx?demo-source')} />
        </Stack>
    );
};
