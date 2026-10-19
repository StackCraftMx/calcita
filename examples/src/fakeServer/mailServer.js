// Lo que respondería el API de una bandeja tipo Gmail: conversaciones (cada una con sus mensajes, del más viejo al más
// nuevo) en carpetas (recibidos, pospuestos, borradores, archivados, spam, papelera; destacados y enviados se calculan) y con
// etiquetas. Lista por páginas con búsqueda, abrir (marca como leída), cambiar varias a la vez (leída, destacada, carpeta,
// etiquetas, posponer), borrar (a la papelera; desde ahí, para siempre), vaciar la papelera, mandar (nueva o respuesta),
// deshacer el envío y guardar o tirar borradores. Datos de mentira y fijos (sin azar), con fechas a partir de ahora.
//
// El texto de los mensajes es texto (sin HTML): uno trae HTML a propósito, para ver que se pinta como texto.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {ApiError} from '@/fakeServer/ApiError.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

/** Las carpetas, como las manda el API. starred y sent no se guardan: se calculan (como Gmail). */
export const MAIL_FOLDER = Object.freeze({
    inbox: 'inbox', starred: 'starred', snoozed: 'snoozed', sent: 'sent', drafts: 'drafts', archived: 'archived', spam: 'spam', trash: 'trash',
});
/** Las etiquetas del equipo, con su color del tema. */
export const MAIL_LABELS = Object.freeze([
    {id: 'customers', color: 'info'}, {id: 'suppliers', color: 'success'}, {id: 'team', color: 'secondary'}, {id: 'urgent', color: 'error'},
]);
/** Cuántas conversaciones trae cada página. */
export const MAIL_PAGE_SIZE = 15;

const HTTP_STATUS = Object.freeze({notFound: 404, conflict: 409, unprocessable: 422});
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const PREVIEW_LENGTH = 120;
// lo que dura «Deshacer» después de mandar (Gmail deja de 5 a 30 segundos)
const UNDO_SEND_MILLISECONDS = 10_000;
const ME = Object.freeze({name: 'Ana Martínez Ruiz', email: 'ana.martinez@ejemplo.com'});
// las carpetas donde vive una conversación (las calculadas no van aquí)
const STORED_FOLDERS = Object.freeze([MAIL_FOLDER.inbox, MAIL_FOLDER.snoozed, MAIL_FOLDER.drafts, MAIL_FOLDER.archived, MAIL_FOLDER.spam, MAIL_FOLDER.trash]);

const PEOPLE = Object.freeze({
    luis: {name: 'Luis Herrera', email: 'luis.herrera@ejemplo.com'}, monica: {name: 'Mónica Vega', email: 'monica.vega@ejemplo.com'},
    system: {name: 'Sistema de pedidos', email: 'avisos@ejemplo.com'}, bruno: {name: 'Bruno Díaz', email: 'bruno.diaz@ejemplo.com'},
    irene: {name: 'Irene Campos', email: 'irene.campos@ejemplo.com'}, hector: {name: 'Héctor Navarro', email: 'hector.navarro@ejemplo.com'},
    gabriela: {name: 'Gabriela Soto', email: 'gabriela.soto@ejemplo.com'}, promo: {name: 'Ofertas Increíbles', email: 'ofertas@promo.example.com'},
});

