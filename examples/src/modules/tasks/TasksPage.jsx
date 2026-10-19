// El tablero de tareas como producto: KanbanBoard de /kanban con todo lo de afuera puesto por la pantalla.
//   - mover arrastrando (ratón, dedo o teclado) o con el menú «⋯» (pasar a la columna siguiente); se ve al instante y se
//     guarda; si el servidor dice que no («En proceso» tiene tope de 3), sale el aviso y la tarjeta regresa;
//   - «+» en cada columna para agregar escribiendo el título; picar una tarjeta (o «Editar») abre la ventana con todo:
//     responsables, prioridad, fecha límite, etiquetas y su lista de pendientes;
//   - terminar con el círculo de cada tarjeta o «Finalizar tarea» del «⋯» (pasa a «Listo» con su día) y «Reabrir»;
//   - el congelador (icebox): ideas para después, encogido a la izquierda; «Congelar» y «Descongelar» en el «⋯»;
//   - «Asignarme» / «Quitarme», borrar con confirmación y «Archivar las terminadas» en el «⋯» de «Listo»;
//   - buscar arriba en la barra de la app (BarSearch, como la tabla de Pedidos) y filtrar por responsable.
// El tablero no guarda nada: cada acción llama a tasksApi.js y pinta el tablero como lo regresa el servidor.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import {
    BarSearch, ConfirmDialog, PageHeading, SegmentedControl, toastProblem, toastSuccess, useConfirmAction, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {KanbanBoard, moveCard} from '@stackcraftmx/calcita/kanban';

import {TaskDialog} from '@/modules/tasks/TaskDialog.jsx';
import {addTask, archiveDone, loadTaskBoard, removeTask, saveCompletion, saveMove, saveTask} from '@/modules/tasks/tasksApi.js';

const LOADING_HEIGHT_PIXELS = 360;
// de quién se ven las tareas
const WHO = Object.freeze({all: 'all', mine: 'mine', unassigned: 'unassigned'});
// el color de la etiqueta de cada prioridad
const PRIORITY_COLOR = Object.freeze({high: 'error', medium: 'warning', low: 'default'});
const DONE_COLUMN_ID = 'done';
// el congelador: ideas para después; se descongela a «Por hacer»
const ICEBOX_COLUMN_ID = 'icebox';
const TODO_COLUMN_ID = 'todo';

/** ¿La tarea se ve con la búsqueda y el filtro de responsable? */
const isVisible = (task, {query, who, signedInUserId}) => {
    const words = query.trim().toLowerCase();
    const matchesText = !words || [task.title, task.description, ...task.tagNames].some((text) => text?.toLowerCase().includes(words));
    if (who === WHO.mine) {
        return matchesText && task.assigneeIds.includes(signedInUserId);
    }
    if (who === WHO.unassigned) {
        return matchesText && task.assigneeIds.length === 0;
    }
    return matchesText;
};

/**
 * Con un filtro puesto, el tablero cuenta los lugares entre las tarjetas que se ven: aquí se pasa ese lugar al de la columna
 * completa (antes de la tarjeta que se ve en ese lugar, o al final).
 */
const fullIndexOf = (tasks, visibleTasks, {cardId, toColumnId, toIndex}) => {
    const visibleInColumn = visibleTasks.filter((task) => task.columnId === toColumnId && task.id !== cardId);
    const fullColumn = tasks.filter((task) => task.columnId === toColumnId && task.id !== cardId);
    const anchor = visibleInColumn[toIndex];
    return anchor ? fullColumn.findIndex((task) => task.id === anchor.id) : fullColumn.length;
};

