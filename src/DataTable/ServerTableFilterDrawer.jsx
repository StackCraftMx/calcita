// El botón «Filtros» de ServerTable con su cajón de búsqueda (FilterDrawer): se pone en toolbarExtra y lee y cambia los
// filtros de SU tabla (los de la dirección, los mismos de los chips). El botón dice cuántos filtros del cajón hay puestos.
//
//   const FILTER_FIELDS = [{name: 'total', label: 'Total', kind: FILTER_FIELD_KIND.comparison, prefix: '$'}, …];
//   <ServerTable … filterDefaults={{...MIS_DEFAULTS, ...filterDrawerDefaultsOf(FILTER_FIELDS)}}
//                  filterKinds={{...MIS_KINDS, ...filterDrawerKindsOf(FILTER_FIELDS)}}
//                  chipConfig={buildChipConfig(filterDrawerChipsOf(FILTER_FIELDS, {t, formatDate}))}
//                  toolbarExtra={<ServerTableFilterDrawer fields={FILTER_FIELDS} />} />
//
// filterDefaults: la tabla solo guarda en la dirección lo que declara ahí. filterKinds: las listas se leen como lista. Los
// chips dicen cada filtro en palabras y cada uno se quita con su ×.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Button from '@mui/material/Button';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import {useTableFilter} from '@/DataTable/filterContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import FilterDrawer from '@/ui/filters/FilterDrawer.jsx';
import {activeDrawerFilterCountOf} from '@/ui/filters/filterDrawerFields.js';

/**
 * @param {object} props
 * @param {object[]} props.fields los campos del cajón (filterDrawerFields.js)
 * @param {'left'|'right'} [props.anchor] de qué lado sale; por omisión la derecha
 * @param {number} [props.width] su ancho en escritorio
 * @param {string} [props.title] ya traducido; por omisión «Filtros»
 * @param {string} [props.buttonLabel] ya traducido; por omisión «Filtros» (con los puestos, «Filtros (3)»)
 * @param {(values: Record<string, unknown>) => void} [props.onApply] aviso de lo que se buscó (la tabla ya se filtró)
 * @param {import('react').ReactNode} [props.children] algo más abajo de los campos del cajón
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function ServerTableFilterDrawer({fields, anchor, width, title, buttonLabel, onApply, children, texts, ...unknownProps}) {
    warnUnknownProps('ServerTableFilterDrawer', unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {filters, setFilters} = useTableFilter();
    const [isOpen, setIsOpen] = useState(false);
    const activeCount = activeDrawerFilterCountOf(fields, filters);

    return (
        <>
            <Button size="small" variant={activeCount > 0 ? 'contained' : 'outlined'} startIcon={<TuneRoundedIcon />}
                    aria-haspopup="dialog" onClick={() => setIsOpen(true)}>
                {activeCount > 0 ? t('filterDrawer.openWithCount', {count: activeCount}) : (buttonLabel ?? t('filterDrawer.open'))}
            </Button>
            <FilterDrawer open={isOpen} onClose={() => setIsOpen(false)} fields={fields} values={filters} anchor={anchor} width={width} title={title}
                          texts={texts}
                          onApply={(values) => {
                              setFilters(values);
                              onApply?.(values);
                          }}>
                {children}
            </FilterDrawer>
        </>
    );
}
