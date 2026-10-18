// Las llamadas de la bandeja, con los datos ya en la forma de MessageList y MessageView (camelCase).
//
// Funciones que no renderizan: function (regla de la casa).
import * as mailServer from '@/fakeServer/mailServer.js';

export const {MAIL_FOLDER} = mailServer;

const summaryOf = (message) => ({
    id: message.id, from: message.from, subject: message.subject, preview: message.preview, receivedAt: message.received_at,
    isUnread: message.is_unread, isStarred: message.is_starred, hasAttachments: message.has_attachments,
});

/** Los mensajes de una carpeta y cuántos sin leer hay en cada una. */
export async function loadMessages({folder, search}, signal) {
    const response = await mailServer.listMessages({folder, search}, signal);
    return {messages: response.messages.map(summaryOf), unreadCounts: response.unread_counts};
}

/** El mensaje completo (abrirlo lo marca como leído). */
export async function loadMessage(messageId, signal) {
    const message = await mailServer.getMessage(messageId, signal);
    return {...summaryOf(message), to: message.to, body: message.body, attachments: message.attachments};
}

export const toggleStar = (message) => mailServer.updateMessage(message.id, {is_starred: !message.isStarred});
export const markUnread = (messageId) => mailServer.updateMessage(messageId, {is_unread: true});
export const archiveMessage = (messageId) => mailServer.updateMessage(messageId, {folder: MAIL_FOLDER.archived});
export const {deleteMessage, sendMessage} = mailServer;
