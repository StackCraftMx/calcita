// El asterisco de lo obligatorio en la etiqueta de un campo, compartido por FieldFrame (la etiqueta de arriba) y FormRow (el
// renglón del formulario agrupado).
//
// OJO, por qué va en el estilo (::after) y no como texto dentro de la etiqueta: el texto de la etiqueta es como las pruebas
// y los lectores encuentran el campo. Con «Nombre*» dentro, getByLabel('Nombre', {exact: true}) de Playwright y
// getByLabelText('Nombre') de Testing Library dejaban de encontrarlo: subir de versión
// rompía las pruebas de cualquier proyecto que ya usaba required. En ::after el texto sigue igual, y con «/ ""» el lector de
// pantalla no dice «asterisco» (el campo ya dice que es obligatorio con required o aria-required). Un navegador viejo que no
// conoce «/ ""» pinta el asterisco solo (@supports).
//
// La etiqueta lleva data-required: así el tema del proyecto la encuentra (label: {'&[data-required]::after': {color: …}}).
//
// Funciones puras, sin React.

/** El atributo que marca la etiqueta de un campo obligatorio. */
export const REQUIRED_LABEL_ATTRIBUTE = 'data-required';

/**
 * El texto de la marca como cadena de CSS (entre comillas, con las comillas y diagonales de adentro escapadas).
 *
 * @param {string} mark
 * @returns {string}
 */
function cssStringOf(mark) {
    return `"${String(mark).replace(/["\\]/g, '\\$&')}"`;
}

/**
 * Los estilos de la etiqueta de un campo obligatorio: la marca después del texto, pegada y del mismo color.
 *
 * @param {string} mark el texto de la marca, ya traducido (common.form.requiredMark: «*»)
 * @returns {object} para el sx de la etiqueta
 */
export function requiredMarkSxOf(mark) {
    const text = cssStringOf(mark);
    return {
        '&::after': {content: text, marginLeft: '0.15em'},
        // con texto alterno vacío: se ve, pero el lector de pantalla no lo lee
        [`@supports (content: ${text} / "")`]: {'&::after': {content: `${text} / ""`}},
    };
}
