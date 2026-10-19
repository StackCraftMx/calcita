// Las llamadas de la bandeja, con los datos ya en la forma de MessageList y MessageView (camelCase). Aquí iría axios; en los
// ejemplos van al servidor de mentira, con la misma forma.
//
// Funciones que no renderizan: function (regla de la casa).
import * as mailServer from '@/fakeServer/mailServer.js';

export const {MAIL_FOLDER, MAIL_LABELS, MAIL_ME, MAIL_PAGE_SIZE} = mailServer;

const summaryOf = (conversation) => ({
    id: conversation.id, folder: conversation.folder, from: conversation.from, subject: conversation.subject, preview: conversation.preview,
    receivedAt: conversation.received_at, isUnread: conversation.is_unread, isStarred: conversation.is_starred, hasAttachments: conversation.has_attachments,
    threadCount: conversation.thread_count, labelIds: conversation.label_ids, snoozedUntil: conversation.snoozed_until,
});

/** Una página de conversaciones de una carpeta o etiqueta, cuántas hay y cuántas sin leer en cada carpeta. */
export async function loadConversations({folder, search, page}, signal) {
    const response = await mailServer.listConversations({folder, search, page}, signal);
    return {conversations: response.conversations.map(summaryOf), total: response.total, page: response.page, pageSize: response.page_size, unreadCounts: response.unread_counts};
}

/** La conversación completa (abrirla la marca como leída): el último mensaje y los anteriores en thread. */
export async function loadConversation(conversationId, signal) {
    const response = await mailServer.getConversation(conversationId, signal);
    const messages = response.messages.map((message) => ({
        id: message.id, from: message.from, to: message.to, cc: message.cc, bcc: message.bcc, body: message.body, attachments: message.attachments,
        receivedAt: message.received_at,
    }));
    const last = messages[messages.length - 1];
    return {...summaryOf(response), ...last, id: response.id, lastMessageId: last.id, thread: messages.slice(0, -1), messages};
}

/** Cambia varias a la vez; regresa cómo estaban antes (para «Deshacer»). changes en camelCase. */
export async function changeConversations(conversationIds, changes) {
    const response = await mailServer.updateConversations(conversationIds, {
        ...('isUnread' in changes && {is_unread: changes.isUnread}),
        ...('isStarred' in changes && {is_starred: changes.isStarred}),
        ...(changes.folder && {folder: changes.folder}),
        ...(changes.snoozedUntil && {snoozed_until: changes.snoozedUntil}),
        ...(changes.labelIds && {label_ids: changes.labelIds}),
    });
    return response.before;
}

export const restoreConversations = (before) => mailServer.restoreConversations(before);
export const deleteConversations = (conversationIds) => mailServer.deleteConversations(conversationIds);
export const emptyTrash = () => mailServer.emptyTrash();
export const sendMessage = (fields) => mailServer.sendMessage(fields);
export const undoSend = (sent) => mailServer.undoSend({conversationId: sent.conversation_id, messageId: sent.message_id, undoUntil: sent.undo_until});
export const saveDraft = (fields) => mailServer.saveDraft(fields);
export const discardDraft = (draftId) => mailServer.discardDraft(draftId);
export const loadContacts = (signal) => mailServer.listContacts(signal);
