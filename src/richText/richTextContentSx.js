// Cómo se ve el texto con formato, dentro del editor y en la vista de solo lectura: párrafos, títulos, listas, cita, código y
// ligas con los colores y la tipografía del tema. Uno solo para los dos: lo que se escribe se ve igual a como se guarda.
//
// Genérico del paquete: function (regla de la casa).

/**
 * El sx del contenido (.tiptap es la caja que edita Tiptap; en la vista es la misma, sin editar).
 *
 * @param {object} theme
 * @returns {object}
 */
export function richTextContentSxOf(theme) {
    const palette = (theme.vars ?? theme).palette;
    return {
        '& .tiptap': {
            outline: 'none',
            ...theme.typography.body1,
            '& > :first-of-type': {mt: 0},
            '& > :last-child': {mb: 0},
            '& p': {my: 1},
            '& h2': {...theme.typography.h6, mt: 2, mb: 1},
            '& h3': {...theme.typography.subtitle1, fontWeight: 600, mt: 1.5, mb: 0.5},
            '& ul, & ol': {pl: 3, my: 1},
            '& li > p': {my: 0.25},
            '& blockquote': {borderLeft: 3, borderColor: 'divider', pl: 2, ml: 0, my: 1.5, color: 'text.secondary'},
            '& pre': {
                bgcolor: 'action.hover', borderRadius: 1, px: 2, py: 1.5, my: 1.5, overflowX: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.875em',
            },
            '& code': {fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.9em', bgcolor: 'action.hover', borderRadius: 0.5, px: 0.5},
            '& pre code': {bgcolor: 'transparent', p: 0},
            '& a': {color: palette.primary.main, textDecorationThickness: 1},
            // el texto de ejemplo con el editor vacío (Placeholder de Tiptap)
            '& p.is-editor-empty:first-of-type::before': {
                content: 'attr(data-placeholder)', color: 'text.disabled', float: 'left', height: 0, pointerEvents: 'none',
            },
        },
    };
}
