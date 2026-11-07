// El aire de los renglones (density): compacta (de fábrica, 36 px), estándar (52) o cómoda (67). En la compacta, entre el
// «⋯» de un renglón y el del siguiente quedan 6 px: con el dedo se pica el de al lado. Para una lista que se trabaja con
// el dedo todo el día, la estándar; para toda la app va una vez en el tema:
//   components: {CalcitaServerTable: {defaultProps: {density: TABLE_DENSITY.standard}}}
// Pruebe las tres con el selector de arriba y mire el espacio entre los «⋯».
import {useMemo, useState} from 'react';
import Stack from '@mui/material/Stack';
import {SegmentedControl, toastSuccess} from '@stackcraftmx/calcita';
import {ServerTable, TABLE_DENSITY, actionsColumn, textColumn} from '@stackcraftmx/calcita/table';

// ─── El servidor de mentira (en su proyecto NO va: fetchPage llama a su API) ───
interface BranchRow {
    id: number;
    name: string;
    city: string;
    manager: string;
}
const CITIES = ['Monterrey', 'Guadalajara', 'Puebla', 'Mérida', 'Querétaro'];
const MANAGERS = ['Ana López', 'Luis Herrera', 'Mónica Vega', 'Bruno Díaz', 'Irene Campos'];
const BRANCHES: BranchRow[] = Array.from({length: 12}, (unused, index) => ({
    id: index + 1,
    name: `Sucursal ${index + 1}`,
    city: CITIES[index % CITIES.length],
    manager: MANAGERS[(index * 3) % MANAGERS.length],
}));
const fetchBranches = async ({page, pageSize}: {page: number, pageSize: number}) => ({
    rows: BRANCHES.slice(page * pageSize, (page + 1) * pageSize), total: BRANCHES.length, facets: {},
});

// las tres densidades con su nombre para el selector
const DENSITY_OPTIONS = [
    {value: TABLE_DENSITY.compact, label: 'Compacta'},
    {value: TABLE_DENSITY.standard, label: 'Estándar'},
    {value: TABLE_DENSITY.comfortable, label: 'Cómoda'},
];

const TableDensityDemo = () => {
    const [density, setDensity] = useState<string>(TABLE_DENSITY.compact);

    // el «⋯» de cada renglón: es el que se pica de más con el dedo en la compacta
    const columns = useMemo(() => [
        actionsColumn({
            label: 'Acciones de la sucursal', labelOf: (branch: BranchRow) => `Acciones de ${branch.name}`,
            actionsOf: (branch: BranchRow) => [{key: 'open', label: 'Abrir', onClick: () => toastSuccess(`Se abrió ${branch.name}`)}],
        }),
        textColumn({field: 'name', label: 'Sucursal', flex: 1, minWidth: 140, filter: false}),
        textColumn({field: 'city', label: 'Ciudad', flex: 1, minWidth: 120, filter: false}),
        textColumn({field: 'manager', label: 'Gerente', flex: 1, minWidth: 140, filter: false}),
    ], []);

    return (
        <Stack spacing={2}>
            <SegmentedControl ariaLabel="Aire de los renglones" value={density} onChange={setDensity} options={DENSITY_OPTIONS} />
            <ServerTable queryKey="density-demo" fetchPage={fetchBranches} columns={columns} density={density as 'compact'}
                         defaultPageSize={5} pageSizeOptions={[5]} ariaLabel="Sucursales" />
        </Stack>
    );
};

export default TableDensityDemo;
