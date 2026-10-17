// Catálogo · selección: casillas (con el estado «mixto» de una casilla madre), opciones de una sola elección (Radio),
// interruptores (en renglones de lista, como pide Apple), deslizadores, calificación (Rating), botones de opción
// (ToggleButtonGroup) y SegmentedControl del framework.
//
// Con el vidrio del tema (HIG de Apple): la opción elegida va en su gota y las opciones de un control segmentado miden lo
// mismo; la perilla del interruptor y la del deslizador se vuelven vidrio al apretarlas.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Rating from '@mui/material/Rating';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import {PageHeading, SegmentedControl, useToolkitTranslation} from '@stackcraftmx/calcita';

import {ShowcaseSection, Specimen} from '@/modules/catalog/Showcase.jsx';

// el renglón del interruptor con el texto antes: el texto a la izquierda y el interruptor a la derecha, como en Ajustes
const SWITCH_ROW_WIDTH = 320;
const CHECKBOX_COLORS = Object.freeze(['primary', 'secondary', 'success', 'error']);
// las casillas hijas de la casilla madre: avisos que se prenden por canal
const NOTIFICATION_CHANNELS = Object.freeze(['email', 'sms', 'push']);
const DELIVERY_SPEEDS = Object.freeze(['standard', 'express', 'pickup']);
const PERIODS = Object.freeze(['day', 'week', 'month']);
const ALIGNMENTS = Object.freeze([
    {value: 'left', Icon: FormatAlignLeftIcon},
    {value: 'center', Icon: FormatAlignCenterIcon},
    {value: 'right', Icon: FormatAlignRightIcon},
]);
const FORMATS = Object.freeze([
    {value: 'bold', Icon: FormatBoldIcon},
    {value: 'italic', Icon: FormatItalicIcon},
    {value: 'underline', Icon: FormatUnderlinedIcon},
]);
// el deslizador de pasos: de 0 a 100 de 10 en 10, con marca en cada 25 (HIG: no hace falta etiquetar cada marca)
const SLIDER_STEP = 10;
const SLIDER_MARKS = Object.freeze([0, 25, 50, 75, 100].map((value) => ({value, label: `${value}`})));
// lo ancho de los deslizadores de muestra
const SLIDER_WIDTH = 240;
const SAMPLE_RATING = 3.5;

