// Un texto traducido con una o varias palabras pintadas distinto: «Optimiza tu negocio con <highlight>financiamiento</highlight>
// inteligente» en UNA llave, y la pantalla dice cómo se pinta cada marca. Lo mismo que <Trans> de react-i18next, sin
// depender de i18next.
//
//   <MarkedText text={t('home.headline')}
//               marks={{highlight: <Box component="strong" sx={{color: 'primary.main'}} />, terms: <Link href="/terminos" />}} />
//
// Cada marca puede ser:
//   un elemento   <Box component="strong" />, <Link href="/terminos" />: se le pone lo de adentro como hijos
//   una etiqueta  'strong', 'em': se crea con lo de adentro como hijos
//   una función   (children) => <Tooltip title="…"><span>{children}</span></Tooltip>
// OJO: un componente propio va como elemento (<Resaltado />), no suelto (Resaltado): una función suelta se toma como la de
// arriba, que recibe lo de adentro.
//
// NO pinta HTML: solo las marcas que se nombran en `marks`; todo lo demás (también un «<b>» que venga en un dato) sale como
// texto (markedTextPieces.js).
//
// Genérico del paquete: function (regla de la casa).
import {Fragment, cloneElement, createElement, isValidElement} from 'react';

import {parseMarkedText} from '@/ui/labels/markedTextPieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * Pinta los pedazos con la marca de cada uno.
 *
 * @param {Array<object>} pieces
 * @param {Record<string, any>} marks
 * @param {string} keyPrefix
 * @returns {import('react').ReactNode[]}
 */
function renderPieces(pieces, marks, keyPrefix) {
    return pieces.map((piece, index) => {
        const key = `${keyPrefix}${index}`;
        if (piece.type === 'text') {
            return <Fragment key={key}>{piece.value}</Fragment>;
        }
        const children = piece.children.length > 0 ? renderPieces(piece.children, marks, `${key}.`) : undefined;
        const mark = marks[piece.name];
        if (isValidElement(mark)) {
            return cloneElement(mark, {key}, children);
        }
        if (typeof mark === 'function') {
            return <Fragment key={key}>{mark(children)}</Fragment>;
        }
        return createElement(mark, {key}, children);
    });
}

/**
 * @param {object} props
 * @param {string} props.text el texto ya traducido, con sus marcas
 * @param {Record<string, import('react').ReactElement|string|((children: import('react').ReactNode) => import('react').ReactNode)>} props.marks
 *     cómo se pinta cada marca, por su nombre: un elemento, una etiqueta ('strong') o una función que recibe lo de adentro
 */
export default function MarkedText({text, marks, ...unknownProps}) {
    warnUnknownProps('MarkedText', unknownProps);
    const pieces = parseMarkedText(text, Object.keys(marks ?? {}));
    return <>{renderPieces(pieces, marks ?? {}, '')}</>;
}
