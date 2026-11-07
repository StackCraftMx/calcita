// Una tabla chica donde el orden de los renglones es el dato (@stackcraftmx/calcita/sortable): qué se hace primero, en qué
// orden pasa la ruta. Los renglones se arrastran con el ratón, con el dedo o con el teclado (espacio para levantar, flechas
// para mover, espacio para soltar), y la columna «Orden» se renumera 1..n. Con @hello-pangea/dnd por dentro, la misma del
// tablero kanban.
//
//   <SortableTable rows={stops} columns={[{field: 'name', headerName: 'Sucursal', flex: 1}]} ariaLabel="Ruta de reparto"
//                  onReorder={({rows}) => setStops(rows)} />
//
// Dos formas de guardar, según lo que regrese onReorder:
//   - nada (en un formulario: se guarda al final con su botón): la pantalla pone los renglones nuevos (rows) y la tabla los
//     enseña. FormSortableField lo hace con formik y marca el formulario como cambiado;
//   - una promesa (se guarda al soltar): la tabla enseña el orden nuevo al instante y, si la promesa truena (el servidor dijo
//     que no), el renglón regresa a donde estaba y el lector de pantalla lo anuncia; mientras se guarda no se arrastra otro.
//     Al cumplirse, la pantalla pone los renglones nuevos o los vuelve a pedir.
//
// Para lo que no va en una tabla de servidor: la tabla de MUI X gratis no ordena renglones arrastrando (es de su versión de
// paga), así que esta lista va completa en el navegador, sin páginas.
//
// OJO trampa: un renglón que se arrastra flota (position fixed) y en una tabla de HTML pierde el ancho de sus columnas. Aquí
// la tabla de MUI se pinta con divisiones (role table, row y cell) y cada renglón es una cuadrícula con las mismas columnas:
// el que flota conserva su ancho. El estilo del tema del proyecto para MuiTableCell se le aplica igual.
//
// Mover sin arrastrar: cada renglón trae «Subir» y «Bajar» en la última columna (moveButtons, por omisión sí). La regla de
// accesibilidad lo pide (WCAG 2.5.7: lo que se arrastra también se hace con un clic, para quien no puede sostener y mover el
// ratón o el dedo). Cada clic mueve el renglón un lugar y guarda igual que soltarlo. Para mover desde otra parte (un menú
// «Mandar al final»): moveRow de sortableRows.js.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSortableTable con defaultProps y
// styleOverrides de sus partes: root, container, table, head, headerRow, headerCell, body, row, handleCell, handle, positionCell,
// cell, moveCell, moveButton, empty, helperText, announcer.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useId, useRef, useState} from 'react';
import {DragDropContext, Draggable, Droppable} from '@hello-pangea/dnd';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';

import {moveRow} from '@/sortable/sortableRows.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

const THEME_NAME = 'CalcitaSortableTable';
const SortableRoot = piecePart(THEME_NAME, 'Root', Box);
const SortableContainer = piecePart(THEME_NAME, 'Container', TableContainer);
const SortableTableElement = piecePart(THEME_NAME, 'Table', Table);
const SortableHead = piecePart(THEME_NAME, 'Head', TableHead);
const SortableHeaderRow = piecePart(THEME_NAME, 'HeaderRow', TableRow);
const SortableHeaderCell = piecePart(THEME_NAME, 'HeaderCell', TableCell);
const SortableBody = piecePart(THEME_NAME, 'Body', TableBody);
const SortableRow = piecePart(THEME_NAME, 'Row', TableRow);
const SortableHandleCell = piecePart(THEME_NAME, 'HandleCell', TableCell);
const SortableHandle = piecePart(THEME_NAME, 'Handle', Box);
const SortablePositionCell = piecePart(THEME_NAME, 'PositionCell', TableCell);
const SortableCell = piecePart(THEME_NAME, 'Cell', TableCell);
const SortableMoveCell = piecePart(THEME_NAME, 'MoveCell', TableCell);
const SortableMoveButton = piecePart(THEME_NAME, 'MoveButton', IconButton);
const SortableEmpty = piecePart(THEME_NAME, 'Empty', TableCell);
const SortableHelperText = piecePart(THEME_NAME, 'HelperText', FormHelperText);
const SortableAnnouncer = piecePart(THEME_NAME, 'Announcer', Box);

