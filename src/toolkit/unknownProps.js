// Avisa en la consola, mientras se programa, cuando una pieza de la casa recibe una opción que no conoce.
//
// Por qué existe: React descarta sin decir nada lo que un componente no lee. Al pasar a Calcita las pantallas de un sistema que
// ya existía, las opciones con otro nombre (countNoun en lugar de countLabel, label en lugar de ariaLabelOf) se perdieron en
// silencio: la pantalla abría bien, pero sin esos textos, y solo las encontró una comparación de textos de punta a punta.
//
// Cómo se usa: cada pieza junta lo que no conoce con «...unknownProps» al leer sus props y se lo pasa a warnUnknownProps:
//
//   const {columns, fetchPage, ...unknownProps} = usePieceProps(props, THEME_NAME);
//   warnUnknownProps(THEME_NAME, unknownProps);
//
// Solo avisa en desarrollo (en producción no hace nada) y una vez por pieza y opción, no en cada render.
//
// Funciones puras, no renderizan: function (regla de la casa).

// el prefijo de los nombres de las piezas en el tema (CalcitaServerTable): el aviso dice solo el del componente
const THEME_NAME_PREFIX = 'Calcita';
// React 19 manda `ref` como un prop más: no es una opción de la pieza
const REACT_OWN_PROPS = new Set(['ref']);
// las que ya se avisaron («ServerTable.countNoun»): el aviso sale una vez, no en cada render
const warnedProps = new Set();

/**
 * ¿Se está programando? Los empaquetadores (Vite, Next) cambian process.env.NODE_ENV por su valor al construir la app. Una
 * página sin empaquetador no tiene `process`: se toma como producción y no se avisa.
 *
 * @returns {boolean}
 */
export function isDevelopmentBuild() {
    try {
        return process.env.NODE_ENV !== 'production';
    } catch {
        return false;
    }
}

/**
 * El aviso de una opción que la pieza no conoce.
 *
 * @param {string} componentName el nombre de la pieza en el tema («CalcitaServerTable») o el del componente
 * @param {string} propName
 * @returns {string}
 */
export function unknownPropMessageOf(componentName, propName) {
    const name = componentName.startsWith(THEME_NAME_PREFIX) ? componentName.slice(THEME_NAME_PREFIX.length) : componentName;
    return `Calcita · ${name} no conoce la opción «${propName}» y no la usa. Revise el nombre en el README o en «Hecho en Calcita».`;
}

/**
 * Avisa (solo en desarrollo, una vez por pieza y opción) de cada opción que la pieza no leyó.
 *
 * @param {string} componentName el nombre de la pieza en el tema («CalcitaServerTable») o el del componente
 * @param {object} unknownProps lo que quedó después de leer las opciones que la pieza conoce
 * @returns {void}
 */
export function warnUnknownProps(componentName, unknownProps) {
    if (!isDevelopmentBuild()) {
        return;
    }
    for (const propName of Object.keys(unknownProps)) {
        const warnedKey = `${componentName}.${propName}`;
        if (REACT_OWN_PROPS.has(propName) || warnedProps.has(warnedKey)) {
            continue;
        }
        warnedProps.add(warnedKey);
        console.warn(unknownPropMessageOf(componentName, propName));
    }
}
