// Lo que respondería el API de la bandeja: los mensajes por carpeta (recibidos, destacados, enviados y archivados),
// leerlos, destacarlos, archivarlos, borrarlos y mandar uno nuevo. Datos de mentira y fijos, con fechas a partir de hoy.
//
// El texto de los mensajes es texto (sin HTML): uno trae HTML a propósito, para ver que se pinta como texto.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {ApiError} from '@/fakeServer/ApiError.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

/** Las carpetas, como las manda el API. */
export const MAIL_FOLDER = Object.freeze({inbox: 'inbox', starred: 'starred', sent: 'sent', archived: 'archived'});

const HTTP_STATUS = Object.freeze({unprocessable: 422});
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const PREVIEW_LENGTH = 120;
const ME = Object.freeze({name: 'Ana Martínez Ruiz', email: 'ana.martinez@ejemplo.com'});

// [horas antes de ahora, de, asunto, texto, adjuntos, sin leer, destacado]
const SAMPLE_MESSAGES = Object.freeze([
    [1, {name: 'Luis Herrera', email: 'luis.herrera@ejemplo.com'}, 'Entrega de sillas para el lunes',
        'Hola, Ana:\n\n¿Me confirma si las 12 sillas de oficina del pedido P-2375 salen el lunes? El cliente pidió que lleguen antes de las 10.\n\nGracias,\nLuis', [], true, false],
    [3, {name: 'Mónica Vega', email: 'monica.vega@ejemplo.com'}, 'Cotización de la remodelación',
        'Ana, le mando la cotización de la remodelación de San Pedro. Son tres partes: obra, mobiliario y señalización.\n\nQuedo atenta a sus comentarios.', [{name: 'cotizacion-san-pedro.pdf', size: '284 kB'}], true, true],
    [26, {name: 'Sistema de pedidos', email: 'avisos@ejemplo.com'}, 'Reporte de septiembre listo',
        'El reporte de ventas de septiembre ya está disponible en Descargas.\n\n1,382 pedidos · $8,708,227.00 · 13 cancelados.', [{name: 'ventas-septiembre.xlsx', size: '1.2 MB'}], false, false],
    [50, {name: 'Bruno Díaz', email: 'bruno.diaz@ejemplo.com'}, 'Nota con formato',
        'Le pego la nota que me llegó de la página: <b>Pedido urgente</b> <img src="x" onerror="alert(1)">\n\nSe ve tal cual, como texto: así la bandeja no corre código de nadie.', [], false, false],
    [74, {name: 'Irene Campos', email: 'irene.campos@ejemplo.com'}, 'Capacitación del equipo de Mérida',
        'La capacitación quedó para el jueves a las 9. Somos 8 personas; ¿podemos usar la sala grande?', [], false, true],
    [120, {name: 'Héctor Navarro', email: 'hector.navarro@ejemplo.com'}, 'Inventario de la bodega norte',
        'Adjunto el conteo de la bodega norte. Faltan 4 lámparas contra el sistema.', [{name: 'conteo-bodega-norte.csv', size: '18 kB'}], false, false],
]);

let messages = null;

function messagesOrSample() {
    if (!messages) {
        const now = Date.now();
        messages = SAMPLE_MESSAGES.map(([hoursAgo, from, subject, body, attachments, isUnread, isStarred], index) => ({
            id: `mail-${index + 1}`, folder: MAIL_FOLDER.inbox, from, to: [ME.email], subject, body, attachments,
            receivedAt: new Date(now - hoursAgo * MILLISECONDS_PER_HOUR).toISOString(), isUnread, isStarred,
        }));
        messages.push({
            id: 'mail-sent-1', folder: MAIL_FOLDER.sent, from: ME, to: ['monica.vega@ejemplo.com'], subject: 'Re: Cotización de la remodelación',
            body: 'Gracias, Mónica. La reviso hoy y le respondo mañana.', attachments: [],
            receivedAt: new Date(now - 2 * MILLISECONDS_PER_HOUR).toISOString(), isUnread: false, isStarred: false,
        });
    }
    return messages;
}

/** Un mensaje como lo manda el API para la lista (con el principio del texto, sin el texto completo). */
function summaryOf(message) {
    return {
        id: message.id, from: message.from, subject: message.subject, preview: message.body.replace(/\s+/g, ' ').slice(0, PREVIEW_LENGTH),
        received_at: message.receivedAt, is_unread: message.isUnread, is_starred: message.isStarred, has_attachments: message.attachments.length > 0,
    };
}

/** ¿El mensaje va en la carpeta? Destacados junta los destacados de todas. */
function isInFolder(message, folder) {
    return folder === MAIL_FOLDER.starred ? message.isStarred && message.folder !== MAIL_FOLDER.archived : message.folder === folder;
}

/**
 * GET mail?folder=&search=: los mensajes de una carpeta, del más nuevo al más viejo, y cuántos sin leer hay en cada una.
 *
 * @returns {Promise<{messages: object[], unread_counts: Record<string, number>}>}
 */
export async function listMessages({folder, search = ''}, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    const words = search.trim().toLowerCase();
    const folderMessages = messagesOrSample()
        .filter((message) => isInFolder(message, folder))
        .filter((message) => !words || `${message.from.name} ${message.subject} ${message.body}`.toLowerCase().includes(words))
        .sort((first, second) => second.receivedAt.localeCompare(first.receivedAt));
    const unreadCounts = Object.fromEntries(Object.values(MAIL_FOLDER).map((candidate) => (
        [candidate, messagesOrSample().filter((message) => isInFolder(message, candidate) && message.isUnread).length]
    )));
    return {messages: folderMessages.map(summaryOf), unread_counts: unreadCounts};
}

/** GET mail/{id}: el mensaje completo; abrirlo lo marca como leído. */
export async function getMessage(messageId, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    const message = messagesOrSample().find((candidate) => candidate.id === messageId);
    message.isUnread = false;
    return {...summaryOf(message), to: message.to, body: message.body, attachments: message.attachments};
}

/** PATCH mail/{id}: destacado, sin leer o la carpeta (archivar). */
export async function updateMessage(messageId, changes) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const message = messagesOrSample().find((candidate) => candidate.id === messageId);
    if ('is_starred' in changes) {
        message.isStarred = changes.is_starred;
    }
    if ('is_unread' in changes) {
        message.isUnread = changes.is_unread;
    }
    if ('folder' in changes) {
        message.folder = changes.folder;
    }
    return summaryOf(message);
}

/** DELETE mail/{id}. */
export async function deleteMessage(messageId) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    messages = messagesOrSample().filter((message) => message.id !== messageId);
    return {message: serverTextOf('mail.deleted')};
}

/** POST mail: manda un mensaje (va a Enviados). */
export async function sendMessage({to, subject, body}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const errors = {};
    if (!EMAIL_PATTERN.test(to?.trim() ?? '')) {
        errors.to = [serverTextOf('mail.toInvalid')];
    }
    if (!subject?.trim()) {
        errors.subject = [serverTextOf('mail.subjectRequired')];
    }
    if (Object.keys(errors).length > 0) {
        throw new ApiError({status: HTTP_STATUS.unprocessable, problem: {title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors}});
    }
    messagesOrSample().push({
        id: `mail-${Date.now()}`, folder: MAIL_FOLDER.sent, from: ME, to: [to.trim()], subject: subject.trim(), body: body ?? '', attachments: [],
        receivedAt: new Date().toISOString(), isUnread: false, isStarred: false,
    });
    return {message: serverTextOf('mail.sent', {to: to.trim()})};
}
