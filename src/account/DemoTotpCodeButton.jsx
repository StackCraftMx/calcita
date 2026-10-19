// El atajo de la DEMOSTRACIÓN para la app autenticadora: llena el campo «code» del formulario con el código que enseñaría
// la app ahorita. Para quien prueba sin la app en su teléfono (y para las pruebas automáticas, que no escanean QR). Solo
// sale cuando el conector trae demoTotpCode: con un backend de verdad no existe (el código solo lo conoce la app).
//
// Va dentro del formulario de formik (abajo del segundo paso o en el diálogo de activar la app).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaDemoTotpCode con defaultProps y
// styleOverrides de sus partes: root, code.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikContext} from 'formik';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';

import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaDemoTotpCode)
const THEME_NAME = 'CalcitaDemoTotpCode';
const TotpRoot = piecePart(THEME_NAME, 'Root', Stack);
const TotpCode = piecePart(THEME_NAME, 'Code', Typography);

/**
 * @param {{loadCode: () => Promise<string|null>}} props
 */
export default function DemoTotpCodeButton(props) {
    // lo que el proyecto puso en su tema (components.CalcitaDemoTotpCode.defaultProps) y encima lo que llega aquí
    const {loadCode} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('account');
    const {setFieldValue} = useFormikContext();

    const fillCode = async () => {
        const code = await loadCode();
        if (code) {
            setFieldValue('code', code);
        }
    };

    return (
        <TotpRoot spacing={0.5} ownSx={{alignItems: 'center'}}>
            <Button size="small" startIcon={<ScienceOutlinedIcon />} onClick={fillCode}>{t('demo.totpCode')}</Button>
            <TotpCode variant="caption" color="text.secondary" ownSx={{textAlign: 'center'}}>{t('demo.totpCodeHelp')}</TotpCode>
        </TotpRoot>
    );
}
