// Hecho en Calcita · la cuenta: entrar con su segundo paso, «¿Olvidó su contraseña?», elegir una contraseña nueva, Mi perfil
// y su seguridad vienen hechos en @stackcraftmx/calcita/account; el proyecto solo escribe el conector. Aquí su código: con un
// backend que sigue el contrato, con uno distinto, sin backend todavía, y la sesión en una pantalla propia. Las pantallas
// se ven funcionando en la misma app de ejemplos (las ligas de arriba).
//
// Lo renderiza la app: arrow (regla de la casa).
import {Link as RouterLink} from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {PageHeading, SectionCard, useToolkitTranslation} from '@stackcraftmx/calcita';

import {APP_PATHS} from '@/core';
import {CodeSection} from '@/modules/catalog/DemoSection.jsx';

const loadRestSetup = () => import('@/modules/catalog/demos/account/AccountRestSetup.tsx?demo-source');
const loadCustomConnector = () => import('@/modules/catalog/demos/account/AccountCustomConnector.ts?demo-source');
const loadDemoSetup = () => import('@/modules/catalog/demos/account/AccountDemoSetup.ts?demo-source');
const loadGreeting = () => import('@/modules/catalog/demos/account/AccountGreeting.tsx?demo-source');

export const AccountPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('account.title')} description={t('account.description')} />
            <SectionCard title={t('account.live.title')}>
                <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}}>
                    <Button component={RouterLink} to={APP_PATHS.profile} variant="outlined">{t('account.live.profile')}</Button>
                    <Button component={RouterLink} to={`${APP_PATHS.profile}?tab=security`} variant="outlined">{t('account.live.security')}</Button>
                </Stack>
            </SectionCard>
            <CodeSection title={t('account.rest.title')} description={t('account.rest.description')} loadSource={loadRestSetup} />
            <CodeSection title={t('account.custom.title')} description={t('account.custom.description')} loadSource={loadCustomConnector} />
            <CodeSection title={t('account.demo.title')} description={t('account.demo.description')} loadSource={loadDemoSetup} />
            <CodeSection title={t('account.session.title')} description={t('account.session.description')} loadSource={loadGreeting} />
        </Stack>
    );
};
