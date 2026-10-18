// Catálogo · campos: el formulario de Apple (FormSection), TextField en sus tres variantes y sus estados, con prefijo o
// sufijo, de varios renglones, la lista para elegir (Select), buscar y elegir (Autocomplete) y los campos del framework
// (TextInput, NumberInput, SelectInput, CatalogInput, ColorInput, SecretField).
//
// Con el vidrio del tema los campos no llevan vidrio (son contenido; HIG «Materials»); lo que se abre encima sí: la lista
// de un Select o de un Autocomplete flota de vidrio y marca la opción actual con su palomita (HIG «Menus»).
//
// Cada sección pinta su ejemplo de demos/inputs y lo enseña con «Ver código» (DemoSection). El formulario de Apple va sin
// tarjeta: sus secciones ya son tarjetas.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import AppleForm from '@/modules/catalog/demos/inputs/AppleForm.tsx';
import AutocompleteFields from '@/modules/catalog/demos/inputs/AutocompleteFields.tsx';
import FrameworkInputs from '@/modules/catalog/demos/inputs/FrameworkInputs.tsx';
import MultilineField from '@/modules/catalog/demos/inputs/MultilineField.tsx';
import SelectField from '@/modules/catalog/demos/inputs/SelectField.tsx';
import TextFieldAdornments from '@/modules/catalog/demos/inputs/TextFieldAdornments.tsx';
import TextFieldStates from '@/modules/catalog/demos/inputs/TextFieldStates.tsx';
import TextFieldVariants from '@/modules/catalog/demos/inputs/TextFieldVariants.tsx';

export const InputsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('inputs.title')} description={t('inputs.description')} />

            <DemoSection bare title={t('inputs.appleForm.title')} description={t('inputs.appleForm.description')}
                         Demo={AppleForm} loadSource={() => import('@/modules/catalog/demos/inputs/AppleForm.tsx?demo-source')} />
            <DemoSection title={t('inputs.variants.title')} description={t('inputs.variants.description')}
                         Demo={TextFieldVariants} loadSource={() => import('@/modules/catalog/demos/inputs/TextFieldVariants.tsx?demo-source')} />
            <DemoSection title={t('inputs.states.title')} description={t('inputs.states.description')}
                         Demo={TextFieldStates} loadSource={() => import('@/modules/catalog/demos/inputs/TextFieldStates.tsx?demo-source')} />
            <DemoSection title={t('inputs.adornments.title')} description={t('inputs.adornments.description')}
                         Demo={TextFieldAdornments} loadSource={() => import('@/modules/catalog/demos/inputs/TextFieldAdornments.tsx?demo-source')} />
            <DemoSection title={t('inputs.multiline.title')} description={t('inputs.multiline.description')}
                         Demo={MultilineField} loadSource={() => import('@/modules/catalog/demos/inputs/MultilineField.tsx?demo-source')} />
            <DemoSection title={t('inputs.select.title')} description={t('inputs.select.description')}
                         Demo={SelectField} loadSource={() => import('@/modules/catalog/demos/inputs/SelectField.tsx?demo-source')} />
            <DemoSection title={t('inputs.autocomplete.title')} description={t('inputs.autocomplete.description')}
                         Demo={AutocompleteFields} loadSource={() => import('@/modules/catalog/demos/inputs/AutocompleteFields.tsx?demo-source')} />
            <DemoSection title={t('frameworkTitle')} description={t('inputs.framework.description')}
                         Demo={FrameworkInputs} loadSource={() => import('@/modules/catalog/demos/inputs/FrameworkInputs.tsx?demo-source')} />
        </Stack>
    );
};
