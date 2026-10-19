// Cambie el tema y vea cómo se acoplan las piezas de Calcita: el de Calcita (el de esta app), el de MUI tal cual y el de
// «otro sistema» hecho solo con overrides (components.Calcita… y components.Mui…, como se cambian las piezas de MUI).
// Abajo, las variables CSS (--calcita-…) cambian las esquinas de un jalón. Todo se aplica solo a esta vista previa.
import {useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {ThemeProvider, createTheme, useColorScheme} from '@mui/material/styles';
import type {ThemeOptions} from '@mui/material/styles';
import {FormSection, MetricCard, SegmentedControl, StatusChip, TextInput, dictionaryEntryOf} from '@stackcraftmx/calcita';

const ORDER_STATUS = {
    pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning'),
    delivered: dictionaryEntryOf('delivered', 'orderStatus.delivered', 'success'),
    canceled: dictionaryEntryOf('canceled', 'orderStatus.canceled', 'error'),
};

const THEME_CHOICES = [
    {value: 'calcita', label: 'Calcita'},
    {value: 'mui', label: 'MUI tal cual'},
    {value: 'other', label: 'Otro sistema'},
];

// «otro sistema»: las piezas de Calcita cambiadas solo con overrides, igual que las de MUI. Los nombres de Calcita
// (CalcitaMetricCard…) no vienen en los tipos de MUI: por eso el `as`
const OTHER_SYSTEM_COMPONENTS = {
    MuiButton: {defaultProps: {disableElevation: true}, styleOverrides: {root: {borderRadius: 2, letterSpacing: '0.06em'}}},
    CalcitaMetricCard: {
        styleOverrides: {root: {borderRadius: 2, borderTopWidth: 0, borderLeftWidth: 4, borderLeftColor: '#7C3AED'}, value: {fontWeight: 800}},
    },
    CalcitaStatusChip: {defaultProps: {variant: 'chip'}},
    CalcitaFormSection: {styleOverrides: {card: {borderRadius: 2}, title: {textTransform: 'uppercase', letterSpacing: '0.1em'}}},
    CalcitaFormRow: {styleOverrides: {label: {fontWeight: 600}}},
    CalcitaSegmentedControl: {styleOverrides: {root: {borderRadius: 2, '& .MuiToggleButton-root.MuiToggleButtonGroup-grouped': {borderRadius: 2}}}},
} as ThemeOptions['components'];

const themeOf = (choice: string, mode: 'light' | 'dark') => {
    if (choice === 'mui') {
        return createTheme({palette: {mode}});
    }
    return createTheme({
        // palette.field: los campos de captura de Calcita (relleno, con el cursor encima y su orilla), también en la paleta
        palette: {
            mode,
            primary: {main: mode === 'light' ? '#6D28D9' : '#C4B5FD'},
            background: mode === 'light' ? {default: '#F5F3FF', paper: '#FFFFFF'} : {default: '#140F24', paper: '#1E1733'},
            field: mode === 'light'
                ? {fill: '#FFFFFF', hoverFill: '#FFFFFF', border: '#C4B5FD', hoverBorder: '#6D28D9'}
                : {fill: '#2A2140', hoverFill: '#2A2140', border: '#4C3D75', hoverBorder: '#C4B5FD'},
        } as ThemeOptions['palette'],
        shape: {borderRadius: 2},
        components: OTHER_SYSTEM_COMPONENTS,
    });
};

// Calcita sin tema propio: la vista previa usa el de la app
const WithTheme = ({choice, children}: {choice: string; children: ReactNode}) => {
    const {mode, systemMode} = useColorScheme();
    const shownMode = (mode === 'system' ? systemMode : mode) === 'dark' ? 'dark' : 'light';
    const theme = useMemo(() => (choice === 'calcita' ? null : themeOf(choice, shownMode)), [choice, shownMode]);
    return theme ? <ThemeProvider theme={theme}>{children}</ThemeProvider> : <>{children}</>;
};

const ThemeSwitchDemo = () => {
    const [choice, setChoice] = useState('calcita');
    const [period, setPeriod] = useState('week');
    const [panelRadius, setPanelRadius] = useState(20);
    const [fieldRadius, setFieldRadius] = useState(12);
    const [name, setName] = useState('');

    return (
        <Stack spacing={2.5}>
            <SegmentedControl options={THEME_CHOICES} value={choice} onChange={setChoice} ariaLabel="Tema de la vista previa" />
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={3} sx={{maxWidth: 560}}>
                <Box sx={{flex: 1}}>
                    <Typography variant="caption" color="text.secondary">--calcita-panel-radius: {panelRadius}px</Typography>
                    <Slider size="small" min={0} max={28} value={panelRadius} onChange={(event, value) => setPanelRadius(value as number)}
                            aria-label="Esquinas de los paneles" />
                </Box>
                <Box sx={{flex: 1}}>
                    <Typography variant="caption" color="text.secondary">--calcita-field-radius: {fieldRadius}px</Typography>
                    <Slider size="small" min={0} max={20} value={fieldRadius} onChange={(event, value) => setFieldRadius(value as number)}
                            aria-label="Esquinas de los campos" />
                </Box>
            </Stack>
            {/* las variables en un contenedor: valen para lo que está adentro (un menú flotante toma las de :root) */}
            <WithTheme choice={choice}>
                <Box data-testid="theme-preview" sx={{
                    p: 2, borderRadius: 2, bgcolor: 'background.default',
                    '--calcita-panel-radius': `${panelRadius}px`,
                    '--calcita-field-radius': `${fieldRadius}px`,
                }}>
                    <Stack spacing={2}>
                        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                            <Box sx={{flex: 1}}><MetricCard label="Pedidos" value="1,382" caption="este mes" tone="info" /></Box>
                            <Box sx={{flex: 1}}><MetricCard label="Cancelados" value="126" caption="ver cuáles" tone="error" /></Box>
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{alignItems: 'center', flexWrap: 'wrap'}}>
                            <StatusChip dictionary={ORDER_STATUS} value="pending" />
                            <StatusChip dictionary={ORDER_STATUS} value="delivered" />
                            <StatusChip dictionary={ORDER_STATUS} value="canceled" />
                            <SegmentedControl options={[{value: 'day', label: 'Día'}, {value: 'week', label: 'Semana'}, {value: 'month', label: 'Mes'}]}
                                              value={period} onChange={setPeriod} ariaLabel="Periodo" />
                        </Stack>
                        <Box sx={{maxWidth: 520}}>
                            <FormSection title="Datos del cliente">
                                <TextInput name="customer" label="Nombre" value={name} onChange={setName} />
                                <TextInput name="email" label="Correo" value="" onChange={() => {}} />
                            </FormSection>
                        </Box>
                        <Box><Button variant="contained">Guardar</Button></Box>
                    </Stack>
                </Box>
            </WithTheme>
        </Stack>
    );
};

export default ThemeSwitchDemo;
