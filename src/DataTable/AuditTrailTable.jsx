// Tabla de historial de un renglón: sus eventos, paginados y filtrados EN EL SERVIDOR (regla de tablas).
//
// La usan AuditTrailDialog (historial en un diálogo desde una lista) y los detalles con historial a la vista (p. ej. el
// detalle de una cuenta). Recibe QUÉ consultar (fetchPage) y CÓMO nombrar los eventos (diccionarios) por props: core no
// conoce el API.
//
// Filtros y página en memoria (sin prefijo de URL): el historial vive dentro de otra pantalla y escribir en la barra de
// direcciones ensuciaría la URL de esa pantalla.
//
// Contrato de fetchPage: el de ServerTable ({filters: {event: [...]}, sortOrders, page, pageSize}) →
// {rows: [{id, event, result, occurred_at, actor: {id, name}|null, ...}], total, facets: {event: [{value, total}]}}.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

import ServerTable from '@/DataTable/ServerTable.jsx';
import {FILTER_KINDS} from '@/DataTable/useTableState.js';
import {labelOf, lookup} from '@/dictionaries/dictionaries.js';
import {formatDateTime} from '@/formatting.js';
import StatusChip from '@/ui/labels/StatusChip.jsx';

// OJO: constantes de módulo; objetos nuevos en cada render reinician el estado de la tabla
const AUDIT_FILTER_DEFAULTS = {event: []};
const AUDIT_FILTER_KINDS = {event: FILTER_KINDS.multiSelect};

/**
 * @param {object} props
 * @param {string} props.subjectKey identifica el renglón (cambia la consulta al cambiar de renglón); '' no consulta
 * @param {(tableRequest: object, signal: AbortSignal) => Promise<{rows: Array, total: number, facets?: object}>} props.fetchPage
 * @param {Record<string, object>} props.eventDictionary
 * @param {Record<string, object>} [props.resultDictionary]
 * @param {Array<object>} [props.extraColumns] columnas del DataGrid propias del módulo (archivo, origen, motivo...)
 * @param {(row: any) => string|null} [props.eventSuffixOf] texto que va después del evento con « · » (p. ej. para
 *     quién era la descarga); null = solo el evento
 * @param {string} props.ariaLabel
 * @param {number} [props.maxGridHeight]
 * @param {unknown} [props.refreshToken] cambia para volver a consultar (después de una acción sobre el mismo renglón)
 */
export default function AuditTrailTable({
    subjectKey, fetchPage, eventDictionary, resultDictionary, extraColumns = [], ariaLabel, maxGridHeight = null, refreshToken,
    eventSuffixOf = null,
}) {
    const {t} = useToolkitTranslation(['table', 'dictionaries']);

    const columns = [
        {
            field: 'occurred_at', headerName: t('table:audit.columns.occurredAt'), width: 170, sortable: false,
            valueFormatter: (value) => (value ? formatDateTime(value) : '—'),
        },
        {
            field: 'event', headerName: t('table:audit.columns.event'), flex: 1, minWidth: 230, sortable: false,
            renderCell: ({row}) => <StatusChip variant="chip" dictionary={eventDictionary} value={row.event} suffix={eventSuffixOf?.(row) ?? undefined} />,
        },
        ...(resultDictionary ? [{
            field: 'result', headerName: t('table:audit.columns.result'), width: 170, sortable: false,
            renderCell: ({row}) => <StatusChip dictionary={resultDictionary} value={row.result} />,
        }] : []),
        {
            field: 'actor', headerName: t('table:audit.columns.actor'), width: 190, sortable: false,
            // los eventos que escribe un proceso automático o la propia persona no tienen actor: se dice quién fue en palabras
            valueGetter: (value) => value?.name ?? t('table:audit.systemActor'),
        },
        ...extraColumns,
    ];

    // OJO: key={subjectKey}. Sin prefijo, los filtros viven en memoria dentro de ServerTable; si el diálogo o la página
    // siguen montados al pasar a otro renglón, el filtro de evento del renglón anterior se quedaría puesto
    return (
        <ServerTable
            key={subjectKey || 'without-subject'}
            queryKey={subjectKey ? `audit:${subjectKey}` : ''}
            enabled={Boolean(subjectKey)}
            fetchPage={fetchPage}
            refreshToken={refreshToken}
            columns={columns}
            filterDefaults={AUDIT_FILTER_DEFAULTS}
            filterKinds={AUDIT_FILTER_KINDS}
            searchField={null}
            chipConfig={[]}
            quickFilters={[{
                field: 'event',
                facetKey: 'event',
                caption: t('table:audit.eventFilterCaption'),
                renderLabel: (eventValue) => labelOf(lookup(eventDictionary, eventValue), t),
            }]}
            countLabel={(total) => t('table:audit.count', {count: total})}
            emptyLabel={t('table:audit.empty')}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50]}
            maxGridHeight={maxGridHeight}
            ariaLabel={ariaLabel}
        />
    );
}
