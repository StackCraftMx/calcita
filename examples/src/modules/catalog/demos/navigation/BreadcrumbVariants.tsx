import type {MouseEvent} from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// las ligas de muestra no llevan a ningún lado: sin esto, «#» brincaba al inicio de la página
const SAMPLE_LINK_PROPS = {href: '#', onClick: (event: MouseEvent) => event.preventDefault()};

// dónde está la persona y el camino de regreso; la última miga es la página actual y no es liga
const BreadcrumbVariants = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={2}>
            <Breadcrumbs aria-label={t('navigation.breadcrumbs.ariaLabel')}>
                <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.breadcrumbs.home')}</Link>
                <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.breadcrumbs.orders')}</Link>
                <Typography sx={{color: 'text.primary'}}>P-2375</Typography>
            </Breadcrumbs>
            {/* con muchas, las de en medio se juntan en «…» */}
            <Breadcrumbs maxItems={3} aria-label={t('navigation.breadcrumbs.ariaLabel')}>
                <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.breadcrumbs.home')}</Link>
                <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.breadcrumbs.reports')}</Link>
                <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>2026</Link>
                <Link underline="hover" color="inherit" {...SAMPLE_LINK_PROPS}>{t('navigation.tabs.monthNames.sep')}</Link>
                <Typography sx={{color: 'text.primary'}}>{t('navigation.breadcrumbs.sales')}</Typography>
            </Breadcrumbs>
        </Stack>
    );
};

export default BreadcrumbVariants;
