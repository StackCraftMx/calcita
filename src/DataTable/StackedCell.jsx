// La celda con varios datos apilados (la de stackedColumn): el principal arriba en negritas y los demás debajo en gris,
// los que hagan falta. Lo que se lee de corrido va junto en una columna (la empresa, su RFC y su régimen; el contacto, su
// correo y su teléfono) y la tabla no pide deslizar de lado con ocho columnas sueltas.
//
// Cada dato va solo o con su etiqueta arriba:
//   - solo, cuando el encabezado de la columna ya dice qué son («Empresa»: la razón social y el RFC se reconocen);
//   - con etiqueta ({label, value}), cuando el encabezado nombra al grupo y no a cada dato («Fechas»: alta y último
//     cambio), como en una tarjeta. La etiqueta va arriba y no al lado: así el dato se queda con todo el ancho.
//
// Un dato vacío (null, undefined, '' o false) no se pinta, salvo el principal o uno con etiqueta: esos enseñan «—» (el
// texto table.cells.empty, que un proyecto cambia), para que se vea qué falta en vez de que el renglón se recorra.
//
// Pieza genérica: function (regla de la casa).
import {isValidElement} from 'react';

import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// las partes con su lugar en el tema (theme.components.CalcitaStackedCell)
const THEME_NAME = 'CalcitaStackedCell';
const StackedRoot = piecePart(THEME_NAME, 'Root', 'div');
const StackedLine = piecePart(THEME_NAME, 'Line', 'div');
const StackedLabel = piecePart(THEME_NAME, 'Label', 'span');
const StackedValueRow = piecePart(THEME_NAME, 'ValueRow', 'span');
const StackedPrimary = piecePart(THEME_NAME, 'Primary', 'span');
const StackedSecondary = piecePart(THEME_NAME, 'Secondary', 'span');
const StackedNote = piecePart(THEME_NAME, 'Note', 'span');

// cada dato en su línea y con «…» si no cabe; la altura de línea propia (la de la celda no sirve: ver ServerTable)
const ONE_LINE_STYLES = Object.freeze({display: 'block', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4});
const LABEL_STYLES = Object.freeze({...ONE_LINE_STYLES, color: 'text.secondary', fontSize: '0.6875rem', lineHeight: 1.3});
const VALUE_ROW_STYLES = Object.freeze({display: 'flex', alignItems: 'baseline', gap: 0.75, minWidth: 0});
const NOTE_STYLES = Object.freeze({flexShrink: 0, fontStyle: 'italic', color: 'text.secondary', fontSize: '0.75rem'});

/**
 * Un dato de la celda: el valor solo, o con su etiqueta arriba y una nota corta junto al valor («nuevo», «sombra»).
 *
 * @typedef {import('react').ReactNode | {label?: import('react').ReactNode, value: import('react').ReactNode, note?: import('react').ReactNode}} StackedEntry
 */

function isEmpty(value) {
    return value === undefined || value === null || value === '' || value === false;
}

/** El dato con su forma completa: {label, value, note}; el que llegó solo, sin etiqueta. */
function entryOf(entry) {
    const hasShape = typeof entry === 'object' && entry !== null && !isValidElement(entry) && !Array.isArray(entry) && 'value' in entry;
    return hasShape ? {label: entry.label, value: entry.value, note: entry.note, hasLabel: !isEmpty(entry.label)}
        : {label: undefined, value: entry, note: undefined, hasLabel: false};
}

/**
 * Los datos que se pintan: el principal (el primero) siempre; de los demás, los que traen valor o etiqueta.
 *
 * @param {StackedEntry[]} entries
 */
function visibleEntriesOf(entries) {
    return entries.map(entryOf).filter((entry, index) => index === 0 || entry.hasLabel || !isEmpty(entry.value));
}

/**
 * La celda con varios datos, uno debajo del otro (lo que pinta stackedColumn; sirve también dentro de un renderCell propio).
 *
 *   <StackedCell entries={[row.business_name, row.rfc, {label: 'Régimen', value: row.regime, note: 'nuevo'}]} />
 *
 * @param {object} props
 * @param {StackedEntry[]} props.entries los datos en orden: el primero es el principal (negritas)
 * @returns {import('react').JSX.Element}
 */
export default function StackedCell(props) {
    const {entries, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps('StackedCell', unknownProps);
    const {t} = useToolkitTranslation('table');

    return (
        <StackedRoot ownSx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.25, minWidth: 0, py: 0.75}}>
            {visibleEntriesOf(entries ?? []).map((entry, index) => {
                const isPrimary = index === 0;
                const Value = isPrimary ? StackedPrimary : StackedSecondary;
                const value = isEmpty(entry.value) ? t('cells.empty') : entry.value;
                return (
                    // la posición es la llave: los datos de una celda no se reordenan
                    <StackedLine key={index} ownSx={{minWidth: 0}}>
                        {entry.hasLabel && <StackedLabel ownSx={LABEL_STYLES}>{entry.label}</StackedLabel>}
                        <StackedValueRow ownSx={VALUE_ROW_STYLES}>
                            <Value ownSx={isPrimary ? {...ONE_LINE_STYLES, fontWeight: 600} : {...ONE_LINE_STYLES, color: 'text.secondary', fontSize: '0.8125rem'}}
                                   // completo al pasar el cursor, por si la columna lo corta
                                   title={typeof value === 'string' ? value : undefined}>
                                {value}
                            </Value>
                            {!isEmpty(entry.note) && <StackedNote ownSx={NOTE_STYLES}>{entry.note}</StackedNote>}
                        </StackedValueRow>
                    </StackedLine>
                );
            })}
        </StackedRoot>
    );
}
