// Columnas listas y la vista de tarjetas: una lista de clientes como las de un sistema de administración.
//   - stackedColumn: lo que se lee de corrido en un solo lugar, uno debajo del otro, los datos que hagan falta (la empresa y su
//     RFC; el contacto, su correo y su teléfono). Solos si el encabezado ya dice qué son; con su etiqueta arriba si el
//     encabezado nombra al grupo (Fechas: alta y último cambio). Los renglones toman su alto solos;
//   - statusColumn: el estatus desde su diccionario, con el ancho de su etiqueta más larga (medido, en el idioma de la pantalla);
//   - actionsColumn: el «⋯» de cada renglón en su columna, fija al deslizar junto con la empresa (fixedColumn);
//   - renderCard: la misma lista en tarjetas, con la misma búsqueda, filtros y páginas (el botón de la derecha cambia de vista).
import {useMemo} from 'react';
import {RecordCard, StatusChip, dictionaryEntryOf, formatDate, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {ACTIONS_COLUMN_FIELD, ServerTable, actionsColumn, stackedColumn, statusColumn} from '@stackcraftmx/calcita/table';

// 1. El estatus como llega del API → su texto (dictionaries:registrationStatus.<valor>) y su color
const REGISTRATION_STATUS = {
    approved: dictionaryEntryOf('approved', 'registrationStatus.approved', 'success'),
    documenting: dictionaryEntryOf('documenting', 'registrationStatus.documenting', 'warning'),
    rejected: dictionaryEntryOf('rejected', 'registrationStatus.rejected', 'error'),
};

// ─── El servidor de mentira (en su proyecto NO va: fetchPage llama a su API) ───
interface ClientRow {
    id: number;
    business_name: string;
    rfc: string;
    contact_name: string;
    email: string;
    phone: string;
    status: string;
    registered: string;
    changed: string;
}
const COMPANIES = ['ACME COMERCIAL SA DE CV', 'DISTRIBUIDORA DEL NORTE SA', 'EMPAQUES Y CAJAS DE MÉXICO', 'FERRETERA LA ESQUINA', 'PAPELERÍA CENTRAL SA DE CV'];
const CONTACTS = ['Ana López', 'Luis Herrera', 'Mónica Vega', 'Bruno Díaz', 'Irene Campos'];
const STATUSES = Object.keys(REGISTRATION_STATUS);
const CLIENTS: ClientRow[] = Array.from({length: 23}, (unused, index) => ({
    id: index + 1,
    business_name: COMPANIES[index % COMPANIES.length],
    rfc: `${['ACO', 'DNO', 'EYC', 'FLE', 'PCE'][index % 5]}0${(index % 9) + 1}0101${String.fromCharCode(65 + (index % 26))}B${index % 10}`,
    contact_name: CONTACTS[(index * 2) % CONTACTS.length],
    email: `compras${index + 1}@ejemplo.mx`,
    // a uno de cada cuatro le falta el teléfono: ese renglón no se pinta
    phone: index % 4 === 3 ? '' : `55 5${String(index).padStart(3, '0')} ${String(1000 + index * 37).slice(0, 4)}`,
    status: STATUSES[index % STATUSES.length],
    registered: `2025-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    changed: `2026-${String((index % 10) + 1).padStart(2, '0')}-${String((index % 25) + 2).padStart(2, '0')}`,
}));
const fetchClients = async ({filters = {}, page, pageSize}: {filters?: {contains?: string, status?: string[]}, page: number, pageSize: number}) => {
    const text = (filters.contains ?? '').toLowerCase();
    const rows = CLIENTS.filter((client) => (!text || `${client.business_name} ${client.rfc} ${client.contact_name}`.toLowerCase().includes(text))
        && (!filters.status?.length || filters.status.includes(client.status)));
    const facets = {status: STATUSES.map((value) => ({value, total: CLIENTS.filter((client) => client.status === value).length}))};
    return {rows: rows.slice(page * pageSize, (page + 1) * pageSize), total: rows.length, facets};
};

const ReadyColumnsDemo = () => {
    // las etiquetas del estatus en el idioma de la pantalla: con ellas statusColumn mide su ancho
    const {t} = useToolkitTranslation('dictionaries');

    // 2. El menú «⋯» de un cliente: el mismo en la tabla y en su tarjeta
    const actionsOf = (client: ClientRow) => [
        {key: 'approve', label: 'Aprobar el registro', disabled: client.status === 'approved', onClick: () => toastSuccess(`Se aprobó ${client.business_name}`)},
        {key: 'copy', label: 'Copiar el RFC', onClick: () => navigator.clipboard?.writeText(client.rfc)},
    ];

    // 3. Las columnas: con memoria (columnas nuevas en cada pintada harían que la tabla recalcule todas)
    const columns = useMemo(() => [
        actionsColumn({label: 'Acciones del cliente', labelOf: (client: ClientRow) => `Acciones de ${client.business_name}`, actionsOf}),
        stackedColumn({field: 'business_name', label: 'Empresa', entries: (client: ClientRow) => [client.business_name, client.rfc], flex: 1.4, minWidth: 220, sort: false}),
        // los datos que hagan falta: el contacto, su correo y su teléfono (si no tiene, ese renglón no se pinta)
        stackedColumn({
            field: 'contact_name', label: 'Contacto', flex: 1, minWidth: 190, sort: false, filter: false,
            entries: (client: ClientRow) => [client.contact_name, client.email, client.phone],
        }),
        // el encabezado nombra al grupo: cada dato con su etiqueta arriba, como en la tarjeta
        stackedColumn({
            field: 'registered', label: 'Fechas', width: 170, sort: false, filter: false,
            entries: (client: ClientRow) => [
                {label: 'Alta', value: formatDate(client.registered)},
                {label: 'Último cambio', value: formatDate(client.changed)},
            ],
        }),
        statusColumn({field: 'status', label: 'Estado', dictionary: REGISTRATION_STATUS, t, sort: false}),
    ], [t]);

    return (
        <ServerTable
            queryKey="clients-demo"
            fetchPage={fetchClients}
            columns={columns}
            filterDefaults={{contains: '', status: []}}
            ariaLabel="Clientes"
            searchPlaceholder="Buscar por empresa, RFC o contacto"
            defaultPageSize={5}
            // 4. Fijas al deslizar de lado: el «⋯» (ancho fijo) y la empresa (la última puede ser flexible)
            fixedColumn={[ACTIONS_COLUMN_FIELD, 'business_name']}
            // 5. La misma lista en tarjetas
            renderCard={(client: ClientRow) => (
                <RecordCard eyebrow={client.rfc} title={client.business_name} avatar={client.business_name}
                            status={<StatusChip variant="chip" dictionary={REGISTRATION_STATUS} value={client.status} />}
                            actions={actionsOf(client)}
                            groups={[
                                {key: 'contact', title: 'Contacto', facts: [{label: 'Nombre', value: client.contact_name}, {label: 'Correo', value: client.email}, {label: 'Teléfono', value: client.phone || '—'}]},
                                {key: 'dates', title: 'Registro', facts: [{label: 'Alta', value: formatDate(client.registered)}, {label: 'Último cambio', value: formatDate(client.changed)}]},
                            ]} />
            )}
        />
    );
};

export default ReadyColumnsDemo;
