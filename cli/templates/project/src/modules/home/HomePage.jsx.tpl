// El inicio: la bienvenida y los primeros pasos para crecer la app con el CLI de Calcita. Cámbielo por el tablero de su
// app cuando lo tenga.
//
// Lo renderiza la app: arrow (regla de la casa).
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {PageHeader, SectionCard, useToolkitTranslation} from '@stackcraftmx/calcita';

// los comandos del CLI que se enseñan, con la llave de su explicación
const NEXT_STEPS = Object.freeze([
    {command: 'pnpm exec calcita make:module orders', textKey: 'steps.module'},
    {command: 'pnpm exec calcita make:page orders OrderDetail', textKey: 'steps.page'},
    {command: 'pnpm exec calcita make:form orders OrderForm', textKey: 'steps.form'},
    {command: 'pnpm exec calcita make:component StatusBadge', textKey: 'steps.component'},
]);

export const HomePage = () => {
    const {t} = useToolkitTranslation('home');

    return (
        <Stack spacing={3}>
            <PageHeader title={t('page.title')} subtitle={t('page.subtitle')} />
            <SectionCard title={t('steps.title')}>
                <Stack spacing={2}>
                    {NEXT_STEPS.map((step) => (
                        <Box key={step.command}>
                            <Typography variant="body2">{t(step.textKey)}</Typography>
                            <Typography component="code" variant="body2" sx={{fontFamily: 'monospace', color: 'text.secondary'}}>
                                {step.command}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </SectionCard>
        </Stack>
    );
};
