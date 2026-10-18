// __PAGE_LABEL_ES__ (en __module__): la pantalla que armó el CLI de Calcita (make:page). Su ruta está en routes.js del
// módulo (__PAGE_NAME___PATH) y sus textos en __pageName__PageTexts.js.
//
// Para hablar con el servidor, la pantalla llama a __module__Api.js (la única puerta del módulo), nunca directo.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {PageHeading, SectionCard, useToolkitTranslation} from '@stackcraftmx/calcita';

export const __PageName__Page = () => {
    const {t} = useToolkitTranslation('__module__');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('__pageName__Page.title')} description={t('__pageName__Page.description')} />
            <SectionCard title={t('__pageName__Page.sectionTitle')}>
                <Typography variant="body2" color="text.secondary">{t('__pageName__Page.empty')}</Typography>
            </SectionCard>
        </Stack>
    );
};
