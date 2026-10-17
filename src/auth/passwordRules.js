// Las reglas de una contraseña nueva y su revisión, para la lista que se va palomeando mientras la persona escribe
// (ChangePasswordForm) y para el esquema del formulario (passwordSchemaOf).
//
// Decisiones, con su porqué:
//   - La política la elige el proyecto (DEFAULT_PASSWORD_POLICY es solo el punto de partida): hay clientes que exigen
//     mayúsculas y números por norma interna. La guía del NIST (SP 800-63B) dice que el largo protege más que mezclar
//     tipos de letra; por eso el largo por omisión es 12 y el símbolo no se exige.
//   - Se cuenta por caracteres que ve la persona (Array.from), no por unidades de JavaScript: un emoji cuenta como uno.
//   - Esto es para no gastar un viaje al servidor en lo obvio: la regla que protege es la del backend.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (passwordRules.test.js).

/** Las reglas que se pueden pedir. */
export const PASSWORD_RULE = Object.freeze({
    minLength: 'minLength',
    lowercase: 'lowercase',
    uppercase: 'uppercase',
    number: 'number',
    symbol: 'symbol',
});

/** La política por omisión: 12 caracteres, con minúscula, mayúscula y número. */
export const DEFAULT_PASSWORD_POLICY = Object.freeze({
    minLength: 12,
    lowercase: true,
    uppercase: true,
    number: true,
    symbol: false,
});

// qué cuenta para cada tipo de caracter (con acentos y ñ: \p{Ll} y \p{Lu} son las minúsculas y mayúsculas de cualquier idioma)
const RULE_PATTERNS = Object.freeze({
    [PASSWORD_RULE.lowercase]: /\p{Ll}/u,
    [PASSWORD_RULE.uppercase]: /\p{Lu}/u,
    [PASSWORD_RULE.number]: /\p{Nd}/u,
    [PASSWORD_RULE.symbol]: /[^\p{L}\p{Nd}\s]/u,
});

/**
 * Cada regla que pide la política, con si ya se cumple: es la lista que se pinta palomeada.
 *
 * @param {string} password lo que lleva escrito la persona
 * @param {object} [policy] por omisión DEFAULT_PASSWORD_POLICY
 * @returns {Array<{rule: string, isMet: boolean, values: object}>} en el orden de PASSWORD_RULE
 */
export function passwordChecksOf(password, policy = DEFAULT_PASSWORD_POLICY) {
    const text = password ?? '';
    const checks = [];
    if (policy.minLength > 0) {
        checks.push({rule: PASSWORD_RULE.minLength, isMet: Array.from(text).length >= policy.minLength, values: {count: policy.minLength}});
    }
    [PASSWORD_RULE.lowercase, PASSWORD_RULE.uppercase, PASSWORD_RULE.number, PASSWORD_RULE.symbol].forEach((rule) => {
        if (policy[rule]) {
            checks.push({rule, isMet: RULE_PATTERNS[rule].test(text), values: {}});
        }
    });
    return checks;
}

/**
 * @param {string} password
 * @param {object} [policy]
 * @returns {boolean} si cumple todas las reglas de la política
 */
export function isPasswordAccepted(password, policy = DEFAULT_PASSWORD_POLICY) {
    return passwordChecksOf(password, policy).every((check) => check.isMet);
}
