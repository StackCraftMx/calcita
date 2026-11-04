// En el teléfono, la etiqueta arriba: en el formulario agrupado la etiqueta se lleva el 38 % del renglón y un nombre largo
// («Correo adicional para avisos») se parte en tres renglones. Con labelPlacement={FORM_LABEL_PLACEMENT.topOnPhone} la
// etiqueta sube arriba del campo por debajo de `sm` (como en los formularios de iOS y de Android); más ancho, igual que
// siempre. Achique la ventana para verlo.
//
// Para todos los formularios del proyecto, una vez en el tema: components.CalcitaFormSection.defaultProps.labelPlacement.
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import {FORM_LABEL_PLACEMENT, FormSection, INPUT_MASK, MaskedInput, SegmentedControl, TextInput} from '@stackcraftmx/calcita';

type LabelPlacement = typeof FORM_LABEL_PLACEMENT[keyof typeof FORM_LABEL_PLACEMENT];

const PhoneLabels = () => {
    const [placement, setPlacement] = useState<LabelPlacement>(FORM_LABEL_PLACEMENT.topOnPhone);
    const [fullName, setFullName] = useState('');
    const [extraEmail, setExtraEmail] = useState('');
    const [officePhone, setOfficePhone] = useState('');

    return (
        <Stack spacing={2}>
            {/* 1. Para comparar: la de siempre y la que sube en el teléfono */}
            <SegmentedControl ariaLabel="Dónde va la etiqueta" value={placement} onChange={(value) => setPlacement(value as LabelPlacement)} options={[
                {value: FORM_LABEL_PLACEMENT.side, label: 'A la izquierda'},
                {value: FORM_LABEL_PLACEMENT.topOnPhone, label: 'Arriba en el teléfono'},
            ]} />
            {/* 2. La sección decide por todos sus renglones */}
            <FormSection title="Representante" labelPlacement={placement}>
                <TextInput label="Nombre completo del representante" value={fullName} onChange={setFullName} required />
                <TextInput label="Correo adicional para avisos" value={extraEmail} onChange={setExtraEmail} type="email" />
                <MaskedInput label="Teléfono de la oficina" mask={INPUT_MASK.phone} value={officePhone} onChange={setOfficePhone} />
            </FormSection>
        </Stack>
    );
};

export default PhoneLabels;
