// Las reglas de __FormName__ del lado del navegador (yup). La que protege es la del servidor; esta es para no gastar un
// viaje en lo obvio.
//
// OJO: el esquema es una función y no una constante: yup toma sus mensajes al armarlo, y armado al importar el archivo se
// adelantaría a buildYupLocale (main.jsx) y saldría en inglés.
import {Yup} from '@stackcraftmx/calcita/forms';

// lo más largo que acepta el servidor
const NAME_MAX_LENGTH = 120;
const NOTES_MAX_LENGTH = 500;

/** Cómo empieza el formulario: vacío. */
export const __FORM_NAME___INITIAL_VALUES = Object.freeze({name: '', notes: ''});

export function build__FormName__Schema() {
    return Yup.object({
        name: Yup.string().trim().required().max(NAME_MAX_LENGTH),
        notes: Yup.string().trim().max(NOTES_MAX_LENGTH),
    });
}
