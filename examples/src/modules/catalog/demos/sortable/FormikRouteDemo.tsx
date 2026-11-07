// FormSortableField en un formulario de formik: la ruta del camión de reparto. Al soltar un renglón el formulario queda
// cambiado y se guarda con su botón; «Deshacer» regresa al orden con que abrió. La regla de yup revisa la lista entera: el
// camión sale de la bodega de Ciudad de México, así que la primera parada tiene que estar ahí (suba Guadalajara para ver el
// error abajo de la tabla).
import {useMemo} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {formatNumber, toastSuccess} from '@stackcraftmx/calcita';
import {Form, Formik, SubmitButton, Yup} from '@stackcraftmx/calcita/forms';
import {FormSortableField} from '@stackcraftmx/calcita/sortable';

interface RouteStop {
    id: string;
    name: string;
    city: string;
    orders: number;
}

// de donde sale el camión
const WAREHOUSE_CITY = 'Ciudad de México';
const STOPS: RouteStop[] = [
    {id: 'cdmx-centro', name: 'Centro Histórico', city: 'Ciudad de México', orders: 412},
    {id: 'cdmx-polanco', name: 'Polanco', city: 'Ciudad de México', orders: 388},
    {id: 'pue-centro', name: 'Centro', city: 'Puebla', orders: 154},
    {id: 'qro-juriquilla', name: 'Juriquilla', city: 'Querétaro', orders: 121},
    {id: 'gdl-chapultepec', name: 'Chapultepec', city: 'Guadalajara', orders: 296},
];

const FormikRouteDemo = () => {
    // 1. La regla de la lista entera (el esquema se arma dentro: yup toma los mensajes al armarlo, ya en el idioma activo)
    const schema = useMemo(() => Yup.object({
        stops: Yup.array().test('firstStop', `El camión sale de ${WAREHOUSE_CITY}: la primera parada tiene que estar ahí.`,
            (stops) => stops?.[0]?.city === WAREHOUSE_CITY),
    }), []);

    return (
        <Formik initialValues={{stops: STOPS}} validationSchema={schema}
                onSubmit={(values, {resetForm}) => {
                    // 3. Lo que viaja a su backend: cada sucursal con su número de parada
                    const route = values.stops.map((stop, index) => ({branch_id: stop.id, stop: index + 1}));
                    toastSuccess(`Viaja: ${JSON.stringify(route)}`);
                    // lo guardado es el nuevo punto de partida: el formulario ya no está cambiado
                    resetForm({values});
                }}>
            {({dirty, resetForm}) => (
                <Form noValidate>
                    <Stack spacing={1.5} sx={{maxWidth: 720}}>
                        {/* 2. El campo por su nombre: su valor es la lista en su orden */}
                        <FormSortableField<RouteStop> name="stops" ariaLabel="Ruta de reparto" getRowLabel={(stop) => stop.name}
                                                      columns={[
                                                          {field: 'name', headerName: 'Sucursal', flex: 1, minWidth: 150},
                                                          {field: 'city', headerName: 'Ciudad', width: 160},
                                                          {field: 'orders', headerName: 'Pedidos del mes', width: 140, align: 'right',
                                                              renderCell: (stop) => formatNumber(stop.orders)},
                                                      ]} />
                        <Stack direction="row" spacing={1}>
                            <SubmitButton disabled={!dirty}>Guardar la ruta</SubmitButton>
                            <Button onClick={() => resetForm()} disabled={!dirty}>Deshacer</Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};

export default FormikRouteDemo;
