// A quiénes se puede invitar a una cita: el equipo de la tienda. Aquí iría axios; en los ejemplos, el servidor de mentira.
//
// Funciones que no renderizan: function (regla de la casa).
import {fakeUsers} from '@/fakeServer/fakeAccounts.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';

/** GET team/people: el id y el nombre de cada quien. */
export async function loadPeople(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return fakeUsers.map((user) => ({id: user.id, name: user.name}));
}
