// El selector de cómo contesta el servidor de mentira, con su explicación. Lo usan los dos formularios de alta (formik y
// react-hook-form).
//
// Lo renderiza la app: arrow (regla de la casa).
import Typography from '@mui/material/Typography';
import {SectionCard, SegmentedControl, useToolkitTranslation} from '@stackcraftmx/calcita';

import {SIMULATED_RESPONSES} from '@/modules/customers/customersApi.js';

// la explicación de cada respuesta simulada, debajo del selector
const HINT_KEY_BY_RESPONSE = Object.freeze({
    [SIMULATED_RESPONSES.normal]: 'server.hintNormal',
    [SIMULATED_RESPONSES.offline]: 'server.hintOffline',
    [SIMULATED_RESPONSES.serverError]: 'server.hintServerError',
});

/**
 * @param {{value: string, onChange: (response: string) => void}} props
 */
export const ServerResponseCard = ({value, onChange}) => {
    const {t} = useToolkitTranslation('customers');
    const options = Object.values(SIMULATED_RESPONSES).map((response) => ({value: response, label: t(`server.${response}`)}));

    return (
        <SectionCard title={t('server.title')}>
            {/* si no se elige ninguna, el selector se queda en la que estaba */}
            <SegmentedControl options={options} value={value} onChange={(response) => onChange(response ?? value)} ariaLabel={t('server.ariaLabel')} />
            <Typography variant="body2" color="text.secondary" sx={{mt: 1.5}}>{t(HINT_KEY_BY_RESPONSE[value])}</Typography>
        </SectionCard>
    );
};