// las conversaciones de ejemplo: [horas antes de ahora del último mensaje, carpeta, etiquetas, sin leer, destacada, asunto,
// mensajes como [quién, horas antes del último, texto, adjuntos]]
const SAMPLE_CONVERSATIONS = Object.freeze([
    [1, MAIL_FOLDER.inbox, ['customers', 'urgent'], true, false, 'Entrega de sillas para el lunes', [
        [PEOPLE.luis, 26, 'Hola, Ana:\n\n¿Me confirma si las 12 sillas de oficina del pedido P-2375 salen el lunes? El cliente pidió que lleguen antes de las 10.\n\nGracias,\nLuis', []],
        [ME, 24, 'Hola, Luis. Sí salen el lunes temprano; le confirmo la hora mañana.', []],
        [PEOPLE.luis, 0, 'Perfecto. El cliente pregunta si pueden subirlas al tercer piso.', []],
    ]],
    [3, MAIL_FOLDER.inbox, ['suppliers'], true, true, 'Cotización de la remodelación', [
        [PEOPLE.monica, 0, 'Ana, le mando la cotización de la remodelación de San Pedro. Son tres partes: obra, mobiliario y señalización.\n\nQuedo atenta a sus comentarios.', [{name: 'cotizacion-san-pedro.pdf', size: '284 kB'}]],
    ]],
    [26, MAIL_FOLDER.inbox, [], false, false, 'Reporte de septiembre listo', [
        [PEOPLE.system, 0, 'El reporte de ventas de septiembre ya está disponible en Descargas.\n\n1,382 pedidos · $8,708,227.00 · 13 cancelados.', [{name: 'ventas-septiembre.xlsx', size: '1.2 MB'}]],
    ]],
    [50, MAIL_FOLDER.inbox, ['customers'], false, false, 'Nota con formato', [
        [PEOPLE.bruno, 0, 'Le pego la nota que me llegó de la página: <b>Pedido urgente</b> <img src="x" onerror="alert(1)">\n\nSe ve tal cual, como texto: así la bandeja no corre código de nadie.', []],
    ]],
    [74, MAIL_FOLDER.inbox, ['team'], false, true, 'Capacitación del equipo de Mérida', [
        [PEOPLE.irene, 3, 'La capacitación quedó para el jueves a las 9. Somos 8 personas; ¿podemos usar la sala grande?', []],
        [ME, 2, 'Sí, la sala grande está libre. ¿Necesitan proyector?', []],
        [PEOPLE.irene, 0, 'Sí, por favor, y café para 8.', []],
    ]],
    [120, MAIL_FOLDER.inbox, ['suppliers'], false, false, 'Inventario de la bodega norte', [
        [PEOPLE.hector, 0, 'Adjunto el conteo de la bodega norte. Faltan 4 lámparas contra el sistema.', [{name: 'conteo-bodega-norte.csv', size: '18 kB'}]],
    ]],
    [6, MAIL_FOLDER.snoozed, ['customers'], false, false, 'Renovación del contrato de mantenimiento', [
        [PEOPLE.gabriela, 0, 'Ana, el contrato vence a fin de mes. ¿Lo renovamos igual o revisamos precios?', []],
    ]],
    [30, MAIL_FOLDER.archived, ['team'], false, false, 'Vacaciones de diciembre', [
        [PEOPLE.irene, 0, 'Les recuerdo mandar sus fechas de vacaciones de diciembre antes del 15 de noviembre.', []],
    ]],
    [8, MAIL_FOLDER.spam, [], true, false, '¡Gane un viaje con su compra!', [
        [PEOPLE.promo, 0, 'Felicidades, fue seleccionado. Dé clic aquí para reclamar su premio.', []],
    ]],
    [200, MAIL_FOLDER.trash, [], false, false, 'Cambio de horario de la bodega', [
        [PEOPLE.hector, 0, 'A partir del lunes la bodega abre a las 8.', []],
    ]],
]);
// avisos del sistema para llenar más de una página (y ver la paginación): uno por día hacia atrás, sin azar
const DAILY_NOTICE_COUNT = 24;
const DAILY_NOTICE_FIRST_HOURS = 140;
const HOURS_PER_DAY = 24;

let conversations = null;
let nextNumber = 1000;

/** Un mensaje de una conversación, con su fecha a partir de ahora. */
function messageOf([from, hoursBefore, body, attachments], lastHoursAgo, now, conversationId, index) {
    return {
        id: `${conversationId}-m${index + 1}`, from, to: from.email === ME.email ? [PEOPLE.luis.email] : [ME.email], cc: [], body, attachments,
        receivedAt: new Date(now - (lastHoursAgo + hoursBefore) * MILLISECONDS_PER_HOUR).toISOString(),
    };
}

function conversationsOrSample() {
    if (!conversations) {
        const now = Date.now();
        conversations = SAMPLE_CONVERSATIONS.map(([hoursAgo, folder, labelIds, isUnread, isStarred, subject, sampleMessages], index) => {
            const id = `conversation-${index + 1}`;
            return {
                id, folder, labelIds: [...labelIds], isUnread, isStarred, subject, snoozedUntil: null,
                messages: sampleMessages.map((sample, position) => messageOf(sample, hoursAgo, now, id, position)),
            };
        });
        for (let day = 0; day < DAILY_NOTICE_COUNT; day += 1) {
            const id = `notice-${day + 1}`;
            conversations.push({
                id, folder: MAIL_FOLDER.inbox, labelIds: [], isUnread: false, isStarred: false, subject: `Resumen diario de pedidos #${DAILY_NOTICE_COUNT - day}`, snoozedUntil: null,
                messages: [messageOf([PEOPLE.system, 0, `Pedidos del día: ${40 + ((day * 7) % 23)}. Entregados: ${30 + ((day * 5) % 17)}. Sin novedades.`, []],
                    DAILY_NOTICE_FIRST_HOURS + day * HOURS_PER_DAY, now, id, 0)],
            });
        }
    }
    return conversations;
}

