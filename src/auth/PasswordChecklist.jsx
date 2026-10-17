// La lista de lo que debe tener una contraseña nueva, que se va palomeando mientras la persona escribe: dice qué falta
// ANTES de enviar, en lugar de un «contraseña inválida» después.
//
// Para el lector de pantalla cada renglón dice si ya cumple o falta (con el ícono solo, se oía la regla sin saber cómo
// iba). Va justo debajo del campo de la contraseña nueva.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import {DEFAULT_PASSWORD_POLICY, passwordChecksOf} from '@/auth/passwordRules.js';

// texto que solo oye el lector de pantalla (el mismo truco que usa MUI)
const SCREEN_READER_ONLY_SX = {
    position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
};

/**
 * @param {object} props
 * @param {string} props.password lo que lleva escrito la persona
 * @param {object} [props.policy] las reglas; por omisión DEFAULT_PASSWORD_POLICY
 * @param {string} [props.id]
 */
export default function PasswordChecklist({password, policy = DEFAULT_PASSWORD_POLICY, id}) {
    const {t} = useToolkitTranslation('auth');
    return (
        <Box id={id}>
            <Typography variant="caption" color="text.secondary" component="p" sx={{mb: 0.5}}>{t('passwordRules.title')}</Typography>
            <Box component="ul" sx={{listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 0.5}}>
                {passwordChecksOf(password, policy).map((check) => (
                    <Box component="li" key={check.rule} data-rule={check.rule} data-met={check.isMet}
                         sx={{display: 'flex', alignItems: 'center', gap: 1, color: check.isMet ? 'text.primary' : 'text.secondary'}}>
                        {check.isMet
                            ? <CheckCircleIcon fontSize="small" color="success" aria-hidden />
                            : <RadioButtonUncheckedIcon fontSize="small" color="disabled" aria-hidden />}
                        <Typography variant="body2" component="span">{t(`passwordRules.${check.rule}`, check.values)}</Typography>
                        <Box component="span" sx={SCREEN_READER_ONLY_SX}>{check.isMet ? t('passwordRules.met') : t('passwordRules.missing')}</Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
