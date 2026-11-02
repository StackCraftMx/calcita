// La búsqueda en cajón: un panel que sale de un lado con los campos que filtran una lista, para cuando ya no caben arriba
// de la tabla. Lo que se cambia adentro es un borrador: la lista no se mueve hasta «Buscar». Aquí sale de la izquierda y
// suelto; conectado a ServerTable va con su botón «Filtros (N)» y sus chips:
//
//   <ServerTable … filterDefaults={{...DEFAULTS, ...filterDrawerDefaultsOf(FIELDS)}} filterKinds={{...KINDS, ...filterDrawerKindsOf(FIELDS)}}
//                  chipConfig={buildChipConfig(filterDrawerChipsOf(FIELDS, {t}))} toolbarExtra={<ServerTableFilterDrawer fields={FIELDS} />} />
import {useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {FILTER_DRAWER_ANCHOR, FILTER_FIELD_KIND, FilterDrawer, activeDrawerFilterCountOf} from '@stackcraftmx/calcita';

// 1. Los campos, una vez: su tipo dice cómo se pinta y cómo viaja
const FIELDS = [
    {name: 'currency', label: 'Moneda', kind: FILTER_FIELD_KIND.select, options: [{value: 'MXN', label: 'Pesos'}, {value: 'USD', label: 'Dólares'}]},
    {name: 'channel', label: 'Canal', kind: FILTER_FIELD_KIND.checkboxes, options: [{value: 'store', label: 'Tienda'}, {value: 'web', label: 'En línea'}]},
    {name: 'term', label: 'Plazo', kind: FILTER_FIELD_KIND.numberRange, suffix: 'días'},
    {name: 'paid', label: 'Fecha de pago', kind: FILTER_FIELD_KIND.dateRange},
    {name: 'discount', label: 'Descuento', kind: FILTER_FIELD_KIND.comparison, suffix: '%', decimals: 1},
    {name: 'amount', label: 'Monto', kind: FILTER_FIELD_KIND.comparison, prefix: '$'},
];

const FilterDrawerDemo = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<Record<string, unknown>>({currency: 'MXN'});
    const activeCount = activeDrawerFilterCountOf(FIELDS, filters);

    return (
        <Stack spacing={1.5} sx={{alignItems: 'flex-start'}}>
            {/* 2. El botón dice cuántos hay puestos */}
            <Button variant={activeCount > 0 ? 'contained' : 'outlined'} startIcon={<TuneRoundedIcon />} onClick={() => setIsOpen(true)}>
                {activeCount > 0 ? `Filtros (${activeCount})` : 'Filtros'}
            </Button>
            {/* 3. El cajón: de qué lado sale, su ancho y su título; «Buscar» manda todos juntos */}
            <FilterDrawer open={isOpen} onClose={() => setIsOpen(false)} fields={FIELDS} values={filters} onApply={setFilters}
                          anchor={FILTER_DRAWER_ANCHOR.left} width={360} title="Buscar operaciones" />
            {/* 4. Lo que viaja: el total va como operador:cantidad ('gte:500'), los rangos en dos */}
            <Typography variant="body2" color="text.secondary" sx={{overflowWrap: 'anywhere'}}>Viaja: {JSON.stringify(filters)}</Typography>
        </Stack>
    );
};

export default FilterDrawerDemo;