const lastMessageOf = (conversation) => conversation.messages[conversation.messages.length - 1];
const isSentByMe = (conversation) => conversation.messages.some((message) => message.from.email === ME.email);

/** ¿La conversación va en la carpeta o etiqueta? Destacados y Enviados se calculan; papelera y spam no salen en las demás. */
function isInFolder(conversation, folder) {
    const isAway = [MAIL_FOLDER.trash, MAIL_FOLDER.spam].includes(conversation.folder);
    if (folder === MAIL_FOLDER.starred) {
        return conversation.isStarred && !isAway;
    }
    if (folder === MAIL_FOLDER.sent) {
        return isSentByMe(conversation) && !isAway && conversation.folder !== MAIL_FOLDER.drafts;
    }
    if (MAIL_LABELS.some((label) => label.id === folder)) {
        return conversation.labelIds.includes(folder) && !isAway;
    }
    return conversation.folder === folder;
}

/** Una conversación como la manda el API para la lista: su último mensaje, cuántos trae y el principio del texto. */
function summaryOf(conversation) {
    const last = lastMessageOf(conversation);
    const otherPeople = [...new Set(conversation.messages.map((message) => message.from.name))];
    return {
        id: conversation.id, folder: conversation.folder, subject: conversation.subject, from: last.from, participants: otherPeople,
        preview: last.body.replace(/\s+/g, ' ').slice(0, PREVIEW_LENGTH), received_at: last.receivedAt, is_unread: conversation.isUnread,
        is_starred: conversation.isStarred, has_attachments: conversation.messages.some((message) => message.attachments.length > 0),
        thread_count: conversation.messages.length, label_ids: [...conversation.labelIds], snoozed_until: conversation.snoozedUntil,
    };
}

function findOrFail(conversationId) {
    const conversation = conversationsOrSample().find((candidate) => candidate.id === conversationId);
    if (!conversation) {
        throw new ApiError({status: HTTP_STATUS.notFound, problem: {title: serverTextOf('mail.notFoundTitle'), detail: serverTextOf('mail.notFound')}});
    }
    return conversation;
}

/**
 * GET mail?folder=&search=&page=: las conversaciones de una carpeta o etiqueta, de la más nueva a la más vieja, por páginas,
 * y cuántas sin leer hay en cada carpeta y etiqueta.
 */
export async function listConversations({folder, search = '', page = 1}, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    const words = search.trim().toLowerCase();
    const found = conversationsOrSample()
        .filter((conversation) => isInFolder(conversation, folder))
        .filter((conversation) => !words || `${conversation.subject} ${conversation.messages.map((message) => `${message.from.name} ${message.body}`).join(' ')}`.toLowerCase().includes(words))
        .sort((first, second) => lastMessageOf(second).receivedAt.localeCompare(lastMessageOf(first).receivedAt));
    const ids = [...Object.values(MAIL_FOLDER), ...MAIL_LABELS.map((label) => label.id)];
    const unreadCounts = Object.fromEntries(ids.map((id) => [id, conversationsOrSample().filter((conversation) => isInFolder(conversation, id) && conversation.isUnread).length]));
    // borradores: Gmail cuenta cuántos hay, no cuántos sin leer
    unreadCounts[MAIL_FOLDER.drafts] = conversationsOrSample().filter((conversation) => conversation.folder === MAIL_FOLDER.drafts).length;
    const start = (page - 1) * MAIL_PAGE_SIZE;
    return {
        conversations: found.slice(start, start + MAIL_PAGE_SIZE).map(summaryOf), total: found.length, page, page_size: MAIL_PAGE_SIZE, unread_counts: unreadCounts,
    };
}

/** GET mail/{id}: la conversación completa; abrirla la marca como leída. */
export async function getConversation(conversationId, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    const conversation = findOrFail(conversationId);
    conversation.isUnread = false;
    return {...summaryOf(conversation), messages: conversation.messages.map((message) => ({...message, received_at: message.receivedAt}))};
}

