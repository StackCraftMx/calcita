// La e.firma: el certificado (.cer) se lee aquí mismo (RFC, nombre, número, vigencia; avisa si venció o si es de otro RFC) y
// «Revisar la e.firma» abre la llave con su contraseña en el navegador (jsrsasign) y dice el motivo de un «no». Con onVerifyKey
// la revisión es de su API. Pruebe con los archivos de ejemplo de «Documentos fiscales» (contraseña de su llave: Ejemplo2026).
//
// Mientras el .cer no sirva (de otro RFC, vencido, que no es certificado), la llave y la contraseña esperan apagadas al
// bueno. El certificado de ejemplo es del RFC AAA010101AAA: elija abajo el otro RFC esperado para verlo.
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import {SelectInput} from '@stackcraftmx/calcita';
import {EfirmaFields} from '@stackcraftmx/calcita/mexico';

const EXPECTED_RFC_OPTIONS = [
    {value: 'AAA010101AAA', label: 'AAA010101AAA (el del certificado de ejemplo)'},
    {value: 'XAXX010101000', label: 'XAXX010101000 (otro)'},
];

const EfirmaDemo = () => {
    const [efirma, setEfirma] = useState({certificateFile: null as File | null, keyFile: null as File | null, password: ''});
    const [expectedRfc, setExpectedRfc] = useState(EXPECTED_RFC_OPTIONS[0].value);

    return (
        <Stack spacing={2}>
            <SelectInput label="RFC de su empresa" value={expectedRfc} onChange={(rfc: string) => setExpectedRfc(rfc)} options={EXPECTED_RFC_OPTIONS} />
            <EfirmaFields
                // 1. Los tres datos, controlados
                value={efirma}
                onChange={setEfirma}
                // 2. El RFC que debe traer (el de su empresa): con otro, la llave y la contraseña esperan apagadas
                expectedRfc={expectedRfc}
                // 3. Sin onVerifyKey, la llave se abre en el navegador; con onVerifyKey={(input) => api.verifyEfirma(input)}, en su API
                // 4. disabled={{certificate: true}} apaga solo una parte (true, todo)
            />
        </Stack>
    );
};

export default EfirmaDemo;
