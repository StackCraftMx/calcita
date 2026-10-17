// Cómo se pinta el punto de un evento en GroupedTimeline, según el énfasis de su grupo y el tono del evento.
//
// Funciones puras (no renderizan): function (regla de la casa). Se prueban sin navegador (timelineDot.test.js).

/** Énfasis de un grupo de la línea de tiempo. */
export const TIMELINE_EMPHASIS = Object.freeze({
    // el grupo que importa ahora (p. ej. el intento vigente): recuadro, puntos llenos con el color de su tono
    highlighted: 'highlighted',
    // un grupo sin resaltar: puntos llenos con el color de su tono
    normal: 'normal',
    // un grupo que ya pasó: puntos con contorno gris, para que el ojo se vaya al resaltado
    muted: 'muted',
});

// los colores que acepta TimelineDot de @mui/lab
const DOT_COLORS = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'grey'];

/**
 * Variante y color del punto de un evento.
 *
 * @param {{emphasis?: string, tone?: string}} dotOptions énfasis del grupo y tono del evento (success, warning, error...)
 * @returns {{variant: 'filled'|'outlined', color: string}} props de TimelineDot; un tono desconocido sale en gris
 */
export function timelineDotOf({emphasis, tone} = {}) {
    if (emphasis === TIMELINE_EMPHASIS.muted) {
        return {variant: 'outlined', color: 'grey'};
    }

    return {variant: 'filled', color: DOT_COLORS.includes(tone) ? tone : 'grey'};
}
