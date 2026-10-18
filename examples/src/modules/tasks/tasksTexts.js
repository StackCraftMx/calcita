// Los textos del ejemplo del tablero de tareas (namespace tasks).
export const tasksTexts = {
    es: {
        tasks: {
            menu: {label: 'Tareas', description: 'Un tablero kanban: arrastre las tarjetas entre columnas, también con el teclado.'},
            page: {
                title: 'Tareas del equipo',
                description: 'Arrastre una tarjeta a otra columna con el ratón, el dedo o el teclado (espacio, flechas y espacio). «En proceso» tiene tope de 3: si lo pasa, el servidor dice que no y la tarjeta regresa.',
            },
            board: 'Tablero de tareas',
        },
    },
    en: {
        tasks: {
            menu: {label: 'Tasks', description: 'A kanban board: drag the cards between columns, also with the keyboard.'},
            page: {
                title: 'Team tasks',
                description: 'Drag a card to another column with the mouse, your finger or the keyboard (space, arrows and space). “In progress” has a limit of 3: if you go over it, the server says no and the card goes back.',
            },
            board: 'Task board',
        },
    },
};
