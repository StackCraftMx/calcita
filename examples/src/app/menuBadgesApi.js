// Lo que pide la app al servidor para los badges del menú (GET /users/badges): el marco los pinta por su badgeKey.
import {getMenuBadges} from '@/fakeServer/ordersServer.js';

/**
 * @returns {Promise<{badges: Array<{badgeKey: string, count: number}>}>}
 */
export function fetchMenuBadges() {
    return getMenuBadges();
}
