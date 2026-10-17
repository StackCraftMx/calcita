// Etiqueta en la punta de cada barra de BarList: de dónde sale el número y su detalle («de 8», «rechazados · 120 conformes»).
//
// OJO (trampa ya pagada): Recharts 3 DESCARTA las barras de ancho 0 (Bar.js, computeBarRectangles →
// `width === 0` → null → filter(Boolean)) y LabelList numera solo las que quedan. BarList tomaba el detalle con
// items[labelProps.index]: después de una barra en 0 el detalle salía del renglón de ARRIBA («Producto C 300 rechazados
// · 0 conformes» cuando eran 120; «Gerente 1 de 3» cuando era 1 de 1), y con todo en 0 no se pintaba nada.
// Las dos cosas que lo arreglan, y que se prueban en barListLabels.test.js contra computeBarRectangles de verdad:
//   1. BAR_MIN_POINT_SIZE = 1: Recharts ensancha a 1 px ANTES de filtrar, así ninguna barra se descarta y un 0 también
//      dice «0 de 2»;
//   2. el detalle se lee del propio renglón (entry.payload) con valueAccessor y SIN dataKey: LabelList solo usa
//      valueAccessor cuando dataKey es nulo. NO sirve labelProps.payload: LabelList le pasa a la etiqueta solo las
//      propiedades SVG del renglón y payload no es una.
//
// Funciones puras, sin imports de pantalla: se prueban con node --test.

/** Ancho mínimo (px) de una barra: con 0 Recharts la descarta y la etiqueta desaparece o se corre de renglón. */
export const BAR_MIN_POINT_SIZE = 1;

/**
 * valueAccessor de LabelList: el número y el detalle del MISMO renglón de la barra.
 *
 * @param {{payload: {value: number, detail?: string}}} barEntry rectángulo que arma Recharts (payload = renglón de items)
 * @returns {{value: number, detail: string|undefined}}
 */
export function barLabelValueOf(barEntry) {
    return {value: barEntry.payload.value, detail: barEntry.payload.detail};
}