/**
 * PATCH mail: cambia varias a la vez. changes: is_unread, is_starred, folder, add_label_ids, remove_label_ids, snoozed_until
 * (posponer: se van a «Pospuestos» hasta esa fecha). Regresa cómo estaban antes, para «Deshacer».
 */
export async function updateConversations(conversationIds, changes) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    if (changes.folder && !STORED_FOLDERS.includes(changes.folder)) {
        throw new ApiError({status: HTTP_STATUS.unprocessable, problem: {title: serverTextOf('validation.title'), detail: serverTextOf('mail.folderInvalid')}});
    }
    const before = conversationIds.map((conversationId) => {
        const conversation = findOrFail(conversationId);
        const previous = {id: conversation.id, is_unread: conversation.isUnread, is_starred: conversation.isStarred, folder: conversation.folder,
            label_ids: [...conversation.labelIds], snoozed_until: conversation.snoozedUntil};
        if ('is_unread' in changes) {
            conversation.isUnread = changes.is_unread;
        }
        if ('is_starred' in changes) {
            conversation.isStarred = changes.is_starred;
        }
        if (changes.folder) {
            conversation.folder = changes.folder;
            conversation.snoozedUntil = null;
        }
        if (changes.snoozed_until) {
            conversation.folder = MAIL_FOLDER.snoozed;
            conversation.snoozedUntil = changes.snoozed_until;
        }
        if (changes.label_ids) {
            conversation.labelIds = [...changes.label_ids];
        }
        conversation.labelIds = [...new Set([...conversation.labelIds, ...(changes.add_label_ids ?? [])])]
            .filter((labelId) => !(changes.remove_label_ids ?? []).includes(labelId));
        return previous;
    });
    return {updated: before.length, before};
}

/** PUT mail/restore: regresa cada conversación a como estaba (lo que dio updateConversations en before). */
export async function restoreConversations(before) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    before.forEach((previous) => {
        const conversation = findOrFail(previous.id);
        Object.assign(conversation, {isUnread: previous.is_unread, isStarred: previous.is_starred, folder: previous.folder,
            labelIds: [...previous.label_ids], snoozedUntil: previous.snoozed_until});
    });
    return {restored: before.length};
}

/** DELETE mail: a la papelera; las que ya estaban en la papelera se borran para siempre. */
export async function deleteConversations(conversationIds) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const inTrash = conversationsOrSample().filter((conversation) => conversationIds.includes(conversation.id) && conversation.folder === MAIL_FOLDER.trash);
    const before = [];
    conversationsOrSample().forEach((conversation) => {
        if (conversationIds.includes(conversation.id) && conversation.folder !== MAIL_FOLDER.trash) {
            before.push({id: conversation.id, is_unread: conversation.isUnread, is_starred: conversation.isStarred, folder: conversation.folder,
                label_ids: [...conversation.labelIds], snoozed_until: conversation.snoozedUntil});
            conversation.folder = MAIL_FOLDER.trash;
        }
    });
    conversations = conversationsOrSample().filter((conversation) => !inTrash.includes(conversation));
    return {moved_to_trash: before.length, deleted_forever: inTrash.length, before};
}

/** DELETE mail/trash: vacía la papelera. */
export async function emptyTrash() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const count = conversationsOrSample().filter((conversation) => conversation.folder === MAIL_FOLDER.trash).length;
    conversations = conversationsOrSample().filter((conversation) => conversation.folder !== MAIL_FOLDER.trash);
    return {deleted_forever: count};
}

/** Las direcciones de un campo «Para» o «Cc» (separadas por coma o punto y coma). */
function addressesOf(text) {
    return (text ?? '').split(/[,;]/).map((address) => address.trim()).filter(Boolean);
}

/** Los errores de cada campo de un mensaje, como un 422 de Laravel. */
function failIfInvalidMessage({to, cc, bcc, subject}) {
    const errors = {};
    const toAddresses = addressesOf(to);
    if (toAddresses.length === 0 || toAddresses.some((address) => !EMAIL_PATTERN.test(address))) {
        errors.to = [serverTextOf('mail.toInvalid')];
    }
    if (addressesOf(cc).some((address) => !EMAIL_PATTERN.test(address))) {
        errors.cc = [serverTextOf('mail.ccInvalid')];
    }
    if (addressesOf(bcc).some((address) => !EMAIL_PATTERN.test(address))) {
        errors.bcc = [serverTextOf('mail.ccInvalid')];
    }
    if (!subject?.trim()) {
        errors.subject = [serverTextOf('mail.subjectRequired')];
    }
    if (Object.keys(errors).length > 0) {
        throw new ApiError({status: HTTP_STATUS.unprocessable, problem: {status: HTTP_STATUS.unprocessable, title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors}});
    }
}

