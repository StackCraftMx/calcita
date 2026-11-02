// RFC, CURP y CLABE: se escriben con su máscara (en mayúsculas, solo lo que cabe) y se revisan con su dígito verificador
// antes de mandar nada. En un formulario de yup van como reglas: Yup.string().test(rfcRule()). Quien dice si existen es el
// SAT, RENAPO o el banco, del lado del servidor.
import {useState} from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import {FormSection, INPUT_MASK, MaskedInput} from '@stackcraftmx/calcita';
import {isValidClabe, isValidCurp, isValidRfc, rfcKindOf} from '@stackcraftmx/calcita/mexico';

// cómo se dice cada tipo de RFC
const RFC_KIND_LABELS: Record<string, string> = {company: 'Persona moral', person: 'Persona física', generic: 'Genérico del SAT'};

const ResultChip = ({value, isValid, okLabel = 'Bien escrita'}: {value: string, isValid: boolean, okLabel?: string}) => (
    value ? <Chip size="small" color={isValid ? 'success' : 'error'} label={isValid ? okLabel : 'Revise el dato'} /> : null
);

const MexicoIdentifiers = () => {
    const [rfc, setRfc] = useState('SAT970701NN3');
    const [curp, setCurp] = useState('');
    const [clabe, setClabe] = useState('032180000118359719');
    const rfcKind = rfcKindOf(rfc);

    return (
        <Stack spacing={1.5} sx={{maxWidth: 560}}>
            <FormSection title="Claves">
                {/* 1. El RFC: su forma y que la fecha exista; con strict, también su dígito */}
                <MaskedInput label="RFC" mask={INPUT_MASK.rfc} value={rfc} onChange={setRfc} />
                <MaskedInput label="CURP" mask={INPUT_MASK.curp} value={curp} onChange={setCurp} />
                <MaskedInput label="CLABE" mask={INPUT_MASK.clabe} value={clabe} onChange={setClabe} />
            </FormSection>
            {/* 2. Lo que dice cada revisión */}
            <Stack direction="row" sx={{gap: 1, flexWrap: 'wrap'}}>
                <ResultChip value={rfc} isValid={isValidRfc(rfc, {strict: true})} okLabel={rfcKind ? `RFC · ${RFC_KIND_LABELS[rfcKind]}` : 'RFC'} />
                <ResultChip value={curp} isValid={isValidCurp(curp)} okLabel="CURP bien escrita" />
                <ResultChip value={clabe} isValid={isValidClabe(clabe)} okLabel="CLABE bien escrita" />
            </Stack>
        </Stack>
    );
};

export default MexicoIdentifiers;
