// Catálogo · campos: TextField en sus tres variantes y sus estados, con prefijo o sufijo, de varios renglones, la lista para
// elegir (Select), buscar y elegir (Autocomplete) y los campos del framework (TextInput, NumberInput, SelectInput,
// CatalogInput, ColorInput, SecretField).
//
// Con el vidrio del tema los campos no llevan vidrio (son contenido; HIG «Materials»); lo que se abre encima sí: la lista
// de un Select o de un Autocomplete flota de vidrio y marca la opción actual con su palomita (HIG «Menus»).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import {
    CatalogInput, ColorInput, FormRow, FormSection, NumberInput, PageHeading, SecretField, SelectInput, TextInput, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {DateInput} from '@stackcraftmx/calcita/date-pickers';

import {ShowcaseSection, Specimen} from '@/modules/catalog/Showcase.jsx';

const TEXT_FIELD_VARIANTS = Object.freeze(['outlined', 'filled', 'standard']);
// lo ancho de cada campo de muestra: el de un nombre (HIG «Text fields»: el tamaño del campo dice cuánto escribir)
const SPECIMEN_FIELD_WIDTH = 240;
// las ciudades y los estados de ejemplo (datos de mentira, con su clave como los manda un API)
const SAMPLE_CITIES = Object.freeze(['Ciudad de México', 'Guadalajara', 'Mérida', 'Monterrey', 'Puebla', 'Querétaro']);
const SAMPLE_STATES = Object.freeze([
    {code: 'JAL', label: 'Jalisco'},
    {code: 'NLE', label: 'Nuevo León'},
    {code: 'YUC', label: 'Yucatán'},
    {code: 'PUE', label: 'Puebla'},
]);
const CUSTOMER_TYPES = Object.freeze(['retail', 'wholesale']);
// el color y el secreto de ejemplo (de mentira)
const SAMPLE_COLOR = '#FF6B1A';
const SAMPLE_SECRET = 'sk_prueba_4f9a2c7e1b';
// la fecha de ejemplo del formulario de Apple (AAAA-MM-DD, como viaja)
const SAMPLE_SINCE = '2024-03-15';
const APPLE_FORM_MAX_WIDTH = 640;

