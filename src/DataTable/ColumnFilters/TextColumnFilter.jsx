// Filtro de texto libre de una columna, con rebote (350 ms, igual que la caja de búsqueda de la tabla): sin él,
// escribir cinco letras son cinco consultas y las respuestas llegan en desorden.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import TextField from '@mui/material/TextField';

import {useDebouncedFilter} from '@/DataTable/useDebouncedFilter.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {{value: string, onChange: (value: string) => void, label?: string}} props label ya traducido
 */
export default function TextColumnFilter({value, onChange, label, ...unknownProps}) {
    warnUnknownProps('TextColumnFilter', unknownProps);
    const {t} = useToolkitTranslation('table');
    const [draft, setDraft] = useDebouncedFilter(value, onChange);

    return (
        <TextField size="small" autoFocus fullWidth label={label ?? t('columnFilter.contains')} value={draft}
                   onChange={(event) => setDraft(event.target.value)} />
    );
}
