// El tablero de tareas: KanbanBoard de /kanban. Mover una tarjeta se ve al instante (moveCard, sin esperar al servidor) y
// se guarda; si el servidor dice que no (la columna «En proceso» tiene tope de 3), sale el aviso y la tarjeta regresa.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import {PageHeading, toastProblem, useToolkitTranslation} from '@stackcraftmx/calcita';
import {KanbanBoard, moveCard} from '@stackcraftmx/calcita/kanban';

import {loadTaskBoard, saveMove} from '@/modules/tasks/tasksApi.js';

const LOADING_HEIGHT_PIXELS = 360;

export const TasksPage = () => {
    // el idioma: al cambiarlo se vuelve a pedir el tablero (los nombres llegan traducidos del servidor)
    const {t, language} = useToolkitTranslation('tasks');
    const [board, setBoard] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        loadTaskBoard(controller.signal).then(setBoard).catch((error) => error.name !== 'AbortError' && toastProblem(error));
        return () => controller.abort();
    }, [language]);

    const move = async (cardMove) => {
        const cardsBefore = board.cards;
        // se ve al instante; si el servidor dice que no, regresa
        setBoard((current) => ({...current, cards: moveCard(current.cards, cardMove)}));
        try {
            const savedCards = await saveMove(cardMove);
            setBoard((current) => ({...current, cards: savedCards}));
        } catch (error) {
            setBoard((current) => ({...current, cards: cardsBefore}));
            toastProblem(error);
        }
    };

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.description')} />
            {board
                ? <KanbanBoard columns={board.columns} cards={board.cards} onMove={move} ariaLabel={t('board')} />
                : <Skeleton variant="rounded" height={LOADING_HEIGHT_PIXELS} />}
        </Stack>
    );
};
