// La lista de lo que debe tener una contraseña nueva, que se va palomeando mientras la persona escribe: dice qué falta
// ANTES de enviar, en lugar de un «contraseña inválida» después.
//
// Para el lector de pantalla cada renglón dice si ya cumple o falta (con el ícono solo, se oía la regla sin saber cómo
// iba). Va justo debajo del campo de la contraseña nueva.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaPasswordChecklist con defaultProps y
// styleOverrides de sus partes: title, list, item, hidden.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import {DEFAULT_PASSWORD_POLICY, passwordChecksOf} from '@/auth/passwordRules.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaPasswordChecklist)
const THEME_NAME = 'CalcitaPasswordChecklist';
const ChecklistTitle = piecePart(THEME_NAME, 'Title', Typography);
const ChecklistList = piecePart(THEME_NAME, 'List', Box);
const ChecklistItem = piecePart(THEME_NAME, 'Item', Box);
const ChecklistHidden = piecePart(THEME_NAME, 'Hidden', Box);

// texto que solo oye el lector de pantalla (el mismo truco que usa MUI)
const SCREEN_READER_ONLY_SX = {
    position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
};

/**
 * @param {object} props
 * @param {string} props.password lo que lleva escrito la persona
 * @param {object} [props.policy] las reglas; por omisión DEFAULT_PASSWORD_POLICY
 * @param {string} [props.id]
 * @param {object} [props.texts] los textos que cambian, con la forma de `auth` en los textos del paquete
 */
export default function PasswordChecklist(props) {
    // lo que el proyecto puso en su tema (components.CalcitaPasswordChecklist.defaultProps) y encima lo que llega aquí
    const {password, policy = DEFAULT_PASSWORD_POLICY, id, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('auth', texts);
    return (
        <Box id={id}>
            <ChecklistTitle variant="caption" color="text.secondary" component="p" ownSx={{mb: 0.5}}>{t('passwordRules.title')}</ChecklistTitle>
            <ChecklistList component="ul" ownSx={{listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 0.5}}>
                {passwordChecksOf(password, policy).map((check) => (
                    <ChecklistItem component="li" key={check.rule} data-rule={check.rule} data-met={check.isMet}
                         ownSx={{display: 'flex', alignItems: 'center', gap: 1, color: check.isMet ? 'text.primary' : 'text.secondary'}}>
                        {check.isMet
                            ? <CheckCircleIcon fontSize="small" color="success" aria-hidden />
                            : <RadioButtonUncheckedIcon fontSize="small" color="disabled" aria-hidden />}
                        <Typography variant="body2" component="span">{t(`passwordRules.${check.rule}`, check.values)}</Typography>
                        <ChecklistHidden component="span" ownSx={SCREEN_READER_ONLY_SX}>{check.isMet ? t('passwordRules.met') : t('passwordRules.missing')}</ChecklistHidden>
                    </ChecklistItem>
                ))}
            </ChecklistList>
        </Box>
    );
}
