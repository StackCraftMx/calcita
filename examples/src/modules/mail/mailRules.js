// Lo que la bandeja decide sin pintar nada: qué llega ya puesto al responder, responder a todos o reenviar (con el mensaje
// citado como Gmail), hasta cuándo se pospone una conversación y qué acciones tiene cada carpeta. Funciones puras: se prueban
// sin navegador (mailRules.test.js).
//
// Funciones puras, no renderizan: function (regla de la casa).

/** Cómo se redacta: nuevo, respuesta, respuesta a todos o reenvío (también es la llave del título de la ventana). */
export const COMPOSE_MODE = Object.freeze({new: 'new', reply: 'reply', replyAll: 'replyAll', forward: 'forward'});

/** Hasta cuándo se pospone: más tarde hoy (si aún es temprano), mañana o la semana que entra, siempre a una hora fija. */
export const SNOOZE_OPTION = Object.freeze({laterToday: 'laterToday', tomorrow: 'tomorrow', nextWeek: 'nextWeek'});

// «más tarde hoy» es a las 18; después de las 17 ya no se ofrece (quedaría en menos de una hora)
const LATER_TODAY_HOUR = 18;
const LAST_HOUR_FOR_LATER_TODAY = 17;
// mañana y la semana que entra, a primera hora
const MORNING_HOUR = 8;
const MONDAY = 1;
const DAYS_PER_WEEK = 7;
const REPLY_PREFIX = /^(re|rv|fwd?):\s*/i;

/**
 * El asunto con su prefijo («Re: », «Fwd: ») una sola vez: responder a una respuesta no lo repite.
 *
 * @param {string} prefix «Re» o «Fwd»
 * @param {string} subject
 * @returns {string}
 */
export function prefixedSubjectOf(prefix, subject) {
    let clean = subject;
    while (REPLY_PREFIX.test(clean)) {
        clean = clean.replace(REPLY_PREFIX, '');
    }
    return `${prefix}: ${clean}`;
}

/**
 * Lo que llega ya puesto al responder, responder a todos o reenviar el último mensaje de una conversación.
 *   - responder: a quien lo mandó;
 *   - a todos: a quien lo mandó y a los demás de «Para», con copia a los de «Cc», nunca a uno mismo;
 *   - reenviar: sin destinatario, con los archivos y el mensaje completo abajo.
 *
 * @param {COMPOSE_MODE[keyof COMPOSE_MODE]} mode
 * @param {{id: string, subject: string, from: {name: string, email: string}, to?: string[], cc?: string[], body: string, attachments?: object[]}} message
 * @param {string} myEmail el correo de quien responde
 * @param {(entry: {name: string, email: string, body: string}) => string} quoteHeaderOf el renglón traducido de arriba de la cita
 *     («El 18 oct 2026, Luis <luis@…> escribió:» o el encabezado del reenvío)
 * @returns {{mode: string, conversationId?: string, to: string, cc: string, subject: string, body: string, attachments: object[]}}
 */
export function draftForReplyOf(mode, message, myEmail, quoteHeaderOf) {
    const isNotMe = (address) => address.toLowerCase() !== myEmail.toLowerCase();
    if (mode === COMPOSE_MODE.forward) {
        return {
            mode, to: '', cc: '', subject: prefixedSubjectOf('Fwd', message.subject), attachments: [...(message.attachments ?? [])],
            body: `\n\n${quoteHeaderOf(message)}\n\n${message.body}`,
        };
    }
    const quoted = message.body.split('\n').map((line) => `> ${line}`).join('\n');
    const to = mode === COMPOSE_MODE.replyAll
        ? [message.from.email, ...(message.to ?? [])].filter(isNotMe)
        : [message.from.email].filter(isNotMe);
    return {
        mode, conversationId: message.id, to: [...new Set(to)].join(', '), cc: mode === COMPOSE_MODE.replyAll ? (message.cc ?? []).filter(isNotMe).join(', ') : '',
        subject: prefixedSubjectOf('Re', message.subject), attachments: [], body: `\n\n${quoteHeaderOf(message)}\n${quoted}`,
    };
}

/**
 * Las opciones de posponer a partir de ahora, cada una con su fecha y hora en texto ISO. «Más tarde hoy» solo antes de las 17.
 *
 * @param {Date} now
 * @returns {Array<{key: string, until: string}>}
 */
export function snoozeOptionsOf(now) {
    const at = (daysAhead, hour) => {
        const date = new Date(now);
        date.setDate(date.getDate() + daysAhead);
        date.setHours(hour, 0, 0, 0);
        return date.toISOString();
    };
    const daysToMonday = ((MONDAY - now.getDay() + DAYS_PER_WEEK) % DAYS_PER_WEEK) || DAYS_PER_WEEK;
    return [
        ...(now.getHours() < LAST_HOUR_FOR_LATER_TODAY ? [{key: SNOOZE_OPTION.laterToday, until: at(0, LATER_TODAY_HOUR)}] : []),
        {key: SNOOZE_OPTION.tomorrow, until: at(1, MORNING_HOUR)},
        {key: SNOOZE_OPTION.nextWeek, until: at(daysToMonday, MORNING_HOUR)},
    ];
}

/** Lo que se le puede hacer a una conversación según la carpeta donde está (las llaves de los textos mail.actions.*). */
export const MAIL_ACTION = Object.freeze({
    archive: 'archive', moveToInbox: 'moveToInbox', markRead: 'markRead', markUnread: 'markUnread', snooze: 'snooze', spam: 'spam',
    notSpam: 'notSpam', delete: 'delete', deleteForever: 'deleteForever', restore: 'restore', unsnooze: 'unsnooze',
});

/**
 * Las acciones de cada carpeta, como Gmail: en la papelera se recupera o se borra para siempre; en spam, «No es spam»; lo
 * archivado regresa a Recibidos; lo pospuesto se puede quitar de pospuestos. Las etiquetas, destacados y enviados se portan
 * como Recibidos.
 *
 * @param {string} folder MAIL_FOLDER o el id de una etiqueta
 * @param {Record<string, string>} folders MAIL_FOLDER
 * @returns {string[]} llaves de MAIL_ACTION, en orden
 */
export function actionsOfFolder(folder, folders) {
    if (folder === folders.trash) {
        return [MAIL_ACTION.restore, MAIL_ACTION.deleteForever];
    }
    if (folder === folders.spam) {
        return [MAIL_ACTION.notSpam, MAIL_ACTION.deleteForever];
    }
    if (folder === folders.archived) {
        return [MAIL_ACTION.moveToInbox, MAIL_ACTION.markRead, MAIL_ACTION.markUnread, MAIL_ACTION.delete];
    }
    if (folder === folders.snoozed) {
        return [MAIL_ACTION.unsnooze, MAIL_ACTION.markRead, MAIL_ACTION.markUnread, MAIL_ACTION.delete];
    }
    if (folder === folders.drafts) {
        return [MAIL_ACTION.delete];
    }
    return [MAIL_ACTION.archive, MAIL_ACTION.markRead, MAIL_ACTION.markUnread, MAIL_ACTION.snooze, MAIL_ACTION.spam, MAIL_ACTION.delete];
}
