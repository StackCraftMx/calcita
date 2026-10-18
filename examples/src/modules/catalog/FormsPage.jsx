// Hecho en Calcita · formularios: los campos de la casa con formik o react-hook-form, el formulario al estilo de
// Apple, los errores del servidor en su campo y el formulario por pasos.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import NewCustomerForm from '@/modules/catalog/demos/forms/NewCustomerForm.tsx';
import NewCustomerHookForm from '@/modules/catalog/demos/forms/NewCustomerHookForm.tsx';
import CreditWizard from '@/modules/catalog/demos/forms/CreditWizard.tsx';

const loadFormik = () => import('@/modules/catalog/demos/forms/NewCustomerForm.tsx?demo-source');
const loadHookForm = () => import('@/modules/catalog/demos/forms/NewCustomerHookForm.tsx?demo-source');
const loadWizard = () => import('@/modules/catalog/demos/forms/CreditWizard.tsx?demo-source');

export const FormsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('forms.title')} description={t('forms.description')} />
            <DemoSection title={t('forms.formik.title')} description={t('forms.formik.description')}
                         Demo={NewCustomerForm} loadSource={loadFormik} />
            <DemoSection title={t('forms.hookForm.title')} description={t('forms.hookForm.description')}
                         Demo={NewCustomerHookForm} loadSource={loadHookForm} />
            <DemoSection title={t('forms.wizard.title')} description={t('forms.wizard.description')}
                         Demo={CreditWizard} loadSource={loadWizard} />
        </Stack>
    );
};
