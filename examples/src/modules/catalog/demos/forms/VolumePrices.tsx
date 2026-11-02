// Renglones que se repiten con formik: los precios por volumen de un producto. Cada renglón «desde N piezas, a $X» se
// agrega y se quita; las reglas de listas dicen en SU renglón lo que no cuadra: una cantidad repetida, las cantidades de
// menor a mayor y los precios de mayor a menor (más piezas, más barato). Hasta 6 precios.
import {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {formatCurrency, toastSuccess} from '@stackcraftmx/calcita';
import {
    Form, Formik, FormNumberField, FormRepeatingFields, SubmitButton, Yup, orderedInListRule, uniqueInListRule,
} from '@stackcraftmx/calcita/forms';

const MAX_PRICES = 6;
const EMPTY_PRICE = {min_quantity: '', unit_price: ''};
const INITIAL_VALUES = {prices: [{min_quantity: '1', unit_price: '120'}, {min_quantity: '10', unit_price: '110'}]};
type PricesValues = typeof INITIAL_VALUES;

const VolumePrices = () => {
    // 1. Las reglas de cada columna, con las de listas: sin repetidos y en orden
    const schema = useMemo(() => Yup.object({
        prices: Yup.array().min(1).max(MAX_PRICES).of(Yup.object({
            min_quantity: Yup.string().required()
                .test(uniqueInListRule('prices', 'min_quantity'))
                .test(orderedInListRule('prices', 'min_quantity', {displayOf: (pieces) => `${pieces} pzas`})),
            unit_price: Yup.string().required()
                .test(orderedInListRule('prices', 'unit_price', {ascending: false, displayOf: (price) => formatCurrency(Number(price))})),
        })),
    }), []);

    return (
        <Formik initialValues={INITIAL_VALUES} validationSchema={schema}
                onSubmit={(values: PricesValues) => {
                    toastSuccess(`Viaja: ${JSON.stringify(values.prices)}`);
                }}>
            {({values}) => (
                <Form noValidate>
                    <Stack spacing={2} sx={{maxWidth: 640}}>
                        {/* 2. La lista por su nombre: cada campo del renglón con nameOf */}
                        <FormRepeatingFields
                            name="prices"
                            label="Precios por volumen"
                            emptyRow={EMPTY_PRICE}
                            maxRows={MAX_PRICES}
                            columns={{xs: 1, sm: 2}}
                            rowLabelOf={(index) => `Precio ${index + 1}`}
                            addLabel="Agregar un precio"
                            renderRow={({nameOf}) => (
                                <>
                                    <FormNumberField name={nameOf('min_quantity')} label="Desde (piezas)" decimals={0} />
                                    <FormNumberField name={nameOf('unit_price')} label="Precio por pieza" prefix="$" />
                                </>
                            )}
                        />
                        <SubmitButton sx={{alignSelf: 'flex-start'}}>Guardar precios</SubmitButton>
                        {/* 3. Lo que viaja: la lista tal cual */}
                        <Typography variant="body2" color="text.secondary">Viaja: «{JSON.stringify(values.prices)}»</Typography>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};

export default VolumePrices;