/**
 * POST mail: manda un mensaje. Con conversation_id es una respuesta (se suma a esa conversación); sin él, una conversación
 * nueva. Con draft_id, el borrador se va. Se puede deshacer unos segundos (undoSend).
 */
export async function sendMessage({conversationId, draftId, to, cc, bcc, subject, body, attachments = []}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    failIfInvalidMessage({to, cc, bcc, subject});
    const message = {
        id: `message-${nextNumber++}`, from: ME, to: addressesOf(to), cc: addressesOf(cc), body: body ?? '', receivedAt: new Date().toISOString(),
        attachments: attachments.map((attachment) => ({name: attachment.name, size: attachment.size})),
    };
    let conversation = conversationId ? findOrFail(conversationId) : null;
    if (conversation) {
        conversation.messages.push(message);
    } else {
        conversation = {id: `conversation-${nextNumber++}`, folder: MAIL_FOLDER.archived, labelIds: [], isUnread: false, isStarred: false, subject: subject.trim(), snoozedUntil: null, messages: [message]};
        conversationsOrSample().push(conversation);
    }
    if (draftId) {
        conversations = conversationsOrSample().filter((candidate) => candidate.id !== draftId);
    }
    return {
        conversation_id: conversation.id, message_id: message.id, undo_until: new Date(Date.now() + UNDO_SEND_MILLISECONDS).toISOString(),
        message: serverTextOf('mail.sent', {to: addressesOf(to).join(', ')}),
    };
}

/** POST mail/{conversation}/messages/{message}/undo: quita lo que se acaba de mandar (si no pasó el tiempo, 409). */
export async function undoSend({conversationId, messageId, undoUntil}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    if (Date.now() > new Date(undoUntil).getTime()) {
        throw new ApiError({status: HTTP_STATUS.conflict, problem: {code: 'too_late', title: serverTextOf('mail.undoTooLateTitle'), detail: serverTextOf('mail.undoTooLate')}});
    }
    const conversation = findOrFail(conversationId);
    conversation.messages = conversation.messages.filter((message) => message.id !== messageId);
    if (conversation.messages.length === 0) {
        conversations = conversationsOrSample().filter((candidate) => candidate.id !== conversationId);
    }
    return {message: serverTextOf('mail.undone')};
}

/** PUT mail/drafts/{id}: guarda (o crea) un borrador. Sin validar: un borrador puede ir a medias. */
export async function saveDraft({draftId, to, cc, bcc, subject, body}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const message = {
        id: `${draftId ?? 'draft'}-m1`, from: ME, to: addressesOf(to), cc: addressesOf(cc), bcc: addressesOf(bcc), body: body ?? '',
        receivedAt: new Date().toISOString(), attachments: [],
    };
    let draft = draftId ? conversationsOrSample().find((candidate) => candidate.id === draftId) : null;
    if (draft) {
        Object.assign(draft, {subject: subject?.trim() ?? '', messages: [message]});
    } else {
        draft = {id: `draft-${nextNumber++}`, folder: MAIL_FOLDER.drafts, labelIds: [], isUnread: false, isStarred: false, subject: subject?.trim() ?? '', snoozedUntil: null, messages: [message]};
        conversationsOrSample().push(draft);
    }
    return {draft_id: draft.id, message: serverTextOf('mail.draftSaved')};
}

/** DELETE mail/drafts/{id}: tira el borrador. */
export async function discardDraft(draftId) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    conversations = conversationsOrSample().filter((candidate) => candidate.id !== draftId);
    return {message: serverTextOf('mail.draftDiscarded')};
}

/** GET mail/contacts: a quién se le ha escrito (para sugerir en «Para»). */
export async function listContacts(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return Object.values(PEOPLE).filter((person) => person !== PEOPLE.promo);
}

/** La persona que tiene la sesión (para «Responder a todos» sin escribirse a sí misma). */
export const MAIL_ME = ME;
