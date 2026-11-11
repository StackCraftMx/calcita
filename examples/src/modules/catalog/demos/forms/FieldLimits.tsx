// Mínimo y máximo: cada campo trae su tope y el programador escoge qué pasa cuando lo escrito se sale:
//   - avisar (LIMIT_MODE.warn, por omisión): lo dice en rojo al salir del campo y el formulario no se envía;
//   - corregirlo solo (LIMIT_MODE.fix): el monto de más se vuelve el máximo al salir, el texto no deja teclear más letras,
//     la lista llena apaga las opciones que faltan y la fecha tecleada fuera del rango se vuelve el tope.
// Se escoge una vez para toda la app (<ToolkitProvider limitMode>) o en un campo (limitMode). Aquí el botón de arriba
// cambia el de la demo. Lo que no se puede corregir solo (faltan letras u opciones) avisa con los dos modos.
//
// Lo corregido solo se dice: una nota en el campo («Se ajustó al máximo: 500,000.») y onLimitFix con el objeto de la
// corrección, para lo que la pantalla quiera hacer (aquí se enseña abajo del formulario).
//
// El tope se escribe en el esquema de yup y el campo lo lee (<ToolkitProvider limitsFromSchema>, como el asterisco con
// requiredFromSchema): las letras y las sucursales de abajo salen del esquema. O en el campo: el monto y la fecha.
//
// OJO: un número de Calcita viaja como texto ('250000.00'). Con Yup.string() en el esquema, su min y max son de LETRAS:
// el tope del valor va en el campo (min, max) o en el esquema con Yup.number().
import {useMemo, useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {FormSection, LIMIT_MODE, ToolkitProvider, limitFixOf, toastSuccess} from '@stackcraftmx/calcita';
import {FormDateField} from '@stackcraftmx/calcita/date-pickers';
import {Form, FormCheckboxGroupField, FormNumberField, FormTextField, Formik, SubmitButton, Yup} from '@stackcraftmx/calcita/forms';

type LimitMode = (typeof LIMIT_MODE)[keyof typeof LIMIT_MODE];
type LimitFix = ReturnType<typeof limitFixOf>;

const BRANCH_OPTIONS = [
    {value: 'centro', label: 'Centro'},
    {value: 'norte', label: 'Norte'},
    {value: 'sur', label: 'Sur'},
    {value: 'oriente', label: 'Oriente'},
    {value: 'poniente', label: 'Poniente'},
];
const MILLISECONDS_PER_DAY = 86_400_000;
const DELIVERY_WINDOW_DAYS = 60;

// una fecha de calendario 'AAAA-MM-DD' en la hora de la computadora (toISOString la daría en UTC y podría cambiar de día)
const calendarDateOf = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const FieldLimits = () => {
    const [limitMode, setLimitMode] = useState<LimitMode>(LIMIT_MODE.warn);
    const [lastFix, setLastFix] = useState<LimitFix | null>(null);
    // 1. Los topes de letras y de opciones, una vez, en el esquema
    const schema = useMemo(() => Yup.object({
        amount: Yup.string().required(),
        reference: Yup.string().trim().max(12),
        reason: Yup.string().trim().min(10).max(80),
        branches: Yup.array().of(Yup.string()).min(2).max(3),
        deliveryDate: Yup.string(),
    }), []);
    const lastDeliveryDate = useMemo(() => calendarDateOf(new Date(Date.now() + DELIVERY_WINDOW_DAYS * MILLISECONDS_PER_DAY)), []);

    return (
        <Stack spacing={2}>
            <ToggleButtonGroup exclusive size="small" value={limitMode} aria-label="Qué pasa al salirse del tope"
                               onChange={(event, chosenMode: LimitMode | null) => chosenMode && setLimitMode(chosenMode)}>
                <ToggleButton value={LIMIT_MODE.warn}>Avisar</ToggleButton>
                <ToggleButton value={LIMIT_MODE.fix}>Corregir solo</ToggleButton>
            </ToggleButtonGroup>
            {/* 2. Prendido en la raíz de su app; aquí, solo para la demo */}
            <ToolkitProvider limitsFromSchema limitMode={limitMode}>
                <Formik initialValues={{amount: '', reference: '', reason: '', branches: [], deliveryDate: ''}} validationSchema={schema}
                        onSubmit={() => {
                            toastSuccess('Se envió la solicitud.');
                        }}>
                    <Form noValidate>
                        <Stack spacing={2}>
                            <FormSection title="Solicitud" footer="El monto va de $5,000 a $500,000. La entrega, de hoy a 60 días.">
                                {/* 3. El tope del valor, en el campo: también impide enviar */}
                                <FormNumberField name="amount" label="Monto" prefix="$" min={5000} max={500000} onLimitFix={setLastFix} />
                                <FormTextField name="reference" label="Referencia" uppercase />
                                <FormTextField name="reason" label="Motivo" multiline minRows={2} />
                                <FormCheckboxGroupField name="branches" label="Sucursales que surten" options={BRANCH_OPTIONS} row />
                                {/* 4. Una fecha con su rango: el calendario apaga lo de fuera y lo tecleado avisa o se corrige */}
                                <FormDateField name="deliveryDate" label="Entrega" disablePast maxDate={lastDeliveryDate} onLimitFix={setLastFix} />
                            </FormSection>
                            <SubmitButton sx={{alignSelf: 'flex-start'}}>Pedir</SubmitButton>
                            {/* 5. Lo que recibe la pantalla al corregirse solo un campo */}
                            {lastFix && (
                                <Typography variant="body2" color="text.secondary" data-testid="last-limit-fix">
                                    onLimitFix: {lastFix.typedValue} → {lastFix.fixedValue} (tope {lastFix.rule === 'min' ? 'mínimo' : 'máximo'}: {lastFix.limit})
                                </Typography>
                            )}
                        </Stack>
                    </Form>
                </Formik>
            </ToolkitProvider>
        </Stack>
    );
};

export default FieldLimits;
