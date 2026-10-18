import {useState} from 'react';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import {CatalogInput, FormRow, FormSection, NumberInput, SelectInput, TextInput, useToolkitTranslation} from '@stackcraftmx/calcita';
import {DateInput} from '@stackcraftmx/calcita/date-pickers';

// los estados de ejemplo, con su clave como los manda un API (datos de mentira)
const SAMPLE_STATES = [
    {code: 'JAL', label: 'Jalisco'},
    {code: 'NLE', label: 'Nuevo León'},
    {code: 'YUC', label: 'Yucatán'},
    {code: 'PUE', label: 'Puebla'},
];
const CUSTOMER_TYPES = ['retail', 'wholesale'];
// el ancho de un formulario que se lee de un vistazo (px)
const FORM_MAX_WIDTH = 640;

// Como los formularios de Ajustes del iPhone: cada sección es una tarjeta y cada campo un renglón (etiqueta a la
// izquierda, valor a la derecha). Los campos del framework se acomodan solos dentro de FormSection.
const AppleForm = () => {
    const {t} = useToolkitTranslation('catalog');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    // SelectInput entrega texto o número (sus opciones pueden traer números)
    const [customerType, setCustomerType] = useState<string | number>(CUSTOMER_TYPES[0]);
    const [creditLimit, setCreditLimit] = useState('50000');
    const [stateCode, setStateCode] = useState('NLE');
    // la fecha viaja como AAAA-MM-DD
    const [customerSince, setCustomerSince] = useState('2024-03-15');
    const [wantsNotices, setWantsNotices] = useState(true);

    const customerTypeOptions = CUSTOMER_TYPES.map((type) => ({value: type, label: t(`samples.${type}`)}));

    return (
        <Stack spacing={2} sx={{maxWidth: FORM_MAX_WIDTH}}>
            <FormSection title={t('inputs.appleForm.contact')} footer={t('inputs.appleForm.contactFooter')}>
                <TextInput label={t('samples.name')} value={name} onChange={setName} placeholder={t('inputs.appleForm.namePlaceholder')} />
                <TextInput label={t('samples.email')} type="email" value={email} onChange={setEmail} placeholder="ana@ejemplo.com" />
            </FormSection>
            <FormSection title={t('inputs.appleForm.credit')}>
                <SelectInput label={t('samples.customerType')} value={customerType} onChange={setCustomerType} options={customerTypeOptions} />
                <NumberInput label={t('samples.amount')} value={creditLimit} onChange={setCreditLimit} prefix="$" />
                <CatalogInput label={t('samples.state')} value={stateCode} onChange={setStateCode} options={SAMPLE_STATES}
                              placeholder={t('inputs.appleForm.statePlaceholder')} />
                <DateInput label={t('inputs.appleForm.since')} value={customerSince} onChange={setCustomerSince} disableFuture />
                {/* lo que no es campo del framework va en un FormRow: la etiqueta a la izquierda y el control a la derecha */}
                <FormRow label={t('inputs.appleForm.notices')}>
                    <Switch checked={wantsNotices} onChange={(event) => setWantsNotices(event.target.checked)}
                            slotProps={{input: {'aria-label': t('inputs.appleForm.notices')}}} sx={{alignSelf: 'flex-end'}} />
                </FormRow>
            </FormSection>
        </Stack>
    );
};

export default AppleForm;
