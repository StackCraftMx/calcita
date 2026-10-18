// Catálogo · botones: Button en sus tres variantes, colores, tamaños, con ícono y sus estados; el grupo de botones, el
// botón de ícono, el botón flotante, el marcado rápido (SpeedDial) y CopyButton del framework.
//
// Con el vidrio del tema (reglas de la HIG de Apple, «Buttons»): el relleno es el «prominente» (color de fondo con brillo),
// el de borde es una cápsula de vidrio con letra de un solo color y el grupo con borde es una sola cápsula.
//
// Cada sección pinta su ejemplo de demos/buttons y lo enseña con «Ver código» (DemoSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import ButtonColors from '@/modules/catalog/demos/buttons/ButtonColors.tsx';
import ButtonGroups from '@/modules/catalog/demos/buttons/ButtonGroups.tsx';
import ButtonSizes from '@/modules/catalog/demos/buttons/ButtonSizes.tsx';
import ButtonStates from '@/modules/catalog/demos/buttons/ButtonStates.tsx';
import ButtonVariants from '@/modules/catalog/demos/buttons/ButtonVariants.tsx';
import ButtonsWithIcons from '@/modules/catalog/demos/buttons/ButtonsWithIcons.tsx';
import CopyButtonDemo from '@/modules/catalog/demos/buttons/CopyButtonDemo.tsx';
import FloatingButtons from '@/modules/catalog/demos/buttons/FloatingButtons.tsx';
import IconButtons from '@/modules/catalog/demos/buttons/IconButtons.tsx';
import SpeedDialButton from '@/modules/catalog/demos/buttons/SpeedDialButton.tsx';

export const ButtonsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('buttons.title')} description={t('buttons.description')} />

            <DemoSection title={t('buttons.variants.title')} description={t('buttons.variants.description')}
                         Demo={ButtonVariants} loadSource={() => import('@/modules/catalog/demos/buttons/ButtonVariants.tsx?demo-source')} />
            <DemoSection title={t('buttons.colors.title')} description={t('buttons.colors.description')}
                         Demo={ButtonColors} loadSource={() => import('@/modules/catalog/demos/buttons/ButtonColors.tsx?demo-source')} />
            <DemoSection title={t('buttons.sizes.title')} description={t('buttons.sizes.description')}
                         Demo={ButtonSizes} loadSource={() => import('@/modules/catalog/demos/buttons/ButtonSizes.tsx?demo-source')} />
            <DemoSection title={t('buttons.icons.title')} description={t('buttons.icons.description')}
                         Demo={ButtonsWithIcons} loadSource={() => import('@/modules/catalog/demos/buttons/ButtonsWithIcons.tsx?demo-source')} />
            <DemoSection title={t('buttons.states.title')} description={t('buttons.states.description')}
                         Demo={ButtonStates} loadSource={() => import('@/modules/catalog/demos/buttons/ButtonStates.tsx?demo-source')} />
            <DemoSection title={t('buttons.group.title')} description={t('buttons.group.description')}
                         Demo={ButtonGroups} loadSource={() => import('@/modules/catalog/demos/buttons/ButtonGroups.tsx?demo-source')} />
            <DemoSection title={t('buttons.iconButtons.title')} description={t('buttons.iconButtons.description')}
                         Demo={IconButtons} loadSource={() => import('@/modules/catalog/demos/buttons/IconButtons.tsx?demo-source')} />
            <DemoSection title={t('buttons.fab.title')} description={t('buttons.fab.description')}
                         Demo={FloatingButtons} loadSource={() => import('@/modules/catalog/demos/buttons/FloatingButtons.tsx?demo-source')} />
            <DemoSection title={t('buttons.speedDial.title')} description={t('buttons.speedDial.description')}
                         Demo={SpeedDialButton} loadSource={() => import('@/modules/catalog/demos/buttons/SpeedDialButton.tsx?demo-source')} />
            <DemoSection title={t('frameworkTitle')} description={t('buttons.framework.description')}
                         Demo={CopyButtonDemo} loadSource={() => import('@/modules/catalog/demos/buttons/CopyButtonDemo.tsx?demo-source')} />
        </Stack>
    );
};
