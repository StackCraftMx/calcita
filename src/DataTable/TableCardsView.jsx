// La otra vista de ServerTable: los mismos renglones (la misma búsqueda, filtros, orden y página) en tarjetas, una por
// renglón, con lo que pinte la pantalla (renderCard; normalmente RecordCard). Mientras llega la primera página, esqueletos
// con la forma de la tarjeta; al cambiar de página se quedan las de antes con una barra arriba (no brinca la pantalla).
//
// Se cambia desde el tema del proyecto, como la tabla: components.CalcitaServerTable con styleOverrides de sus partes
// cards (la lista: una columna por omisión; con display grid se hacen columnas), cardsPagination y viewToggle.
//
// Genéricos del paquete: function (regla de la casa).
import LinearProgress from '@mui/material/LinearProgress';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';

import EmptyState from '@/DataTable/EmptyState.jsx';
import {TABLE_VIEW} from '@/DataTable/useTableView.js';
import {piecePart} from '@/theme/themePieces.js';
import RecordCardSkeleton from '@/ui/cards/RecordCardSkeleton.jsx';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

// el nombre de la pieza en el tema: el de la tabla (theme.components.CalcitaServerTable)
const THEME_NAME = 'CalcitaServerTable';
const TableCards = piecePart(THEME_NAME, 'Cards', 'div');
const TableCardsPagination = piecePart(THEME_NAME, 'CardsPagination', Stack);
const TableViewToggleGroup = piecePart(THEME_NAME, 'ViewToggle', ToggleButtonGroup);

// cuántos esqueletos mientras llega la primera página: los de una pantalla, no los de toda la página
const MAX_SKELETON_CARDS = 3;

/**
 * El botón de dos posiciones para ver la lista en tabla o en tarjetas.
 *
 * @param {{view: 'table'|'cards', onChange: (view: 'table'|'cards') => void}} props
 */
export function TableViewToggle({view, onChange}) {
    const {t} = useToolkitTranslation('table');
    return (
        <TableViewToggleGroup size="small" exclusive value={view} aria-label={t('views.label')}
                              onChange={(event, nextView) => nextView && onChange(nextView)} ownSx={{flexShrink: 0, alignSelf: {xs: 'flex-end', md: 'center'}}}>
            <ToggleButton value={TABLE_VIEW.table} aria-label={t('views.table')}>
                <Tooltip title={t('views.table')}><TableRowsRoundedIcon fontSize="small" /></Tooltip>
            </ToggleButton>
            <ToggleButton value={TABLE_VIEW.cards} aria-label={t('views.cards')}>
                <Tooltip title={t('views.cards')}><ViewAgendaOutlinedIcon fontSize="small" /></Tooltip>
            </ToggleButton>
        </TableViewToggleGroup>
    );
}

/**
 * @param {object} props
 * @param {any[]} props.rows los renglones de la página
 * @param {(row: any, helpers: {index: number}) => import('react').ReactNode} props.renderCard
 * @param {(row: any) => string|number} props.rowIdOf
 * @param {boolean} props.isLoading
 * @param {number} props.page desde 0
 * @param {number} props.pageCount
 * @param {(page: number) => void} props.onPageChange recibe la página desde 0
 * @param {boolean} props.hasActiveFilters
 * @param {string} [props.emptyLabel]
 * @param {() => void} props.onClearFilters
 * @param {import('react').ReactNode} [props.skeleton] el esqueleto de una tarjeta (por omisión RecordCardSkeleton)
 * @param {string} [props.ariaLabel] el nombre de la lista para el lector de pantalla
 */
export default function TableCardsView({
    rows, renderCard, rowIdOf, isLoading, page, pageCount, onPageChange, hasActiveFilters, emptyLabel, onClearFilters, skeleton, ariaLabel,
}) {
    const {t} = useToolkitTranslation('table');
    const isFirstLoad = isLoading && rows.length === 0;

    return (
        <>
            {/* al cambiar de página se quedan las tarjetas de antes con una barra arriba: no brinca la pantalla */}
            {isLoading && !isFirstLoad && <LinearProgress sx={{mb: 1, borderRadius: 1}} />}
            <TableCards role="list" aria-label={ariaLabel ?? t('cards.label')} aria-busy={isLoading}
                        ownSx={{display: 'grid', gap: 1.5, minWidth: 0}}>
                {isFirstLoad && Array.from({length: MAX_SKELETON_CARDS}, (unused, index) => (
                    <div key={index} role="listitem">{skeleton ?? <RecordCardSkeleton />}</div>
                ))}
                {rows.map((row, index) => <div key={rowIdOf(row)} role="listitem">{renderCard(row, {index})}</div>)}
            </TableCards>
            {!isLoading && rows.length === 0 && (
                <EmptyState filtered={hasActiveFilters} label={emptyLabel} onClearFilters={onClearFilters} />
            )}
            {pageCount > 1 && (
                <TableCardsPagination direction="row" ownSx={{justifyContent: 'center', mt: 2}}>
                    <Pagination count={pageCount} page={page + 1} onChange={(event, nextPage) => onPageChange(nextPage - 1)}
                                getItemAriaLabel={(type, itemPage) => t(`cards.pagination.${type}`, {page: itemPage})} />
                </TableCardsPagination>
            )}
        </>
    );
}
