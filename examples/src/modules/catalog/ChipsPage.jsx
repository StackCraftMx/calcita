// Catálogo · chips y etiquetas: Chip en sus variantes y colores, con ícono, avatar o para quitar; las etiquetas del
// framework (Tag, StatusChip con su diccionario, QuickFilters); las insignias (Badge) y los avatares.
//
// Con el vidrio del tema (HIG de Apple, «Materials» y «Buttons»): el chip que solo informa es contenido y no lleva vidrio;
// el que se pica es un control y se vuelve cápsula de vidrio, y el elegido, de su color con brillo.
//
// Cada sección pinta su ejemplo de demos/chips y lo enseña con «Ver código» (DemoSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import Avatars from '@/modules/catalog/demos/chips/Avatars.tsx';
import Badges from '@/modules/catalog/demos/chips/Badges.tsx';
import ChipColors from '@/modules/catalog/demos/chips/ChipColors.tsx';
import ChipExtras from '@/modules/catalog/demos/chips/ChipExtras.tsx';
import ChipVariants from '@/modules/catalog/demos/chips/ChipVariants.tsx';
import FrameworkTags from '@/modules/catalog/demos/chips/FrameworkTags.tsx';

export const ChipsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('chips.title')} description={t('chips.description')} />

            <DemoSection title={t('chips.variants.title')} description={t('chips.variants.description')}
                         Demo={ChipVariants} loadSource={() => import('@/modules/catalog/demos/chips/ChipVariants.tsx?demo-source')} />
            <DemoSection title={t('chips.colors.title')} description={t('chips.colors.description')}
                         Demo={ChipColors} loadSource={() => import('@/modules/catalog/demos/chips/ChipColors.tsx?demo-source')} />
            <DemoSection title={t('chips.extras.title')} description={t('chips.extras.description')}
                         Demo={ChipExtras} loadSource={() => import('@/modules/catalog/demos/chips/ChipExtras.tsx?demo-source')} />
            <DemoSection title={t('frameworkTitle')} description={t('chips.framework.description')}
                         Demo={FrameworkTags} loadSource={() => import('@/modules/catalog/demos/chips/FrameworkTags.tsx?demo-source')} />
            <DemoSection title={t('chips.badges.title')} description={t('chips.badges.description')}
                         Demo={Badges} loadSource={() => import('@/modules/catalog/demos/chips/Badges.tsx?demo-source')} />
            <DemoSection title={t('chips.avatars.title')} description={t('chips.avatars.description')}
                         Demo={Avatars} loadSource={() => import('@/modules/catalog/demos/chips/Avatars.tsx?demo-source')} />
        </Stack>
    );
};
