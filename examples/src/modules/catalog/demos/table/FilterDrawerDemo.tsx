// La búsqueda en cajón: un panel que sale de un lado con los campos que filtran una lista, para cuando ya no caben arriba
// de la tabla. Lo que se cambia adentro es un borrador: la lista no se mueve hasta «Buscar». Aquí sale de la izquierda y
// suelto, con el calendario del navegador; Pedidos usa el de la app (slots={{dateInput: DateInput}}). Conectado a
// ServerTable va con su botón «Filtros (N)» y sus chips:
//
//   <ServerTable … filterDefaults={{...DEFAULTS, ...filterDrawerDefaultsOf(FIELDS)}} filterKinds={{...KINDS, ...filterDrawerKindsOf(FIELDS)}}
//                  chipConfig={buildChipConfig(filterDrawerChipsOf(FIELDS, {t}))} toolbarExtra={<ServerTableFilterDrawer fields={FIELDS} />} />
import {useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {FILTER_DRAWER_ANCHOR, FILTER_FIELD_KIND, FilterDrawer, activeDrawerFilterCountOf} from '@stackcraftmx/calcita';
import {MonthInput} from '@stackcraftmx/calcita/date-pickers';

// lo que el cajón le da a un campo propio: el borrador completo, sus llaves y lo que esté mal en cada una
type CustomFieldProps = {values: Record<string, unknown>, setValue: (key: string, value: unknown) => void, keys: string[], errors: Record<string, string>};

// 1. Los campos, una vez: su tipo dice cómo se pinta y cómo viaja
const FIELDS = [
    {name: 'currency', label: 'Moneda', kind: FILTER_FIELD_KIND.select, options: [{value: 'MXN', label: 'Pesos'}, {value: 'USD', label: 'Dólares'}]},
    {name: 'channel', label: 'Canal', kind: FILTER_FIELD_KIND.checkboxes, options: [{value: 'store', label: 'Tienda'}, {value: 'web', label: 'En línea'}]},
    {name: 'term', label: 'Plazo', kind: FILTER_FIELD_KIND.numberRange, suffix: 'días'},
    // con topes: desde el 1 de enero y nunca después de hoy; cada extremo acota al otro
    {name: 'paid', label: 'Fecha de pago', kind: FILTER_FIELD_KIND.dateRange, minDate: '2026-01-01', disableFuture: true},
    {name: 'discount', label: 'Descuento', kind: FILTER_FIELD_KIND.comparison, suffix: '%', decimals: 1},
    {name: 'amount', label: 'Monto', kind: FILTER_FIELD_KIND.comparison, prefix: '$'},
    // un rango propio: dos meses en sus dos llaves; isBackwards dice cuándo está al revés y entonces no deja buscar
    {
        name: 'period', label: 'Periodo', kind: FILTER_FIELD_KIND.custom, keys: {from: 'period_from', to: 'period_to'},
        isBackwards: (from: string, to: string) => to < from,
        render: ({values, setValue, keys: [fromKey, toKey], errors}: CustomFieldProps) => (
            <Stack spacing={1}>
                <MonthInput label="Periodo desde" value={String(values[fromKey] ?? '')} onChange={(month: string) => setValue(fromKey, month)} helperText="" />
                <MonthInput label="Periodo hasta" value={String(values[toKey] ?? '')} onChange={(month: string) => setValue(toKey, month)} error={errors[toKey]} />
            </Stack>
        ),
    },
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
            {/* 3. El cajón: de qué lado sale, su ancho y su título; con stackPairsBelow, más angosto que eso cada par va uno
                arriba del otro (aquí siempre: mide 360). «Buscar» manda todos juntos */}
            <FilterDrawer open={isOpen} onClose={() => setIsOpen(false)} fields={FIELDS} values={filters} onApply={setFilters}
                          anchor={FILTER_DRAWER_ANCHOR.left} width={360} stackPairsBelow={400} title="Buscar operaciones" />
            {/* 4. Lo que viaja: el total va como operador:cantidad ('gte:500'), los rangos en dos */}
            <Typography variant="body2" color="text.secondary" sx={{overflowWrap: 'anywhere'}}>Viaja: {JSON.stringify(filters)}</Typography>
        </Stack>
    );
};

export default FilterDrawerDemo;
