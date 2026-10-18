// Un alta con formik + yup y los campos de la casa: el formulario al estilo de Apple (FormSection: etiqueta a la izquierda y
// valor a la derecha en una tarjeta), el número exacto (viaja como texto, sin decimales de punto flotante), el catálogo con
// búsqueda y las reglas del navegador. Si el servidor dice que no (RFC 9457), applyServerProblem pone cada error en su
// campo y el aviso general arriba. Este servidor de mentira rechaza el correo ana@ejemplo.com, como uno que ya existe.
// Varias opciones: `multiple` en la lista (cada elegida con su palomita; al formulario llega la lista de valores).
import {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {ApiError, FormSection, toastSuccess} from '@stackcraftmx/calcita';
import {
    Form, FormCatalogField, FormNumberField, FormProblemAlert, FormSelectField, FormTextField, Formik, SubmitButton, Yup, applyServerProblem,
} from '@stackcraftmx/calcita/forms';

// 1. Los campos del formulario con su valor de arranque (los montos van como texto: '' es vacío)
const INITIAL_VALUES = {name: '', email: '', customerType: 'retail', creditLimit: '', state: '', deliveryDays: [] as string[]};
const STATES = [{code: 'JAL', label: 'Jalisco'}, {code: 'NLE', label: 'Nuevo León'}, {code: 'YUC', label: 'Yucatán'}];
const DELIVERY_DAYS = [{value: 'mon', label: 'Lunes'}, {value: 'wed', label: 'Miércoles'}, {value: 'fri', label: 'Viernes'}];
const CUSTOMER_TYPES = [
    {value: 'retail', label: 'Menudeo', description: 'Compra por pieza'},
    {value: 'wholesale', label: 'Mayoreo', description: 'Compra por caja, con precio de mayoreo'},
];
type CustomerValues = typeof INITIAL_VALUES;

// ─── El servidor de mentira (en su proyecto NO va: es la llamada de su *Api.js) ───
const createCustomer = async (values: CustomerValues) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (values.email.trim().toLowerCase() === 'ana@ejemplo.com') {
        throw new ApiError({status: 422, problem: {title: 'Revise los datos', detail: 'Hay campos por corregir.', errors: {email: ['Ya hay un cliente con ese correo.']}}});
    }
    return {message: `Se dio de alta a ${values.name.trim()}.`};
};

const NewCustomerForm = () => {
    // 2. Las reglas. OJO: el esquema se arma al pintar, no afuera: yup toma sus mensajes (ya traducidos) al armarlo
    const schema = useMemo(() => Yup.object({
        name: Yup.string().trim().required(),
        email: Yup.string().trim().required().email(),
        creditLimit: Yup.string().required(),
        state: Yup.string().required(),
        deliveryDays: Yup.array().of(Yup.string()).min(1),
    }), []);

    // 3. Qué hacer al guardar: si el servidor dice que no, applyServerProblem pone cada error en su campo
    const save = async (values: CustomerValues, formikHelpers: {resetForm: () => void, setFieldError: (field: string, message?: string) => void, setStatus: (status?: unknown) => void}) => {
        try {
            const response = await createCustomer(values);
            toastSuccess(response.message);
            formikHelpers.resetForm();
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    // 4. El formulario: sus tarjetas y sus campos. Lo de abajo es lo mínimo; la tabla «Cómo se extiende» trae lo demás
    return (
        <Formik initialValues={INITIAL_VALUES} validationSchema={schema} onSubmit={save}>
            <Form noValidate>
                <Stack spacing={3} sx={{maxWidth: 560}}>
                    <FormProblemAlert />
                    <FormSection title="Contacto" footer="El correo es con el que recibe sus facturas.">
                        <FormTextField name="name" label="Nombre" />
                        <FormTextField name="email" label="Correo" type="email" />
                    </FormSection>
                    <FormSection title="Crédito">
                        <FormSelectField name="customerType" label="Tipo de cliente" options={CUSTOMER_TYPES} />
                        <FormNumberField name="creditLimit" label="Límite de crédito" prefix="$" decimals={2} />
                        <FormCatalogField name="state" label="Estado" options={STATES} placeholder="Busque el estado" />
                    </FormSection>
                    <FormSection title="Entrega">
                        <FormSelectField name="deliveryDays" label="Días en que recibe" options={DELIVERY_DAYS} multiple />
                    </FormSection>
                    <SubmitButton sx={{alignSelf: 'flex-start'}}>Dar de alta</SubmitButton>
                </Stack>
            </Form>
        </Formik>
    );
};

export default NewCustomerForm;
