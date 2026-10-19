// Diálogo de auditoría de un renglón: su historia de eventos, paginada y filtrada EN EL SERVIDOR (AuditTrailTable).
//
// Sirve para el historial de cualquier registro (un pedido, una cuenta).
// Solo abre una vista: no ejecuta nada y por eso no lleva confirmación.
//
// Se abre como diálogo de contenido (ContentDialog): sube desde abajo y ocupa la pantalla debajo de la barra superior. Una
// tabla con su historia se lee mejor a todo lo ancho que en un recuadro al centro, también en el teléfono.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaAuditTrailDialog con defaultProps y
// styleOverrides de sus partes: description.
//
// Genérico del paquete: function (regla de la casa).
import Typography from '@mui/material/Typography';

import AuditTrailTable from '@/DataTable/AuditTrailTable.jsx';
import ContentDialog from '@/ui/layout/ContentDialog.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaAuditTrailDialog)
const THEME_NAME = 'CalcitaAuditTrailDialog';
const AuditDescription = piecePart(THEME_NAME, 'Description', Typography);

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
 * @param {(row: any) => string|null} [props.eventSuffixOf] complemento del evento de un renglón (AuditTrailTable)
 */
export default function AuditTrailDialog(props) {
    // lo que el proyecto puso en su tema (components.CalcitaAuditTrailDialog.defaultProps) y encima lo que llega aquí
    const {
    open, onClose, title, subtitle, subjectKey, fetchPage, eventDictionary, resultDictionary, extraColumns = [], header = null, eventSuffixOf = null,
} = usePieceProps(props, THEME_NAME);
    return (
        <ContentDialog open={open} onClose={onClose} title={title}>
            {subtitle && (
                <AuditDescription variant="body2" color="text.secondary" ownSx={{mb: 2}}>{subtitle}</AuditDescription>
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
