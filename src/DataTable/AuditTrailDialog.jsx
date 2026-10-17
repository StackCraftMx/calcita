// Diálogo de auditoría de un renglón: su historia de eventos, paginada y filtrada EN EL SERVIDOR (AuditTrailTable).
//
// Sirve para el historial de cualquier registro (un pedido, una cuenta).
// Solo abre una vista: no ejecuta nada y por eso no lleva confirmación.
//
// Se abre como diálogo de contenido (ContentDialog): sube desde abajo y ocupa la pantalla debajo de la barra superior. Una
// tabla con su historia se lee mejor a todo lo ancho que en un recuadro al centro, también en el teléfono.
//
// Genérico del paquete: function (regla de la casa).
import Typography from '@mui/material/Typography';

import AuditTrailTable from '@/DataTable/AuditTrailTable.jsx';
import ContentDialog from '@/ui/layout/ContentDialog.jsx';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title ya traducido («Historial de Q3 · ago 2026»)
 * @param {import('react').ReactNode} [props.subtitle]
 * @param {string} props.subjectKey
 * @param {(tableRequest: object, signal: AbortSignal) => Promise<{rows: Array, total: number, facets?: object}>} props.fetchPage
 * @param {Record<string, object>} props.eventDictionary
 * @param {Record<string, object>} [props.resultDictionary]
 * @param {Array<object>} [props.extraColumns]
 * @param {import('react').ReactNode} [props.header] va entre el subtítulo y la tabla (p. ej. pestañas que cambian lo que se
 *     consulta)
 * @param {(row: object) => string|null} [props.eventSuffixOf] complemento del evento de un renglón (AuditTrailTable)
 */
export default function AuditTrailDialog({
    open, onClose, title, subtitle, subjectKey, fetchPage, eventDictionary, resultDictionary, extraColumns = [], header = null, eventSuffixOf = null,
}) {
    return (
        <ContentDialog open={open} onClose={onClose} title={title}>
            {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{subtitle}</Typography>
            )}
            {header}
            <AuditTrailTable
                subjectKey={open ? subjectKey : ''}
                fetchPage={fetchPage}
                eventDictionary={eventDictionary}
                resultDictionary={resultDictionary}
                extraColumns={extraColumns}
                eventSuffixOf={eventSuffixOf}
                ariaLabel={title}
                maxGridHeight={null}
            />
        </ContentDialog>
    );
}
