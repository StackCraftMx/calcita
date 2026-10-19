// Pruebas de lo que la bandeja decide sin pintar: responder, posponer y las acciones de cada carpeta. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {COMPOSE_MODE, MAIL_ACTION, SNOOZE_OPTION, actionsOfFolder, draftForReplyOf, prefixedSubjectOf, snoozeOptionsOf} from '@/modules/mail/mailRules.js';

const ME = 'ana@ejemplo.com';
const MESSAGE = {
    id: 'c1', subject: 'Re: Entrega', from: {name: 'Luis', email: 'luis@ejemplo.com'}, to: [ME, 'irene@ejemplo.com'], cc: ['bruno@ejemplo.com', ME],
    body: 'Hola\n¿Salen el lunes?', attachments: [{name: 'pedido.pdf', size: '20 kB'}],
};
const header = (message) => `${message.from.name} escribió:`;

test('el prefijo del asunto va una sola vez', () => {
    assert.equal(prefixedSubjectOf('Re', 'Re: RE: Entrega'), 'Re: Entrega');
    assert.equal(prefixedSubjectOf('Fwd', 'Re: Entrega'), 'Fwd: Entrega');
});

test('responder: a quien lo mandó, con el mensaje citado', () => {
    const draft = draftForReplyOf(COMPOSE_MODE.reply, MESSAGE, ME, header);
    assert.equal(draft.to, 'luis@ejemplo.com');
    assert.equal(draft.cc, '');
    assert.equal(draft.conversationId, 'c1');
    assert.match(draft.body, /Luis escribió:\n> Hola\n> ¿Salen el lunes\?/);
});

test('responder a todos: los demás de Para y Cc, nunca uno mismo', () => {
    const draft = draftForReplyOf(COMPOSE_MODE.replyAll, MESSAGE, ME, header);
    assert.equal(draft.to, 'luis@ejemplo.com, irene@ejemplo.com');
    assert.equal(draft.cc, 'bruno@ejemplo.com');
});

test('reenviar: sin destinatario, con los archivos y en otra conversación', () => {
    const draft = draftForReplyOf(COMPOSE_MODE.forward, MESSAGE, ME, header);
    assert.equal(draft.to, '');
    assert.equal(draft.conversationId, undefined);
    assert.equal(draft.attachments.length, 1);
    assert.equal(draft.subject, 'Fwd: Entrega');
});

test('posponer: «más tarde hoy» solo antes de las 17 y la semana que entra cae en lunes', () => {
    const wednesdayMorning = new Date(2026, 9, 21, 10, 0);
    const morningOptions = snoozeOptionsOf(wednesdayMorning);
    assert.deepEqual(morningOptions.map((option) => option.key), [SNOOZE_OPTION.laterToday, SNOOZE_OPTION.tomorrow, SNOOZE_OPTION.nextWeek]);
    assert.equal(new Date(morningOptions[2].until).getDay(), 1);
    assert.equal(new Date(morningOptions[1].until).getHours(), 8);
    const mondayEvening = new Date(2026, 9, 19, 18, 30);
    const eveningOptions = snoozeOptionsOf(mondayEvening);
    assert.deepEqual(eveningOptions.map((option) => option.key), [SNOOZE_OPTION.tomorrow, SNOOZE_OPTION.nextWeek]);
    // un lunes, «la semana que entra» es el lunes siguiente (no hoy)
    assert.equal(new Date(eveningOptions[1].until).getDate(), 26);
});

test('las acciones de cada carpeta', () => {
    const folders = {trash: 'trash', spam: 'spam', archived: 'archived', snoozed: 'snoozed', drafts: 'drafts'};
    assert.deepEqual(actionsOfFolder('trash', folders), [MAIL_ACTION.restore, MAIL_ACTION.deleteForever]);
    assert.ok(actionsOfFolder('inbox', folders).includes(MAIL_ACTION.archive));
    assert.ok(actionsOfFolder('customers', folders).includes(MAIL_ACTION.snooze));
});
