// Sucursales · la ruta de reparto: en qué orden visita el camión las sucursales abiertas. La lista se ordena arrastrando
// (FormSortableField de /sortable, en un formulario de formik): al soltar, el formulario queda cambiado y se guarda con su
// botón; «Deshacer cambios» regresa al orden guardado. Viaja cada sucursal con su número de parada.
//
// Lo revisa el servidor (422 abajo de la tabla, con applyServerProblem): que la primera parada esté en la ciudad de la
// bodega y que la ruta no haya cambiado mientras se editaba.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import {PageHeading, formatNumber, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {Form, Formik, FormProblemAlert, SubmitButton, applyServerProblem} from '@stackcraftmx/calcita/forms';
import {FormSortableField} from '@stackcraftmx/calcita/sortable';

import {BranchesNav} from '@/modules/branches/BranchesNav.jsx';
import {loadDeliveryRoute, saveRoute} from '@/modules/branches/branchesApi.js';

// lo que ocupa la tabla mientras llega la ruta (unas seis paradas)
const LOADING_HEIGHT_PIXELS = 360;
const ROUTE_MAX_WIDTH_PIXELS = 820;

export const DeliveryRoutePage = () => {
    const {t} = useToolkitTranslation('branches');
    const [stops, setStops] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        loadDeliveryRoute(controller.signal)
            .then(setStops)
            .catch((caught) => caught.name !== 'AbortError' && setError(caught.message));
        return () => controller.abort();
    }, []);

    const save = async (values, formikHelpers) => {
        try {
            const {message} = await saveRoute(values.stops);
            toastSuccess(message);
            // lo guardado es el nuevo punto de partida: el formulario ya no está cambiado
            formikHelpers.resetForm({values});
        } catch (caught) {
            // OJO: applyServerProblem necesita los valores para saber qué campos existen; formik no los trae en sus helpers
            applyServerProblem(caught, {...formikHelpers, values});
        }
    };

    const columns = [
        {field: 'name', headerName: t('route.name'), flex: 1, minWidth: 150},
        {field: 'city', headerName: t('route.city'), width: 170},
        {field: 'orders', headerName: t('route.orders'), width: 150, align: 'right', renderCell: (stop) => formatNumber(stop.orders)},
    ];

    return (
        <Stack spacing={3}>
            <PageHeading title={t('route.title')} description={t('route.description')} />
            <BranchesNav />
            {error && <Alert severity="error">{error}</Alert>}
            {!stops && !error && <Skeleton variant="rounded" height={LOADING_HEIGHT_PIXELS} sx={{maxWidth: ROUTE_MAX_WIDTH_PIXELS}} />}
            {stops && (
                <Formik initialValues={{stops}} onSubmit={save}>
                    {({dirty, isSubmitting, resetForm}) => (
                        <Form noValidate>
                            <Stack spacing={1.5} sx={{maxWidth: ROUTE_MAX_WIDTH_PIXELS}}>
                                <FormProblemAlert />
                                <FormSortableField name="stops" ariaLabel={t('route.table')} getRowLabel={(stop) => stop.name} columns={columns} />
                                <Stack direction="row" spacing={1}>
                                    <SubmitButton size="medium" disabled={!dirty}>{t('route.save')}</SubmitButton>
                                    <Button onClick={() => resetForm()} disabled={!dirty || isSubmitting}>{t('route.undo')}</Button>
                                </Stack>
                            </Stack>
                        </Form>
                    )}
                </Formik>
            )}
        </Stack>
    );
};
