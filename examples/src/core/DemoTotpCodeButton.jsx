// El atajo de los ejemplos para la app autenticadora: llena el campo «code» del formulario con el código que enseñaría la
// app ahorita. Para quien prueba sin tener la app en su teléfono (y para las pruebas automáticas, que no escanean QR).
// En un proyecto real NO existe: el código solo lo conoce la app de la persona.
//
// Va dentro del formulario de formik (el hueco de abajo de SecondStepForm o el extra del diálogo de activar la app). Lo usan
// dos módulos (entrar y Mi perfil): por eso vive en core. No le pregunta al servidor: quien lo usa le pasa loadCode.
//
// Lo renderiza la app: arrow (regla de la casa).
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {useFormikContext} from '@stackcraftmx/calcita/forms';

/**
 * @param {object} props
 * @param {() => Promise<string|null>} props.loadCode el código de ahorita (del servidor de mentira)
 */
export const DemoTotpCodeButton = ({loadCode}) => {
    const {t} = useToolkitTranslation('demo');
    const {setFieldValue} = useFormikContext();

    const fillCode = async () => {
        const code = await loadCode();
        if (code) {
            setFieldValue('code', code);
        }
    };

    return (
        <Stack spacing={0.5} sx={{alignItems: 'center'}}>
            <Button size="small" startIcon={<ScienceOutlinedIcon />} onClick={fillCode}>{t('totpCode')}</Button>
            <Typography variant="caption" color="text.secondary" sx={{textAlign: 'center'}}>{t('totpCodeHelp')}</Typography>
        </Stack>
    );
};
