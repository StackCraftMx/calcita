// Catálogo · selección: casillas (con el estado «mixto» de una casilla madre), opciones de una sola elección (Radio),
// interruptores (en renglones de lista, como pide Apple), deslizadores, calificación (Rating), botones de opción
// (ToggleButtonGroup) y SegmentedControl del framework.
//
// Con el vidrio del tema (HIG de Apple): la opción elegida va en su gota y las opciones de un control segmentado miden lo
// mismo; la perilla del interruptor y la del deslizador se vuelven vidrio al apretarlas.
//
// Cada sección pinta su ejemplo de demos/selection y lo enseña con «Ver código» (DemoSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import Checkboxes from '@/modules/catalog/demos/selection/Checkboxes.tsx';
import RadioButtons from '@/modules/catalog/demos/selection/RadioButtons.tsx';
import Ratings from '@/modules/catalog/demos/selection/Ratings.tsx';
import SegmentedControlDemo from '@/modules/catalog/demos/selection/SegmentedControlDemo.tsx';
import Sliders from '@/modules/catalog/demos/selection/Sliders.tsx';
import Switches from '@/modules/catalog/demos/selection/Switches.tsx';
import ToggleButtons from '@/modules/catalog/demos/selection/ToggleButtons.tsx';

export const SelectionPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('selection.title')} description={t('selection.description')} />

            <DemoSection title={t('selection.checkbox.title')} description={t('selection.checkbox.description')}
                         Demo={Checkboxes} loadSource={() => import('@/modules/catalog/demos/selection/Checkboxes.tsx?demo-source')} />
            <DemoSection title={t('selection.radio.title')} description={t('selection.radio.description')}
                         Demo={RadioButtons} loadSource={() => import('@/modules/catalog/demos/selection/RadioButtons.tsx?demo-source')} />
            <DemoSection title={t('selection.switch.title')} description={t('selection.switch.description')}
                         Demo={Switches} loadSource={() => import('@/modules/catalog/demos/selection/Switches.tsx?demo-source')} />
            <DemoSection title={t('selection.slider.title')} description={t('selection.slider.description')}
                         Demo={Sliders} loadSource={() => import('@/modules/catalog/demos/selection/Sliders.tsx?demo-source')} />
            <DemoSection title={t('selection.rating.title')} description={t('selection.rating.description')}
                         Demo={Ratings} loadSource={() => import('@/modules/catalog/demos/selection/Ratings.tsx?demo-source')} />
            <DemoSection title={t('selection.toggle.title')} description={t('selection.toggle.description')}
                         Demo={ToggleButtons} loadSource={() => import('@/modules/catalog/demos/selection/ToggleButtons.tsx?demo-source')} />
            <DemoSection title={t('frameworkTitle')} description={t('selection.framework.description')}
                         Demo={SegmentedControlDemo} loadSource={() => import('@/modules/catalog/demos/selection/SegmentedControlDemo.tsx?demo-source')} />
        </Stack>
    );
};