export const TasksPage = () => {
    // el idioma: al cambiarlo se vuelve a pedir el tablero (los nombres de las columnas llegan traducidos del servidor)
    const {t, language} = useToolkitTranslation('tasks');
    const [board, setBoard] = useState(null);
    const [query, setQuery] = useState('');
    const [who, setWho] = useState(WHO.all);
    const [editingTaskId, setEditingTaskId] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        loadTaskBoard(controller.signal).then(setBoard).catch((error) => error.name !== 'AbortError' && toastProblem(error));
        return () => controller.abort();
    }, [language]);

    // borrar y archivar no se deshacen: se confirman antes
    const deleteAction = useConfirmAction({
        run: ({subject}) => removeTask(subject.id),
        onDone: (newBoard) => {
            setBoard(newBoard);
            toastSuccess(t('deleted'));
        },
    });
    const archiveAction = useConfirmAction({
        run: () => archiveDone(),
        onDone: ({board: newBoard, archived}) => {
            setBoard(newBoard);
            toastSuccess(t('archived', {count: archived}));
        },
    });

    // cualquier cambio: se manda y se pinta el tablero como lo regresa el servidor; si dice que no, el aviso
    const apply = async (request) => {
        try {
            setBoard(await request());
        } catch (error) {
            toastProblem(error);
        }
    };

    if (!board) {
        return (
            <Stack spacing={3}>
                <PageHeading title={t('page.title')} description={t('page.description')} />
                <Skeleton variant="rounded" height={LOADING_HEIGHT_PIXELS} />
            </Stack>
        );
    }

    const filters = {query, who, signedInUserId: board.signedInUserId};
    const visibleTasks = board.tasks.filter((task) => isVisible(task, filters));
    // lo que pinta el tablero: la prioridad como la primera etiqueta (con su color) y el avance de la lista de pendientes
    const cards = visibleTasks.map((task) => ({
        ...task,
        tags: [{label: t(`priority.${task.priority}`), color: PRIORITY_COLOR[task.priority]}, ...task.tagNames],
        checklist: {done: task.checklistItems.filter((item) => item.done).length, total: task.checklistItems.length},
    }));
    const columnIndexOf = (columnId) => board.columns.findIndex((column) => column.id === columnId);

    const move = async (cardMove) => {
        const tasksBefore = board.tasks;
        const fullMove = {...cardMove, toIndex: fullIndexOf(board.tasks, visibleTasks, cardMove)};
        // se ve al instante; si el servidor dice que no, regresa
        setBoard((current) => ({...current, tasks: moveCard(current.tasks, fullMove)}));
        try {
            setBoard(await saveMove(fullMove));
        } catch (error) {
            setBoard((current) => ({...current, tasks: tasksBefore}));
            toastProblem(error);
        }
    };

    // a una columna, arriba (congelar, descongelar)
    const moveToTop = (card, toColumnId) => move({cardId: card.id, fromColumnId: card.columnId, toColumnId, toIndex: 0});

    const cardActions = (card) => {
        const isMine = card.assigneeIds.includes(board.signedInUserId);
        const nextColumn = board.columns[columnIndexOf(card.columnId) + 1];
        const isInIcebox = card.columnId === ICEBOX_COLUMN_ID;
        return [
            {key: 'edit', label: t('actions.edit'), icon: <EditOutlinedIcon fontSize="small" />, onClick: () => setEditingTaskId(card.id)},
            card.completed
                ? {key: 'reopen', label: t('actions.reopen'), icon: <ReplayRoundedIcon fontSize="small" />, onClick: () => apply(() => saveCompletion(card.id, false))}
                : {key: 'complete', label: t('actions.complete'), icon: <TaskAltRoundedIcon fontSize="small" />, color: 'success', onClick: () => apply(() => saveCompletion(card.id, true))},
            {
                key: 'assign', label: isMine ? t('actions.unassignMe') : t('actions.assignMe'),
                icon: isMine ? <PersonRemoveOutlinedIcon fontSize="small" /> : <PersonAddAlt1OutlinedIcon fontSize="small" />,
                onClick: () => apply(() => saveTask(card.id, {
                    assigneeIds: isMine ? card.assigneeIds.filter((id) => id !== board.signedInUserId) : [...card.assigneeIds, board.signedInUserId],
                })),
            },
            // congelar lo que se deja para después (y descongelarlo a «Por hacer»); lo terminado no se congela
            ...(card.completed ? [] : [isInIcebox
                ? {key: 'thaw', label: t('actions.thaw'), icon: <WbSunnyOutlinedIcon fontSize="small" />, onClick: () => moveToTop(card, TODO_COLUMN_ID)}
                : {key: 'freeze', label: t('actions.freeze'), icon: <AcUnitRoundedIcon fontSize="small" />, onClick: () => moveToTop(card, ICEBOX_COLUMN_ID)}]),
            // mover sin arrastrar: también para quien no puede arrastrar
            {
                key: 'next', label: nextColumn ? t('actions.moveTo', {column: nextColumn.title}) : t('actions.lastColumn'),
                icon: <ArrowForwardRoundedIcon fontSize="small" />, disabled: !nextColumn,
                onClick: () => move({cardId: card.id, fromColumnId: card.columnId, toColumnId: nextColumn.id, toIndex: Number.MAX_SAFE_INTEGER}),
            },
            {key: 'delete', label: t('actions.delete'), icon: <DeleteOutlineIcon fontSize="small" />, color: 'error', onClick: () => deleteAction.open(card)},
        ];
    };
    const columnActions = (column) => (column.id !== DONE_COLUMN_ID ? [] : [{
        key: 'archive', label: t('actions.archiveDone'), icon: <ArchiveOutlinedIcon fontSize="small" />,
        disabled: !board.tasks.some((task) => task.columnId === DONE_COLUMN_ID), onClick: () => archiveAction.open({}),
    }]);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.description')} />
            {/* la búsqueda sube a la barra de la app y se encoge a la lupa sin usar (en el teléfono flota arriba) */}
            <BarSearch value={query} onChange={setQuery} placeholder={t('search')} />
            <SegmentedControl ariaLabel={t('who.label')} value={who} onChange={(next) => setWho(next ?? who)}
                              options={Object.values(WHO).map((value) => ({value, label: t(`who.${value}`)}))} />
            {/* con filtro, cada columna dice cuántas tiene de verdad (count): el tope de «En proceso» se cuenta contra todas */}
            {/* el congelador se encoge y empieza encogido: ocupa una tira y se le pueden soltar tarjetas */}
            <KanbanBoard columns={board.columns.map((column) => ({
                ...column, count: board.tasks.filter((task) => task.columnId === column.id).length,
                ...(column.id === ICEBOX_COLUMN_ID && {collapsible: true, defaultCollapsed: true}),
            }))}
                         cards={cards} onMove={move} ariaLabel={t('board')}
                         onAddCard={(newCard) => apply(() => addTask(newCard))} onCardClick={setEditingTaskId}
                         cardActions={cardActions} columnActions={columnActions}
                         onCardComplete={(card, completed) => apply(() => saveCompletion(card.id, completed))} />
            <TaskDialog key={editingTaskId} task={board.tasks.find((task) => task.id === editingTaskId) ?? null} people={board.people}
                        onClose={() => setEditingTaskId(null)} onSaved={setBoard} />
            <ConfirmDialog {...deleteAction.dialogProps} tone="error" title={t('confirmDelete.title', {title: deleteAction.subject?.title ?? ''})}
                           description={t('confirmDelete.description')} confirmLabel={t('actions.delete')} cancelLabel={t('dialog.cancel')} />
            <ConfirmDialog {...archiveAction.dialogProps} title={t('confirmArchive.title')} description={t('confirmArchive.description')}
                           confirmLabel={t('actions.archiveDone')} cancelLabel={t('dialog.cancel')} />
        </Stack>
    );
};
