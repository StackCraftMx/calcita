// Campos con máscara: mientras se escribe se ven los separadores y al formulario llega el valor LIMPIO (lo que valida y
// guarda el servidor). Pegar un número con otros separadores también sirve. Las máscaras de siempre vienen con nombre
// (INPUT_MASK) y una propia es un patrón: 9 dígito, A letra, X letra o dígito, H hexadecimal.
import {useState} from 'react';
import Typography from '@mui/material/Typography';
import {FormSection, INPUT_MASK, MaskedInput} from '@stackcraftmx/calcita';

const MaskedFields = () => {
    const [values, setValues] = useState({phone: '', clabe: '', rfc: '', curp: '', uuid: '', contract: ''});
    const fieldOf = (name: keyof typeof values) => ({value: values[name], onChange: (clean: string) => setValues((current) => ({...current, [name]: clean}))});

    return (
        <>
            <FormSection title="Datos con forma fija">
                {/* 1. Las de siempre, por su nombre */}
                <MaskedInput label="Teléfono" mask={INPUT_MASK.phone} placeholder="555 123 4567" {...fieldOf('phone')} />
                <MaskedInput label="CLABE" mask={INPUT_MASK.clabe} placeholder="032 180 00011835971 9" {...fieldOf('clabe')} />
                {/* 2. RFC y CURP: en mayúsculas y solo letras y dígitos mientras se escriben */}
                <MaskedInput label="RFC" mask={INPUT_MASK.rfc} placeholder="MARA850101AB1" {...fieldOf('rfc')} />
                <MaskedInput label="CURP" mask={INPUT_MASK.curp} {...fieldOf('curp')} />
                <MaskedInput label="Folio fiscal" mask={INPUT_MASK.uuid} {...fieldOf('uuid')} />
                {/* 3. Un patrón propio: tres letras, guion y cuatro dígitos */}
                <MaskedInput label="Contrato" mask="AAA-9999" placeholder="ABC-1234" {...fieldOf('contract')} />
            </FormSection>
            {/* 4. Lo que viaja al servidor: limpio, sin separadores */}
            <Typography variant="body2" color="text.secondary" sx={{mt: 1.5, overflowWrap: 'anywhere'}}>
                Viaja: {JSON.stringify(values)}
            </Typography>
        </>
    );
};

export default MaskedFields;
