// Campo de catálogo de react-hook-form: CatalogInput (inputs/) conectado a su campo con useController. Se ve y se porta igual que
// el FormCatalogField de formik (@stackcraftmx/calcita/forms).
//
// Sus minSelected y maxSelected también impiden enviar, salvo con resolver (useHookFormField.js). Los del esquema se
// leen con FormSchemaProvider y ToolkitProvider limitsFromSchema (useHookFormSchemaLimits.js).
//
// Genérico del paquete: function (regla de la casa).
import CatalogInput from '@/inputs/CatalogInput.jsx';
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import {LIMIT_KIND, listLimitProblemOf} from '@/inputs/fieldLimits.js';
import {useHookFormSchemaLimits} from '@/hookForm/useHookFormSchemaLimits.js';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/inputs/CatalogInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/CatalogInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las del campo de la casa, sin
 *     value ni error (su onChange y su onBlur corren después de los del formulario); control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormCatalogField({name, control, ...inputProps}) {
    const hasLimits = inputProps.minSelected !== undefined || inputProps.maxSelected !== undefined;
    const fieldProps = useHookFormField(name, control, inputProps, hasLimits ? (value) => listLimitProblemOf(value, inputProps) : undefined);
    // los del esquema (con FormSchemaProvider y ToolkitProvider limitsFromSchema); los de la pantalla ganan
    const schemaLimits = useHookFormSchemaLimits(name, control, LIMIT_KIND.list);
    return <CatalogInput {...schemaLimits} {...inputProps} {...fieldProps} />;
}
