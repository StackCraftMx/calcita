// Los textos del paquete desde i18next, para un proyecto que ya lo usa: el proyecto escribe sus textos en sus
// namespaces de siempre (table, common, problems, validation, dictionaries) y lo que no escriba sale del paquete.
//
//   <ToolkitProvider language={i18n.resolvedLanguage} onLanguageChange={(language) => i18n.changeLanguage(language)}
//                    translate={translateWithI18next(i18n)}>
//
// No importa i18next: recibe la instancia del proyecto.
//
// Funciones puras, no renderizan: function (regla de la casa).

/**
 * El traductor de ToolkitProvider sobre una instancia de i18next: si la llave existe en el proyecto regresa su texto;
 * si no, undefined, y el paquete usa el suyo.
 *
 * @param {{exists: Function, t: Function}} i18n la instancia de i18next del proyecto
 * @returns {(namespace: string, key: string, values?: object) => string|undefined}
 */
export function translateWithI18next(i18n) {
    return (namespace, key, values) => (i18n.exists(key, {ns: namespace}) ? i18n.t(key, {ns: namespace, ...values}) : undefined);
}