export const InputsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const [sortField, setSortField] = useState('date');
    const [city, setCity] = useState(SAMPLE_CITIES[1]);
    const [cities, setCities] = useState([SAMPLE_CITIES[0], SAMPLE_CITIES[3]]);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('2850.5');
    const [customerType, setCustomerType] = useState('');
    const [stateCode, setStateCode] = useState('JAL');
    const [color, setColor] = useState(SAMPLE_COLOR);
    // los del formulario de Apple: aparte, para que escribir allá no cambie las muestras de abajo
    const [rowName, setRowName] = useState('');
    const [rowEmail, setRowEmail] = useState('');
    const [rowType, setRowType] = useState(CUSTOMER_TYPES[0]);
    const [rowLimit, setRowLimit] = useState('50000');
    const [rowState, setRowState] = useState('NLE');
    const [rowSince, setRowSince] = useState(SAMPLE_SINCE);
    const [rowNotices, setRowNotices] = useState(true);

    const customerTypeOptions = CUSTOMER_TYPES.map((type) => ({value: type, label: t(`samples.${type}`)}));
    const fieldSx = {width: SPECIMEN_FIELD_WIDTH};

    return (
        <Stack spacing={3}>
            <PageHeading title={t('inputs.title')} description={t('inputs.description')} />

            {/* el formulario de Apple va directo en la página y no dentro de una tarjeta: sus secciones ya son tarjetas */}
            <Stack spacing={2} sx={{maxWidth: APPLE_FORM_MAX_WIDTH}}>
                <Typography variant="h6" component="h2">{t('inputs.appleForm.title')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('inputs.appleForm.description')}</Typography>
                <FormSection title={t('inputs.appleForm.contact')} footer={t('inputs.appleForm.contactFooter')}>
                    <TextInput label={t('samples.name')} value={rowName} onChange={setRowName} placeholder={t('inputs.appleForm.namePlaceholder')} />
                    <TextInput label={t('samples.email')} type="email" value={rowEmail} onChange={setRowEmail} placeholder="ana@ejemplo.com" />
                </FormSection>
                <FormSection title={t('inputs.appleForm.credit')}>
                    <SelectInput label={t('samples.customerType')} value={rowType} onChange={setRowType} options={customerTypeOptions} />
                    <NumberInput label={t('samples.amount')} value={rowLimit} onChange={setRowLimit} prefix="$" />
                    <CatalogInput label={t('samples.state')} value={rowState} onChange={setRowState} options={SAMPLE_STATES} placeholder={t('inputs.appleForm.statePlaceholder')} />
                    <DateInput label={t('inputs.appleForm.since')} value={rowSince} onChange={setRowSince} disableFuture />
                    <FormRow label={t('inputs.appleForm.notices')}>
                        <Switch checked={rowNotices} onChange={(event) => setRowNotices(event.target.checked)}
                                slotProps={{input: {'aria-label': t('inputs.appleForm.notices')}}} sx={{alignSelf: 'flex-end'}} />
                    </FormRow>
                </FormSection>
            </Stack>

            <ShowcaseSection title={t('inputs.variants.title')} description={t('inputs.variants.description')}>
                {TEXT_FIELD_VARIANTS.map((variant) => (
                    <Specimen key={variant} label={t(`variants.${variant}`)} code={`<TextField variant="${variant}" />`}>
                        <TextField variant={variant} label={t('samples.name')} sx={fieldSx} />
                    </Specimen>
                ))}
            </ShowcaseSection>

            <ShowcaseSection title={t('inputs.states.title')} description={t('inputs.states.description')}>
                <Specimen label={t('inputs.states.helper')} code='helperText="…"'>
                    <TextField label={t('samples.email')} helperText={t('inputs.states.helperText')} sx={fieldSx} />
                </Specimen>
                <Specimen label={t('states.error')} code='error helperText="…"'>
                    <TextField label={t('samples.email')} defaultValue="ana@" error helperText={t('inputs.states.errorText')} sx={fieldSx} />
                </Specimen>
                <Specimen label={t('states.required')} code="required">
                    <TextField label={t('samples.name')} required sx={fieldSx} />
                </Specimen>
                <Specimen label={t('states.disabled')} code="disabled">
                    <TextField label={t('samples.name')} defaultValue={t('samples.personName')} disabled sx={fieldSx} />
                </Specimen>
                <Specimen label={t('states.readOnly')} code="slotProps={{htmlInput: {readOnly: true}}}">
                    <TextField label={t('samples.folio')} defaultValue="P-2375" slotProps={{htmlInput: {readOnly: true}}} sx={fieldSx} />
                </Specimen>
                <Specimen label={t('sizes.small')} code='size="small"'>
                    <TextField label={t('samples.name')} size="small" sx={fieldSx} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('inputs.adornments.title')} description={t('inputs.adornments.description')}>
                <Specimen label={t('inputs.adornments.search')} code='type="search" + startAdornment: <SearchIcon />'>
                    <TextField type="search" placeholder={t('inputs.adornments.searchPlaceholder')} sx={fieldSx}
                               slotProps={{input: {startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>}}} />
                </Specimen>
                <Specimen label={t('inputs.adornments.prefix')} code='startAdornment: "$"'>
                    <TextField label={t('samples.amount')} sx={fieldSx}
                               slotProps={{input: {startAdornment: <InputAdornment position="start">$</InputAdornment>}}} />
                </Specimen>
                <Specimen label={t('inputs.adornments.suffix')} code='endAdornment: "kg"'>
                    <TextField label={t('samples.weight')} sx={fieldSx}
                               slotProps={{input: {endAdornment: <InputAdornment position="end">kg</InputAdornment>}}} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('inputs.multiline.title')} description={t('inputs.multiline.description')}>
                <Specimen wide label={t('inputs.multiline.label')} code="multiline minRows={3}">
                    <TextField label={t('samples.notes')} multiline minRows={3} fullWidth />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('inputs.select.title')} description={t('inputs.select.description')}>
                <Specimen label="TextField select" code="<TextField select>…<MenuItem /></TextField>">
                    <TextField select label={t('inputs.select.sortBy')} value={sortField} onChange={(event) => setSortField(event.target.value)} sx={fieldSx}>
                        {['date', 'amount', 'customer'].map((field) => <MenuItem key={field} value={field}>{t(`inputs.select.fields.${field}`)}</MenuItem>)}
                    </TextField>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('inputs.autocomplete.title')} description={t('inputs.autocomplete.description')}>
                <Specimen label={t('inputs.autocomplete.single')} code="<Autocomplete options={…} />">
                    <Autocomplete options={SAMPLE_CITIES} value={city} onChange={(event, value) => setCity(value)} sx={fieldSx}
                                  renderInput={(params) => <TextField {...params} label={t('samples.city')} />} />
                </Specimen>
                <Specimen label={t('inputs.autocomplete.multiple')} code="multiple">
                    <Autocomplete multiple options={SAMPLE_CITIES} value={cities} onChange={(event, value) => setCities(value)} sx={{width: SPECIMEN_FIELD_WIDTH * 1.5}}
                                  renderInput={(params) => <TextField {...params} label={t('samples.cities')} />} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('frameworkTitle')} description={t('inputs.framework.description')}>
                <Specimen label="TextInput" code='<TextInput label="…" value={…} onChange={…} />'>
                    <Stack sx={fieldSx}><TextInput label={t('samples.name')} value={name} onChange={setName} helperText={t('inputs.framework.textHelp')} /></Stack>
                </Specimen>
                <Specimen label="NumberInput" code='<NumberInput prefix="$" decimals={2} />'>
                    <Stack sx={fieldSx}><NumberInput label={t('samples.amount')} value={amount} onChange={setAmount} prefix="$" helperText={t('inputs.framework.numberHelp')} /></Stack>
                </Specimen>
                <Specimen label="SelectInput" code="<SelectInput options={[{value, label}]} />">
                    <Stack sx={fieldSx}><SelectInput label={t('samples.customerType')} value={customerType} onChange={setCustomerType} options={customerTypeOptions}
                                                     placeholder={t('inputs.framework.choose')} /></Stack>
                </Specimen>
                <Specimen label="CatalogInput" code="<CatalogInput options={[{code, label}]} />">
                    <Stack sx={fieldSx}><CatalogInput label={t('samples.state')} value={stateCode} onChange={setStateCode} options={SAMPLE_STATES} /></Stack>
                </Specimen>
                <Specimen label="ColorInput" code="<ColorInput value={'#RRGGBB'} />">
                    <Stack sx={fieldSx}><ColorInput label={t('samples.brandColor')} value={color} onChange={setColor} /></Stack>
                </Specimen>
                <Specimen label="SecretField" code="<SecretField value={…} />">
                    <Stack sx={fieldSx}><SecretField label={t('samples.apiKey')} value={SAMPLE_SECRET} helperText={t('inputs.framework.secretHelp')} /></Stack>
                </Specimen>
            </ShowcaseSection>
        </Stack>
    );
};
