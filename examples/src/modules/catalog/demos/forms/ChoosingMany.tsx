// Elegir varios, de tres formas, según cuántas opciones hay:
//   pocas y a la vista       CheckboxGroupInput: una casilla por opción, con su explicación
//   una lista corta          SelectInput con multiple: «Elegir todos» y una casilla por opción
//   un catálogo largo        CatalogInput con multiple: buscar, «Elegir los que coinciden», y «+3 más» con el campo sin foco
// «Elegir todos» lleva su casilla a medias cuando hay algunos elegidos. A cada campo le llega la lista de claves.
import {useState} from 'react';
import Typography from '@mui/material/Typography';
import {CatalogInput, CheckboxGroupInput, FormSection, SelectInput} from '@stackcraftmx/calcita';

// ─── Las opciones (en su proyecto salen de sus diccionarios o del API) ───
const CHANNELS = [
    {value: 'email', label: 'Correo', description: 'Facturas y estados de cuenta'},
    {value: 'sms', label: 'SMS', description: 'Solo avisos de pago'},
    {value: 'whatsapp', label: 'WhatsApp'},
    {value: 'call', label: 'Llamada', description: 'Para cobranza vencida', disabled: true},
];
const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day) => ({value: day.toLowerCase(), label: day}));
const STATES = [
    ['AGU', 'Aguascalientes'], ['BCN', 'Baja California'], ['CHH', 'Chihuahua'], ['CMX', 'Ciudad de México'], ['COA', 'Coahuila'],
    ['GUA', 'Guanajuato'], ['JAL', 'Jalisco'], ['MEX', 'Estado de México'], ['MIC', 'Michoacán'], ['NLE', 'Nuevo León'],
    ['PUE', 'Puebla'], ['QUE', 'Querétaro'], ['SLP', 'San Luis Potosí'], ['SON', 'Sonora'], ['TAM', 'Tamaulipas'], ['YUC', 'Yucatán'],
].map(([code, label]) => ({code, label}));

const ChoosingMany = () => {
    const [channels, setChannels] = useState<Array<string | number>>(['email']);
    const [days, setDays] = useState<Array<string | number>>(['lunes', 'martes']);
    const [states, setStates] = useState<string[]>(['NLE', 'JAL', 'CMX', 'QUE']);

    return (
        <>
            <FormSection title="Entregas y avisos">
                {/* 1. Pocas y a la vista: casillas, con «Elegir todos» (la apagada no cuenta) */}
                <CheckboxGroupInput label="Avisos por" value={channels} onChange={setChannels} options={CHANNELS} selectAll />
                {/* 2. Una lista corta: «Elegir todos» y una casilla por opción */}
                <SelectInput label="Días en que recibe" value={days} onChange={setDays} options={WEEK_DAYS} multiple selectAll checkboxes />
                {/* 3. Un catálogo largo: escriba «nu» y «Elegir los que coinciden»; sin foco, solo 3 chips y «+N más» */}
                <CatalogInput label="Estados donde entrega" value={states} onChange={setStates} options={STATES} formatLabel={(state) => state.label}
                              multiple selectAll checkboxes limitTags={3} placeholder="Busque un estado" />
            </FormSection>
            {/* 4. Lo que viaja: las claves */}
            <Typography variant="body2" color="text.secondary" sx={{mt: 1.5, overflowWrap: 'anywhere'}}>
                Viaja: {JSON.stringify({channels, days, states})}
            </Typography>
        </>
    );
};

export default ChoosingMany;
