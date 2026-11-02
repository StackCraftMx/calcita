// La e.firma: el certificado (.cer) se lee aquí mismo (RFC, nombre, número, vigencia; avisa si venció o si es de otro RFC) y
// «Revisar la e.firma» abre la llave con su contraseña en el navegador (jsrsasign) y dice el motivo de un «no». Con onVerifyKey
// la revisión es de su API. Pruebe con los archivos de ejemplo de «Documentos fiscales» (contraseña de su llave: Ejemplo2026).
import {useState} from 'react';
import {EfirmaFields} from '@stackcraftmx/calcita/mexico';

const EfirmaDemo = () => {
    const [efirma, setEfirma] = useState({certificateFile: null as File | null, keyFile: null as File | null, password: ''});

    return (
        <EfirmaFields
            // 1. Los tres datos, controlados
            value={efirma}
            onChange={setEfirma}
            // 2. El RFC que debe traer (el de su empresa)
            expectedRfc="AAA010101AAA"
            // 3. Sin onVerifyKey, la llave se abre en el navegador; con onVerifyKey={(input) => api.verifyEfirma(input)}, en su API
        />
    );
};

export default EfirmaDemo;
