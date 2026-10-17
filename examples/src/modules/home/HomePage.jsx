// La página de inicio: una tarjeta por ejemplo, con lo que dice su entrada del menú (su menu.js). Agregar un ejemplo nuevo
// no toca esta página.
//
// El menú lo da el marco (useAppMenu del framework): un módulo no importa a los demás.
//
// Lo renderiza la app: arrow (regla de la casa).
import {Link} from 'react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {PageHeader, SectionCard, menuItemDescriptionOf, menuItemLabelOf, useAppMenu, useToolkitTranslation} from '@stackcraftmx/calcita';

import {APP_PATHS} from '@/core';

export const HomePage = () => {
    const {t} = useToolkitTranslation('home');
    const {menuItems} = useAppMenu();
    // el inicio no se presenta a sí mismo
    const examples = menuItems.filter((menuItem) => menuItem.to !== APP_PATHS.home);

    return (
        <>
            <PageHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
            <Alert severity="info" sx={{mb: 3}}>{t('toggleHint')}</Alert>
            <Grid container spacing={2}>
                {examples.map((menuItem) => (
                    <Grid key={menuItem.to} size={{xs: 12, md: 6}}>
                        <SectionCard title={menuItemLabelOf(menuItem, t)} action={<Button component={Link} to={menuItem.to}>{t('open')}</Button>}>
                            <Stack direction="row" spacing={1.5} sx={{alignItems: 'flex-start'}}>
                                {menuItem.Icon && <menuItem.Icon color="primary" />}
                                <Typography variant="body2" color="text.secondary">{menuItemDescriptionOf(menuItem, t)}</Typography>
                            </Stack>
                        </SectionCard>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};
