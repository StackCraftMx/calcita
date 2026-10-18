// __LABEL_ES__: la lista que manda el servidor y el formulario para agregar uno. Es el esqueleto que armó el CLI de Calcita
// (make:module): cámbielo a lo que pida su pantalla.
//
// La pantalla no sabe del servidor: llama a __name__Api.js (hoy el servidor de mentira; mañana el de verdad).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useCallback, useEffect, useState} from 'react';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {PageHeading, SectionCard, formatDateTime, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';

import {__Name__Form} from '@/modules/__name__/__Name__Form.jsx';
import {addRecord, loadRecords} from '@/modules/__name__/__name__Api.js';

// lo alto del esqueleto mientras llega la lista
const LOADING_HEIGHT_PIXELS = 160;
// lo ancho del formulario: un renglón cómodo, no toda la pantalla
const FORM_MAX_WIDTH = 520;

export const __Name__Page = () => {
    const {t} = useToolkitTranslation('__name__');
    // null: todavía no llega
    const [records, setRecords] = useState(null);
    const [loadError, setLoadError] = useState(null);

    const reload = useCallback((signal) => loadRecords(signal)
        .then((loadedRecords) => {
            setRecords(loadedRecords);
            setLoadError(null);
        })
        // cancelar (la pantalla se cerró a media carga) no es un error que enseñar
        .catch((error) => error.name !== 'AbortError' && setLoadError(error.message)), []);

    useEffect(() => {
        const controller = new AbortController();
        reload(controller.signal);
        return () => controller.abort();
    }, [reload]);

    // el formulario ya guardó: el aviso del servidor y la lista al día
    const showSaved = (message) => {
        toastSuccess(message);
        reload();
    };

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.description')} />
            <SectionCard title={t('page.formTitle')}>
                <Stack sx={{maxWidth: FORM_MAX_WIDTH}}>
                    <__Name__Form onSubmit={addRecord} onSaved={showSaved} />
                </Stack>
            </SectionCard>
            <SectionCard title={t('page.listTitle')}>
                {loadError && <Alert severity="error">{loadError}</Alert>}
                {!records && !loadError && <Skeleton variant="rounded" height={LOADING_HEIGHT_PIXELS} />}
                {records?.length === 0 && <Typography variant="body2" color="text.secondary">{t('page.empty')}</Typography>}
                {records?.length > 0 && (
                    <List disablePadding aria-label={t('page.listTitle')}>
                        {records.map((record) => (
                            <ListItem key={record.id} divider disableGutters>
                                <ListItemText primary={record.name} secondary={record.notes || formatDateTime(record.createdAt)} />
                            </ListItem>
                        ))}
                    </List>
                )}
            </SectionCard>
        </Stack>
    );
};