// las columnas de la casa, con menos relleno a los lados que las demás: la del asa (el ícono y su foco) y la del orden
// (OJO: con 72 px y el relleno de siempre, «Orden» se partía en «Orde / n»; con 88 caben «Orden», «Order» o «Prioridad»)
const HANDLE_COLUMN_WIDTH_PIXELS = 48;
const POSITION_COLUMN_WIDTH_PIXELS = 88;
const HOUSE_COLUMN_PADDING_X = 1.5;
// la columna de «Subir» y «Bajar»: dos botones chicos (30 px cada uno), su separación y el relleno de la casa
const MOVE_COLUMN_WIDTH_PIXELS = 88;
// los dos botones de cada renglón para mover sin arrastrar: cuántos lugares se mueve con cada uno, su ícono y sus textos
const MOVE_BUTTONS = Object.freeze([
    {direction: 'up', step: -1, Icon: KeyboardArrowUpRoundedIcon, labelKey: 'moveUp', hintKey: 'moveUpHint'},
    {direction: 'down', step: 1, Icon: KeyboardArrowDownRoundedIcon, labelKey: 'moveDown', hintKey: 'moveDownHint'},
]);
// lo mínimo de una columna sin ancho fijo: abajo de eso la tabla se desliza de lado (en el teléfono)
const DEFAULT_COLUMN_MIN_WIDTH_PIXELS = 96;
// lo que se ve, solo para el lector de pantalla
const VISUALLY_HIDDEN_SX = {position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0};
const JUSTIFY_BY_ALIGN = Object.freeze({left: 'flex-start', center: 'center', right: 'flex-end'});

/**
 * Una columna de la tabla. Row: el renglón de la pantalla (llega tal cual a renderCell).
 *
 * @template Row
 * @typedef {object} SortableTableColumn
 * @property {string} field la llave del renglón que se pinta (y la del encabezado)
 * @property {string} headerName el encabezado, ya traducido
 * @property {number} [width] ancho fijo en px
 * @property {number} [flex] cuánto del espacio libre toma, como en la tabla de servidor (por omisión 1)
 * @property {number} [minWidth] el mínimo en px de una columna sin ancho fijo (por omisión 96)
 * @property {'left'|'center'|'right'} [align] los números a la derecha
 * @property {(row: Row, place: {index: number, position: number}) => import('react').ReactNode} [renderCell] lo de la celda a la
 *     medida; position es la que ve la persona (desde 1)
 */

/** La pista de la cuadrícula de una columna: el ancho fijo, o lo que le toque del espacio libre sin bajar de su mínimo. */
function trackOf(column) {
    if (column.width) {
        return `${column.width}px`;
    }
    return `minmax(${column.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH_PIXELS}px, ${column.flex ?? 1}fr)`;
}

/** Una función que regresa una promesa: se guarda al soltar. */
function isPromiseLike(value) {
    return typeof value?.then === 'function';
}

/**
 * Los renglones conservan el tipo que usa la pantalla (Row): onReorder los regresa del mismo tipo, ya en su orden nuevo.
 *
 * @template {object} Row
 * @param {object} props
 * @param {Row[]} props.rows en su orden
 * @param {SortableTableColumn<Row>[]} props.columns
 * @param {(change: {rows: Row[], rowId: string|number, fromIndex: number, toIndex: number}) => Promise<unknown>|void} props.onReorder
 *     al soltar un renglón en otro lugar: rows ya en el orden nuevo; fromIndex y toIndex desde 0. Si regresa una promesa, el
 *     orden nuevo se enseña mientras se cumple y regresa si truena
 * @param {string} props.ariaLabel qué es la tabla, ya traducido
 * @param {(row: Row) => string|number} [props.getRowId] por omisión row.id
 * @param {(row: Row) => string} [props.getRowLabel] el nombre del renglón que oye el lector de pantalla («Polanco»); por omisión
 *     lo de la primera columna
 * @param {boolean} [props.showPosition] la columna «Orden» con 1..n (por omisión sí)
 * @param {boolean} [props.moveButtons] «Subir» y «Bajar» en cada renglón, para mover sin arrastrar (por omisión sí: lo pide la
 *     regla de accesibilidad WCAG 2.5.7); false los quita
 * @param {boolean} [props.disabled] nada se arrastra ni se mueve (mientras se envía el formulario, o de solo lectura)
 * @param {import('react').ReactNode} [props.error] el error de la lista (en rojo, abajo de la tabla)
 * @param {import('react').ReactNode} [props.helperText] una ayuda abajo de la tabla (el error gana)
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] lo de afuera de la tabla
 * @param {object} [props.texts] los textos que cambian, con la forma de `sortableTable` en los textos del paquete
 */
function SortableTableContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSortableTable.defaultProps) y encima lo que llega aquí
    const {
        rows, columns, onReorder, ariaLabel, getRowId = (row) => row.id, getRowLabel, showPosition = true, moveButtons = true,
        disabled = false, error, helperText, sx, texts, ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('sortableTable', texts);
    const helperId = useId();
    const listId = useId();
    // un orden que se está guardando (o ya se guardó y la pantalla todavía no da los renglones nuevos); vale mientras rows
    // sea el mismo arreglo sobre el que se movió
    const [pending, setPending] = useState(null);
    // lo último que se anunció fuera del arrastre (el renglón que regresó)
    const [notice, setNotice] = useState('');
    // el asa que la librería le dio a cada renglón la última vez que se podía arrastrar (ver la trampa en el asa)
    const handlePropsByRow = useRef(new Map());
    const shownRows = pending && pending.basedOn === rows ? pending.rows : rows;
    const isSaving = Boolean(pending && pending.basedOn === rows && pending.saving);
    const canDrag = !disabled && !isSaving;
    const total = shownRows.length;

    const labelOf = (row) => String(getRowLabel ? getRowLabel(row) : (row[columns[0]?.field] ?? getRowId(row)));
    const rowOfDraggable = (draggableId) => shownRows.find((row) => String(getRowId(row)) === draggableId);
    const titleOf = (draggableId) => {
        const row = rowOfDraggable(draggableId);
        return row ? labelOf(row) : draggableId;
    };

    // OJO trampa pagada: sin poder arrastrar (mientras se guarda) la librería no da el asa. Sin ella, quien soltó con el
    // teclado se quedaba sin foco, y la librería (que busca el asa para devolverle el foco al soltar) avisaba en la consola
    // que no la encontraba. Mientras tanto se queda con la que tuvo la última vez: con el renglón apagado no arranca otro
    // arrastre (la librería lo revisa en su registro, no en el asa). Sin una de antes (apagada desde el principio), solo
    // recibe el foco.
    const handlePropsOf = (rowId, dragHandleProps) => {
        if (dragHandleProps) {
            handlePropsByRow.current.set(rowId, dragHandleProps);
            return dragHandleProps;
        }
        return handlePropsByRow.current.get(rowId) ?? {tabIndex: 0, role: 'button'};
    };

    // los botones «Subir» y «Bajar» ya pintados de cada renglón (para regresarles el foco) y a cuál se le regresa
    const moveButtonsByRow = useRef(new Map());
    const focusAfterMove = useRef(null);
    const rememberMoveButton = (rowId, direction) => (element) => {
        const buttons = moveButtonsByRow.current.get(rowId) ?? {};
        buttons[direction] = element;
        moveButtonsByRow.current.set(rowId, buttons);
    };

    // OJO trampa pagada: al cambiar el orden, React a veces saca la división del renglón movido y la vuelve a meter en su lugar
    // nuevo (medido en Chrome: al bajar sí, al subir no), y el navegador le quita el foco a lo que se saca: quien movía con el
    // teclado se quedaba sin foco y tenía que volver a buscar el renglón. Si el foco estaba en un botón del renglón, se le
    // regresa cuando el renglón se pinta en expectedIndex (al botón de enfrente si ya llegó a la orilla y se apagó). Con el
    // ratón en Safari el botón no se lleva el foco: ahí no se toca.
    const keepFocusOnMoveButton = (rowId, expectedIndex) => {
        const buttons = moveButtonsByRow.current.get(rowId);
        const focused = MOVE_BUTTONS.find(({direction}) => buttons?.[direction] && buttons[direction] === document.activeElement);
        focusAfterMove.current = focused ? {rowId, direction: focused.direction, expectedIndex} : null;
    };
    useEffect(() => {
        const wanted = focusAfterMove.current;
        if (!wanted) {
            return;
        }
        const index = shownRows.findIndex((row) => String(getRowId(row)) === wanted.rowId);
        // todavía no se pinta en su lugar nuevo: la pantalla no ha dado los renglones
        if (index !== -1 && index !== wanted.expectedIndex) {
            return;
        }
        focusAfterMove.current = null;
        const buttons = moveButtonsByRow.current.get(wanted.rowId);
        const pressed = MOVE_BUTTONS.find(({direction}) => direction === wanted.direction);
        const reachedEdge = index + pressed.step < 0 || index + pressed.step >= shownRows.length;
        const opposite = MOVE_BUTTONS.find(({direction}) => direction !== wanted.direction);
        buttons?.[reachedEdge ? opposite.direction : pressed.direction]?.focus();
    });

    const reorder = (row, fromIndex, toIndex) => {
        const movedRows = moveRow(shownRows, fromIndex, toIndex);
        const outcome = onReorder({rows: movedRows, rowId: getRowId(row), fromIndex, toIndex});
        // sin promesa: la pantalla ya puso sus renglones (un formulario); nada que esperar
        if (!isPromiseLike(outcome)) {
            return;
        }
        const attempt = {rows: movedRows, basedOn: rows, saving: true};
        setPending(attempt);
        outcome.then(
            () => setPending((current) => (current === attempt ? {...attempt, saving: false} : current)),
            () => {
                // el servidor dijo que no: se enseñan otra vez los renglones de la pantalla (el orden de antes), y si el foco
                // estaba en «Subir» o «Bajar» de ese renglón, lo sigue a su lugar de antes
                keepFocusOnMoveButton(String(getRowId(row)), fromIndex);
                setPending((current) => (current === attempt ? null : current));
                setNotice(t('reverted', {title: labelOf(row), position: fromIndex + 1}));
            },
        );
    };

    // un lugar arriba o abajo con su botón: guarda igual que soltarlo; mientras se guarda, el botón conserva el foco pero no
    // mueve (y en la orilla está apagado)
    const moveWithButton = (row, index, step) => {
        const toIndex = index + step;
        if (!canDrag || toIndex < 0 || toIndex >= total) {
            return;
        }
        keepFocusOnMoveButton(String(getRowId(row)), toIndex);
        setNotice(t('moved', {title: labelOf(row), position: toIndex + 1, total}));
        reorder(row, index, toIndex);
    };

    // lo que oye quien usa lector de pantalla (posiciones desde 1, como se cuentan)
    const announceStart = (start, provided) => {
        // se empezó a arrastrar: ya no se espera regresarle el foco a un botón
        focusAfterMove.current = null;
        setNotice('');
        provided.announce(t('lifted', {title: titleOf(start.draggableId), position: start.source.index + 1, total}));
    };
    const announceUpdate = (update, provided) => {
        if (update.destination) {
            provided.announce(t('moving', {position: update.destination.index + 1, total}));
        }
    };
    const finishMove = (result, provided) => {
        const {draggableId, source, destination} = result;
        const row = rowOfDraggable(draggableId);
        // se soltó fuera de la tabla o en el mismo lugar: nada que mover
        if (!row || !destination || destination.index === source.index) {
            provided.announce(t('cancelled', {title: titleOf(draggableId), position: source.index + 1}));
            return;
        }
        provided.announce(t('dropped', {title: labelOf(row), position: destination.index + 1, total}));
        reorder(row, source.index, destination.index);
    };

    // todas las filas con las mismas columnas: la del asa, la del orden, las de la pantalla y la de «Subir» y «Bajar»
    const gridTemplateColumns = [
        `${HANDLE_COLUMN_WIDTH_PIXELS}px`, ...(showPosition ? [`${POSITION_COLUMN_WIDTH_PIXELS}px`] : []), ...columns.map(trackOf),
        ...(moveButtons ? [`${MOVE_COLUMN_WIDTH_PIXELS}px`] : []),
    ].join(' ');
    // abajo de esto la tabla se desliza de lado en vez de apretar las columnas
    const minimumWidth = HANDLE_COLUMN_WIDTH_PIXELS + (showPosition ? POSITION_COLUMN_WIDTH_PIXELS : 0) + (moveButtons ? MOVE_COLUMN_WIDTH_PIXELS : 0)
        + columns.reduce((sum, column) => sum + (column.width ?? column.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH_PIXELS), 0);
    const rowSx = {display: 'grid', gridTemplateColumns};
    // una palabra solo se parte si no cabe ni sola en su renglón (un correo largo); un encabezado de dos palabras baja entero
    const cellSx = (align = 'left') => ({display: 'flex', alignItems: 'center', minWidth: 0, justifyContent: JUSTIFY_BY_ALIGN[align], textAlign: align, overflowWrap: 'break-word'});
    const houseCellSx = (align) => ({...cellSx(align), px: HOUSE_COLUMN_PADDING_X});
    const bottomText = error || helperText;

    return (
        <SortableRoot sx={sx}>
            {/* OJO trampa pagada: los encabezados escondidos (solo para el lector de pantalla) van con position absolute y se
                acomodan contra el primer papá con posición. Sin la de esta caja, el de la última columna («Subir o bajar») quedaba
                fuera de lo que se desliza y ensanchaba la página en el teléfono (715 px en una pantalla de 390). */}
            <SortableContainer component={Paper} variant="outlined" ownSx={{overflowX: 'auto', position: 'relative'}}>
                <SortableTableElement component="div" aria-label={ariaLabel} aria-busy={isSaving || undefined}
                                      aria-describedby={bottomText ? helperId : undefined} ownSx={{display: 'block', minWidth: minimumWidth}}>
                    <SortableHead component="div" ownSx={{display: 'block'}}>
                        <SortableHeaderRow component="div" ownSx={rowSx}>
                            <SortableHeaderCell component="div" role="columnheader" ownSx={houseCellSx('center')}>
                                <Box component="span" sx={VISUALLY_HIDDEN_SX}>{t('handleHeader')}</Box>
                            </SortableHeaderCell>
                            {showPosition && (
                                <SortableHeaderCell component="div" role="columnheader" ownSx={houseCellSx('right')}>{t('position')}</SortableHeaderCell>
                            )}
                            {columns.map((column) => (
                                <SortableHeaderCell key={column.field} component="div" role="columnheader" ownSx={cellSx(column.align)}>
                                    {column.headerName}
                                </SortableHeaderCell>
                            ))}
                            {moveButtons && (
                                <SortableHeaderCell component="div" role="columnheader" ownSx={houseCellSx('center')}>
                                    <Box component="span" sx={VISUALLY_HIDDEN_SX}>{t('moveHeader')}</Box>
                                </SortableHeaderCell>
                            )}
                        </SortableHeaderRow>
                    </SortableHead>
                    <DragDropContext onDragStart={announceStart} onDragUpdate={announceUpdate} onDragEnd={finishMove}
                                     dragHandleUsageInstructions={t('instructions')}>
                        <Droppable droppableId={listId}>
                            {(droppableProvided) => (
                                <SortableBody component="div" ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}
                                              ownSx={{display: 'block', '& > .MuiTableRow-root:last-of-type > .MuiTableCell-root': {borderBottom: 0}}}>
                                    {shownRows.map((row, index) => {
                                        const rowId = String(getRowId(row));
                                        const label = labelOf(row);
                                        return (
                                            <Draggable key={rowId} draggableId={rowId} index={index} isDragDisabled={!canDrag}>
                                                {(draggableProvided, draggableSnapshot) => (
                                                    <SortableRow component="div" ref={draggableProvided.innerRef} {...draggableProvided.draggableProps}
                                                                 ownSx={{
                                                                     ...rowSx,
                                                                     // el que flota lleva fondo y sombra: sin eso se transparenta sobre los demás
                                                                     ...(draggableSnapshot.isDragging && {bgcolor: 'background.paper', boxShadow: 8, borderRadius: 1}),
                                                                 }}>
                                                        <SortableHandleCell component="div" role="cell" ownSx={houseCellSx('center')}>
                                                            <SortableHandle component="span" {...handlePropsOf(rowId, draggableProvided.dragHandleProps)}
                                                                            aria-label={t('handle', {title: label, position: index + 1})}
                                                                            aria-disabled={!canDrag || undefined}
                                                                            ownSx={{
                                                                                display: 'inline-flex', p: 0.5, borderRadius: 1,
                                                                                color: canDrag ? 'text.secondary' : 'text.disabled',
                                                                                cursor: canDrag ? (draggableSnapshot.isDragging ? 'grabbing' : 'grab') : 'default',
                                                                                '&:focus-visible': {outline: 2, outlineColor: 'primary.main', outlineOffset: 1},
                                                                            }}>
                                                                <DragIndicatorRoundedIcon fontSize="small" />
                                                            </SortableHandle>
                                                        </SortableHandleCell>
                                                        {showPosition && (
                                                            <SortablePositionCell component="div" role="cell"
                                                                                  ownSx={{...houseCellSx('right'), fontVariantNumeric: 'tabular-nums', color: 'text.secondary'}}>
                                                                {index + 1}
                                                            </SortablePositionCell>
                                                        )}
                                                        {columns.map((column) => (
                                                            <SortableCell key={column.field} component="div" role="cell" ownSx={cellSx(column.align)}>
                                                                {column.renderCell ? column.renderCell(row, {index, position: index + 1}) : (row[column.field] ?? t('noValue'))}
                                                            </SortableCell>
                                                        ))}
                                                        {moveButtons && (
                                                            <SortableMoveCell component="div" role="cell" ownSx={{...houseCellSx('center'), gap: 0.5}}>
                                                                {MOVE_BUTTONS.map(({direction, step, Icon, labelKey, hintKey}) => (
                                                                    // el span deja que el globo salga también con el botón apagado (regla de MUI)
                                                                    <Tooltip key={direction} title={t(hintKey)}>
                                                                        <span>
                                                                            <SortableMoveButton size="small" ref={rememberMoveButton(rowId, direction)}
                                                                                                aria-label={t(labelKey, {title: label})}
                                                                                                // el primero no sube y el último no baja; mientras se guarda
                                                                                                // se queda prendido para no perder el foco, pero no mueve
                                                                                                disabled={disabled || index + step < 0 || index + step >= total}
                                                                                                aria-disabled={isSaving || undefined}
                                                                                                onClick={() => moveWithButton(row, index, step)}
                                                                                                ownSx={isSaving ? {color: 'text.disabled'} : undefined}>
                                                                                <Icon fontSize="small" />
                                                                            </SortableMoveButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                ))}
                                                            </SortableMoveCell>
                                                        )}
                                                    </SortableRow>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {droppableProvided.placeholder}
                                    {total === 0 && (
                                        <TableRow component="div" sx={rowSx}>
                                            <SortableEmpty component="div" role="cell" ownSx={{gridColumn: '1 / -1', color: 'text.secondary', textAlign: 'center', py: 3}}>
                                                {t('empty')}
                                            </SortableEmpty>
                                        </TableRow>
                                    )}
                                </SortableBody>
                            )}
                        </Droppable>
                    </DragDropContext>
                </SortableTableElement>
            </SortableContainer>
            {bottomText && <SortableHelperText id={helperId} error={Boolean(error)}>{bottomText}</SortableHelperText>}
            <SortableAnnouncer role="status" aria-live="polite" ownSx={VISUALLY_HIDDEN_SX}>{notice}</SortableAnnouncer>
        </SortableRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
// OJO: con su tipo propio, el genérico (Row: el renglón de la pantalla) que la envoltura borraría; slots y slotProps van en su
// documentación
/** @type {typeof SortableTableContent} */
const SortableTable = withPieceSlots(SortableTableContent, THEME_NAME);
export default SortableTable;
