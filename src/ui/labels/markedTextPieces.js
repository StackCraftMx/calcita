// Lee un texto traducido con marcas («Optimiza tu negocio con <highlight>financiamiento</highlight> inteligente») y lo
// parte en pedazos: texto suelto y marcas con lo que llevan adentro. Quien traduce ve la frase completa en una sola llave
// (antes había que partirla en tres: headlineBefore, headlineHighlight, headlineAfter).
//
// NO es HTML ni lo pinta como HTML: solo se reconocen las marcas que la pantalla nombra (`allowedNames`), cada una se cambia
// por un componente de React y todo lo demás sale como texto. Un «<b>» que venga en un dato (el nombre de una persona) se
// queda tal cual, letra por letra.
//
//   <nombre>…</nombre>   una marca con texto adentro (pueden ir unas dentro de otras)
//   <nombre/>            una marca sola (un ícono, un salto de línea)
//
// Funciones puras, no renderizan: function (regla de la casa).

const MARK_PATTERN = /<(\/?)([A-Za-z][\w-]*)\s*(\/?)>/g;

/**
 * @typedef {{type: 'text', value: string} | {type: 'mark', name: string, children: MarkedTextPiece[]}} MarkedTextPiece
 */

/**
 * Los pedazos de un texto con marcas.
 *
 * Una marca que abre y no cierra (o cierra sin abrir) sale como texto: así un error de quien traduce se ve en pantalla en
 * lugar de comerse el resto de la frase.
 *
 * @param {string} text el texto ya traducido
 * @param {string[]} allowedNames las marcas que la pantalla sabe pintar
 * @returns {MarkedTextPiece[]}
 */
export function parseMarkedText(text, allowedNames) {
    const allowed = new Set(allowedNames);
    const root = {children: []};
    // las marcas abiertas, de afuera hacia adentro, con el lugar donde empezó cada una (para regresarla a texto si no cierra)
    const open = [{node: root, name: null, rawStart: 0, raw: ''}];
    let lastIndex = 0;

    const pushText = (parent, value) => {
        if (!value) {
            return;
        }
        const previous = parent.children.at(-1);
        if (previous?.type === 'text') {
            previous.value += value;
            return;
        }
        parent.children.push({type: 'text', value});
    };

    for (const match of String(text ?? '').matchAll(MARK_PATTERN)) {
        const [raw, closing, name, selfClosing] = match;
        const current = open.at(-1);
        pushText(current.node, text.slice(lastIndex, match.index));
        lastIndex = match.index + raw.length;

        if (!allowed.has(name)) {
            pushText(current.node, raw);
            continue;
        }
        if (selfClosing && !closing) {
            current.node.children.push({type: 'mark', name, children: []});
            continue;
        }
        if (!closing) {
            const mark = {type: 'mark', name, children: []};
            current.node.children.push(mark);
            open.push({node: mark, name, raw});
            continue;
        }
        // cierra: tiene que ser la última que se abrió; si no, sale como texto
        if (current.name === name) {
            open.pop();
        } else {
            pushText(current.node, raw);
        }
    }
    pushText(open.at(-1).node, String(text ?? '').slice(lastIndex));

    // las que quedaron abiertas se regresan a texto: su etiqueta de apertura y lo que llevaban adentro
    while (open.length > 1) {
        const unclosed = open.pop();
        const parent = open.at(-1).node;
        const index = parent.children.indexOf(unclosed.node);
        parent.children.splice(index, 1, {type: 'text', value: unclosed.raw}, ...unclosed.node.children);
        mergeAdjacentTexts(parent.children);
    }
    return root.children;
}

/** Junta textos seguidos (quedan así al regresar a texto una marca sin cerrar). */
function mergeAdjacentTexts(pieces) {
    for (let index = pieces.length - 1; index > 0; index -= 1) {
        if (pieces[index].type === 'text' && pieces[index - 1].type === 'text') {
            pieces[index - 1].value += pieces[index].value;
            pieces.splice(index, 1);
        }
    }
}
