// Catálogo · navegación: pestañas (con texto, con ícono, muchas que se deslizan y verticales), migas (Breadcrumbs), ligas
// (Link), paginación, pasos (Stepper y MobileStepper) y la barra de abajo del teléfono (BottomNavigation).
//
// Con el vidrio del tema (HIG de Apple): la pestaña elegida y la página actual van en la gota, y la barra de abajo flota de
// vidrio con lo elegido en su gota («A tab bar floats above content… on a Liquid Glass background», HIG «Tab bars»).
//
// Cada sección pinta su ejemplo de demos/navigation y lo enseña con «Ver código» (DemoSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import BreadcrumbVariants from '@/modules/catalog/demos/navigation/BreadcrumbVariants.tsx';
import LinkUnderlines from '@/modules/catalog/demos/navigation/LinkUnderlines.tsx';
import PaginationVariants from '@/modules/catalog/demos/navigation/PaginationVariants.tsx';
import PhoneBottomNavigation from '@/modules/catalog/demos/navigation/PhoneBottomNavigation.tsx';
import StepperVariants from '@/modules/catalog/demos/navigation/StepperVariants.tsx';
import TabVariants from '@/modules/catalog/demos/navigation/TabVariants.tsx';

export const NavigationPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('navigation.title')} description={t('navigation.description')} />

            <DemoSection title={t('navigation.tabs.title')} description={t('navigation.tabs.description')}
                         Demo={TabVariants} loadSource={() => import('@/modules/catalog/demos/navigation/TabVariants.tsx?demo-source')} />
            <DemoSection title={t('navigation.breadcrumbs.title')} description={t('navigation.breadcrumbs.description')}
                         Demo={BreadcrumbVariants} loadSource={() => import('@/modules/catalog/demos/navigation/BreadcrumbVariants.tsx?demo-source')} />
            <DemoSection title={t('navigation.links.title')} description={t('navigation.links.description')}
                         Demo={LinkUnderlines} loadSource={() => import('@/modules/catalog/demos/navigation/LinkUnderlines.tsx?demo-source')} />
            <DemoSection title={t('navigation.pagination.title')} description={t('navigation.pagination.description')}
                         Demo={PaginationVariants} loadSource={() => import('@/modules/catalog/demos/navigation/PaginationVariants.tsx?demo-source')} />
            <DemoSection title={t('navigation.stepper.title')} description={t('navigation.stepper.description')}
                         Demo={StepperVariants} loadSource={() => import('@/modules/catalog/demos/navigation/StepperVariants.tsx?demo-source')} />
            <DemoSection title={t('navigation.bottom.title')} description={t('navigation.bottom.description')}
                         Demo={PhoneBottomNavigation} loadSource={() => import('@/modules/catalog/demos/navigation/PhoneBottomNavigation.tsx?demo-source')} />
        </Stack>
    );
};