export const SelectionPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const [channels, setChannels] = useState({email: true, sms: false, push: true});
    const [deliverySpeed, setDeliverySpeed] = useState('standard');
    const [rowSwitches, setRowSwitches] = useState({notifications: true, emailReports: false});
    const [brightness, setBrightness] = useState(60);
    const [priceRange, setPriceRange] = useState([20, 70]);
    const [rating, setRating] = useState(4);
    const [alignment, setAlignment] = useState('left');
    const [formats, setFormats] = useState(['bold']);
    const [period, setPeriod] = useState('week');

    // la casilla madre: palomeada si todas, vacía si ninguna y «mixta» si unas sí y otras no (HIG «Toggles»: «show a mixed
    // state when the subordinate checkboxes have different states»)
    const checkedCount = NOTIFICATION_CHANNELS.filter((channel) => channels[channel]).length;
    const isAllChecked = checkedCount === NOTIFICATION_CHANNELS.length;
    const isMixed = checkedCount > 0 && !isAllChecked;
    const setAllChannels = (isChecked) => setChannels(Object.fromEntries(NOTIFICATION_CHANNELS.map((channel) => [channel, isChecked])));

    const periodOptions = PERIODS.map((value) => ({value, label: t(`selection.periods.${value}`)}));

    return (
        <Stack spacing={3}>
            <PageHeading title={t('selection.title')} description={t('selection.description')} />

            <ShowcaseSection title={t('selection.checkbox.title')} description={t('selection.checkbox.description')}>
                <Specimen label={t('selection.checkbox.states')} code="<Checkbox checked | indeterminate | disabled />">
                    <Checkbox slotProps={{input: {'aria-label': t('selection.checkbox.off')}}} />
                    <Checkbox defaultChecked slotProps={{input: {'aria-label': t('selection.checkbox.on')}}} />
                    <Checkbox indeterminate slotProps={{input: {'aria-label': t('selection.checkbox.mixed')}}} />
                    <Checkbox disabled slotProps={{input: {'aria-label': t('states.disabled')}}} />
                    <Checkbox disabled checked slotProps={{input: {'aria-label': t('states.disabled')}}} />
                </Specimen>
                <Specimen label={t('selection.checkbox.colors')} code='color="…"'>
                    {CHECKBOX_COLORS.map((color) => (
                        <Checkbox key={color} defaultChecked color={color} slotProps={{input: {'aria-label': t(`colors.${color}`)}}} />
                    ))}
                </Specimen>
                <Specimen label={t('selection.checkbox.parent')} code="indeterminate={unas sí y otras no}">
                    <Box>
                        <FormControlLabel label={t('selection.checkbox.allChannels')}
                                          control={<Checkbox checked={isAllChecked} indeterminate={isMixed} onChange={(event) => setAllChannels(event.target.checked)} />} />
                        <FormGroup sx={{pl: 3}}>
                            {NOTIFICATION_CHANNELS.map((channel) => (
                                <FormControlLabel key={channel} label={t(`selection.channels.${channel}`)}
                                                  control={<Checkbox checked={channels[channel]}
                                                                     onChange={(event) => setChannels((current) => ({...current, [channel]: event.target.checked}))} />} />
                            ))}
                        </FormGroup>
                    </Box>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('selection.radio.title')} description={t('selection.radio.description')}>
                <Specimen label={t('selection.radio.group')} code="<RadioGroup row value={…}>">
                    <RadioGroup row value={deliverySpeed} onChange={(event) => setDeliverySpeed(event.target.value)} aria-label={t('selection.radio.ariaLabel')}>
                        {DELIVERY_SPEEDS.map((speed) => (
                            <FormControlLabel key={speed} value={speed} control={<Radio />} label={t(`selection.speeds.${speed}`)} />
                        ))}
                    </RadioGroup>
                </Specimen>
                <Specimen label={t('states.disabled')} code="disabled">
                    <FormControlLabel disabled control={<Radio checked />} label={t('selection.speeds.pickup')} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('selection.switch.title')} description={t('selection.switch.description')}>
                <Specimen label={t('selection.switch.inList')} code="<ListItem secondaryAction={<Switch />}>">
                    <List dense disablePadding sx={{width: 320}}>
                        {Object.keys(rowSwitches).map((setting) => (
                            <ListItem key={setting} disableGutters
                                      secondaryAction={(
                                          <Switch edge="end" checked={rowSwitches[setting]}
                                                  onChange={(event) => setRowSwitches((current) => ({...current, [setting]: event.target.checked}))}
                                                  slotProps={{input: {'aria-label': t(`selection.switch.settings.${setting}`)}}} />
                                      )}>
                                <ListItemText primary={t(`selection.switch.settings.${setting}`)} secondary={t(`selection.switch.settings.${setting}Help`)} />
                            </ListItem>
                        ))}
                    </List>
                </Specimen>
                <Specimen label={t('selection.switch.withLabel')} code={'<FormControlLabel control={<Switch />} label="…" />'}>
                    <FormControlLabel control={<Switch defaultChecked />} label={t('selection.switch.sampleLabel')} />
                </Specimen>
                <Specimen label={t('selection.switch.withLabelStart')} code={'<FormControlLabel labelPlacement="start" … />'}>
                    <FormControlLabel control={<Switch />} label={t('selection.switch.sampleLabel')} labelPlacement="start" sx={{width: SWITCH_ROW_WIDTH}} />
                </Specimen>
                <Specimen label={t('selection.switch.variants')} code='<Switch size="small" | disabled />'>
                    <Switch defaultChecked slotProps={{input: {'aria-label': t('selection.switch.on')}}} />
                    <Switch size="small" defaultChecked slotProps={{input: {'aria-label': t('sizes.small')}}} />
                    <Switch disabled slotProps={{input: {'aria-label': t('states.disabled')}}} />
                    <Switch disabled checked slotProps={{input: {'aria-label': t('states.disabled')}}} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('selection.slider.title')} description={t('selection.slider.description')}>
                <Specimen label={t('selection.slider.continuous')} code='<Slider valueLabelDisplay="auto" />'>
                    <Stack direction="row" spacing={1.5} sx={{alignItems: 'center', width: SLIDER_WIDTH}}>
                        <BrightnessLowIcon aria-hidden fontSize="small" />
                        <Slider value={brightness} onChange={(event, value) => setBrightness(value)} valueLabelDisplay="auto"
                                aria-label={t('selection.slider.brightness')} />
                        <BrightnessHighIcon aria-hidden fontSize="small" />
                    </Stack>
                </Specimen>
                <Specimen label={t('selection.slider.steps')} code="step={10} marks={[…]}">
                    <Box sx={{width: SLIDER_WIDTH, px: 1}}>
                        <Slider defaultValue={50} step={SLIDER_STEP} marks={SLIDER_MARKS} valueLabelDisplay="auto" aria-label={t('selection.slider.discount')} />
                    </Box>
                </Specimen>
                <Specimen label={t('selection.slider.range')} code="value={[desde, hasta]}">
                    <Box sx={{width: SLIDER_WIDTH, px: 1}}>
                        <Slider value={priceRange} onChange={(event, value) => setPriceRange(value)} valueLabelDisplay="auto"
                                getAriaLabel={(index) => t(index === 0 ? 'selection.slider.from' : 'selection.slider.to')} />
                    </Box>
                </Specimen>
                <Specimen label={t('states.disabled')} code="disabled">
                    <Box sx={{width: SLIDER_WIDTH, px: 1}}><Slider defaultValue={30} disabled aria-label={t('states.disabled')} /></Box>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('selection.rating.title')} description={t('selection.rating.description')}>
                <Specimen label={t('selection.rating.editable')} code="<Rating value={…} onChange={…} />">
                    <Rating value={rating} onChange={(event, value) => setRating(value)} />
                </Specimen>
                <Specimen label={t('states.readOnly')} code="readOnly precision={0.5}">
                    <Rating value={SAMPLE_RATING} precision={0.5} readOnly />
                </Specimen>
                <Specimen label={t('selection.rating.sizes')} code='size="small | large"'>
                    <Rating defaultValue={3} size="small" />
                    <Rating defaultValue={3} size="large" />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('selection.toggle.title')} description={t('selection.toggle.description')}>
                <Specimen label={t('selection.toggle.exclusive')} code="<ToggleButtonGroup exclusive>">
                    <ToggleButtonGroup exclusive value={alignment} onChange={(event, value) => value && setAlignment(value)} aria-label={t('selection.toggle.alignment')}>
                        {ALIGNMENTS.map(({value, Icon}) => (
                            <ToggleButton key={value} value={value} aria-label={t(`selection.toggle.align.${value}`)}><Icon /></ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Specimen>
                <Specimen label={t('selection.toggle.multiple')} code="<ToggleButtonGroup value={[…]}>">
                    <ToggleButtonGroup value={formats} onChange={(event, value) => setFormats(value)} aria-label={t('selection.toggle.format')}>
                        {FORMATS.map(({value, Icon}) => (
                            <ToggleButton key={value} value={value} aria-label={t(`selection.toggle.formats.${value}`)}><Icon /></ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Specimen>
                <Specimen label={t('selection.toggle.text')} code="<ToggleButton>Día</ToggleButton>">
                    <ToggleButtonGroup exclusive size="small" value={period} onChange={(event, value) => value && setPeriod(value)} aria-label={t('selection.toggle.period')}>
                        {PERIODS.map((value) => <ToggleButton key={value} value={value}>{t(`selection.periods.${value}`)}</ToggleButton>)}
                    </ToggleButtonGroup>
                </Specimen>
                <Specimen label={t('selection.toggle.vertical')} code='orientation="vertical"'>
                    <ToggleButtonGroup exclusive orientation="vertical" value={alignment} onChange={(event, value) => value && setAlignment(value)}
                                       aria-label={t('selection.toggle.alignment')}>
                        {ALIGNMENTS.map(({value, Icon}) => (
                            <ToggleButton key={value} value={value} aria-label={t(`selection.toggle.align.${value}`)}><Icon /></ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('frameworkTitle')} description={t('selection.framework.description')}>
                <Specimen label="SegmentedControl" code="<SegmentedControl options={[{value, label}]} />">
                    <SegmentedControl options={periodOptions} value={period} onChange={setPeriod} ariaLabel={t('selection.toggle.period')} />
                </Specimen>
            </ShowcaseSection>
        </Stack>
    );
};
