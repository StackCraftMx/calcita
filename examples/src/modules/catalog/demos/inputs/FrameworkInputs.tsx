import {useState} from 'react';
import Stack from '@mui/material/Stack';
import {CatalogInput, ColorInput, NumberInput, SecretField, SelectInput, TextInput, useToolkitTranslation} from '@stackcraftmx/calcita';

const FIELD_WIDTH = 240;
const SAMPLE_STATES = [
    {code: 'JAL', label: 'Jalisco'},
    {code: 'NLE', label: 'Nuevo León'},
    {code: 'YUC', label: 'Yucatán'},
];
const CUSTOMER_TYPES = ['retail', 'wholesale'];
// un secreto de mentira
const SAMPLE_SECRET = 'sk_prueba_4f9a2c7e1b';

// Los campos del framework: reciben el valor y avisan el nuevo (onChange(valor)), sin el evento de por medio. El número
// viaja como texto exacto (sin decimales de punto flotante) y el color como #RRGGBB.
const FrameworkInputs = () => {
    const {t} = useToolkitTranslation('catalog');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('2850.5');
    // SelectInput entrega texto o número (sus opciones pueden traer números)
    const [customerType, setCustomerType] = useState<string | number>('');
    const [stateCode, setStateCode] = useState('JAL');
    const [color, setColor] = useState('#FF6B1A');

    const customerTypeOptions = CUSTOMER_TYPES.map((type) => ({value: type, label: t(`samples.${type}`)}));

    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'flex-start', '& > *': {width: FIELD_WIDTH}}}>
            <TextInput label={t('samples.name')} value={name} onChange={setName} helperText={t('inputs.framework.textHelp')} />
            <NumberInput label={t('samples.amount')} value={amount} onChange={setAmount} prefix="$" helperText={t('inputs.framework.numberHelp')} />
            <SelectInput label={t('samples.customerType')} value={customerType} onChange={setCustomerType} options={customerTypeOptions}
                         placeholder={t('inputs.framework.choose')} />
            <CatalogInput label={t('samples.state')} value={stateCode} onChange={setStateCode} options={SAMPLE_STATES} />
            <ColorInput label={t('samples.brandColor')} value={color} onChange={setColor} />
            <SecretField label={t('samples.apiKey')} value={SAMPLE_SECRET} helperText={t('inputs.framework.secretHelp')} />
        </Stack>
    );
};

export default FrameworkInputs;
